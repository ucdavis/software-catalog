using System.Collections.Concurrent;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;

namespace Server.Tests.Integration;

public sealed class ApplicationLifetimeTests
{
    [Fact]
    public async Task Shutdown_logs_before_the_host_disposes_its_services()
    {
        var logs = new RecordingLoggerProvider();
        await using var application = new ApplicationFactory();
        var configured = application.WithWebHostBuilder(builder =>
            builder.ConfigureLogging(logging => logging.AddProvider(logs)));
        try
        {
            using var client = configured.CreateClient();
            using var response = await client.GetAsync("/health");
            response.EnsureSuccessStatusCode();
        }
        finally
        {
            await configured.DisposeAsync();
        }

        Assert.Contains(logs.Entries, entry => entry.Level == LogLevel.Information &&
            entry.Message.StartsWith("Shutting down ", StringComparison.Ordinal));
        Assert.DoesNotContain(logs.Entries, entry => entry.Level == LogLevel.Critical);
    }

    private sealed class RecordingLoggerProvider : ILoggerProvider
    {
        public ConcurrentQueue<(LogLevel Level, string Message)> Entries { get; } = new();

        public ILogger CreateLogger(string categoryName) => new RecordingLogger(Entries);

        public void Dispose() { }

        private sealed class RecordingLogger(ConcurrentQueue<(LogLevel Level, string Message)> entries) : ILogger
        {
            public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;
            public bool IsEnabled(LogLevel logLevel) => true;

            public void Log<TState>(LogLevel logLevel, EventId eventId, TState state,
                Exception? exception, Func<TState, Exception?, string> formatter) =>
                entries.Enqueue((logLevel, formatter(state, exception)));
        }
    }
}
