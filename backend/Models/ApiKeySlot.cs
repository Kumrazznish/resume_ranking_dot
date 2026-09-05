using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ResumeRanker.Api.Models;

[Table("api_keys")]
public class ApiKeySlot
{
    [Key]
    [JsonPropertyName("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(200)]
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(250)]
    [JsonIgnore] // Protected by default
    public string ApiKey { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    [JsonPropertyName("maskedKey")]
    public string MaskedKey { get; set; } = "AIzaSy...****";

    [MaxLength(50)]
    [JsonPropertyName("provider")]
    public string Provider { get; set; } = "gemini";

    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; } = true;

    [JsonPropertyName("healthScore")]
    public int HealthScore { get; set; } = 100;

    [JsonPropertyName("queuePosition")]
    public int QueuePosition { get; set; } = 0;

    [JsonPropertyName("rateLimit")]
    public int RateLimit { get; set; } = 15;

    [JsonPropertyName("softLimit")]
    public int SoftLimit { get; set; } = 12;

    [JsonPropertyName("requestsThisMinute")]
    public int RequestsThisMinute { get; set; } = 0;

    [JsonPropertyName("isOccupied")]
    public bool IsOccupied { get; set; } = false;

    [MaxLength(100)]
    [JsonPropertyName("occupiedBy")]
    public string? OccupiedBy { get; set; }

    [JsonPropertyName("occupiedSince")]
    public DateTime? OccupiedSince { get; set; }

    [MaxLength(100)]
    [JsonPropertyName("activeModel")]
    public string ActiveModel { get; set; } = "gemini-3.6-flash";

    [JsonPropertyName("totalRequests")]
    public int TotalRequests { get; set; } = 0;

    [JsonPropertyName("successfulRequests")]
    public int SuccessfulRequests { get; set; } = 0;

    [JsonPropertyName("failedRequests")]
    public int FailedRequests { get; set; } = 0;

    [JsonPropertyName("totalTokensUsed")]
    public long TotalTokensUsed { get; set; } = 0;

    [JsonPropertyName("avgLatencyMs")]
    public double AvgLatencyMs { get; set; } = 0;

    [JsonPropertyName("lastUsedAt")]
    public DateTime? LastUsedAt { get; set; }

    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public static string GenerateMask(string key)
    {
        if (string.IsNullOrWhiteSpace(key) || key.Length < 8) return "AIzaSy...****";
        return $"{key.Substring(0, Math.Min(6, key.Length))}...{key.Substring(Math.Max(0, key.Length - 4))}";
    }
}
