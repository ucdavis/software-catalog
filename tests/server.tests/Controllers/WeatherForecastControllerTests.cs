using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Server.Controllers;
using Server.Core.Data;
using Server.Core.Domain;
using Server.Tests;

namespace Server.Tests.Controllers;

public class WeatherForecastControllerTests
{
    [Fact]
    public async Task Get_returns_latest_20_forecasts_descending_by_date()
    {
        // Arrange
        using AppDbContext ctx = TestDbContextFactory.CreateSqlite();

        // seed some data
        var today = new DateOnly(2025, 1, 1);

        for (int i = 0; i < 25; i++)
        {
            ctx.WeatherForecasts.Add(new WeatherForecast
            {
                Date = today.AddDays(i),          // strictly increasing dates
                TemperatureC = i % 50 - 10,       // some variety
                Summary = $"Day {i}"
            });
        }

        ctx.SaveChanges();

        var logger = NullLogger<WeatherForecastController>.Instance;
        var controller = new WeatherForecastController(logger, ctx);

        // Act
        var result = await controller.Get();
        var list = result.ToList();

        // Assert
        list.Should().HaveCount(20, "controller takes top 20");

        // dates should be strictly descending, starting from the most recent
        var dates = list.Select(w => w.Date).ToList();
        dates.Should().BeInDescendingOrder();

        // The first item should be the last inserted date (today + 24)
        var expectedTop = new DateOnly(2025, 1, 1).AddDays(24);
        dates.First().Should().Be(expectedTop);

        // The last of the 20 should be (today + 5)
        var expectedLast = new DateOnly(2025, 1, 1).AddDays(5);
        dates.Last().Should().Be(expectedLast);

        // also sanity-check a couple of mapped properties carried through
        list[0].Summary.Should().Be("Day 24");
        list[0].TemperatureC.Should().Be(24 % 50 - 10);
    }
}
