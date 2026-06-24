using System.ComponentModel.DataAnnotations;

namespace StockSync.DTOs;

public class UpdateProductDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Sku { get; set; } = string.Empty;

    [Range(0.01, 999999.99)]
    public decimal Price { get; set; }

    [Required]
    [StringLength(100)]
    public string Category { get; set; } = string.Empty;
}