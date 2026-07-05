using StockSync.DTOs;

namespace StockSync.Interfaces;

public interface IReportService
{
    Task<InventorySummaryDto> GetInventorySummaryAsync();
}