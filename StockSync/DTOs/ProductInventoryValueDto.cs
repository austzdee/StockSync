namespace StockSync.DTOs;

public class ProductInventoryValueDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string? Category { get; set; }
    public decimal UnitPrice { get; set; }
    public int TotalAvailableQuantity { get; set; }
    public int TotalReservedQuantity { get; set; }
    public int TotalQuantity { get; set; }
    public decimal AvailableInventoryValue { get; set; }
    public decimal ReservedInventoryValue { get; set; }
    public decimal TotalInventoryValue { get; set; }
}
