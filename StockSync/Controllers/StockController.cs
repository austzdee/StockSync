using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockSync.Data;
using StockSync.DTOs;
using StockSync.Interfaces;

namespace StockSync.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StockController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IStockService _stockService;

    // Inject database context and stock service
    public StockController(AppDbContext context, IStockService stockService)
    {
        _context = context;
        _stockService = stockService;
    }

    // Create or update stock for a product in a warehouse
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

    // Reserve stock for a product in a warehouse
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

    // Release reserved stock back to available stock
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

    // Transfer stock from one warehouse to another
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

    // Get audit log history
    [HttpGet("audit-logs")]
    public async Task<IActionResult> GetAuditLogs()
    {
        var logs = await _context.AuditLogs
            .OrderByDescending(a => a.CreatedAtUtc)
            .ToListAsync();

        return Ok(logs);
    }

    // Get all stock records
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var stocks = await _context.Stocks
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Select(s => new
            {
                s.ProductId,
                ProductName = s.Product.Name,
                s.WarehouseId,
                WarehouseName = s.Warehouse.LocationName,
                s.QuantityAvailable,
                s.QuantityReserved
            })
            .ToListAsync();

        return Ok(stocks);
    }
}