namespace StockSync.Entities
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Sku { get; set; } = string.Empty;

        public decimal Price { get; set; } 

        public string Category { get; set; } = string.Empty;

        public bool IsDeleted { get; set; } = false;
        public ICollection<Stock> Stocks { get; set; } = new List<Stock>();
    }
}
