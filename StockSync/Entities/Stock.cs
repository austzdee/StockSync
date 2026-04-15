namespace StockSync.Entities
{
    public class Stock
    {
        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;

        public int WarehouseId { get; set; }
        public Warehouse Warehouse { get; set; } = null!;

        public int QuantityAvailable { get; set; }
        public int QuantityReserved { get; set; }

        public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    }
}
