using Microsoft.EntityFrameworkCore;
using Server.Core.Data;

namespace Server.Tests;

public static class TestDbContextFactory
{
    /// <summary>
    /// Creates an isolated relational database, owned and disposed by the context.
    /// SQL Server migrations and provider behavior have a separate integration suite.
    /// </summary>
    public static AppDbContext CreateSqlite()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite("Data Source=:memory:")
            .Options;

        var ctx = new AppDbContext(options);
        ctx.Database.OpenConnection();
        ctx.Database.EnsureCreated();
        return ctx;
    }
}
