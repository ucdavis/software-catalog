using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Server.Core.Data;

namespace Server.Tests.Integration;

public sealed class ApplicationFactory : WebApplicationFactory<Program>
{
    protected override IHost CreateHost(IHostBuilder builder)
    {
        // DeferredHostBuilder passes host configuration as launch arguments,
        // before Program reads authentication settings or registers services.
        builder.ConfigureHostConfiguration(configuration => configuration.AddInMemoryCollection(
            new Dictionary<string, string?>
            {
                ["Auth:UseLocal"] = "true",
                ["Auth:LocalCookieSuffix"] = "integration-tests",
                ["DB_CONNECTION"] = "unused-test-connection",
                ["DevelopmentData:SeedOnStartup"] = "false",
                ["Smtp:Host"] = "",
                ["Notification:BaseUrl"] = "",
            }));
        return base.CreateHost(builder);
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.RemoveAll<IDbContextOptionsConfiguration<AppDbContext>>();
            services.AddSingleton(_ =>
            {
                var connection = new SqliteConnection("Data Source=:memory:");
                connection.Open();
                return connection;
            });
            // Retain the application's pool and replace only its provider options.
            services.AddDbContextPool<AppDbContext>((provider, options) =>
                options.UseSqlite(provider.GetRequiredService<SqliteConnection>()));
            services.RemoveAll<IDbInitializer>();
            services.AddScoped<IDbInitializer, SqliteInitializer>();
            services.AddDataProtection().UseEphemeralDataProtectionProvider();
        });
    }

    private sealed class SqliteInitializer(AppDbContext context) : IDbInitializer
    {
        public async Task InitializeAsync(bool includeSampleData, CancellationToken cancellationToken = default)
        {
            await context.Database.EnsureCreatedAsync(cancellationToken);
        }
    }
}
