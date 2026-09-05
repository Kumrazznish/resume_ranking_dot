using System.Diagnostics;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace ResumeRanker.Api.Services;

public interface IGeminiAiService
{
    Task<(string RawOutput, object? SlotInfo)> ScreenResumesAsync(string prompt, string userId);
}

public class GeminiAiService : IGeminiAiService
{
    private readonly HttpClient _httpClient;
    private readonly KeyPoolManager _keyPoolManager;
    private readonly ILogger<GeminiAiService> _logger;

    public GeminiAiService(
        HttpClient httpClient,
        KeyPoolManager keyPoolManager,
        ILogger<GeminiAiService> logger)
    {
        _httpClient = httpClient;
        _keyPoolManager = keyPoolManager;
        _logger = logger;
    }

    public async Task<(string RawOutput, object? SlotInfo)> ScreenResumesAsync(string prompt, string userId)
    {
        var checkout = _keyPoolManager.CheckoutSlot(userId);
        if (checkout == null || string.IsNullOrWhiteSpace(checkout.RawKey))
        {
            throw new InvalidOperationException("No active API keys available in the pool. Please add a key in the Admin Console.");
        }

        var slot = checkout.Slot;
        var rawKey = checkout.RawKey;
        var stopwatch = Stopwatch.StartNew();

        var modelsToTry = new[] { slot.ActiveModel, "gemini-3.6-flash", "gemini-3.5-flash", "gemini-flash-latest", "gemini-3.7-flash" }
            .Where(m => !string.IsNullOrEmpty(m) && !m.Contains("1.5") && !m.Contains("2.0") && !m.Contains("2.5"))
            .Distinct()
            .ToList();

        if (modelsToTry.Count == 0)
        {
            modelsToTry = new List<string> { "gemini-3.6-flash", "gemini-3.5-flash", "gemini-flash-latest" };
        }

        string? lastError = null;

        foreach (var model in modelsToTry)
        {
            try
            {
                var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={rawKey}";

                var requestBody = new
                {
                    contents = new[]
                    {
                        new { parts = new[] { new { text = prompt } } }
                    },
                    generationConfig = new
                    {
                        temperature = 0.1,
                        maxOutputTokens = 8192,
                        response_mime_type = "application/json"
                    }
                };

                using var content = new StringContent(
                    JsonSerializer.Serialize(requestBody),
                    Encoding.UTF8,
                    "application/json");

                var response = await _httpClient.PostAsync(url, content);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("[GeminiAiService] Model {Model} returned {Status}: {Content}", model, response.StatusCode, responseContent);
                    lastError = $"HTTP {(int)response.StatusCode}: {responseContent}";
                    continue;
                }

                var jsonNode = JsonNode.Parse(responseContent);
                var candidateText = jsonNode?["candidates"]?[0]?["content"]?["parts"]?[0]?["text"]?.GetValue<string>();

                if (string.IsNullOrWhiteSpace(candidateText))
                {
                    lastError = "Empty or malformed candidate evaluation returned by Gemini API";
                    continue;
                }

                stopwatch.Stop();
                _keyPoolManager.ReleaseSlot(slot.Id, true, stopwatch.ElapsedMilliseconds);

                var slotInfo = new
                {
                    id = slot.Id,
                    name = slot.Name,
                    maskedKey = slot.MaskedKey,
                    activeModel = model,
                    latencyMs = stopwatch.ElapsedMilliseconds,
                    queuePosition = slot.QueuePosition + 1
                };

                return (candidateText, slotInfo);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[GeminiAiService] Exception calling Gemini with model {Model}", model);
                lastError = ex.Message;
            }
        }

        stopwatch.Stop();
        _keyPoolManager.ReleaseSlot(slot.Id, false, stopwatch.ElapsedMilliseconds, lastError);
        throw new HttpRequestException($"All Gemini model attempts failed. Last error: {lastError}");
    }
}
