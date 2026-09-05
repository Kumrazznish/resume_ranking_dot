using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeRanker.Api.Data;
using ResumeRanker.Api.Models;
using ResumeRanker.Api.Services;

namespace ResumeRanker.Api.Controllers;

[ApiController]
[Route("api/analysis")]
public class AnalysisController : ControllerBase
{
    private readonly ResumeRankingDbContext _db;
    private readonly IDocumentParserService _parserService;
    private readonly IGeminiAiService _geminiService;
    private readonly ILogger<AnalysisController> _logger;

    public AnalysisController(
        ResumeRankingDbContext db,
        IDocumentParserService parserService,
        IGeminiAiService geminiService,
        ILogger<AnalysisController> logger)
    {
        _db = db;
        _parserService = parserService;
        _geminiService = geminiService;
        _logger = logger;
    }

    [HttpPost("parse-file")]
    public async Task<IActionResult> ParseFile()
    {
        try
        {
            var filename = Request.Headers["x-file-name"].FirstOrDefault() ?? "document.pdf";

            using var memoryStream = new MemoryStream();
            await Request.Body.CopyToAsync(memoryStream);
            if (memoryStream.Length == 0)
            {
                return BadRequest(new { success = false, error = "Empty file buffer received" });
            }
            memoryStream.Position = 0;

            var (text, characterCount) = await _parserService.ExtractTextAsync(memoryStream, filename);

            if (string.IsNullOrWhiteSpace(text) || text.Length < 15)
            {
                return UnprocessableEntity(new { success = false, error = "Could not extract text from document" });
            }

            return Ok(new
            {
                success = true,
                data = new
                {
                    text,
                    characterCount,
                    filename
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Analysis API] File extraction failure");
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }

    [HttpGet("sessions")]
    public async Task<IActionResult> GetSessions()
    {
        try
        {
            var sessions = await _db.ScreeningSessions
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            return Ok(new { success = true, data = sessions });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Analysis API] Get sessions error");
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }

    [HttpPost("sessions")]
    public async Task<IActionResult> SaveSession([FromBody] ScreeningSession sessionData)
    {
        try
        {
            if (sessionData == null || string.IsNullOrWhiteSpace(sessionData.Id))
            {
                return BadRequest(new { success = false, error = "Session ID is required" });
            }

            var existing = await _db.ScreeningSessions.FirstOrDefaultAsync(s => s.Id == sessionData.Id);
            if (existing != null)
            {
                existing.JobTitle = sessionData.JobTitle;
                existing.JobDescription = sessionData.JobDescription;
                existing.TotalCandidates = sessionData.TotalCandidates;
                existing.RelevantCandidates = sessionData.RelevantCandidates;
                existing.AverageScore = sessionData.AverageScore;
                existing.TopScore = sessionData.TopScore;
                existing.TopCandidateName = sessionData.TopCandidateName;
                existing.Candidates = sessionData.Candidates;
                existing.Tags = sessionData.Tags;
                existing.AppendCount = sessionData.AppendCount;
                existing.LastUpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            }
            else
            {
                sessionData.CreatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                sessionData.LastUpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                _db.ScreeningSessions.Add(sessionData);
            }

            // Update recruiter's resume counter if matching user exists
            if (!string.IsNullOrWhiteSpace(sessionData.RecruiterEmail))
            {
                var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == sessionData.RecruiterEmail.ToLower());
                if (user != null)
                {
                    user.ResumesAnalyzedCount += sessionData.TotalCandidates;
                }
            }

            await _db.SaveChangesAsync();

            return StatusCode(201, new { success = true, data = sessionData });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Analysis API] Save session error");
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }

    [HttpDelete("sessions/{id}")]
    public async Task<IActionResult> DeleteSession(string id)
    {
        try
        {
            var session = await _db.ScreeningSessions.FirstOrDefaultAsync(s => s.Id == id);
            if (session != null)
            {
                _db.ScreeningSessions.Remove(session);
                await _db.SaveChangesAsync();
            }

            return Ok(new { success = true, message = "Session deleted" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Analysis API] Delete session error");
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAnalysisResults()
    {
        try
        {
            var results = await _db.AnalysisResults
                .OrderByDescending(a => a.AnalysisDate)
                .ToListAsync();

            return Ok(new { success = true, data = results });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Analysis API] Get analysis results error");
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }

    public record AnalysisResultRequest(
        string? JobDescriptionId,
        List<Candidate>? Candidates,
        int? TotalCandidates,
        int? RelevantCandidates,
        double? AverageScore,
        int? TopCandidates,
        double? ProcessingTime
    );

    [HttpPost]
    public async Task<IActionResult> SaveAnalysis([FromBody] AnalysisResultRequest req)
    {
        try
        {
            var candidates = req.Candidates ?? new List<Candidate>();
            var result = new AnalysisResult
            {
                JobDescriptionId = req.JobDescriptionId,
                Candidates = candidates,
                TotalCandidates = req.TotalCandidates ?? candidates.Count,
                RelevantCandidates = req.RelevantCandidates ?? candidates.Count(c => c.IsRelevant),
                AverageScore = req.AverageScore ?? (candidates.Count > 0 ? candidates.Average(c => c.MatchScore) : 0),
                TopCandidates = req.TopCandidates ?? candidates.Count(c => c.MatchScore >= 80),
                ProcessingTime = req.ProcessingTime ?? 0,
                AnalysisDate = DateTime.UtcNow
            };

            _db.AnalysisResults.Add(result);
            await _db.SaveChangesAsync();

            return StatusCode(201, new { success = true, data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Analysis API] Save analysis error");
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }

    public record AiScreenRequest(string Prompt, string? UserId, string? OperationType);

    [HttpPost("ai-screen")]
    public async Task<IActionResult> AiScreen([FromBody] AiScreenRequest req)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(req.Prompt))
            {
                return BadRequest(new { success = false, error = "Prompt is required" });
            }

            var userId = req.UserId ?? "recruiter-session";
            var (rawOutput, slotInfo) = await _geminiService.ScreenResumesAsync(req.Prompt, userId);

            return Ok(new
            {
                success = true,
                data = new
                {
                    rawOutput,
                    slotInfo
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Analysis API] AI-Screen error");
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }
}
