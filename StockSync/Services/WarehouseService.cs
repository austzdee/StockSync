using Microsoft.EntityFrameworkCore;
using StockSync.Data;
using StockSync.DTOs;
using StockSync.Entities;
using StockSync.Interfaces;

namespace StockSync.Services;

public class WarehouseService : IWarehouseService
{
    private readonly AppDbContext _context;

    // Inject database context
    public WarehouseService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Warehouse>> GetAllAsync()
    {
        return await _context.Warehouses
            .Where(w => !w.IsDeleted)
            .ToListAsync();
    }

    public async Task<Warehouse?> GetByIdAsync(int id)
    {
        return await _context.Warehouses
            .FirstOrDefaultAsync(w => w.Id == id && !w.IsDeleted);
    }

    public async Task<Warehouse> CreateAsync(CreateWarehouseDto dto)
    {
        var warehouse = new Warehouse
        {
            LocationName = dto.LocationName,
            Address = dto.Address
        };

        _context.Warehouses.Add(warehouse);
        await _context.SaveChangesAsync();

        return warehouse;
    }

    public async Task<Warehouse> UpdateAsync(int id, UpdateWarehouseDto dto)
    {
        var warehouse = await _context.Warehouses
            .FirstOrDefaultAsync(w => w.Id == id && !w.IsDeleted);

        if (warehouse is null)
            throw new KeyNotFoundException("Warehouse not found.");

        warehouse.LocationName = dto.LocationName;
        warehouse.Address = dto.Address;

        await _context.SaveChangesAsync();

        return warehouse;
    }

    public async Task DeleteAsync(int id)
    {
        var warehouse = await _context.Warehouses
            .FirstOrDefaultAsync(w => w.Id == id && !w.IsDeleted);

        if (warehouse is null)
            throw new KeyNotFoundException("Warehouse not found.");

        warehouse.IsDeleted = true;

        await _context.SaveChangesAsync();
    }
}