namespace StockSync.DTOs;

public class InventorySummaryDto
{
    public int TotalProducts { get; set; }
    public int TotalWarehouses { get; set; }
    public int TotalAvailableStock { get; set; }
    public int TotalReservedStock { get; set; }
    public int TotalStockQuantity { get; set; }
    public decimal TotalInventoryValue { get; set; }
}