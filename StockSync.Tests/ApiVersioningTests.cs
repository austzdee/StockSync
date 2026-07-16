using System.Net;
using System.Net.Http.Json;
using StockSync.Tests.TestInfrastructure;
using Xunit;

namespace StockSync.Tests;

/// <summary>
/// Integration tests for the StockSync version-one API routes.
/// These tests verify that versioned endpoints are registered
/// and preserve their existing authorization behaviour.
/// </summary>
public class ApiVersioningTests
    : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    /// <summary>
    /// Creates an HTTP client connected to the isolated
    /// StockSync integration-test application.
    /// </summary>
    public ApiVersioningTests(
        CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    /// <summary>
    /// Verifies that protected version-one endpoints are registered
    /// and return an authentication challenge rather than 404.
    /// </summary>
    [Theory]
    [InlineData("/api/v1/products")]
    [InlineData("/api/v1/warehouses")]
    [InlineData("/api/v1/reports/inventory-summary")]
    public async Task
        VersionedProtectedEndpoint_WithoutToken_ReturnsUnauthorized(
            string endpoint)
    {
        // Act
        var response = await _client.GetAsync(endpoint);

        // Assert
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            response.StatusCode);
    }

    /// <summary>
    /// Verifies that the version-one authentication route
    /// is registered and handles invalid credentials.
    /// </summary>
    [Fact]
    public async Task
        VersionedLogin_WithUnknownUser_ReturnsUnauthorized()
    {
        // Arrange
        var request = new
        {
            email =
                $"unknown-{Guid.NewGuid()}@stocksync.com",

            password = "InvalidPassword123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync(
            "/api/v1/auth/login",
            request);

        // Assert
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            response.StatusCode);
    }

    /// <summary>
    /// Verifies that the original unversioned route remains
    /// available during the compatibility period.
    /// </summary>
    [Fact]
    public async Task
        LegacyReportRoute_WithoutToken_RemainsAvailable()
    {
        // Act
        var response = await _client.GetAsync(
            "/api/reports/inventory-summary");

        // Assert
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            response.StatusCode);
    }
}