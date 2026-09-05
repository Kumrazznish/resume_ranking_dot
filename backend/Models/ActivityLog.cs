using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ResumeRanker.Api.Models;

[Table("activity_logs")]
public class ActivityLog
{
    [Key]
    [JsonPropertyName("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [JsonPropertyName("user_id")]
    public string? UserId { get; set; }

    [MaxLength(200)]
    [JsonPropertyName("user_name")]
    public string UserName { get; set; } = string.Empty;

    [MaxLength(200)]
    [JsonPropertyName("user_email")]
    public string UserEmail { get; set; } = string.Empty;

    [MaxLength(100)]
    [JsonPropertyName("action_type")]
    public string ActionType { get; set; } = string.Empty;

    [Column(TypeName = "text")]
    [JsonPropertyName("details")]
    public string Details { get; set; } = string.Empty;

    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
