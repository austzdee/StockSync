using System.ComponentModel.DataAnnotations;

namespace StockSync.DTOs;

/// <summary>
/// Contains the information required to assign stock
/// to a product at a warehouse.
/// </summary>
public class AssignStockDto
{
    /// <summary>
    /// Gets or sets the product receiving the stock.
    /// </summary>
    [Range(
        1,
        int.MaxValue,
        ErrorMessage = "A valid product ID is required.")]
    public int ProductId { get; set; }

    /// <summary>
    /// Gets or sets the warehouse receiving the stock.
    /// </summary>
    [Range(
        1,
        int.MaxValue,
        ErrorMessage = "A valid warehouse ID is required.")]
    public int WarehouseId { get; set; }

    /// <summary>
    /// Gets or sets the number of available units being assigned.
    /// A stock assignment must contain at least one available unit.
    /// </summary>
    [Range(
        1,
        int.MaxValue,
        ErrorMessage = "Quantity available must be greater than zero.")]
    public int QuantityAvailable { get; set; }
}