using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ResumeRanker.Api.Models;

[Table("screening_sessions")]
public class ScreeningSession
{
    [Key]
    [JsonPropertyName("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(300)]
    [JsonPropertyName("jobTitle")]
    public string JobTitle { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "mediumtext")]
    [JsonPropertyName("jobDescription")]
    public string JobDescription { get; set; } = string.Empty;

    [JsonPropertyName("timestamp")]
    public string Timestamp { get; set; } = DateTime.UtcNow.ToString("o");

    [JsonPropertyName("createdAt")]
    public long CreatedAt { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

    [JsonPropertyName("lastUpdatedAt")]
    public long LastUpdatedAt { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

    [JsonPropertyName("totalCandidates")]
    public int TotalCandidates { get; set; } = 0;

    [JsonPropertyName("relevantCandidates")]
    public int RelevantCandidates { get; set; } = 0;

    [JsonPropertyName("averageScore")]
    public double AverageScore { get; set; } = 0;

    [JsonPropertyName("topScore")]
    public double TopScore { get; set; } = 0;

    [MaxLength(200)]
    [JsonPropertyName("topCandidateName")]
    public string TopCandidateName { get; set; } = "N/A";

    [NotMapped]
    [JsonPropertyName("candidates")]
    public List<Candidate> Candidates
    {
        get => DeserializeCandidates(CandidatesJson);
        set => CandidatesJson = SerializeCandidates(value);
    }

    [Column(TypeName = "longtext")]
    [JsonIgnore]
    public string CandidatesJson { get; set; } = "[]";

    [MaxLength(200)]
    [JsonPropertyName("recruiterEmail")]
    public string RecruiterEmail { get; set; } = "recruiter@company.org";

    [NotMapped]
    [JsonPropertyName("tags")]
    public List<string> Tags
    {
        get => DeserializeTags(TagsJson);
        set => TagsJson = SerializeTags(value);
    }

    [JsonIgnore]
    public string TagsJson { get; set; } = "[]";

    [JsonPropertyName("appendCount")]
    public int AppendCount { get; set; } = 0;

    private static List<Candidate> DeserializeCandidates(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new List<Candidate>();
        try { return JsonSerializer.Deserialize<List<Candidate>>(json) ?? new List<Candidate>(); }
        catch { return new List<Candidate>(); }
    }

    private static string SerializeCandidates(List<Candidate>? list)
    {
        return list == null ? "[]" : JsonSerializer.Serialize(list);
    }

    private static List<string> DeserializeTags(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new List<string>();
        try { return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>(); }
        catch { return new List<string>(); }
    }

    private static string SerializeTags(List<string>? list)
    {
        return list == null ? "[]" : JsonSerializer.Serialize(list);
    }
}
