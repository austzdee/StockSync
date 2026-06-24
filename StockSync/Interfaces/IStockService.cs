using StockSync.DTOs;

namespace StockSync.Interfaces;

public interface IStockService
{
    Task<StockResponseDto> AssignStockAsync(AssignStockDto dto);
    Task<StockResponseDto> ReserveStockAsync(ReserveStockDto dto);
    Task<StockResponseDto> ReleaseStockAsync(ReleaseStockDto dto);
    Task<StockTransferResponseDto> TransferStockAsync(TransferStockDto dto);
    Task<IEnumerable<StockListItemDto>> GetLowStockAsync();
    Task<StockListResponseDto> GetAllStockAsync(string? category, int limit, int offset);
}