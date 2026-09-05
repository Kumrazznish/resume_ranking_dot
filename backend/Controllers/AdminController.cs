using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeRanker.Api.Data;
using ResumeRanker.Api.Models;

namespace ResumeRanker.Api.Controllers;

[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly ResumeRankingDbContext _db;

    public AdminController(ResumeRankingDbContext db)
    {
        _db = db;
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview()
    {
        var totalHrs = await _db.Users.CountAsync(u => u.Role != "admin");
        var activeHrs = await _db.Users.CountAsync(u => u.Role != "admin" && u.Status == "active");

        var totalResumesFromUsers = await _db.Users
            .Where(u => u.Role != "admin")
            .SumAsync(u => (int?)u.ResumesAnalyzedCount) ?? 0;

        var totalEmails = await _db.Users
            .Where(u => u.Role != "admin")
            .SumAsync(u => (int?)u.EmailsSentCount) ?? 0;

        var sessionsCount = await _db.ScreeningSessions.CountAsync();
        var avgScore = sessionsCount > 0 
            ? await _db.ScreeningSessions.AverageAsync(s => s.AverageScore) 
            : 0;

        var totalCandidatesInSessions = await _db.ScreeningSessions.SumAsync(s => (int?)s.TotalCandidates) ?? 0;
        var totalResumes = Math.Max(totalResumesFromUsers, totalCandidatesInSessions);

        return Ok(new
        {
            success = true,
            data = new
            {
                totalHrs,
                activeHrs,
                totalResumesAnalyzed = totalResumes,
                totalEmailsSent = totalEmails,
                avgCandidateMatchScore = (int)Math.Round(avgScore),
                totalHiringSessions = sessionsCount
            }
        });
    }

    [HttpGet("hrs")]
    public async Task<IActionResult> GetHrs([FromQuery] string? search, [FromQuery] string? status)
    {
        var query = _db.Users.Where(u => u.Role != "admin");

        if (!string.IsNullOrWhiteSpace(status) && status != "all")
        {
            query = query.Where(u => u.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(u => u.Name.ToLower().Contains(s) || u.Email.ToLower().Contains(s) || u.Company.ToLower().Contains(s));
        }

        var users = await query
            .OrderByDescending(u => u.ResumesAnalyzedCount)
            .ThenByDescending(u => u.CreatedAt)
            .ToListAsync();

        return Ok(new { success = true, data = users });
    }

    public record UpdateStatusRequest(string Status);

    [HttpPatch("hrs/{id}/status")]
    public async Task<IActionResult> UpdateHrStatus(string id, [FromBody] UpdateStatusRequest req)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { success = false, error = "User not found" });
        }

        user.Status = req.Status == "active" ? "active" : "inactive";
        await _db.SaveChangesAsync();

        return Ok(new { success = true, data = user });
    }

    [HttpGet("logs")]
    public async Task<IActionResult> GetLogs([FromQuery] int limit = 100)
    {
        var logs = await _db.ActivityLogs
            .OrderByDescending(l => l.Timestamp)
            .Take(limit)
            .ToListAsync();

        return Ok(new { success = true, data = logs });
    }

    [HttpGet("system-status")]
    public IActionResult GetSystemStatus()
    {
        return Ok(new
        {
            success = true,
            data = new
            {
                status = "operational",
                database = "MySQL Connected (Entity Framework Core)",
                uptimeSeconds = Environment.TickCount64 / 1000,
                timestamp = DateTime.UtcNow
            }
        });
    }

    [HttpGet("db-tables")]
    public async Task<IActionResult> GetDbTables()
    {
        var tables = new[]
        {
            new { Table = "users", RowCount = await _db.Users.CountAsync(), Description = "Admin and HR user accounts" },
            new { Table = "api_keys", RowCount = await _db.ApiKeys.CountAsync(), Description = "Gemini multi-key pool slots" },
            new { Table = "screening_sessions", RowCount = await _db.ScreeningSessions.CountAsync(), Description = "Archived candidate screening sessions" },
            new { Table = "candidates", RowCount = await _db.Candidates.CountAsync(), Description = "Evaluated candidate profiles" },
            new { Table = "job_descriptions", RowCount = await _db.JobDescriptions.CountAsync(), Description = "Job description postings" },
            new { Table = "activity_logs", RowCount = await _db.ActivityLogs.CountAsync(), Description = "User audit logs" },
            new { Table = "analysis_results", RowCount = await _db.AnalysisResults.CountAsync(), Description = "Aggregate session metrics" },
        };

        return Ok(new
        {
            database = "Aiven Cloud MySQL (defaultdb)",
            host = "mysql-1c976af1-rkp102022-06e4.d.aivencloud.com:11722",
            status = "connected",
            totalTables = tables.Length,
            tables
        });
    }
}
