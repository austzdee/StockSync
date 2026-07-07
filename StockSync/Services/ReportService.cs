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

    public async Task<IEnumerable<LowStockReportDto>> GetLowStockReportAsync(int threshold = 10)
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
}