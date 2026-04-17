namespace StockSync.DTOs
{
    public class ReleaseStockDto
    {
        public int ProductId { get; set; }
        public int WarehouseId { get; set; }
        public int Quantity { get; set; }
    }
}
