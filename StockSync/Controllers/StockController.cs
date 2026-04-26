using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockSync.Data;
using StockSync.DTOs;
using StockSync.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace StockSync.Controllers;

[Authorize]
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

    // Get low stock records where total stock is less than 10
    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStock()
    {
        var lowStockItems = await _context.Stocks
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Where(s => s.QuantityAvailable + s.QuantityReserved < 10)
            .Select(s => new
            {
                s.ProductId,
                ProductName = s.Product.Name,
                s.Product.Sku,
                s.Product.Category,
                s.WarehouseId,
                WarehouseName = s.Warehouse.LocationName,
                s.QuantityAvailable,
                s.QuantityReserved,
                TotalQuantity = s.QuantityAvailable + s.QuantityReserved
            })
            .ToListAsync();

        return Ok(lowStockItems);
    }

    // Get all stock records with optional category filter and pagination
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

        var query = _context.Stocks
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Where(s => !s.Product.IsDeleted && !s.Warehouse.IsDeleted)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(s => s.Product.Category == category);
        }

        var totalCount = await query.CountAsync();

        var stocks = await query
            .OrderBy(s => s.Product.Name)
            .Skip(offset)
            .Take(limit)
            .Select(s => new
            {
                s.ProductId,
                ProductName = s.Product.Name,
                s.Product.Sku,
                s.Product.Category,
                s.WarehouseId,
                WarehouseName = s.Warehouse.LocationName,
                s.QuantityAvailable,
                s.QuantityReserved,
                TotalQuantity = s.QuantityAvailable + s.QuantityReserved
            })
            .ToListAsync();

        return Ok(new
        {
            totalCount,
            limit,
            offset,
            results = stocks
        });
    }
}