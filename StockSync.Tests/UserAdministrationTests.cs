using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using StockSync.Data;
using StockSync.DTOs;
using StockSync.Tests.TestInfrastructure;

namespace StockSync.Tests;

/// <summary>
/// Verifies administrator-only user-management workflows.
/// </summary>
public class UserAdministrationTests :
    IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public UserAdministrationTests(
    CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetUsers_AsAdmin_ReturnsRegisteredUsers()
    {
        using var client = _factory.CreateClient();

        var admin = await RegisterAndPromoteAsync(
            "Admin User",
            $"admin-{Guid.NewGuid()}@example.com");

        var token = await LoginAsync(
            client,
            admin.Email,
            TestPassword);

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("/api/v1/users");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var users = await response.Content
            .ReadFromJsonAsync<List<UserResponseDto>>();

        Assert.NotNull(users);
        Assert.Contains(users, user => user.Email == admin.Email);
    }

    [Fact]
    public async Task GetUsers_AsNormalUser_ReturnsForbidden()
    {
        using var client = _factory.CreateClient();

        var email = $"user-{Guid.NewGuid()}@example.com";

        await RegisterAsync(client, "Normal User", email);

        var token = await LoginAsync(
            client,
            email,
            TestPassword);

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("/api/v1/users");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task UpdateRole_AsAdmin_ChangesAnotherUsersRole()
    {
        using var client = _factory.CreateClient();

        var admin = await RegisterAndPromoteAsync(
            "Admin User",
            $"admin-{Guid.NewGuid()}@example.com");

        var targetEmail =
            $"target-{Guid.NewGuid()}@example.com";

        var targetUser = await RegisterAsync(
            client,
            "Target User",
            targetEmail);

        var token = await LoginAsync(
            client,
            admin.Email,
            TestPassword);

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var response = await client.PutAsJsonAsync(
            $"/api/v1/users/{targetUser.Id}/role",
            new UpdateUserRoleDto
            {
                Role = "Admin"
            });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var updatedUser = await response.Content
            .ReadFromJsonAsync<UserResponseDto>();

        Assert.NotNull(updatedUser);
        Assert.Equal("Admin", updatedUser.Role);
    }

    [Fact]
    public async Task UpdateRole_WithInvalidRole_ReturnsBadRequest()
    {
        using var client = _factory.CreateClient();

        var admin = await RegisterAndPromoteAsync(
            "Admin User",
            $"admin-{Guid.NewGuid()}@example.com");

        var targetUser = await RegisterAsync(
            client,
            "Target User",
            $"target-{Guid.NewGuid()}@example.com");

        var token = await LoginAsync(
            client,
            admin.Email,
            TestPassword);

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var response = await client.PutAsJsonAsync(
            $"/api/v1/users/{targetUser.Id}/role",
            new UpdateUserRoleDto
            {
                Role = "Manager"
            });

        Assert.Equal(
            HttpStatusCode.BadRequest,
            response.StatusCode);
    }

    [Fact]
    public async Task UpdateRole_ForMissingUser_ReturnsNotFound()
    {
        using var client = _factory.CreateClient();

        var admin = await RegisterAndPromoteAsync(
            "Admin User",
            $"admin-{Guid.NewGuid()}@example.com");

        var token = await LoginAsync(
            client,
            admin.Email,
            TestPassword);

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var response = await client.PutAsJsonAsync(
            "/api/v1/users/999999/role",
            new UpdateUserRoleDto
            {
                Role = "Admin"
            });

        Assert.Equal(
            HttpStatusCode.NotFound,
            response.StatusCode);
    }

    [Fact]
    public async Task UpdateRole_WhenAdminDemotesSelf_ReturnsBadRequest()
    {
        using var client = _factory.CreateClient();

        var admin = await RegisterAndPromoteAsync(
            "Admin User",
            $"admin-{Guid.NewGuid()}@example.com");

        var token = await LoginAsync(
            client,
            admin.Email,
            TestPassword);

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var response = await client.PutAsJsonAsync(
            $"/api/v1/users/{admin.Id}/role",
            new UpdateUserRoleDto
            {
                Role = "User"
            });

        Assert.Equal(
            HttpStatusCode.BadRequest,
            response.StatusCode);
    }

    private const string TestPassword = "StrongPass1!";

    private async Task<UserResponseDto> RegisterAndPromoteAsync(
        string fullName,
        string email)
    {
        using var client = _factory.CreateClient();

        var user = await RegisterAsync(
            client,
            fullName,
            email);

        using var scope = _factory.Services.CreateScope();

        var context = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        var appUser = await context.AppUsers.FindAsync(user.Id);

        Assert.NotNull(appUser);

        appUser.Role = "Admin";

        await context.SaveChangesAsync();

        return new UserResponseDto
        {
            Id = appUser.Id,
            FullName = appUser.FullName,
            Email = appUser.Email,
            Role = appUser.Role
        };
    }

    private static async Task<UserResponseDto> RegisterAsync(
        HttpClient client,
        string fullName,
        string email)
    {
        var response = await client.PostAsJsonAsync(
            "/api/v1/auth/register",
            new
            {
                fullName,
                email,
                password = TestPassword
            });

        response.EnsureSuccessStatusCode();

        var result = await response.Content
            .ReadFromJsonAsync<UserResponseDto>();

        Assert.NotNull(result);

        return result;
    }

    private static async Task<string> LoginAsync(
        HttpClient client,
        string email,
        string password)
    {
        var response = await client.PostAsJsonAsync(
            "/api/v1/auth/login",
            new
            {
                email,
                password
            });

        response.EnsureSuccessStatusCode();

        var result = await response.Content
            .ReadFromJsonAsync<LoginResponseDto>();

        Assert.NotNull(result);
        Assert.False(string.IsNullOrWhiteSpace(result.Token));

        return result.Token;
    }
}