using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockSync.DTOs;
using StockSync.Interfaces;

namespace StockSync.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class WarehousesController : ControllerBase
{
    private readonly IWarehouseService _warehouseService;

    public WarehousesController(IWarehouseService warehouseService)
    {
        _warehouseService = warehouseService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WarehouseResponseDto>>> GetAll()
    {
        var warehouses = await _warehouseService.GetAllAsync();

        return Ok(warehouses);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<WarehouseResponseDto>> GetById(int id)
    {
        var warehouse = await _warehouseService.GetByIdAsync(id);

        if (warehouse is null)
            return NotFound(new { message = "Warehouse not found." });

        return Ok(warehouse);
    }

    [HttpPost]
    public async Task<ActionResult<WarehouseResponseDto>> Create(CreateWarehouseDto dto)
    {
        var warehouse = await _warehouseService.CreateAsync(dto);

        return CreatedAtAction(nameof(GetById), new { id = warehouse.Id }, warehouse);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateWarehouseDto dto)
    {
        try
        {
            var warehouse = await _warehouseService.UpdateAsync(id, dto);

            return Ok(warehouse);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _warehouseService.DeleteAsync(id);

            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}