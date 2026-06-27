using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using StockSync.Data;
using Microsoft.EntityFrameworkCore.Diagnostics;


namespace StockSync.Tests.TestInfrastructure;

/// <summary>
/// Creates an isolated application host for integration tests.
/// Replaces the production SQL Server database with EF Core InMemory.
/// </summary>
public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _databaseName = $"StockSyncTestDb-{Guid.NewGuid()}";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<AppDbContext>();
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.RemoveAll<DbContextOptions>();

            var efCoreConfigDescriptors = services
                .Where(service =>
                    service.ServiceType.IsGenericType &&
                    service.ServiceType.Name.Contains("IDbContextOptionsConfiguration") &&
                    service.ServiceType.GenericTypeArguments[0] == typeof(AppDbContext))
                .ToList();

            foreach (var descriptor in efCoreConfigDescriptors)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<AppDbContext>(options =>
            {
                options
    .UseInMemoryDatabase(_databaseName)
    .ConfigureWarnings(warnings =>
        warnings.Ignore(InMemoryEventId.TransactionIgnoredWarning));
            });

            using var provider = services.BuildServiceProvider();
            using var scope = provider.CreateScope();

            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();
        });
    }
}