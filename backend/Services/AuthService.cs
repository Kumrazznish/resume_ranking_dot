using Microsoft.EntityFrameworkCore;
using ResumeRanker.Api.Data;
using ResumeRanker.Api.Models;

namespace ResumeRanker.Api.Services;

public interface IAuthService
{
    Task LogActivityAsync(string? userId, string userName, string userEmail, string actionType, string details);
}

public class AuthService : IAuthService
{
    private readonly ResumeRankingDbContext _db;
    private readonly ILogger<AuthService> _logger;

    public AuthService(ResumeRankingDbContext db, ILogger<AuthService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task LogActivityAsync(string? userId, string userName, string userEmail, string actionType, string details)
    {
        try
        {
            var log = new ActivityLog
            {
                UserId = userId,
                UserName = userName,
                UserEmail = userEmail,
                ActionType = actionType,
                Details = details,
                Timestamp = DateTime.UtcNow
            };

            _db.ActivityLogs.Add(log);
            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[AuthService] Error writing activity log");
        }
    }
}
