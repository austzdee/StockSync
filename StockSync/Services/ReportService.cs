using Microsoft.EntityFrameworkCore;
using StockSync.Data;
using StockSync.DTOs;
using StockSync.Interfaces;

namespace StockSync.Services;

public class ReportService : IReportService
{
    private readonly AppDbContext _context;

    public ReportService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<InventorySummaryDto> GetInventorySummaryAsync()
    {
        var totalProducts = await _context.Products
            .CountAsync(p => !p.IsDeleted);

        var totalWarehouses = await _context.Warehouses
            .CountAsync(w => !w.IsDeleted);

        var stockData = await _context.Stocks
            .Include(s => s.Product)
            .Where(s => !s.Product.IsDeleted)
            .Select(s => new
            {
                s.QuantityAvailable,
                s.QuantityReserved,
                s.Product.Price
            })
            .ToListAsync();

        return new InventorySummaryDto
        {
            TotalProducts = totalProducts,
            TotalWarehouses = totalWarehouses,
            TotalAvailableStock = stockData.Sum(s => s.QuantityAvailable),
            TotalReservedStock = stockData.Sum(s => s.QuantityReserved),
            TotalStockQuantity = stockData.Sum(s => s.QuantityAvailable + s.QuantityReserved),
            TotalInventoryValue = stockData.Sum(s =>
                (s.QuantityAvailable + s.QuantityReserved) * s.Price)
        };
    }

    public async Task<IEnumerable<LowStockReportDto>> GetLowStockReportAsync(
        int threshold = 10)
    {
        return await _context.Stocks
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Where(s =>
                !s.Product.IsDeleted &&
                !s.Warehouse.IsDeleted &&
                s.QuantityAvailable + s.QuantityReserved < threshold)
            .OrderBy(s => s.QuantityAvailable + s.QuantityReserved)
            .Select(s => new LowStockReportDto
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

    public async Task<IEnumerable<WarehouseInventoryValueDto>>
        GetWarehouseInventoryValueAsync()
    {
        return await _context.Stocks
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Where(s =>
                !s.Product.IsDeleted &&
                !s.Warehouse.IsDeleted)
            .GroupBy(s => new
            {
                s.WarehouseId,
                s.Warehouse.LocationName
            })
            .Select(group => new WarehouseInventoryValueDto
            {
                WarehouseId = group.Key.WarehouseId,
                WarehouseName = group.Key.LocationName,
                TotalProducts = group
                    .Select(s => s.ProductId)
                    .Distinct()
                    .Count(),
                TotalUnits = group.Sum(s =>
                    s.QuantityAvailable + s.QuantityReserved),
                InventoryValue = group.Sum(s =>
                    (s.QuantityAvailable + s.QuantityReserved) *
                    s.Product.Price)
            })
            .OrderByDescending(item => item.InventoryValue)
            .ToListAsync();
    }

    public async Task<IEnumerable<ProductInventoryValueDto>>
        GetProductInventoryValueAsync()
    {
        return await _context.Stocks
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Where(s =>
                !s.Product.IsDeleted &&
                !s.Warehouse.IsDeleted)
            .GroupBy(s => new
            {
                s.ProductId,
                s.Product.Name,
                s.Product.Sku,
                s.Product.Category,
                s.Product.Price
            })
            .Select(group => new ProductInventoryValueDto
            {
                ProductId = group.Key.ProductId,
                ProductName = group.Key.Name,
                Sku = group.Key.Sku,
                Category = group.Key.Category,
                UnitPrice = group.Key.Price,
                TotalAvailableQuantity = group.Sum(s => s.QuantityAvailable),
                TotalReservedQuantity = group.Sum(s => s.QuantityReserved),
                TotalQuantity = group.Sum(s =>
                    s.QuantityAvailable + s.QuantityReserved),
                AvailableInventoryValue = group.Sum(s =>
                    s.QuantityAvailable * group.Key.Price),
                ReservedInventoryValue = group.Sum(s =>
                    s.QuantityReserved * group.Key.Price),
                TotalInventoryValue = group.Sum(s =>
                    (s.QuantityAvailable + s.QuantityReserved) *
                    group.Key.Price)
            })
            .OrderByDescending(item => item.TotalInventoryValue)
            .ThenBy(item => item.ProductName)
            .ToListAsync();
    }
}
