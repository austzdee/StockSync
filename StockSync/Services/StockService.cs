using Microsoft.EntityFrameworkCore;
using StockSync.Data;
using StockSync.DTOs;
using StockSync.Entities;
using StockSync.Interfaces;

namespace StockSync.Services;

public class StockService : IStockService
{
    private readonly AppDbContext _context;

    // Inject database context
    public StockService(AppDbContext context)
    {
        _context = context;
    }

    // Create a new stock record or update an existing one
    public async Task<object> AssignStockAsync(AssignStockDto dto)
    {
        // Reject negative stock values
        if (dto.QuantityAvailable < 0 )
            throw new InvalidOperationException("Stock values cannot be negative.");

        // Confirm product exists and is active
        var productExists = await _context.Products
            .AnyAsync(p => p.Id == dto.ProductId && !p.IsDeleted);

        if (!productExists)
            throw new KeyNotFoundException("Product not found.");

        // Confirm warehouse exists and is active
        var warehouseExists = await _context.Warehouses
            .AnyAsync(w => w.Id == dto.WarehouseId && !w.IsDeleted);

        if (!warehouseExists)
            throw new KeyNotFoundException("Warehouse not found.");

        // Check if stock row already exists for this product and warehouse
        var stock = await _context.Stocks
            .FirstOrDefaultAsync(s =>
                s.ProductId == dto.ProductId &&
                s.WarehouseId == dto.WarehouseId);

        if (stock is null)
        {
            // Create a new stock row
            stock = new Stock
            {
                ProductId = dto.ProductId,
                WarehouseId = dto.WarehouseId,
                QuantityAvailable = dto.QuantityAvailable,
                QuantityReserved = 0
            };

            _context.Stocks.Add(stock);
        }
        else
        {
            // Update only available stock
            stock.QuantityAvailable += dto.QuantityAvailable;
        }

        // Record stock assignment in audit log
        _context.AuditLogs.Add(new AuditLog
        {
            ProductId = stock.ProductId,
            WarehouseId = stock.WarehouseId,
            Action = "ASSIGN",
            QuantityChanged = stock.QuantityAvailable + stock.QuantityReserved,
            PerformedBy = "system"
        });

        await _context.SaveChangesAsync();

        // Return API-friendly response object
        return new
        {
            message = "Stock assigned successfully.",
            stock.ProductId,
            stock.WarehouseId,
            stock.QuantityAvailable,
            stock.QuantityReserved
        };
    }

    // Move stock from available to reserved
    public async Task<object> ReserveStockAsync(ReserveStockDto dto)
    {
        // Reject invalid quantity
        if (dto.Quantity <= 0)
            throw new InvalidOperationException("Quantity must be greater than zero.");

        // Find matching stock row
        var stock = await _context.Stocks
            .FirstOrDefaultAsync(s =>
                s.ProductId == dto.ProductId &&
                s.WarehouseId == dto.WarehouseId);

        if (stock is null)
            throw new KeyNotFoundException("Stock record not found.");

        // Prevent reserving more than available
        if (stock.QuantityAvailable < dto.Quantity)
            throw new InvalidOperationException("Not enough available stock to reserve.");

        // Update stock values
        stock.QuantityAvailable -= dto.Quantity;
        stock.QuantityReserved += dto.Quantity;

        // Record reservation in audit log
        _context.AuditLogs.Add(new AuditLog
        {
            ProductId = stock.ProductId,
            WarehouseId = stock.WarehouseId,
            Action = "RESERVE",
            QuantityChanged = dto.Quantity,
            PerformedBy = "system"
        });

        await _context.SaveChangesAsync();

        // Return API-friendly response object
        return new
        {
            message = "Stock reserved successfully.",
            stock.ProductId,
            stock.WarehouseId,
            stock.QuantityAvailable,
            stock.QuantityReserved
        };
    }

