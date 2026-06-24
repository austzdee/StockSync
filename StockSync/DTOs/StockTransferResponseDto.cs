namespace StockSync.DTOs;

public class StockTransferResponseDto
{
    public string Message { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public int FromWarehouseId { get; set; }
    public int ToWarehouseId { get; set; }
    public int QuantityTransferred { get; set; }
    public int SourceQuantityAvailable { get; set; }
    public int DestinationQuantityAvailable { get; set; }
}