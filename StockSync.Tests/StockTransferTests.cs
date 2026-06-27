using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using StockSync.Tests.TestInfrastructure;
using Xunit;

namespace StockSync.Tests;

/// <summary>
/// Integration tests for stock transfer workflows.
/// These tests verify that authenticated users can assign stock
/// and transfer inventory between warehouses through the API.
/// </summary>
public class StockTransferTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public StockTransferTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    /// <summary>
    /// Verifies that stock can be assigned to a source warehouse
    /// and then transferred to a destination warehouse.
    /// </summary>
    [Fact]
    public async Task TransferStock_ShouldMoveQuantityBetweenWarehouses()
    {
        // Arrange
        var client = _factory.CreateClient();

        var token = GenerateAdminToken();

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var warehouse1Response = await client.PostAsJsonAsync("/api/warehouses", new
        {
            locationName = "Test Source Warehouse",
            address = "Test Address 1"
        });

        if (warehouse1Response.StatusCode != HttpStatusCode.Created)
        {
            var errorBody = await warehouse1Response.Content.ReadAsStringAsync();
            throw new Exception($"Source warehouse create failed. Status: {warehouse1Response.StatusCode}. Body: {errorBody}");
        }

        var warehouse2Response = await client.PostAsJsonAsync("/api/warehouses", new
        {
            locationName = "Test Destination Warehouse",
            address = "Test Address 2"
        });

        if (warehouse2Response.StatusCode != HttpStatusCode.Created)
        {
            var errorBody = await warehouse2Response.Content.ReadAsStringAsync();
            throw new Exception($"Destination warehouse create failed. Status: {warehouse2Response.StatusCode}. Body: {errorBody}");
        }

        var productResponse = await client.PostAsJsonAsync("/api/products", new
        {
            name = "Test Product",
            sku = $"TEST-{Guid.NewGuid()}",
            price = 10.00m,
            category = "Test"
        });

        if (productResponse.StatusCode != HttpStatusCode.Created)
        {
            var errorBody = await productResponse.Content.ReadAsStringAsync();
            var authHeader = productResponse.Headers.WwwAuthenticate.ToString();

            throw new Exception($"Product create failed. Status: {productResponse.StatusCode}. AuthHeader: {authHeader}. Body: {errorBody}");
        }

        var sourceWarehouse = await warehouse1Response.Content.ReadFromJsonAsync<WarehouseResponse>();
        var destinationWarehouse = await warehouse2Response.Content.ReadFromJsonAsync<WarehouseResponse>();
        var product = await productResponse.Content.ReadFromJsonAsync<ProductResponse>();

        Assert.NotNull(sourceWarehouse);
        Assert.NotNull(destinationWarehouse);
        Assert.NotNull(product);

        var assignResponse = await client.PostAsJsonAsync("/api/stock/assign", new
        {
            productId = product.Id,
            warehouseId = sourceWarehouse.Id,
            quantityAvailable = 20
        });

        if (assignResponse.StatusCode != HttpStatusCode.OK)
        {
            var errorBody = await assignResponse.Content.ReadAsStringAsync();
            throw new Exception($"Stock assign failed. Status: {assignResponse.StatusCode}. Body: {errorBody}");
        }

        // Act
        var transferResponse = await client.PostAsJsonAsync("/api/stock/transfer", new
        {
            productId = product.Id,
            fromWarehouseId = sourceWarehouse.Id,
            toWarehouseId = destinationWarehouse.Id,
            quantity = 5
        });

        // Assert
        if (transferResponse.StatusCode != HttpStatusCode.OK)
        {
            var errorBody = await transferResponse.Content.ReadAsStringAsync();
            throw new Exception($"Stock transfer failed. Status: {transferResponse.StatusCode}. Body: {errorBody}");
        }

        Assert.Equal(HttpStatusCode.OK, transferResponse.StatusCode);
    }

    /// <summary>
    /// Generates a JWT token for an authenticated test admin user.
    /// </summary>
    private static string GenerateAdminToken()
    {
        var key = "THIS_IS_A_DEVELOPMENT_SECRET_KEY_CHANGE_LATER_123456789";

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "999"),
            new Claim(ClaimTypes.Name, "Test Admin"),
            new Claim(ClaimTypes.Email, "admin@test.com"),
            new Claim(ClaimTypes.Role, "Admin")
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: "StockSyncApi",
            audience: "StockSyncUsers",
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(60),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private class WarehouseResponse
    {
        public int Id { get; set; }
    }

    private class ProductResponse
    {
        public int Id { get; set; }
    }
}