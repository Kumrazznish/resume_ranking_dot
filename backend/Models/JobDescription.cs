using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ResumeRanker.Api.Models;

[Table("job_descriptions")]
public class JobDescription
{
    [Key]
    [JsonPropertyName("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(300)]
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "text")]
    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [NotMapped]
    [JsonPropertyName("required_skills")]
    public List<string> RequiredSkills
    {
        get => DeserializeList(RequiredSkillsJson);
        set => RequiredSkillsJson = SerializeList(value);
    }

    [JsonIgnore]
    public string RequiredSkillsJson { get; set; } = "[]";

    [MaxLength(100)]
    [JsonPropertyName("experience_level")]
    public string ExperienceLevel { get; set; } = "Mid";

    [MaxLength(200)]
    [JsonPropertyName("salary_range")]
    public string SalaryRange { get; set; } = "Not specified";

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [JsonPropertyName("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    private static List<string> DeserializeList(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new List<string>();
        try { return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>(); }
        catch { return new List<string>(); }
    }

    private static string SerializeList(List<string>? list)
    {
        return list == null ? "[]" : JsonSerializer.Serialize(list);
    }
}
