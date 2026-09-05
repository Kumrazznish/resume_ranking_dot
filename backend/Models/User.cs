using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ResumeRanker.Api.Models;

[Table("users")]
public class User
{
    [Key]
    [JsonPropertyName("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(200)]
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [Required]
    [JsonIgnore]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(50)]
    [JsonPropertyName("role")]
    public string Role { get; set; } = "hr"; // admin, hr, recruiter

    [MaxLength(200)]
    [JsonPropertyName("company")]
    public string Company { get; set; } = "Talent Acquisition Inc.";

    [MaxLength(200)]
    [JsonPropertyName("department")]
    public string Department { get; set; } = "Human Resources";

    [JsonPropertyName("resumes_analyzed_count")]
    public int ResumesAnalyzedCount { get; set; } = 0;

    [JsonPropertyName("emails_sent_count")]
    public int EmailsSentCount { get; set; } = 0;

    [MaxLength(50)]
    [JsonPropertyName("status")]
    public string Status { get; set; } = "active"; // active, inactive

    [JsonPropertyName("last_active")]
    public DateTime LastActive { get; set; } = DateTime.UtcNow;

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [JsonPropertyName("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
