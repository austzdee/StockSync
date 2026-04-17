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

    // Release reserved stock back to available stock
    [HttpPost("release")]
    public async Task<IActionResult> ReleaseStock(ReleaseStockDto dto)
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

        // Prevent releasing more than reserved
        if (stock.QuantityReserved < dto.Quantity)
            return Conflict(new { message = "Not enough reserved stock to release." });

        // Move quantity from reserved back to available
        stock.QuantityReserved -= dto.Quantity;
        stock.QuantityAvailable += dto.Quantity;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Reserved stock released successfully.",
            stock.ProductId,
            stock.WarehouseId,
            stock.QuantityAvailable,
            stock.QuantityReserved
        });
    }

    // Transfer stock from one warehouse to another
    [HttpPost("transfer")]
    public async Task<IActionResult> TransferStock(TransferStockDto dto)
    {
        // Reject invalid quantity
        if (dto.Quantity <= 0)
            return UnprocessableEntity(new { message = "Quantity must be greater than zero." });

        // Prevent same warehouse transfer
        if (dto.FromWarehouseId == dto.ToWarehouseId)
            return UnprocessableEntity(new { message = "Source and destination warehouses must be different." });

        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Find source stock
            var sourceStock = await _context.Stocks
                .FirstOrDefaultAsync(s =>
                    s.ProductId == dto.ProductId &&
                    s.WarehouseId == dto.FromWarehouseId);

            if (sourceStock is null)
                return NotFound(new { message = "Source stock record not found." });

            // Check available stock
            if (sourceStock.QuantityAvailable < dto.Quantity)
                return Conflict(new { message = "Not enough available stock in source warehouse." });

            // Find destination stock
            var destinationStock = await _context.Stocks
                .FirstOrDefaultAsync(s =>
                    s.ProductId == dto.ProductId &&
                    s.WarehouseId == dto.ToWarehouseId);

            // Create destination stock row if it does not exist
            if (destinationStock is null)
            {
                destinationStock = new Stock
                {
                    ProductId = dto.ProductId,
                    WarehouseId = dto.ToWarehouseId,
                    QuantityAvailable = 0,
                    QuantityReserved = 0
                };

                _context.Stocks.Add(destinationStock);
            }

            // Move stock
            sourceStock.QuantityAvailable -= dto.Quantity;
            destinationStock.QuantityAvailable += dto.Quantity;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new
            {
                message = "Stock transferred successfully.",
                productId = dto.ProductId,
                fromWarehouseId = dto.FromWarehouseId,
                toWarehouseId = dto.ToWarehouseId,
                quantityTransferred = dto.Quantity,
                sourceQuantityAvailable = sourceStock.QuantityAvailable,
                destinationQuantityAvailable = destinationStock.QuantityAvailable
            });
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
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