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
using Xunit;

namespace StockSync.Tests;

/// <summary>
/// Integration tests for stock-transfer workflows.
/// These tests verify that authenticated administrators can assign
/// and transfer inventory between warehouses through the API.
/// </summary>
public class StockTransferTests
    : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly IConfiguration _configuration;

    /// <summary>
    /// Creates the HTTP client and retrieves the test configuration
    /// supplied by the custom application factory.
    /// </summary>
    public StockTransferTests(
        CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();

        _configuration = factory.Services
            .GetRequiredService<IConfiguration>();
    }

    /// <summary>
    /// Verifies that stock can be assigned to a source warehouse
    /// and transferred to a destination warehouse.
    /// </summary>
    [Fact]
    public async Task
        TransferStock_ShouldMoveQuantityBetweenWarehouses()
    {
        // Arrange
        var token = GenerateAdminToken();

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var sourceWarehouseResponse =
            await _client.PostAsJsonAsync(
                "/api/warehouses",
                new
                {
                    locationName = "Test Source Warehouse",
                    address = "Test Address 1"
                });

        await EnsureSuccessStatusAsync(
            sourceWarehouseResponse,
            HttpStatusCode.Created,
            "Source warehouse creation");

        var destinationWarehouseResponse =
            await _client.PostAsJsonAsync(
                "/api/warehouses",
                new
                {
                    locationName =
                        "Test Destination Warehouse",

                    address = "Test Address 2"
                });

        await EnsureSuccessStatusAsync(
            destinationWarehouseResponse,
            HttpStatusCode.Created,
            "Destination warehouse creation");

        var productResponse =
            await _client.PostAsJsonAsync(
                "/api/products",
                new
                {
                    name = "Test Product",
                    sku = $"TEST-{Guid.NewGuid()}",
                    price = 10.00m,
                    category = "Test"
                });

        await EnsureSuccessStatusAsync(
            productResponse,
            HttpStatusCode.Created,
            "Product creation");

        var sourceWarehouse =
            await sourceWarehouseResponse.Content
                .ReadFromJsonAsync<WarehouseResponse>();

        var destinationWarehouse =
            await destinationWarehouseResponse.Content
                .ReadFromJsonAsync<WarehouseResponse>();

        var product =
            await productResponse.Content
                .ReadFromJsonAsync<ProductResponse>();

        Assert.NotNull(sourceWarehouse);
        Assert.NotNull(destinationWarehouse);
        Assert.NotNull(product);

        var assignResponse =
            await _client.PostAsJsonAsync(
                "/api/stock/assign",
                new
                {
                    productId = product.Id,
                    warehouseId = sourceWarehouse.Id,
                    quantityAvailable = 20
                });

        await EnsureSuccessStatusAsync(
            assignResponse,
            HttpStatusCode.OK,
            "Stock assignment");

        // Act
        var transferResponse =
            await _client.PostAsJsonAsync(
                "/api/stock/transfer",
                new
                {
                    productId = product.Id,
                    fromWarehouseId =
                        sourceWarehouse.Id,

                    toWarehouseId =
                        destinationWarehouse.Id,

                    quantity = 5
                });

        // Assert
        await EnsureSuccessStatusAsync(
            transferResponse,
            HttpStatusCode.OK,
            "Stock transfer");

        Assert.Equal(
            HttpStatusCode.OK,
            transferResponse.StatusCode);
    }

    /// <summary>
    /// Generates an administrator JWT using the dedicated
    /// automated-test configuration.
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
            new Claim(
                ClaimTypes.NameIdentifier,
                "1"),

            new Claim(
                ClaimTypes.Name,
                "StockSync Test Administrator"),

            new Claim(
                ClaimTypes.Email,
                "admin-test@stocksync.com"),

            new Claim(
                ClaimTypes.Role,
                "Admin")
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
    /// Throws a detailed exception when an API setup
    /// or workflow request returns an unexpected status.
    /// </summary>
    private static async Task EnsureSuccessStatusAsync(
        HttpResponseMessage response,
        HttpStatusCode expectedStatus,
        string operation)
    {
        if (response.StatusCode == expectedStatus)
        {
            return;
        }

        var responseBody =
            await response.Content.ReadAsStringAsync();

        var authenticationHeader =
            response.Headers.WwwAuthenticate.ToString();

        throw new InvalidOperationException(
            $"{operation} failed. " +
            $"Expected: {expectedStatus}. " +
            $"Actual: {response.StatusCode}. " +
            $"Authentication header: " +
            $"{authenticationHeader}. " +
            $"Body: {responseBody}");
    }

    /// <summary>
    /// Represents the warehouse identifier returned
    /// by warehouse-creation endpoints.
    /// </summary>
    private sealed class WarehouseResponse
    {
        public int Id { get; set; }
    }

    /// <summary>
    /// Represents the product identifier returned
    /// by product-creation endpoints.
    /// </summary>
    private sealed class ProductResponse
    {
        public int Id { get; set; }
    }
}