using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace StockSync.Tests;

public class StockTransferTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    // Inject test application factory
    public StockTransferTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task TransferStock_ReturnsSuccessStatusCode()
    {
        // Create test client
        var client = _factory.CreateClient();

        // Sample transfer request
        var transferRequest = new
        {
            productId = 1,
            fromWarehouseId = 1,
            toWarehouseId = 2,
            quantity = 1
        };

        // Send request to API
        var response = await client.PostAsJsonAsync("/api/stock/transfer", transferRequest);

        // Check that request succeeded
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}