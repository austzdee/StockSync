using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockSync.Interfaces;

namespace StockSync.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("inventory-summary")]
    public async Task<IActionResult> GetInventorySummary()
    {
        var summary = await _reportService.GetInventorySummaryAsync();
        return Ok(summary);
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStockReport([FromQuery] int threshold = 10)
    {
        if (threshold <= 0)
        {
            return BadRequest(new
            {
                message = "Threshold must be greater than zero."
            });
        }

        var report = await _reportService.GetLowStockReportAsync(threshold);
        return Ok(report);
    }

    [HttpGet("warehouse-stock-value")]
    public async Task<IActionResult> GetWarehouseInventoryValue()
    {
        var report = await _reportService.GetWarehouseInventoryValueAsync();
        return Ok(report);
    }

    [HttpGet("product-stock-value")]
    public async Task<IActionResult> GetProductInventoryValue()
    {
        var report = await _reportService.GetProductInventoryValueAsync();
        return Ok(report);
    }
}
