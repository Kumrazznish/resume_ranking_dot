using System.Collections.Concurrent;
using Microsoft.EntityFrameworkCore;
using ResumeRanker.Api.Data;
using ResumeRanker.Api.Models;

namespace ResumeRanker.Api.Services;

public class KeyPoolEvent
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string SlotName { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class SlotCheckout
{
    public ApiKeySlot Slot { get; set; } = null!;
    public string RawKey { get; set; } = string.Empty;
}

public class KeyPoolManager
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IConfiguration _configuration;
    private readonly ILogger<KeyPoolManager> _logger;
    private readonly ConcurrentDictionary<string, ApiKeySlot> _inMemorySlots = new();
    private readonly ConcurrentQueue<KeyPoolEvent> _events = new();
    private readonly object _lockObj = new();
    private bool _isInitialized = false;

    public KeyPoolManager(
        IServiceProvider serviceProvider,
        IConfiguration configuration,
        ILogger<KeyPoolManager> logger)
    {
        _serviceProvider = serviceProvider;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task InitializeAsync()
    {
        if (_isInitialized) return;

        lock (_lockObj)
        {
            if (_isInitialized) return;
            _isInitialized = true;
        }

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ResumeRankingDbContext>();

            var keys = await db.ApiKeys.ToListAsync();
            if (keys.Count == 0)
            {
                // If DB has no keys, check configuration or environment variables
                var envKey = _configuration["GEMINI_API_KEY"] 
                    ?? _configuration["Gemini:ApiKey"]
                    ?? _configuration["VITE_GEMINI_API_KEY"]
                    ?? string.Empty;

                var defaultSlot = new ApiKeySlot
                {
                    Id = "slot_primary",
                    Name = "Primary Gemini Key",
                    ApiKey = envKey,
                    MaskedKey = ApiKeySlot.GenerateMask(envKey),
                    Provider = "gemini",
                    IsActive = true,
                    HealthScore = 100,
                    RateLimit = 15,
                    SoftLimit = 12,
                    ActiveModel = "gemini-3.6-flash"
                };

                db.ApiKeys.Add(defaultSlot);
                await db.SaveChangesAsync();
                keys.Add(defaultSlot);
            }

            bool dbUpdated = false;
            foreach (var k in keys)
            {
                // Auto-upgrade any legacy / deprecated models to the operational gemini-3.6-flash
                if (string.IsNullOrWhiteSpace(k.ActiveModel) || 
                    k.ActiveModel.Contains("1.5") || 
                    k.ActiveModel.Contains("2.0") || 
                    k.ActiveModel.Contains("2.5"))
                {
                    k.ActiveModel = "gemini-3.6-flash";
                    k.HealthScore = 100;
                    k.FailedRequests = 0;
                    dbUpdated = true;
                }
                _inMemorySlots[k.Id] = k;
            }

            if (dbUpdated)
            {
                await db.SaveChangesAsync();
            }

            AddEvent("SYSTEM", "POOL_INIT", $"Initialized {keys.Count} key slot(s) into active pool (Active Model: gemini-3.6-flash)");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[KeyPoolManager] Failed to initialize key pool from DB");
        }
    }

    public void AddEvent(string slotName, string eventType, string message)
    {
        var ev = new KeyPoolEvent
        {
            SlotName = slotName,
            EventType = eventType,
            Message = message
        };
        _events.Enqueue(ev);

        while (_events.Count > 100)
        {
            _events.TryDequeue(out _);
        }
    }

    public SlotCheckout? CheckoutSlot(string userId)
    {
        lock (_lockObj)
        {
            var eligibleSlots = _inMemorySlots.Values
                .Where(s => s.IsActive && s.HealthScore > 20 && !s.IsOccupied)
                .OrderByDescending(s => s.HealthScore)
                .ThenBy(s => s.RequestsThisMinute)
                .ToList();

            ApiKeySlot? chosen = eligibleSlots.FirstOrDefault();

            if (chosen == null)
            {
                // Fallback to least recently used active slot even if temporarily occupied
                chosen = _inMemorySlots.Values
                    .Where(s => s.IsActive)
                    .OrderBy(s => s.RequestsThisMinute)
                    .FirstOrDefault();
            }

            if (chosen != null)
            {
                chosen.IsOccupied = true;
                chosen.OccupiedBy = userId;
                chosen.OccupiedSince = DateTime.UtcNow;
                chosen.RequestsThisMinute++;
                chosen.TotalRequests++;

                AddEvent(chosen.Name, "SLOT_CHECKOUT", $"Slot locked for {userId} [{chosen.ActiveModel}]");

                return new SlotCheckout
                {
                    Slot = chosen,
                    RawKey = chosen.ApiKey
                };
            }

            return null;
        }
    }

    public void ReleaseSlot(string slotId, bool success, double latencyMs = 0, string? errorMessage = null)
    {
        lock (_lockObj)
        {
            if (_inMemorySlots.TryGetValue(slotId, out var slot))
            {
                slot.IsOccupied = false;
                slot.OccupiedBy = null;
                slot.OccupiedSince = null;
                slot.LastUsedAt = DateTime.UtcNow;

                if (success)
                {
                    slot.SuccessfulRequests++;
                    slot.HealthScore = Math.Min(100, slot.HealthScore + 2);
                    if (latencyMs > 0)
                    {
                        slot.AvgLatencyMs = slot.AvgLatencyMs == 0 
                            ? latencyMs 
                            : Math.Round((slot.AvgLatencyMs * 0.7) + (latencyMs * 0.3), 1);
                    }
                    AddEvent(slot.Name, "SLOT_SUCCESS", $"Execution finished in {latencyMs:0}ms (Health: {slot.HealthScore}%)");
                }
                else
                {
                    slot.FailedRequests++;
                    slot.HealthScore = Math.Max(0, slot.HealthScore - 15);
                    AddEvent(slot.Name, "SLOT_ERROR", $"Execution failure: {errorMessage} (Health: {slot.HealthScore}%)");
                }
            }
        }
    }

    public object GetLiveStatusSnapshot()
    {
        var slots = _inMemorySlots.Values.ToList();
        var totalSlots = slots.Count;
        var activeSlots = slots.Count(s => s.IsActive);
        var occupiedSlots = slots.Count(s => s.IsOccupied);
        var healthySlots = slots.Count(s => s.HealthScore > 50 && s.IsActive);
        var currentTotalRPM = slots.Sum(s => s.RequestsThisMinute);
        var totalTokensTracked = slots.Sum(s => s.TotalTokensUsed);

        return new
        {
            summary = new
            {
                totalSlots,
                activeSlots,
                occupiedSlots,
                healthySlots,
                currentTotalRPM,
                totalTokensTracked
            },
            slots = slots.Select(s => new
            {
                id = s.Id,
                name = s.Name,
                maskedKey = s.MaskedKey,
                provider = s.Provider,
                isActive = s.IsActive,
                healthScore = s.HealthScore,
                queuePosition = s.QueuePosition,
                rateLimit = s.RateLimit,
                softLimit = s.SoftLimit,
                currentRPM = s.RequestsThisMinute,
                isOccupied = s.IsOccupied,
                occupiedBy = s.OccupiedBy,
                activeModel = s.ActiveModel,
                totalRequests = s.TotalRequests,
                successfulRequests = s.SuccessfulRequests,
                failedRequests = s.FailedRequests,
                totalTokensUsed = s.TotalTokensUsed,
                avgLatencyMs = s.AvgLatencyMs,
                lastUsedAt = s.LastUsedAt
            }),
            events = _events.Reverse().Take(50)
        };
    }

    public async Task<ApiKeySlot> AddKeyAsync(string apiKey, string name, string provider, int rateLimit, int softLimit)
    {
        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ResumeRankingDbContext>();

        var slot = new ApiKeySlot
        {
            Id = Guid.NewGuid().ToString(),
            ApiKey = apiKey.Trim(),
            MaskedKey = ApiKeySlot.GenerateMask(apiKey),
            Name = name.Trim(),
            Provider = provider,
            RateLimit = rateLimit > 0 ? rateLimit : 15,
            SoftLimit = softLimit > 0 ? softLimit : 12,
            ActiveModel = "gemini-3.6-flash",
            HealthScore = 100,
            IsActive = true
        };

        db.ApiKeys.Add(slot);
        await db.SaveChangesAsync();

        _inMemorySlots[slot.Id] = slot;
        AddEvent(slot.Name, "KEY_REGISTERED", $"New key {slot.MaskedKey} registered with {slot.RateLimit} RPM limit");

        return slot;
    }

    public async Task<bool> ToggleKeyAsync(string id, bool isActive)
    {
        if (_inMemorySlots.TryGetValue(id, out var slot))
        {
            slot.IsActive = isActive;

            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ResumeRankingDbContext>();
            var dbSlot = await db.ApiKeys.FindAsync(id);
            if (dbSlot != null)
            {
                dbSlot.IsActive = isActive;
                await db.SaveChangesAsync();
            }

            AddEvent(slot.Name, "KEY_TOGGLED", $"Key state updated to {(isActive ? "ACTIVE" : "DISABLED")}");
            return true;
        }

        return false;
    }

    public async Task<bool> DeleteKeyAsync(string id)
    {
        _inMemorySlots.TryRemove(id, out var slot);

        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ResumeRankingDbContext>();
        var dbSlot = await db.ApiKeys.FindAsync(id);
        if (dbSlot != null)
        {
            db.ApiKeys.Remove(dbSlot);
            await db.SaveChangesAsync();
        }

        if (slot != null)
        {
            AddEvent(slot.Name, "KEY_DELETED", $"Key slot permanently removed");
            return true;
        }

        return false;
    }
}
