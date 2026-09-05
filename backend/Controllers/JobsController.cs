using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeRanker.Api.Data;
using ResumeRanker.Api.Models;

namespace ResumeRanker.Api.Controllers;

[ApiController]
[Route("api/jobs")]
public class JobsController : ControllerBase
{
    private readonly ResumeRankingDbContext _db;

    public JobsController(ResumeRankingDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetJobs()
    {
        var jobs = await _db.JobDescriptions.OrderByDescending(j => j.CreatedAt).ToListAsync();
        return Ok(new { success = true, data = jobs });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetJob(string id)
    {
        var job = await _db.JobDescriptions.FirstOrDefaultAsync(j => j.Id == id);
        if (job == null)
        {
            return NotFound(new { success = false, error = "Job description not found" });
        }
        return Ok(new { success = true, data = job });
    }

    [HttpPost]
    public async Task<IActionResult> CreateJob([FromBody] JobDescription job)
    {
        if (string.IsNullOrWhiteSpace(job.Title) || string.IsNullOrWhiteSpace(job.Description))
        {
            return BadRequest(new { success = false, error = "Job title and description are required" });
        }

        if (string.IsNullOrWhiteSpace(job.Id)) job.Id = Guid.NewGuid().ToString();
        job.CreatedAt = DateTime.UtcNow;
        job.UpdatedAt = DateTime.UtcNow;

        _db.JobDescriptions.Add(job);
        await _db.SaveChangesAsync();

        return StatusCode(201, new { success = true, data = job });
    }
}
