using System.Net;
using System.Net.Http.Json;
using StockSync.Tests.TestInfrastructure;

namespace StockSync.Tests;

/// <summary>
/// Verifies that registration requests enforce
/// the application's password-strength requirements.
/// </summary>
public class RegistrationValidationTests
    : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    /// <summary>
    /// Creates an HTTP client backed by the isolated test application.
    /// </summary>
    public RegistrationValidationTests(
        CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    /// <summary>
    /// Confirms that registration rejects passwords
    /// that do not meet the minimum length requirement.
    /// </summary>
    [Fact]
    public async Task Register_WithShortPassword_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            FullName = "Short Password User",
            Email = $"short-{Guid.NewGuid()}@stocksync.com",
            Password = "Pa1!"
        };

        // Act
        var response = await _client.PostAsJsonAsync(
            "/api/Auth/register",
            request);

        // Assert
        Assert.Equal(
            HttpStatusCode.BadRequest,
            response.StatusCode);
    }

    /// <summary>
    /// Confirms that registration rejects passwords
    /// that do not contain an uppercase letter.
    /// </summary>
    [Fact]
    public async Task Register_WithoutUppercaseLetter_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            FullName = "Missing Uppercase User",
            Email = $"uppercase-{Guid.NewGuid()}@stocksync.com",
            Password = "password123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync(
            "/api/Auth/register",
            request);

        // Assert
        Assert.Equal(
            HttpStatusCode.BadRequest,
            response.StatusCode);
    }

    /// <summary>
    /// Confirms that registration rejects passwords
    /// that do not contain a lowercase letter.
    /// </summary>
    [Fact]
    public async Task Register_WithoutLowercaseLetter_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            FullName = "Missing Lowercase User",
            Email = $"lowercase-{Guid.NewGuid()}@stocksync.com",
            Password = "PASSWORD123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync(
            "/api/Auth/register",
            request);

        // Assert
        Assert.Equal(
            HttpStatusCode.BadRequest,
            response.StatusCode);
    }

    /// <summary>
    /// Confirms that registration rejects passwords
    /// that do not contain a number.
    /// </summary>
    [Fact]
    public async Task Register_WithoutNumber_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            FullName = "Missing Number User",
            Email = $"number-{Guid.NewGuid()}@stocksync.com",
            Password = "Password!"
        };

        // Act
        var response = await _client.PostAsJsonAsync(
            "/api/Auth/register",
            request);

        // Assert
        Assert.Equal(
            HttpStatusCode.BadRequest,
            response.StatusCode);
    }

    /// <summary>
    /// Confirms that registration rejects passwords
    /// that do not contain a special character.
    /// </summary>
    [Fact]
    public async Task Register_WithoutSpecialCharacter_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            FullName = "Missing Special Character User",
            Email = $"special-{Guid.NewGuid()}@stocksync.com",
            Password = "Password123"
        };

        // Act
        var response = await _client.PostAsJsonAsync(
            "/api/Auth/register",
            request);

        // Assert
        Assert.Equal(
            HttpStatusCode.BadRequest,
            response.StatusCode);
    }

    /// <summary>
    /// Confirms that registration accepts a password
    /// that satisfies every strength requirement.
    /// </summary>
    [Fact]
    public async Task Register_WithStrongPassword_ReturnsOk()
    {
        // Arrange
        var request = new
        {
            FullName = "Strong Password User",
            Email = $"strong-{Guid.NewGuid()}@stocksync.com",
            Password = "Password123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync(
            "/api/Auth/register",
            request);

        // Assert
        Assert.Equal(
            HttpStatusCode.OK,
            response.StatusCode);
    }
}