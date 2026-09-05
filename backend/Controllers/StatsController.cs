using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeRanker.Api.Data;

namespace ResumeRanker.Api.Controllers;

[ApiController]
[Route("api/stats")]
public class StatsController : ControllerBase
{
    private readonly ResumeRankingDbContext _db;

    public StatsController(ResumeRankingDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetStats()
    {
        var totalCandidates = await _db.Candidates.CountAsync();

        if (totalCandidates == 0)
        {
            // If candidates are stored inside screening sessions, check screening sessions
            var sessions = await _db.ScreeningSessions.ToListAsync();
            if (sessions.Count > 0)
            {
                var allSessionCandidates = sessions.SelectMany(s => s.Candidates).ToList();
                if (allSessionCandidates.Count > 0)
                {
                    var total = allSessionCandidates.Count;
                    var relevant = allSessionCandidates.Count(c => c.IsRelevant);
                    var avgScore = allSessionCandidates.Average(c => c.MatchScore);
                    var top = allSessionCandidates.Count(c => c.MatchScore >= 80);
                    var avgExp = allSessionCandidates.Average(c => c.ExperienceYears);
                    var avgHireProb = allSessionCandidates.Average(c => c.HireProbability);

                    return Ok(new
                    {
                        success = true,
                        data = new
                        {
                            totalCandidates = total,
                            relevantCandidates = relevant,
                            averageScore = (int)Math.Round(avgScore),
                            topCandidates = top,
                            averageExperience = (int)Math.Round(avgExp),
                            averageHireProbability = (int)Math.Round(avgHireProb * 100),
                            matchRate = total > 0 ? (int)Math.Round((double)relevant / total * 100) : 0
                        }
                    });
                }
            }

            return Ok(new
            {
                success = true,
                data = new
                {
                    totalCandidates = 0,
                    relevantCandidates = 0,
                    averageScore = 0,
                    topCandidates = 0,
                    averageExperience = 0,
                    averageHireProbability = 0,
                    matchRate = 0
                }
            });
        }

        var relevantCandidates = await _db.Candidates.CountAsync(c => c.IsRelevant);
        var avgScoreCandidate = await _db.Candidates.AverageAsync(c => c.MatchScore);
        var topCandidatesCount = await _db.Candidates.CountAsync(c => c.MatchScore >= 80);
        var avgExperience = await _db.Candidates.AverageAsync(c => c.ExperienceYears);
        var avgHireProbability = await _db.Candidates.AverageAsync(c => c.HireProbability);

        return Ok(new
        {
            success = true,
            data = new
            {
                totalCandidates,
                relevantCandidates,
                averageScore = (int)Math.Round(avgScoreCandidate),
                topCandidates = topCandidatesCount,
                averageExperience = (int)Math.Round(avgExperience),
                averageHireProbability = (int)Math.Round(avgHireProbability * 100),
                matchRate = totalCandidates > 0 ? (int)Math.Round((double)relevantCandidates / totalCandidates * 100) : 0
            }
        });
    }
}
