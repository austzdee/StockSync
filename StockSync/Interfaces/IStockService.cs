using StockSync.DTOs;

namespace StockSync.Interfaces;

public interface IStockService
{
    Task<object> AssignStockAsync(AssignStockDto dto);
    Task<object> ReserveStockAsync(ReserveStockDto dto);
    Task<object> ReleaseStockAsync(ReleaseStockDto dto);
    Task<object> TransferStockAsync(TransferStockDto dto);
    Task<object> GetLowStockAsync();
    Task<object> GetAllStockAsync(string? category, int limit, int offset);
}