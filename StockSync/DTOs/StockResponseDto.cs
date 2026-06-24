namespace StockSync.DTOs;

public class StockResponseDto
{
    public string Message { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public int WarehouseId { get; set; }
    public int QuantityAvailable { get; set; }
    public int QuantityReserved { get; set; }
}