using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockSync.Data;
using StockSync.DTOs;
using StockSync.Entities;

namespace StockSync.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetAll()
    {
        var products = await _context.Products
            .Where(p => !p.IsDeleted)
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetById(int id)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

        if (product is null)
            return NotFound(new { message = "Product not found." });

        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<Product>> Create(CreateProductDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) ||
            string.IsNullOrWhiteSpace(dto.Sku) ||
            string.IsNullOrWhiteSpace(dto.Category))
        {
            return UnprocessableEntity(new { message = "Name, SKU, and Category are required." });
        }

        if (dto.Price < 0)
            return UnprocessableEntity(new { message = "Price cannot be negative." });

        var skuExists = await _context.Products.AnyAsync(p => p.Sku == dto.Sku && !p.IsDeleted);
        if (skuExists)
            return Conflict(new { message = "A product with this SKU already exists." });

        var product = new Product
        {
            Name = dto.Name,
            Sku = dto.Sku,
            Price = dto.Price,
            Category = dto.Category
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateProductDto dto)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

        if (product is null)
            return NotFound(new { message = "Product not found." });

        if (string.IsNullOrWhiteSpace(dto.Name) ||
            string.IsNullOrWhiteSpace(dto.Sku) ||
            string.IsNullOrWhiteSpace(dto.Category))
        {
            return UnprocessableEntity(new { message = "Name, SKU, and Category are required." });
        }

        if (dto.Price < 0)
            return UnprocessableEntity(new { message = "Price cannot be negative." });

        var duplicateSku = await _context.Products
            .AnyAsync(p => p.Id != id && p.Sku == dto.Sku && !p.IsDeleted);

        if (duplicateSku)
            return Conflict(new { message = "Another product with this SKU already exists." });

        product.Name = dto.Name;
        product.Sku = dto.Sku;
        product.Price = dto.Price;
        product.Category = dto.Category;

        await _context.SaveChangesAsync();

        return Ok(product);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

        if (product is null)
            return NotFound(new { message = "Product not found." });

        product.IsDeleted = true;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}