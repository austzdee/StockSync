using StockSync.DTOs;

namespace StockSync.Interfaces;

public interface IReportService
{
    Task<InventorySummaryDto> GetInventorySummaryAsync();
    Task<IEnumerable<LowStockReportDto>> GetLowStockReportAsync(int threshold = 10);
}