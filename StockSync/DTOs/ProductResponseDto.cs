namespace StockSync.DTOs;

public class ProductResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Category { get; set; } = string.Empty;
    public bool IsDeleted { get; set; }
    public int TotalAvailable { get; set; }
    public int TotalReserved { get; set; }
}