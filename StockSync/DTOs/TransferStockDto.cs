using System.ComponentModel.DataAnnotations;

namespace StockSync.DTOs;

public class TransferStockDto
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; set; }

    [Range(1, int.MaxValue)]
    public int FromWarehouseId { get; set; }

    [Range(1, int.MaxValue)]
    public int ToWarehouseId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}