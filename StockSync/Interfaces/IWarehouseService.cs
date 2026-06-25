using StockSync.DTOs;
using StockSync.Entities;

namespace StockSync.Interfaces;

public interface IWarehouseService
{
    Task<IEnumerable<Warehouse>> GetAllAsync();
    Task<Warehouse?> GetByIdAsync(int id);
    Task<Warehouse> CreateAsync(CreateWarehouseDto dto);
    Task<Warehouse> UpdateAsync(int id, UpdateWarehouseDto dto);
    Task DeleteAsync(int id);
}