namespace StockSync.DTOs
{
    public class TransferStockDto
    {
        public int ProductId { get; set; }
        public int FromWarehouseId { get; set; }
        public int ToWarehouseId { get; set; }
        public int Quantity { get; set; }
    }
}
