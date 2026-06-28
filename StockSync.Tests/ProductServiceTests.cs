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

    /// <summary>
/// Verifies that an existing product can be updated successfully.
/// </summary>
[Fact]
public async Task UpdateAsync_ShouldUpdateProduct_WhenProductExists()
{
    // Arrange
    await using var context = CreateDbContext();

    var product = new Product
    {
        Name = "Old Laptop",
        Sku = "OLD-001",
        Price = 500.00m,
        Category = "Electronics"
    };

    context.Products.Add(product);
    await context.SaveChangesAsync();

    var service = new ProductService(context);

    var dto = new UpdateProductDto
    {
        Name = "Updated Laptop",
        Sku = "UPD-001",
        Price = 750.00m,
        Category = "Computing"
    };

    // Act
    var result = await service.UpdateAsync(product.Id, dto);

    // Assert
    Assert.Equal("Updated Laptop", result.Name);
    Assert.Equal("UPD-001", result.Sku);
    Assert.Equal(750.00m, result.Price);
    Assert.Equal("Computing", result.Category);
}

/// <summary>
/// Verifies that deleting a missing product throws a KeyNotFoundException.
/// </summary>
[Fact]
public async Task DeleteAsync_ShouldThrow_WhenProductDoesNotExist()
{
    // Arrange
    await using var context = CreateDbContext();
    var service = new ProductService(context);

    // Act & Assert
    var exception = await Assert.ThrowsAsync<KeyNotFoundException>(
        () => service.DeleteAsync(999));

    Assert.Equal("Product not found.", exception.Message);
}

/// <summary>
/// Verifies that product listing supports category filtering.
/// </summary>
[Fact]
public async Task GetAllAsync_ShouldReturnProductsFilteredByCategory()
{
    // Arrange
    await using var context = CreateDbContext();

    context.Products.AddRange(
        new Product
        {
            Name = "Laptop",
            Sku = "LAP-001",
            Price = 999.99m,
            Category = "Electronics"
        },
        new Product
        {
            Name = "Office Chair",
            Sku = "CHR-001",
            Price = 149.99m,
            Category = "Furniture"
        }
    );

    await context.SaveChangesAsync();

    var service = new ProductService(context);

    // Act
    var result = await service.GetAllAsync("Electronics", false, 10, 0);

    // Assert
    var products = result.ToList();

    Assert.Single(products);
    Assert.Equal("Laptop", products[0].Name);
    Assert.Equal("Electronics", products[0].Category);
}
}