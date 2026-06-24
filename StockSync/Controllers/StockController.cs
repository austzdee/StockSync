using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockSync.DTOs;
using StockSync.Interfaces;

namespace StockSync.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class StockController : ControllerBase
{
   
    private readonly IStockService _stockService;
    private readonly IAuditLogService _auditLogService;

public StockController(
    IStockService stockService,
    IAuditLogService auditLogService)
{
    _stockService = stockService;
    _auditLogService = auditLogService;
}

    [HttpPost("assign")]
    public async Task<IActionResult> AssignStock(AssignStockDto dto)
    {
        try
        {
            var result = await _stockService.AssignStockAsync(dto);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return UnprocessableEntity(new { message = ex.Message });
        }
    }

    [HttpPost("reserve")]
    public async Task<IActionResult> ReserveStock(ReserveStockDto dto)
    {
        try
        {
            var result = await _stockService.ReserveStockAsync(dto);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("release")]
    public async Task<IActionResult> ReleaseStock(ReleaseStockDto dto)
    {
        try
        {
            var result = await _stockService.ReleaseStockAsync(dto);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("transfer")]
    public async Task<IActionResult> TransferStock(TransferStockDto dto)
    {
        try
        {
            var result = await _stockService.TransferStockAsync(dto);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpGet("audit-logs")]
    public async Task<IActionResult> GetAuditLogs()
    {
       var logs = await _auditLogService.GetAllAsync();

        return Ok(logs);
    }

    
    [HttpGet("low-stock")]
public async Task<IActionResult> GetLowStock()
{
    var lowStockItems = await _stockService.GetLowStockAsync();

    return Ok(lowStockItems);
}

    [HttpGet]
public async Task<IActionResult> GetAll(
    [FromQuery] string? category,
    [FromQuery] int limit = 10,
    [FromQuery] int offset = 0)
{
    if (limit <= 0)
        return BadRequest(new { message = "Limit must be greater than zero." });

    if (offset < 0)
        return BadRequest(new { message = "Offset cannot be negative." });

    var stocks = await _stockService.GetAllStockAsync(category, limit, offset);

    return Ok(stocks);
}
}