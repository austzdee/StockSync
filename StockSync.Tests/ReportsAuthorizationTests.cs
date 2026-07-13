using System.Net;
using StockSync.Tests.TestInfrastructure;

namespace StockSync.Tests;

/// <summary>
/// Verifies that reporting endpoints are protected
/// and cannot be accessed without authentication.
/// </summary>
public class ReportsAuthorizationTests
    : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    /// <summary>
    /// Creates a test HTTP client using the
    /// custom application factory.
    /// </summary>
    public ReportsAuthorizationTests(
        CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    /// <summary>
    /// Ensures all reporting endpoints return
    /// HTTP 401 when no JWT token is supplied.
    /// </summary>
    [Theory]
    [InlineData("/api/reports/inventory-summary")]
    [InlineData("/api/reports/low-stock?threshold=10")]
    [InlineData("/api/reports/warehouse-stock-value")]
    public async Task ReportEndpoints_WithoutToken_ReturnUnauthorized(
        string endpoint)
    {
        // Act
        var response = await _client.GetAsync(endpoint);

        // Assert
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            response.StatusCode);
    }
}