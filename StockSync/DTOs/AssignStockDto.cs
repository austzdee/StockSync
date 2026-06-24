using System.ComponentModel.DataAnnotations;

namespace StockSync.DTOs;

public class AssignStockDto
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; set; }

    [Range(1, int.MaxValue)]
    public int WarehouseId { get; set; }

    [Range(1, int.MaxValue)]
    public int QuantityAvailable { get; set; }
}