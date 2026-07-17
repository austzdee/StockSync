using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using StockSync.Tests.TestInfrastructure;

namespace StockSync.Tests;

/// <summary>
/// Integration tests for stock reservation and release workflows.
/// </summary>
public class StockReservationTests
    : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly IConfiguration _configuration;

    /// <summary>
    /// Creates the test HTTP client and loads
    /// the dedicated test configuration.
    /// </summary>
    public StockReservationTests(
        CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();

        _configuration = factory.Services
            .GetRequiredService<IConfiguration>();
    }

    /// <summary>
    /// Verifies that available stock can be reserved
    /// and subsequently released.
    /// </summary>
    [Fact]
    public async Task ReserveAndReleaseStock_ShouldUpdateQuantitiesCorrectly()
    {
        // Arrange: authenticate as an administrator.
        var token = GenerateAdminToken();

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Create a warehouse for the reservation workflow.
        var warehouseResponse = await _client.PostAsJsonAsync(
            "/api/warehouses",
            new
            {
                locationName =
                    $"Reservation Warehouse {Guid.NewGuid()}",
                address = "Reservation Test Address"
            });

        Assert.Equal(
            HttpStatusCode.Created,
            warehouseResponse.StatusCode);

        var warehouse = await warehouseResponse.Content
            .ReadFromJsonAsync<WarehouseResponse>();

        Assert.NotNull(warehouse);

        // Create a unique product for this test.
        var productResponse = await _client.PostAsJsonAsync(
            "/api/products",
            new
            {
                name = "Reservation Test Product",
                sku = $"RES-{Guid.NewGuid()}",
                price = 25.00m,
                category = "Test"
            });

        Assert.Equal(
            HttpStatusCode.Created,
            productResponse.StatusCode);

        var product = await productResponse.Content
            .ReadFromJsonAsync<ProductResponse>();

        Assert.NotNull(product);

        // Assign 20 available units to the warehouse.
        var assignResponse = await _client.PostAsJsonAsync(
            "/api/stock/assign",
            new
            {
                productId = product.Id,
                warehouseId = warehouse.Id,
                quantityAvailable = 20
            });

        Assert.Equal(
            HttpStatusCode.OK,
            assignResponse.StatusCode);

        // Act: reserve 8 units.
        var reserveResponse = await _client.PostAsJsonAsync(
            "/api/stock/reserve",
            new
            {
                productId = product.Id,
                warehouseId = warehouse.Id,
                quantity = 8
            });

        Assert.Equal(
            HttpStatusCode.OK,
            reserveResponse.StatusCode);

        var reservedStock = await reserveResponse.Content
            .ReadFromJsonAsync<StockResponse>();

        Assert.NotNull(reservedStock);

        // Assert the reservation reduced available stock
        // and increased reserved stock.
        Assert.Equal(12, reservedStock.QuantityAvailable);
        Assert.Equal(8, reservedStock.QuantityReserved);

        // Act: release 3 reserved units.
        var releaseResponse = await _client.PostAsJsonAsync(
            "/api/stock/release",
            new
            {
                productId = product.Id,
                warehouseId = warehouse.Id,
                quantity = 3
            });

        Assert.Equal(
            HttpStatusCode.OK,
            releaseResponse.StatusCode);

        var releasedStock = await releaseResponse.Content
            .ReadFromJsonAsync<StockResponse>();

        Assert.NotNull(releasedStock);

        // Assert the release restored available stock
        // and reduced the reserved quantity.
        Assert.Equal(15, releasedStock.QuantityAvailable);
        Assert.Equal(5, releasedStock.QuantityReserved);
    }

    /// <summary>
    /// Confirms that a reservation is rejected when the requested
    /// quantity exceeds the available stock.
    /// </summary>
    [Fact]
    public async Task ReserveStock_WhenQuantityExceedsAvailable_ReturnsConflict()
    {
        // Arrange
        var token = GenerateAdminToken();

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var warehouseResponse = await _client.PostAsJsonAsync(
            "/api/warehouses",
            new
            {
                locationName = $"Insufficient Stock Warehouse {Guid.NewGuid()}",
                address = "Insufficient Stock Test Address"
            });

        Assert.Equal(
            HttpStatusCode.Created,
            warehouseResponse.StatusCode);

        var warehouse = await warehouseResponse.Content
            .ReadFromJsonAsync<WarehouseResponse>();

        Assert.NotNull(warehouse);

        var productResponse = await _client.PostAsJsonAsync(
            "/api/products",
            new
            {
                name = "Insufficient Stock Product",
                sku = $"INS-{Guid.NewGuid()}",
                price = 15.00m,
                category = "Test"
            });

        Assert.Equal(
            HttpStatusCode.Created,
            productResponse.StatusCode);

        var product = await productResponse.Content
            .ReadFromJsonAsync<ProductResponse>();

        Assert.NotNull(product);

        var assignResponse = await _client.PostAsJsonAsync(
            "/api/stock/assign",
            new
            {
                productId = product.Id,
                warehouseId = warehouse.Id,
                quantityAvailable = 5
            });

        Assert.Equal(
            HttpStatusCode.OK,
            assignResponse.StatusCode);

        // Act
        var response = await _client.PostAsJsonAsync(
            "/api/stock/reserve",
            new
            {
                productId = product.Id,
                warehouseId = warehouse.Id,
                quantity = 10
            });

        // Assert
        Assert.Equal(
            HttpStatusCode.Conflict,
            response.StatusCode);
    }

    /// <summary>
    /// Confirms that a release is rejected when the requested
    /// quantity exceeds the currently reserved stock.
    /// </summary>
    [Fact]
    public async Task ReleaseStock_WhenQuantityExceedsReserved_ReturnsConflict()
    {
        // Arrange
        var token = GenerateAdminToken();

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var warehouseResponse = await _client.PostAsJsonAsync(
            "/api/warehouses",
            new
            {
                locationName = $"Release Failure Warehouse {Guid.NewGuid()}",
                address = "Release Failure Test Address"
            });

        Assert.Equal(
            HttpStatusCode.Created,
            warehouseResponse.StatusCode);

        var warehouse = await warehouseResponse.Content
            .ReadFromJsonAsync<WarehouseResponse>();

        Assert.NotNull(warehouse);

        var productResponse = await _client.PostAsJsonAsync(
            "/api/products",
            new
            {
                name = "Release Failure Product",
                sku = $"REL-{Guid.NewGuid()}",
                price = 20.00m,
                category = "Test"
            });

        Assert.Equal(
            HttpStatusCode.Created,
            productResponse.StatusCode);

        var product = await productResponse.Content
            .ReadFromJsonAsync<ProductResponse>();

        Assert.NotNull(product);

        var assignResponse = await _client.PostAsJsonAsync(
            "/api/stock/assign",
            new
            {
                productId = product.Id,
                warehouseId = warehouse.Id,
                quantityAvailable = 10
            });

        Assert.Equal(
            HttpStatusCode.OK,
            assignResponse.StatusCode);

        var reserveResponse = await _client.PostAsJsonAsync(
            "/api/stock/reserve",
            new
            {
                productId = product.Id,
                warehouseId = warehouse.Id,
                quantity = 3
            });

        Assert.Equal(
            HttpStatusCode.OK,
            reserveResponse.StatusCode);

        // Act
        var response = await _client.PostAsJsonAsync(
            "/api/stock/release",
            new
            {
                productId = product.Id,
                warehouseId = warehouse.Id,
                quantity = 5
            });

        // Assert
        Assert.Equal(
            HttpStatusCode.Conflict,
            response.StatusCode);
    }

    /// <summary>
    /// Generates an administrator JWT using
    /// the automated-test configuration.
    /// </summary>
    private string GenerateAdminToken()
    {
        var jwtKey = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException(
                "The test JWT key is not configured.");

        var issuer = _configuration["Jwt:Issuer"]
            ?? throw new InvalidOperationException(
                "The test JWT issuer is not configured.");

        var audience = _configuration["Jwt:Audience"]
            ?? throw new InvalidOperationException(
                "The test JWT audience is not configured.");

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "1"),
            new Claim(
                ClaimTypes.Name,
                "StockSync Test Administrator"),
            new Claim(
                ClaimTypes.Email,
                "admin-test@stocksync.com"),
            new Claim(ClaimTypes.Role, "Admin")
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey));

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(30),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }

    /// <summary>
    /// Represents the warehouse identifier returned by the API.
    /// </summary>
    private class WarehouseResponse
    {
        public int Id { get; set; }
    }

    /// <summary>
    /// Represents the product identifier returned by the API.
    /// </summary>
    private class ProductResponse
    {
        public int Id { get; set; }
    }

    /// <summary>
    /// Represents stock quantities returned by reserve
    /// and release operations.
    /// </summary>
    private class StockResponse
    {
        public int ProductId { get; set; }
        public int WarehouseId { get; set; }
        public int QuantityAvailable { get; set; }
        public int QuantityReserved { get; set; }
    }
}
