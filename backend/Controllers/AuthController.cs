using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeRanker.Api.Data;
using ResumeRanker.Api.Models;
using ResumeRanker.Api.Services;

namespace ResumeRanker.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly ResumeRankingDbContext _db;
    private readonly IAuthService _authService;

    public AuthController(ResumeRankingDbContext db, IAuthService authService)
    {
        _db = db;
        _authService = authService;
    }

    public record RegisterRequest(string Name, string Email, string Password, string? Role, string? Company, string? Department);
    public record LoginRequest(string Email, string Password, string? Role);
    public record ActivityLogRequest(string? UserId, string? UserName, string? UserEmail, string? ActionType, string? Details);

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name) || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
        {
            return BadRequest(new { success = false, error = "Name, email, and password are required" });
        }

        var normalizedEmail = req.Email.Trim().ToLowerInvariant();
        var existing = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
        if (existing != null)
        {
            return BadRequest(new { success = false, error = "An account with this email already exists" });
        }

        var user = new User
        {
            Name = req.Name.Trim(),
            Email = normalizedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Role = string.IsNullOrWhiteSpace(req.Role) ? "hr" : req.Role.ToLowerInvariant(),
            Company = req.Company ?? "Talent Corp",
            Department = req.Department ?? "Recruitment",
            Status = "active",
            LastActive = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        await _authService.LogActivityAsync(user.Id, user.Name, user.Email, "LOGIN", $"New account registered as {user.Role.ToUpper()}");

        return StatusCode(201, new
        {
            success = true,
            data = new
            {
                id = user.Id,
                name = user.Name,
                email = user.Email,
                role = user.Role,
                company = user.Company,
                department = user.Department,
                resumes_analyzed_count = user.ResumesAnalyzedCount,
                emails_sent_count = user.EmailsSentCount
            }
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
        {
            return BadRequest(new { success = false, error = "Email and password are required" });
        }

        var normalizedEmail = req.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        // Special handling for master admin fallback if db seed hasn't run
        if (user == null && normalizedEmail == "admin@resumeranker.ai" && req.Password == "admin123")
        {
            user = new User
            {
                Id = "admin_master_1",
                Name = "Master Admin",
                Email = "admin@resumeranker.ai",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = "admin",
                Company = "TalentAI Executive",
                Department = "Operations",
                Status = "active"
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
        }

        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
        {
            return Unauthorized(new { success = false, error = "Invalid email or password" });
        }

        if (user.Status == "inactive")
        {
            return Unauthorized(new { success = false, error = "Account has been suspended. Please contact the administrator." });
        }

        user.LastActive = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        await _authService.LogActivityAsync(user.Id, user.Name, user.Email, "LOGIN", $"Logged in successfully to {user.Role.ToUpper()} dashboard");

        return Ok(new
        {
            success = true,
            data = new
            {
                id = user.Id,
                name = user.Name,
                email = user.Email,
                role = user.Role,
                company = user.Company,
                department = user.Department,
                resumes_analyzed_count = user.ResumesAnalyzedCount,
                emails_sent_count = user.EmailsSentCount,
                token = $"mock-jwt-token-{user.Id}-{DateTime.UtcNow.Ticks}"
            }
        });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        return Ok(new { success = true, message = "Logged out successfully" });
    }

    [HttpGet("me")]
    public async Task<IActionResult> Me([FromHeader(Name = "Authorization")] string? authHeader)
    {
        var user = await _db.Users.FirstOrDefaultAsync();
        if (user != null)
        {
            return Ok(new { success = true, data = user });
        }
        return Unauthorized(new { success = false, error = "Not authenticated" });
    }

    [HttpPost("activity-log")]
    public async Task<IActionResult> PostActivityLog([FromBody] ActivityLogRequest req)
    {
        await _authService.LogActivityAsync(
            req.UserId,
            req.UserName ?? "Recruiter",
            req.UserEmail ?? "recruiter@company.org",
            req.ActionType ?? "ACTION",
            req.Details ?? string.Empty
        );
        return Ok(new { success = true });
    }
}
