using Microsoft.EntityFrameworkCore;
using StockSync.Entities;


namespace StockSync.Data
{
    public class AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Product> Products => Set<Product>();
        public DbSet<Warehouse> Warehouses => Set<Warehouse>();
        public DbSet<Stock> Stocks => Set<Stock>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Product>()
                .HasIndex(p => p.Sku)
                .IsUnique();


            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Stock>()
                .HasKey(s => new { s.ProductId, s.WarehouseId });

            modelBuilder.Entity<Stock>()
                .Property(s => s.RowVersion)
                .IsRowVersion();

            modelBuilder.Entity<Stock>()
                .HasOne(s => s.Product)
                .WithMany(p => p.Stocks)
                .HasForeignKey(s => s.ProductId);

            modelBuilder.Entity<Stock>()
                .HasOne(s => s.Warehouse)
                .WithMany(w => w.Stocks)
                .HasForeignKey(s => s.WarehouseId);

            modelBuilder.Entity<AuditLog>()
                .Property(a => a.Action)
                .HasMaxLength(50);

            modelBuilder.Entity<AuditLog>()
                .Property(a => a.PerformedBy)
                .HasMaxLength(100);
        }
    }
}
