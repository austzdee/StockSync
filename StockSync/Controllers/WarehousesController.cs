using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockSync.Data;
using StockSync.DTOs;
using StockSync.Entities;

namespace StockSync.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WarehousesController : ControllerBase
{
    private readonly AppDbContext _context;

    // Inject database context
    public WarehousesController(AppDbContext context)
    {
        _context = context;
    }

    // Get all active warehouses
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Warehouse>>> GetAll()
    {
        var warehouses = await _context.Warehouses
            .Where(w => !w.IsDeleted)
            .ToListAsync();

        return Ok(warehouses);
    }

    // Get one active warehouse by id
    [HttpGet("{id}")]
    public async Task<ActionResult<Warehouse>> GetById(int id)
    {
        var warehouse = await _context.Warehouses
            .FirstOrDefaultAsync(w => w.Id == id && !w.IsDeleted);

        if (warehouse is null)
            return NotFound(new { message = "Warehouse not found." });

        return Ok(warehouse);
    }

    // Create a new warehouse
    [HttpPost]
    public async Task<ActionResult<Warehouse>> Create(CreateWarehouseDto dto)
    {
        // Validate required fields
        if (string.IsNullOrWhiteSpace(dto.LocationName) ||
            string.IsNullOrWhiteSpace(dto.Address))
        {
            return UnprocessableEntity(new { message = "Location name and address are required." });
        }

        var warehouse = new Warehouse
        {
            LocationName = dto.LocationName,
            Address = dto.Address
        };

        _context.Warehouses.Add(warehouse);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = warehouse.Id }, warehouse);
    }

    // Update an existing active warehouse
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateWarehouseDto dto)
    {
        var warehouse = await _context.Warehouses
            .FirstOrDefaultAsync(w => w.Id == id && !w.IsDeleted);

        if (warehouse is null)
            return NotFound(new { message = "Warehouse not found." });

        // Validate required fields
        if (string.IsNullOrWhiteSpace(dto.LocationName) ||
            string.IsNullOrWhiteSpace(dto.Address))
        {
            return UnprocessableEntity(new { message = "Location name and address are required." });
        }

        warehouse.LocationName = dto.LocationName;
        warehouse.Address = dto.Address;

        await _context.SaveChangesAsync();

        return Ok(warehouse);
    }

    // Soft delete a warehouse
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var warehouse = await _context.Warehouses
            .FirstOrDefaultAsync(w => w.Id == id && !w.IsDeleted);

        if (warehouse is null)
            return NotFound(new { message = "Warehouse not found." });

        warehouse.IsDeleted = true;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}