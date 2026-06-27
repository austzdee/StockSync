using System.Net;
using System.Net.Http.Json;
using StockSync.Tests.TestInfrastructure;
using Xunit;

namespace StockSync.Tests;

public class AuthTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public AuthTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Login_ShouldReturnTokenAndRefreshToken()
    {
        var client = _factory.CreateClient();

       var email = $"test-{Guid.NewGuid():N}-{DateTime.UtcNow.Ticks}@stocksync.com";
        var password = "Password123!";


        var registerResponse = await client.PostAsJsonAsync("/api/auth/register", new
        {
            fullName = "Test User",
            email,
            password
        });

        if (registerResponse.StatusCode != HttpStatusCode.OK)
        {
            var errorBody = await registerResponse.Content.ReadAsStringAsync();

            throw new Exception(
                $"Registration failed. Status: {registerResponse.StatusCode}. Body: {errorBody}");
        }

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email,
            password
        });
        if (loginResponse.StatusCode != HttpStatusCode.OK)
        {
            var errorBody = await loginResponse.Content.ReadAsStringAsync();

            throw new Exception(
                $"Login failed. Status: {loginResponse.StatusCode}. Body: {errorBody}");
        }

        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var result = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();

        Assert.NotNull(result);
        Assert.False(string.IsNullOrWhiteSpace(result.token));
        Assert.False(string.IsNullOrWhiteSpace(result.refreshToken));
    }

    private class LoginResponse
    {
        public string token { get; set; } = string.Empty;
        public string refreshToken { get; set; } = string.Empty;
    }
}