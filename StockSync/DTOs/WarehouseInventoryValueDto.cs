namespace StockSync.DTOs;

public class WarehouseInventoryValueDto
{
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public int TotalProducts { get; set; }
    public int TotalUnits { get; set; }
    public decimal InventoryValue { get; set; }
}