using System.ComponentModel.DataAnnotations;

namespace StockSync.DTOs;

public class CreateWarehouseDto
{
    [Required]
    [StringLength(100)]
    public string LocationName { get; set; } = string.Empty;

    [Required]
    [StringLength(250)]
    public string Address { get; set; } = string.Empty;
}