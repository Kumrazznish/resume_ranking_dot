using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ResumeRanker.Api.Models;

public class ContactInfo
{
    [JsonPropertyName("email")]
    public string Email { get; set; } = "Not specified";

    [JsonPropertyName("phone")]
    public string Phone { get; set; } = "Not specified";
}

[Table("candidates")]
public class Candidate
{
    [Key]
    [JsonPropertyName("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [JsonPropertyName("job_description_id")]
    public string? JobDescriptionId { get; set; }

    [Required]
    [MaxLength(250)]
    [JsonPropertyName("candidate_name")]
    public string CandidateName { get; set; } = string.Empty;

    [NotMapped]
    [JsonPropertyName("contact_info")]
    public ContactInfo ContactInfo
    {
        get => new ContactInfo { Email = ContactEmail, Phone = ContactPhone };
        set
        {
            if (value != null)
            {
                ContactEmail = value.Email;
                ContactPhone = value.Phone;
            }
        }
    }

    [JsonIgnore]
    public string ContactEmail { get; set; } = "Not specified";

    [JsonIgnore]
    public string ContactPhone { get; set; } = "Not specified";

    [NotMapped]
    [JsonPropertyName("skills")]
    public List<string> Skills
    {
        get => DeserializeList(SkillsJson);
        set => SkillsJson = SerializeList(value);
    }

    [JsonIgnore]
    public string SkillsJson { get; set; } = "[]";

    [JsonPropertyName("experience_years")]
    public double ExperienceYears { get; set; } = 0;

    [MaxLength(500)]
    [JsonPropertyName("education")]
    public string Education { get; set; } = "Not specified";

    [NotMapped]
    [JsonPropertyName("certifications")]
    public List<string> Certifications
    {
        get => DeserializeList(CertificationsJson);
        set => CertificationsJson = SerializeList(value);
    }

    [JsonIgnore]
    public string CertificationsJson { get; set; } = "[]";

    [NotMapped]
    [JsonPropertyName("notable_companies")]
    public List<string> NotableCompanies
    {
        get => DeserializeList(NotableCompaniesJson);
        set => NotableCompaniesJson = SerializeList(value);
    }

    [JsonIgnore]
    public string NotableCompaniesJson { get; set; } = "[]";

    [Column(TypeName = "text")]
    [JsonPropertyName("summary")]
    public string Summary { get; set; } = string.Empty;

    [NotMapped]
    [JsonPropertyName("matched_skills")]
    public List<string> MatchedSkills
    {
        get => DeserializeList(MatchedSkillsJson);
        set => MatchedSkillsJson = SerializeList(value);
    }

    [JsonIgnore]
    public string MatchedSkillsJson { get; set; } = "[]";

    [NotMapped]
    [JsonPropertyName("missing_skills")]
    public List<string> MissingSkills
    {
        get => DeserializeList(MissingSkillsJson);
        set => MissingSkillsJson = SerializeList(value);
    }

    [JsonIgnore]
    public string MissingSkillsJson { get; set; } = "[]";

    [JsonPropertyName("match_score")]
    public double MatchScore { get; set; } = 0;

    [MaxLength(500)]
    [JsonPropertyName("recommendation")]
    public string Recommendation { get; set; } = string.Empty;

    [JsonPropertyName("is_relevant")]
    public bool IsRelevant { get; set; } = false;

    [NotMapped]
    [JsonPropertyName("issues_detected")]
    public List<string> IssuesDetected
    {
        get => DeserializeList(IssuesDetectedJson);
        set => IssuesDetectedJson = SerializeList(value);
    }

    [JsonIgnore]
    public string IssuesDetectedJson { get; set; } = "[]";

    [NotMapped]
    [JsonPropertyName("strengths")]
    public List<string> Strengths
    {
        get => DeserializeList(StrengthsJson);
        set => StrengthsJson = SerializeList(value);
    }

    [JsonIgnore]
    public string StrengthsJson { get; set; } = "[]";

    [NotMapped]
    [JsonPropertyName("weaknesses")]
    public List<string> Weaknesses
    {
        get => DeserializeList(WeaknessesJson);
        set => WeaknessesJson = SerializeList(value);
    }

    [JsonIgnore]
    public string WeaknessesJson { get; set; } = "[]";

    [NotMapped]
    [JsonPropertyName("interview_questions")]
    public List<string> InterviewQuestions
    {
        get => DeserializeList(InterviewQuestionsJson);
        set => InterviewQuestionsJson = SerializeList(value);
    }

    [JsonIgnore]
    public string InterviewQuestionsJson { get; set; } = "[]";

    [MaxLength(200)]
    [JsonPropertyName("salary_range")]
    public string SalaryRange { get; set; } = "Not specified";

    [JsonPropertyName("hire_probability")]
    public double HireProbability { get; set; } = 0.5;

    [MaxLength(100)]
    [JsonPropertyName("experience_level")]
    public string ExperienceLevel { get; set; } = "Mid";

    [JsonPropertyName("skill_diversity")]
    public double SkillDiversity { get; set; } = 0;

    [JsonPropertyName("company_prestige")]
    public double CompanyPrestige { get; set; } = 0;

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

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
