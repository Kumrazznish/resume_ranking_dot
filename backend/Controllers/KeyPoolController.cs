using Microsoft.AspNetCore.Mvc;
using ResumeRanker.Api.Services;

namespace ResumeRanker.Api.Controllers;

[ApiController]
[Route("api/admin/key-pool")]
public class KeyPoolController : ControllerBase
{
    private readonly KeyPoolManager _keyPoolManager;

    public KeyPoolController(KeyPoolManager keyPoolManager)
    {
        _keyPoolManager = keyPoolManager;
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
    {
        await _keyPoolManager.InitializeAsync();
        var snapshot = _keyPoolManager.GetLiveStatusSnapshot();
        return Ok(new { success = true, data = snapshot });
    }

    public record AddKeyRequest(string ApiKey, string? Name, string? Provider, int? RateLimit, int? SoftLimit);

    [HttpPost("keys")]
    public async Task<IActionResult> AddKey([FromBody] AddKeyRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.ApiKey) || req.ApiKey.Trim().Length < 8)
        {
            return BadRequest(new { success = false, error = "Valid API key is required" });
        }

        var slot = await _keyPoolManager.AddKeyAsync(
            req.ApiKey,
            req.Name ?? "Gemini Key Slot",
            req.Provider ?? "gemini",
            req.RateLimit ?? 15,
            req.SoftLimit ?? 12
        );

        return StatusCode(201, new
        {
            success = true,
            message = "API Key successfully registered in pool",
            data = new
            {
                id = slot.Id,
                name = slot.Name,
                maskedKey = slot.MaskedKey,
                healthScore = slot.HealthScore,
                rateLimit = slot.RateLimit
            }
        });
    }

    public record ToggleKeyRequest(bool IsActive);

    [HttpPatch("keys/{id}/toggle")]
    public async Task<IActionResult> ToggleKey(string id, [FromBody] ToggleKeyRequest req)
    {
        var updated = await _keyPoolManager.ToggleKeyAsync(id, req.IsActive);
        return Ok(new
        {
            success = true,
            message = $"Key {id} is now {(req.IsActive ? "active" : "disabled")}",
            data = new { id, isActive = req.IsActive }
        });
    }

    [HttpDelete("keys/{id}")]
    public async Task<IActionResult> DeleteKey(string id)
    {
        await _keyPoolManager.DeleteKeyAsync(id);
        return Ok(new { success = true, message = "Key slot removed successfully" });
    }
}
