using System.Net;
using System.Net.Http.Json;
using StockSync.Tests.TestInfrastructure;

namespace StockSync.Tests;

/// <summary>
/// Verifies that authentication endpoints reject invalid credentials
/// and invalid refresh tokens with the correct HTTP status code.
/// </summary>
public class AuthFailurePathTests
    : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    /// <summary>
    /// Creates an HTTP client backed by the isolated test application.
    /// </summary>
    public AuthFailurePathTests(
        CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    /// <summary>
    /// Confirms that login fails when a registered user
    /// supplies an incorrect password.
    /// </summary>
    [Fact]
    public async Task Login_WithInvalidPassword_ReturnsUnauthorized()
    {
        // Arrange: create a unique user for this test.
        var email = $"invalid-password-{Guid.NewGuid()}@stocksync.com";

        var registerRequest = new
        {
            FullName = "Invalid Password Test User",
            Email = email,
            Password = "Password123!"
        };

        var registerResponse = await _client.PostAsJsonAsync(
            "/api/Auth/register",
            registerRequest);

        registerResponse.EnsureSuccessStatusCode();

        var loginRequest = new
        {
            Email = email,
            Password = "WrongPassword123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync(
            "/api/Auth/login",
            loginRequest);

        // Assert
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            response.StatusCode);
    }

    /// <summary>
    /// Confirms that login fails when the supplied email
    /// does not belong to a registered user.
    /// </summary>
    [Fact]
    public async Task Login_WithUnknownUser_ReturnsUnauthorized()
    {
        // Arrange
        var loginRequest = new
        {
            Email = $"unknown-{Guid.NewGuid()}@stocksync.com",
            Password = "Password123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync(
            "/api/Auth/login",
            loginRequest);

        // Assert
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            response.StatusCode);
    }

    /// <summary>
    /// Confirms that the refresh endpoint rejects
    /// a token that was not issued by the application.
    /// </summary>
    [Fact]
    public async Task Refresh_WithInvalidToken_ReturnsUnauthorized()
    {
        // Arrange
        var request = new
        {
            RefreshToken = "invalid-refresh-token"
        };

        // Act
        var response = await _client.PostAsJsonAsync(
            "/api/Auth/refresh",
            request);

        // Assert
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            response.StatusCode);
    }

    /// <summary>
    /// Confirms that logout rejects a refresh token
    /// that does not belong to an authenticated session.
    /// </summary>
    [Fact]
    public async Task Logout_WithInvalidToken_ReturnsUnauthorized()
    {
        // Arrange
        var request = new
        {
            RefreshToken = "invalid-refresh-token"
        };

        // Act
        var response = await _client.PostAsJsonAsync(
            "/api/Auth/logout",
            request);

        // Assert
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            response.StatusCode);
    }
}