namespace StockSync.DTOs;

public class StockListResponseDto
{
    public int TotalCount { get; set; }
    public int Limit { get; set; }
    public int Offset { get; set; }
    public IEnumerable<StockListItemDto> Results { get; set; } = [];
}