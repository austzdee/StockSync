using Microsoft.EntityFrameworkCore;
using StockSync.Data;
using StockSync.DTOs;
using StockSync.Entities;
using StockSync.Interfaces;

namespace StockSync.Services;

public class StockService : IStockService
{
    private readonly AppDbContext _context;

    public StockService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<StockResponseDto> AssignStockAsync(AssignStockDto dto)
    {
        if (dto.QuantityAvailable < 0)
            throw new InvalidOperationException("Stock values cannot be negative.");

        // Stock can only be assigned to active inventory dimensions.
        var productExists = await _context.Products
            .AnyAsync(p => p.Id == dto.ProductId && !p.IsDeleted);

        if (!productExists)
            throw new KeyNotFoundException("Product not found.");

        var warehouseExists = await _context.Warehouses
            .AnyAsync(w => w.Id == dto.WarehouseId && !w.IsDeleted);

        if (!warehouseExists)
            throw new KeyNotFoundException("Warehouse not found.");

        var stock = await _context.Stocks
            .FirstOrDefaultAsync(s =>
                s.ProductId == dto.ProductId &&
                s.WarehouseId == dto.WarehouseId);

        if (stock is null)
        {
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
            stock.QuantityAvailable += dto.QuantityAvailable;
        }

        // Audit logs provide the inventory movement history used by reporting.
        _context.AuditLogs.Add(new AuditLog
        {
            ProductId = stock.ProductId,
            WarehouseId = stock.WarehouseId,
            Action = "ASSIGN",
            QuantityChanged = stock.QuantityAvailable + stock.QuantityReserved,
            PerformedBy = "system"
        });

        await _context.SaveChangesAsync();

        return new StockResponseDto
        {
            Message = "Stock assigned successfully.",
            ProductId = stock.ProductId,
            WarehouseId = stock.WarehouseId,
            QuantityAvailable = stock.QuantityAvailable,
            QuantityReserved = stock.QuantityReserved
        };
    }

    public async Task<StockResponseDto> ReserveStockAsync(ReserveStockDto dto)
    {
        if (dto.Quantity <= 0)
            throw new InvalidOperationException("Quantity must be greater than zero.");

        var stock = await _context.Stocks
            .FirstOrDefaultAsync(s =>
                s.ProductId == dto.ProductId &&
                s.WarehouseId == dto.WarehouseId);

        if (stock is null)
            throw new KeyNotFoundException("Stock record not found.");

        if (stock.QuantityAvailable < dto.Quantity)
            throw new InvalidOperationException("Not enough available stock to reserve.");

        // Reservation keeps total inventory unchanged while making the quantity unavailable for sale.
        stock.QuantityAvailable -= dto.Quantity;
        stock.QuantityReserved += dto.Quantity;

        _context.AuditLogs.Add(new AuditLog
        {
            ProductId = stock.ProductId,
            WarehouseId = stock.WarehouseId,
            Action = "RESERVE",
            QuantityChanged = dto.Quantity,
            PerformedBy = "system"
        });

        await _context.SaveChangesAsync();

        return new StockResponseDto
        {
            Message = "Stock reserved successfully.",
            ProductId = stock.ProductId,
            WarehouseId = stock.WarehouseId,
            QuantityAvailable = stock.QuantityAvailable,
            QuantityReserved = stock.QuantityReserved
        };
    }

    public async Task<StockResponseDto> ReleaseStockAsync(ReleaseStockDto dto)
    {
        if (dto.Quantity <= 0)
            throw new InvalidOperationException("Quantity must be greater than zero.");

        var stock = await _context.Stocks
            .FirstOrDefaultAsync(s =>
                s.ProductId == dto.ProductId &&
                s.WarehouseId == dto.WarehouseId);

        if (stock is null)
            throw new KeyNotFoundException("Stock record not found.");

        if (stock.QuantityReserved < dto.Quantity)
            throw new InvalidOperationException("Not enough reserved stock to release.");

        // Releasing reverses a reservation without changing total inventory.
        stock.QuantityReserved -= dto.Quantity;
        stock.QuantityAvailable += dto.Quantity;

        _context.AuditLogs.Add(new AuditLog
        {
            ProductId = stock.ProductId,
            WarehouseId = stock.WarehouseId,
            Action = "RELEASE",
            QuantityChanged = dto.Quantity,
            PerformedBy = "system"
        });

        await _context.SaveChangesAsync();

        return new StockResponseDto
        {
            Message = "Reserved stock released successfully.",
            ProductId = stock.ProductId,
            WarehouseId = stock.WarehouseId,
            QuantityAvailable = stock.QuantityAvailable,
            QuantityReserved = stock.QuantityReserved
        };
    }

    public async Task<StockTransferResponseDto> TransferStockAsync(TransferStockDto dto)
    {
        if (dto.Quantity <= 0)
            throw new InvalidOperationException("Quantity must be greater than zero.");

        if (dto.FromWarehouseId == dto.ToWarehouseId)
            throw new InvalidOperationException("Source and destination warehouses must be different.");

        // Validate both warehouses before opening the transaction to keep the locked work short.
        var sourceWarehouseExists = await _context.Warehouses
            .AnyAsync(w => w.Id == dto.FromWarehouseId && !w.IsDeleted);

        if (!sourceWarehouseExists)
            throw new KeyNotFoundException("Source warehouse not found.");

        var destinationWarehouseExists = await _context.Warehouses
            .AnyAsync(w => w.Id == dto.ToWarehouseId && !w.IsDeleted);

        if (!destinationWarehouseExists)
            throw new KeyNotFoundException("Destination warehouse not found.");

        // Source decrement, destination increment, and audit records must commit atomically.
        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var sourceStock = await _context.Stocks
                .FirstOrDefaultAsync(s =>
                    s.ProductId == dto.ProductId &&
                    s.WarehouseId == dto.FromWarehouseId);

            if (sourceStock is null)
                throw new KeyNotFoundException("Source stock record not found.");

            if (sourceStock.QuantityAvailable < dto.Quantity)
                throw new InvalidOperationException("Not enough available stock in source warehouse.");

            var destinationStock = await _context.Stocks
                .FirstOrDefaultAsync(s =>
                    s.ProductId == dto.ProductId &&
                    s.WarehouseId == dto.ToWarehouseId);

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

            sourceStock.QuantityAvailable -= dto.Quantity;
            destinationStock.QuantityAvailable += dto.Quantity;

            // Store separate audit rows so each warehouse ledger can be reviewed independently.
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
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<IEnumerable<StockListItemDto>> GetLowStockAsync()
    {
        // Low stock is based on total on-hand inventory, including reserved units.
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

    
