using System.ComponentModel.DataAnnotations;

namespace StockSync.DTOs;

public class ReleaseStockDto
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; set; }

    [Range(1, int.MaxValue)]
    public int WarehouseId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}