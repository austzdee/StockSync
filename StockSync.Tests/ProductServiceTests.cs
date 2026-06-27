using Microsoft.EntityFrameworkCore;
using StockSync.Data;
using StockSync.DTOs;
using StockSync.Entities;
using StockSync.Services;

namespace StockSync.Tests;

/// <summary>
/// Unit tests for ProductService business logic.
/// Uses the EF Core InMemory provider to isolate service behavior
/// without requiring a real SQL Server database.
/// </summary>
public class ProductServiceTests
{
    /// <summary>
    /// Creates a new isolated in-memory database for each test.
    /// A unique database name prevents tests from sharing data.
    /// </summary>
    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    /// <summary>
    /// Verifies that a product is created successfully when the SKU is unique.
    /// </summary>
    [Fact]
    public async Task CreateAsync_ShouldCreateProduct_WhenSkuIsUnique()
    {
        // Arrange
        await using var context = CreateDbContext();
        var service = new ProductService(context);

        var dto = new CreateProductDto
        {
            Name = "Laptop",
            Sku = "LAP-001",
            Price = 999.99m,
            Category = "Electronics"
        };

        // Act
        var result = await service.CreateAsync(dto);

        // Assert
        Assert.Equal("Laptop", result.Name);
        Assert.Equal("LAP-001", result.Sku);
        Assert.Single(context.Products);
    }

    /// <summary>
    /// Verifies that creating a product with a duplicate SKU
    /// throws an InvalidOperationException.
    /// </summary>
    [Fact]
    public async Task CreateAsync_ShouldThrow_WhenSkuAlreadyExists()
    {
        // Arrange
        await using var context = CreateDbContext();

        context.Products.Add(new Product
        {
            Name = "Existing Laptop",
            Sku = "LAP-001",
            Price = 899.99m,
            Category = "Electronics"
        });

        await context.SaveChangesAsync();

        var service = new ProductService(context);

        var dto = new CreateProductDto
        {
            Name = "New Laptop",
            Sku = "LAP-001",
            Price = 999.99m,
            Category = "Electronics"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.CreateAsync(dto));

        Assert.Equal("A product with this SKU already exists.", exception.Message);
    }

    /// <summary>
    /// Verifies that deleting a product performs a soft delete
    /// by setting the IsDeleted flag.
    /// </summary>
    [Fact]
    public async Task DeleteAsync_ShouldSoftDeleteProduct_WhenProductExists()
    {
        // Arrange
        await using var context = CreateDbContext();

        var product = new Product
        {
            Name = "Monitor",
            Sku = "MON-001",
            Price = 199.99m,
            Category = "Electronics"
        };

        context.Products.Add(product);
        await context.SaveChangesAsync();

        var service = new ProductService(context);

        // Act
        await service.DeleteAsync(product.Id);

        // Assert
        Assert.True(product.IsDeleted);
    }
}