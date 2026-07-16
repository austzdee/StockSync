using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using StockSync.Data;

namespace StockSync.Tests.TestInfrastructure;

/// <summary>
/// Creates an isolated application host for integration tests.
/// Replaces the production SQL Server database with an EF Core
/// in-memory database and loads dedicated test configuration.
/// </summary>
public class CustomWebApplicationFactory
    : WebApplicationFactory<Program>
{
    private readonly string _databaseName =
        $"StockSyncTestDb-{Guid.NewGuid()}";

    /// <summary>
    /// Configures test-specific application settings and services.
    /// </summary>
    protected override void ConfigureWebHost(
        IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration(
            (_, configuration) =>
            {
                // Resolve the test settings file from the compiled
                // StockSync.Tests output directory.
                configuration.SetBasePath(
                    AppContext.BaseDirectory);

                configuration.AddJsonFile(
                    "appsettings.Testing.json",
                    optional: false,
                    reloadOnChange: false);
            });

        builder.ConfigureTestServices(services =>
        {
            // Remove the production DbContext registration.
            services.RemoveAll<AppDbContext>();
            services.RemoveAll<
                DbContextOptions<AppDbContext>>();

            // Remove the provider-specific EF Core configuration
            // retained by the production DbContext registration.
            var configurationDescriptors = services
                .Where(service =>
                    service.ServiceType.IsGenericType &&
                    service.ServiceType.Name.Contains(
                        "IDbContextOptionsConfiguration") &&
                    service.ServiceType
                        .GenericTypeArguments[0] ==
                    typeof(AppDbContext))
                .ToList();

            foreach (var descriptor
                     in configurationDescriptors)
            {
                services.Remove(descriptor);
            }

            // Register a uniquely named in-memory database for
            // this integration-test application factory.
            services.AddDbContext<AppDbContext>(
                options =>
                {
                    options
                        .UseInMemoryDatabase(_databaseName)
                        .ConfigureWarnings(warnings =>
                            warnings.Ignore(
                                InMemoryEventId
                                    .TransactionIgnoredWarning));
                });
        });
    }
}