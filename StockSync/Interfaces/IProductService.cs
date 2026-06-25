using StockSync.DTOs;
using StockSync.Entities;

namespace StockSync.Interfaces;

public interface IProductService
{
    Task<IEnumerable<ProductResponseDto>> GetAllAsync(string? category, bool lowStock, int limit, int offset);
    Task<Product?> GetByIdAsync(int id);
    Task<Product> CreateAsync(CreateProductDto dto);
    Task<Product> UpdateAsync(int id, UpdateProductDto dto);
    Task DeleteAsync(int id);
}