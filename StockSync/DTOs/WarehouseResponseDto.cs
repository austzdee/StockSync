namespace StockSync.DTOs;

/// <summary>
/// Represents warehouse data returned by the API.
/// Prevents exposing EF Core entity details directly to clients.
/// </summary>
public class WarehouseResponseDto
{
    public int Id { get; set; }
    public string LocationName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}