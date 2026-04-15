namespace StockSync.Entities
{
    public class Warehouse
    {
        public int Id { get; set; }
        public string LocationName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;

        public ICollection<Stock> Stocks { get; set; } = new List<Stock>();
    }
}
