namespace StockSync.Entities
{
    public class AuditLog
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int WarehouseId { get; set; }
        public string Action { get; set; } = string.Empty;
        public int QuantityChanged { get; set; }
        public string PerformedBy { get; set; } = "system";
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    }
}