    // Move stock from reserved back to available
    public async Task<object> ReleaseStockAsync(ReleaseStockDto dto)
    {
        // Reject invalid quantity
        if (dto.Quantity <= 0)
            throw new InvalidOperationException("Quantity must be greater than zero.");

        // Find matching stock row
        var stock = await _context.Stocks
            .FirstOrDefaultAsync(s =>
                s.ProductId == dto.ProductId &&
                s.WarehouseId == dto.WarehouseId);

        if (stock is null)
            throw new KeyNotFoundException("Stock record not found.");

        // Prevent releasing more than reserved
        if (stock.QuantityReserved < dto.Quantity)
            throw new InvalidOperationException("Not enough reserved stock to release.");

        // Update stock values
        stock.QuantityReserved -= dto.Quantity;
        stock.QuantityAvailable += dto.Quantity;

        // Record release in audit log
        _context.AuditLogs.Add(new AuditLog
        {
            ProductId = stock.ProductId,
            WarehouseId = stock.WarehouseId,
            Action = "RELEASE",
            QuantityChanged = dto.Quantity,
            PerformedBy = "system"
        });

        await _context.SaveChangesAsync();

        // Return API-friendly response object
        return new
        {
            message = "Reserved stock released successfully.",
            stock.ProductId,
            stock.WarehouseId,
            stock.QuantityAvailable,
            stock.QuantityReserved
        };
    }

    // Transfer stock between two warehouses in one transaction
    public async Task<object> TransferStockAsync(TransferStockDto dto)
    {
        // Reject invalid quantity
        if (dto.Quantity <= 0)
            throw new InvalidOperationException("Quantity must be greater than zero.");

        // Prevent transfer to the same warehouse
        if (dto.FromWarehouseId == dto.ToWarehouseId)
            throw new InvalidOperationException("Source and destination warehouses must be different.");

        // Confirm source warehouse exists and is active
        var sourceWarehouseExists = await _context.Warehouses
            .AnyAsync(w => w.Id == dto.FromWarehouseId && !w.IsDeleted);

        if (!sourceWarehouseExists)
            throw new KeyNotFoundException("Source warehouse not found.");

        // Confirm destination warehouse exists and is active
        var destinationWarehouseExists = await _context.Warehouses
            .AnyAsync(w => w.Id == dto.ToWarehouseId && !w.IsDeleted);

        if (!destinationWarehouseExists)
            throw new KeyNotFoundException("Destination warehouse not found.");

        // Start database transaction for atomic transfer
        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Find source stock row
            var sourceStock = await _context.Stocks
                .FirstOrDefaultAsync(s =>
                    s.ProductId == dto.ProductId &&
                    s.WarehouseId == dto.FromWarehouseId);

            if (sourceStock is null)
                throw new KeyNotFoundException("Source stock record not found.");

            // Prevent transfer beyond available stock
            if (sourceStock.QuantityAvailable < dto.Quantity)
                throw new InvalidOperationException("Not enough available stock in source warehouse.");

            // Find destination stock row
            var destinationStock = await _context.Stocks
                .FirstOrDefaultAsync(s =>
                    s.ProductId == dto.ProductId &&
                    s.WarehouseId == dto.ToWarehouseId);

            // Create destination stock row if missing
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

            // Move stock between warehouses
            sourceStock.QuantityAvailable -= dto.Quantity;
            destinationStock.QuantityAvailable += dto.Quantity;

            // Record both sides of the transfer in audit log
            _context.AuditLogs.AddRange(
                new AuditLog
                {
                    ProductId = dto.ProductId,
                    WarehouseId = dto.FromWarehouseId,
                    Action = "TRANSFER_OUT",
                    QuantityChanged = -dto.Quantity,
                    PerformedBy = "system"
                },
                new AuditLog
                {
                    ProductId = dto.ProductId,
                    WarehouseId = dto.ToWarehouseId,
                    Action = "TRANSFER_IN",
                    QuantityChanged = dto.Quantity,
                    PerformedBy = "system"
                }
            );

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // Return API-friendly response object
            return new
            {
                message = "Stock transferred successfully.",
                productId = dto.ProductId,
                fromWarehouseId = dto.FromWarehouseId,
                toWarehouseId = dto.ToWarehouseId,
                quantityTransferred = dto.Quantity,
                sourceQuantityAvailable = sourceStock.QuantityAvailable,
                destinationQuantityAvailable = destinationStock.QuantityAvailable
            };
        }
        catch
        {
            // Roll back if anything fails
            await transaction.RollbackAsync();
            throw;
        }
    }
}