using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeRanker.Api.Data;
using ResumeRanker.Api.Models;

namespace ResumeRanker.Api.Controllers;

[ApiController]
[Route("api/candidates")]
public class CandidatesController : ControllerBase
{
    private readonly ResumeRankingDbContext _db;

    public CandidatesController(ResumeRankingDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    public async Task<IActionResult> CreateCandidates([FromBody] object payload)
    {
        try
        {
            var json = System.Text.Json.JsonSerializer.Serialize(payload);
            List<Candidate> candidates;

            if (json.TrimStart().StartsWith("["))
            {
                candidates = System.Text.Json.JsonSerializer.Deserialize<List<Candidate>>(json) ?? new List<Candidate>();
            }
            else
            {
                var single = System.Text.Json.JsonSerializer.Deserialize<Candidate>(json);
                candidates = single != null ? new List<Candidate> { single } : new List<Candidate>();
            }

            foreach (var c in candidates)
            {
                if (string.IsNullOrWhiteSpace(c.Id)) c.Id = Guid.NewGuid().ToString();
                c.CreatedAt = DateTime.UtcNow;
            }

            _db.Candidates.AddRange(candidates);
            await _db.SaveChangesAsync();

            return StatusCode(201, new { success = true, data = candidates });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetCandidates(
        [FromQuery] string? query,
        [FromQuery] string? experience_level,
        [FromQuery] double? min_score,
        [FromQuery] bool? is_relevant,
        [FromQuery] int limit = 100,
        [FromQuery] int offset = 0)
    {
        try
        {
            var q = _db.Candidates.AsQueryable();

            if (!string.IsNullOrWhiteSpace(query))
            {
                var lower = query.ToLower();
                q = q.Where(c => c.CandidateName.ToLower().Contains(lower) || c.Summary.ToLower().Contains(lower));
            }

            if (!string.IsNullOrWhiteSpace(experience_level))
            {
                q = q.Where(c => c.ExperienceLevel == experience_level);
            }

            if (min_score.HasValue)
            {
                q = q.Where(c => c.MatchScore >= min_score.Value);
            }

            if (is_relevant.HasValue)
            {
                q = q.Where(c => c.IsRelevant == is_relevant.Value);
            }

            var results = await q
                .OrderByDescending(c => c.MatchScore)
                .ThenByDescending(c => c.CreatedAt)
                .Skip(offset)
                .Take(limit)
                .ToListAsync();

            return Ok(new { success = true, data = results });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCandidate(string id)
    {
        var candidate = await _db.Candidates.FirstOrDefaultAsync(c => c.Id == id);
        if (candidate == null)
        {
            return NotFound(new { success = false, error = "Candidate not found" });
        }
        return Ok(new { success = true, data = candidate });
    }
}
