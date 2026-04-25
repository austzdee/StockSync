using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
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

    private class WarehouseResponse { public int id { get; set; } }
    private class ProductResponse { public int id { get; set; } }
}