using Microsoft.EntityFrameworkCore;
using ResumeRanker.Api.Models;

namespace ResumeRanker.Api.Data;

public class ResumeRankingDbContext : DbContext
{
    public ResumeRankingDbContext(DbContextOptions<ResumeRankingDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<JobDescription> JobDescriptions => Set<JobDescription>();
    public DbSet<Candidate> Candidates => Set<Candidate>();
    public DbSet<ScreeningSession> ScreeningSessions => Set<ScreeningSession>();
    public DbSet<ApiKeySlot> ApiKeys => Set<ApiKeySlot>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();
    public DbSet<AnalysisResult> AnalysisResults => Set<AnalysisResult>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User indexes
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Role);

        // Candidate indexes
        modelBuilder.Entity<Candidate>()
            .HasIndex(c => c.MatchScore);

        modelBuilder.Entity<Candidate>()
            .HasIndex(c => c.IsRelevant);

        // ScreeningSession indexes
        modelBuilder.Entity<ScreeningSession>()
            .HasIndex(s => s.CreatedAt);

        // ApiKeySlot indexes
        modelBuilder.Entity<ApiKeySlot>()
            .HasIndex(k => new { k.IsActive, k.QueuePosition, k.HealthScore, k.IsOccupied });

        // Seed initial Master Admin
        var adminPasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123");
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = "admin_master_1",
                Name = "Master Admin",
                Email = "admin@resumeranker.ai",
                PasswordHash = adminPasswordHash,
                Role = "admin",
                Company = "TalentAI Executive",
                Department = "Operations",
                Status = "active",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                LastActive = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
