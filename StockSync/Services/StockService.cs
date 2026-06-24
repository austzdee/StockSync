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
    public async Task<StockResponseDto> AssignStockAsync(AssignStockDto dto)
    {
        // Reject negative stock values
        if (dto.QuantityAvailable < 0)
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

        return new StockResponseDto
        {
            Message = "Stock assigned successfully.",
            ProductId = stock.ProductId,
            WarehouseId = stock.WarehouseId,
            QuantityAvailable = stock.QuantityAvailable,
            QuantityReserved = stock.QuantityReserved
        };
    }

    // Move stock from available to reserved
    public async Task<StockResponseDto> ReserveStockAsync(ReserveStockDto dto)
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

        return new StockResponseDto
        {
            Message = "Stock reserved successfully.",
            ProductId = stock.ProductId,
            WarehouseId = stock.WarehouseId,
            QuantityAvailable = stock.QuantityAvailable,
            QuantityReserved = stock.QuantityReserved
        };
    }

    // Move stock from reserved back to available
    public async Task<StockResponseDto> ReleaseStockAsync(ReleaseStockDto dto)
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
        return new StockResponseDto
        {
            Message = "Reserved stock released successfully.",
            ProductId = stock.ProductId,
            WarehouseId = stock.WarehouseId,
            QuantityAvailable = stock.QuantityAvailable,
            QuantityReserved = stock.QuantityReserved
        };
    }

    // Transfer stock between two warehouses in one transaction
    public async Task<StockTransferResponseDto> TransferStockAsync(TransferStockDto dto)
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
            return new StockTransferResponseDto
            {
                Message = "Stock transferred successfully.",
                ProductId = dto.ProductId,
                FromWarehouseId = dto.FromWarehouseId,
                ToWarehouseId = dto.ToWarehouseId,
                QuantityTransferred = dto.Quantity,
                SourceQuantityAvailable = sourceStock.QuantityAvailable,
                DestinationQuantityAvailable = destinationStock.QuantityAvailable
            };
        }
        catch
        {
            // Roll back if anything fails
            await transaction.RollbackAsync();
            throw;
        }
    }

   
 public async Task<IEnumerable<StockListItemDto>> GetLowStockAsync()
    {
        return await _context.Stocks
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Where(s => s.QuantityAvailable + s.QuantityReserved < 10)
            .Select(s => new StockListItemDto
            {
                ProductId = s.ProductId,
                ProductName = s.Product.Name,
                Sku = s.Product.Sku,
                Category = s.Product.Category,
                WarehouseId = s.WarehouseId,
                WarehouseName = s.Warehouse.LocationName,
                QuantityAvailable = s.QuantityAvailable,
                QuantityReserved = s.QuantityReserved,
                TotalQuantity = s.QuantityAvailable + s.QuantityReserved
            })
            .ToListAsync();
    }


    public async Task<StockListResponseDto> GetAllStockAsync(string? category, int limit, int offset)
    {
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
            .Select(s => new StockListItemDto
{
    ProductId = s.ProductId,
    ProductName = s.Product.Name,
    Sku = s.Product.Sku,
    Category = s.Product.Category,
    WarehouseId = s.WarehouseId,
    WarehouseName = s.Warehouse.LocationName,
    QuantityAvailable = s.QuantityAvailable,
    QuantityReserved = s.QuantityReserved,
    TotalQuantity = s.QuantityAvailable + s.QuantityReserved
})
            .ToListAsync();

        return new StockListResponseDto
        {
            TotalCount = totalCount,
            Limit = limit,
            Offset = offset,
            Results = stocks
        };
    }
}

    