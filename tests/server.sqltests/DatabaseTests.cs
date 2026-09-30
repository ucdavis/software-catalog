using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Server.Core.Data;
using Server.Core.Domain;

namespace Server.SqlTests;

public sealed class DatabaseTests
{
    [Fact]
    public async Task Migrations_seeding_and_date_queries_work_on_sql_server()
    {
        var connection = Environment.GetEnvironmentVariable("TEST_SQL_CONNECTION");
        Assert.False(string.IsNullOrWhiteSpace(connection),
            "Set TEST_SQL_CONNECTION to a disposable SQL Server instance. See docs/TESTING.md.");
        // Never migrate or delete the database named in the supplied connection.
        var isolated = new SqlConnectionStringBuilder(connection)
        {
            InitialCatalog = $"SoftwareCatalogTests_{Guid.NewGuid():N}",
        };
        var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlServer(isolated.ConnectionString).Options;
        await using var context = new AppDbContext(options);
        try
        {
            var initializer = new DbInitializer(context, NullLogger<DbInitializer>.Instance);
            await initializer.InitializeAsync(includeSampleData: false);
            Assert.NotEmpty(await context.Database.GetAppliedMigrationsAsync());
            Assert.Empty(await context.Database.GetPendingMigrationsAsync());
            Assert.Empty(await context.WeatherForecasts.ToListAsync());
            await initializer.InitializeAsync(includeSampleData: true);
            await initializer.InitializeAsync(includeSampleData: true);
            Assert.Equal(10, await context.WeatherForecasts.CountAsync());
            var latest = await context.WeatherForecasts.OrderByDescending(row => row.Date).Take(1).SingleAsync();
            Assert.Equal(new DateOnly(2025, 1, 10), latest.Date);
            Assert.Equal("Pleasant", latest.Summary);
            Assert.True(latest.Id > 0);

            context.WeatherForecasts.Add(new WeatherForecast
            {
                Date = new DateOnly(2025, 2, 1),
                TemperatureC = 20,
                Summary = new string('x', 101),
            });
            // SQL Server enforces this limit; SQLite does not.
            await Assert.ThrowsAsync<DbUpdateException>(() => context.SaveChangesAsync());
        }
        finally
        {
            await context.Database.EnsureDeletedAsync();
        }
    }
}
