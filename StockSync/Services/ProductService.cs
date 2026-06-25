using Microsoft.EntityFrameworkCore;
using StockSync.Data;
using StockSync.DTOs;
using StockSync.Entities;
using StockSync.Interfaces;

namespace StockSync.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProductResponseDto>> GetAllAsync(
        string? category,
        bool lowStock,
        int limit,
        int offset)
    {
        var query = _context.Products
            .Where(p => !p.IsDeleted)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(p => p.Category == category);
        }

        var products = query.Select(p => new ProductResponseDto
        {
            Id = p.Id,
            Name = p.Name,
            Sku = p.Sku,
            Price = p.Price,
            Category = p.Category,
            IsDeleted = p.IsDeleted,
            TotalAvailable = p.Stocks.Sum(s => s.QuantityAvailable),
            TotalReserved = p.Stocks.Sum(s => s.QuantityReserved)
        });

        if (lowStock)
        {
            products = products.Where(p => p.TotalAvailable < 10);
        }

        return await products
            .Skip(offset)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<Product?> GetByIdAsync(int id)
    {
        return await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
    }

    public async Task<Product> CreateAsync(CreateProductDto dto)
    {
        var skuExists = await _context.Products
            .AnyAsync(p => p.Sku == dto.Sku && !p.IsDeleted);

        if (skuExists)
            throw new InvalidOperationException("A product with this SKU already exists.");

        var product = new Product
        {
            Name = dto.Name,
            Sku = dto.Sku,
            Price = dto.Price,
            Category = dto.Category
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return product;
    }

    public async Task<Product> UpdateAsync(int id, UpdateProductDto dto)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

        if (product is null)
            throw new KeyNotFoundException("Product not found.");

        var duplicateSku = await _context.Products
            .AnyAsync(p => p.Id != id && p.Sku == dto.Sku && !p.IsDeleted);

        if (duplicateSku)
            throw new InvalidOperationException("Another product with this SKU already exists.");

        product.Name = dto.Name;
        product.Sku = dto.Sku;
        product.Price = dto.Price;
        product.Category = dto.Category;

        await _context.SaveChangesAsync();

        return product;
    }

    public async Task DeleteAsync(int id)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

        if (product is null)
            throw new KeyNotFoundException("Product not found.");

        product.IsDeleted = true;
        await _context.SaveChangesAsync();
    }
}