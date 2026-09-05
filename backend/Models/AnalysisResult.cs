using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ResumeRanker.Api.Models;

[Table("analysis_results")]
public class AnalysisResult
{
    [Key]
    [JsonPropertyName("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [JsonPropertyName("job_description_id")]
    public string? JobDescriptionId { get; set; }

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

    [JsonPropertyName("total_candidates")]
    public int TotalCandidates { get; set; } = 0;

    [JsonPropertyName("relevant_candidates")]
    public int RelevantCandidates { get; set; } = 0;

    [JsonPropertyName("average_score")]
    public double AverageScore { get; set; } = 0;

    [JsonPropertyName("top_candidates")]
    public int TopCandidates { get; set; } = 0;

    [JsonPropertyName("processing_time")]
    public double ProcessingTime { get; set; } = 0;

    [JsonPropertyName("analysis_date")]
    public DateTime AnalysisDate { get; set; } = DateTime.UtcNow;

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
}
