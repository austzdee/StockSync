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
}