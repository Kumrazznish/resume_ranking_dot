using Microsoft.AspNetCore.Mvc;
using ResumeRanker.Api.Data;

namespace ResumeRanker.Api.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    private readonly ResumeRankingDbContext _db;

    public HealthController(ResumeRankingDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetHealth()
    {
        bool canConnect = false;
        try
        {
            canConnect = await _db.Database.CanConnectAsync();
        }
        catch
        {
            canConnect = false;
        }

        return Ok(new
        {
            status = "online",
            database = canConnect ? "MySQL Connected (Pomelo EF Core)" : "Database Initializing",
            environment = "dotnet-csharp",
            timestamp = DateTime.UtcNow,
            uptime = Environment.TickCount64 / 1000
        });
    }
}
