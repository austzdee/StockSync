using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockSync.Data;
using StockSync.DTOs;
using StockSync.Entities;

namespace StockSync.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StockController : ControllerBase
{
    private readonly AppDbContext _context;

    // Inject database context
    public StockController(AppDbContext context)
    {
        _context = context;
    }

    // Create or update stock for a product in a warehouse
    [HttpPost("assign")]
    public async Task<IActionResult> AssignStock(AssignStockDto dto)
    {
        // Reject invalid quantities
        if (dto.QuantityAvailable < 0 || dto.QuantityReserved < 0)
            return UnprocessableEntity(new { message = "Stock values cannot be negative." });

        // Check that product exists
        var productExists = await _context.Products
            .AnyAsync(p => p.Id == dto.ProductId && !p.IsDeleted);

        if (!productExists)
            return NotFound(new { message = "Product not found." });

        // Check that warehouse exists
        var warehouseExists = await _context.Warehouses
            .AnyAsync(w => w.Id == dto.WarehouseId);

        if (!warehouseExists)
            return NotFound(new { message = "Warehouse not found." });

        // Check whether stock row already exists
        var stock = await _context.Stocks
            .FirstOrDefaultAsync(s =>
                s.ProductId == dto.ProductId &&
                s.WarehouseId == dto.WarehouseId);

        if (stock is null)
        {
            // Create new stock record
            stock = new Stock
            {
                ProductId = dto.ProductId,
                WarehouseId = dto.WarehouseId,
                QuantityAvailable = dto.QuantityAvailable,
                QuantityReserved = dto.QuantityReserved
            };

            _context.Stocks.Add(stock);
        }
        else
        {
            // Update existing stock record
            stock.QuantityAvailable = dto.QuantityAvailable;
            stock.QuantityReserved = dto.QuantityReserved;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Stock assigned successfully.",
            stock.ProductId,
            stock.WarehouseId,
            stock.QuantityAvailable,
            stock.QuantityReserved
        });
    }

    // Reserve stock for a product in a warehouse
    [HttpPost("reserve")]
    public async Task<IActionResult> ReserveStock(ReserveStockDto dto)
    {
        // Reject invalid quantity
        if (dto.Quantity <= 0)
            return UnprocessableEntity(new { message = "Quantity must be greater than zero." });

        // Find stock record
        var stock = await _context.Stocks
            .FirstOrDefaultAsync(s =>
                s.ProductId == dto.ProductId &&
                s.WarehouseId == dto.WarehouseId);

        if (stock is null)
            return NotFound(new { message = "Stock record not found." });

        // Prevent over-reservation
        if (stock.QuantityAvailable < dto.Quantity)
            return Conflict(new { message = "Not enough available stock to reserve." });

        // Move quantity from available to reserved
        stock.QuantityAvailable -= dto.Quantity;
        stock.QuantityReserved += dto.Quantity;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Stock reserved successfully.",
            stock.ProductId,
            stock.WarehouseId,
            stock.QuantityAvailable,
            stock.QuantityReserved
        });
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