using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.IdentityModel.Tokens;
using Xunit;

namespace StockSync.Tests;

public class StockTransferTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public StockTransferTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task TransferStock_ShouldMoveQuantityBetweenWarehouses()
    {
        var client = _factory.CreateClient();

        var token = GenerateAdminToken();

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var warehouse1Response = await client.PostAsJsonAsync("/api/warehouses", new
        {
            locationName = "Test Source Warehouse",
            address = "Test Address 1"
        });

        var warehouse2Response = await client.PostAsJsonAsync("/api/warehouses", new
        {
            locationName = "Test Destination Warehouse",
            address = "Test Address 2"
        });

        var productResponse = await client.PostAsJsonAsync("/api/products", new
        {
            name = "Test Product",
            sku = $"TEST-{Guid.NewGuid()}",
            price = 10.00,
            category = "Test"
        });

        if (productResponse.StatusCode != HttpStatusCode.Created)
        {
            var errorBody = await productResponse.Content.ReadAsStringAsync();
            var authHeader = productResponse.Headers.WwwAuthenticate.ToString();

            throw new Exception($"Product create failed. Status: {productResponse.StatusCode}. AuthHeader: {authHeader}. Body: {errorBody}");
        }
        Assert.Equal(HttpStatusCode.Created, productResponse.StatusCode);

        var sourceWarehouse = await warehouse1Response.Content.ReadFromJsonAsync<WarehouseResponse>();
        var destinationWarehouse = await warehouse2Response.Content.ReadFromJsonAsync<WarehouseResponse>();
        var product = await productResponse.Content.ReadFromJsonAsync<ProductResponse>();

        Assert.NotNull(sourceWarehouse);
        Assert.NotNull(destinationWarehouse);
        Assert.NotNull(product);

        await client.PostAsJsonAsync("/api/stock/assign", new
        {
            productId = product.id,
            warehouseId = sourceWarehouse.id,
            quantityAvailable = 20
        });

        var transferResponse = await client.PostAsJsonAsync("/api/stock/transfer", new
        {
            productId = product.id,
            fromWarehouseId = sourceWarehouse.id,
            toWarehouseId = destinationWarehouse.id,
            quantity = 5
        });

        Assert.Equal(HttpStatusCode.OK, transferResponse.StatusCode);
    }

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

    private class WarehouseResponse { public int id { get; set; } }
    private class ProductResponse { public int id { get; set; } }
}