using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Server.Core.Notification;
using Server.Examples.Notifications;

namespace Server.Tests.Examples.Notifications;

public sealed class NotificationAntiforgeryTests
{
    [Theory]
    [InlineData("default", "missing")]
    [InlineData("table", "missing")]
    [InlineData("default", "invalid")]
    [InlineData("table", "invalid")]
    [InlineData("default", "mismatched")]
    [InlineData("table", "mismatched")]
    [InlineData("default", "valid")]
    [InlineData("table", "valid")]
    public async Task PostRequiresMatchingAntiforgeryCookieAndToken(string endpoint, string tokenMode)
    {
        var service = new RecordingNotificationService();
        await using var app = CreateApp(service);
        await app.StartAsync();
        using var client = app.GetTestClient();
        using var login = await client.GetAsync("/test-login");
        var authCookie = Cookie(login);
        client.DefaultRequestHeaders.Add("Cookie", authCookie);

        using var tokenResponse = await client.GetAsync("/api/notification/antiforgery");
        tokenResponse.EnsureSuccessStatusCode();
        Assert.True(tokenResponse.Headers.CacheControl?.NoStore);
        var token = (await tokenResponse.Content.ReadFromJsonAsync<TokenResponse>())!.RequestToken;
        var antiforgeryCookie = Cookie(tokenResponse);
        if (tokenMode == "mismatched")
        {
            // No antiforgery cookie is sent, so this produces a different cookie/token pair.
            using var otherResponse = await client.GetAsync("/api/notification/antiforgery");
            otherResponse.EnsureSuccessStatusCode();
            antiforgeryCookie = Cookie(otherResponse);
        }

        client.DefaultRequestHeaders.Remove("Cookie");
        client.DefaultRequestHeaders.Add("Cookie", $"{authCookie}; {antiforgeryCookie}");
        if (tokenMode != "missing")
        {
            client.DefaultRequestHeaders.Add("RequestVerificationToken", tokenMode == "invalid" ? "invalid" : token);
        }

        using var response = await client.PostAsJsonAsync($"/api/notification/{endpoint}", new
        {
            to = "recipient@example.com",
            subject = "Subject",
            header = "Header",
            message = "Message",
            rows = new[] { new { title = "Row", details = "Details", amount = 1 } },
            totalAmount = 1,
        });

        Assert.Equal(tokenMode == "valid" ? HttpStatusCode.OK : HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(tokenMode == "valid" ? 1 : 0, service.Deliveries);
    }

    [Theory]
    [InlineData("/api/notification/antiforgery")]
    [InlineData("/api/notification/default")]
    [InlineData("/api/notification/table")]
    public async Task AnonymousRequestsAreRejected(string path)
    {
        var service = new RecordingNotificationService();
        await using var app = CreateApp(service);
        await app.StartAsync();
        using var client = app.GetTestClient();
        using var response = path.EndsWith("antiforgery", StringComparison.Ordinal)
            ? await client.GetAsync(path)
            : await client.PostAsJsonAsync(path, new { });
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal(0, service.Deliveries);
    }

    private static string Cookie(HttpResponseMessage response) =>
        string.Join("; ", response.Headers.GetValues("Set-Cookie").Select(value => value.Split(';')[0]));

    private static WebApplication CreateApp(RecordingNotificationService service)
    {
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions { EnvironmentName = "test" });
        builder.WebHost.UseTestServer();
        builder.Services.AddDataProtection().UseEphemeralDataProtectionProvider();
        builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie(options =>
        {
            options.Events.OnRedirectToLogin = context =>
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return Task.CompletedTask;
            };
        });
        builder.Services.AddControllersWithViews().AddApplicationPart(typeof(NotificationController).Assembly);
        builder.Services.AddSingleton<ISampleNotificationService>(service);
        var app = builder.Build();
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapGet("/test-login", async (HttpContext context) =>
            await context.SignInAsync(new ClaimsPrincipal(new ClaimsIdentity(
                [new Claim(ClaimTypes.NameIdentifier, "test-user")],
                CookieAuthenticationDefaults.AuthenticationScheme))));
        app.MapControllers();
        return app;
    }

    private sealed record TokenResponse(string RequestToken);

#pragma warning disable S1172 // Test doubles must retain the interface parameter list.
    private sealed class RecordingNotificationService : ISampleNotificationService
    {
        public int Deliveries { get; private set; }

        public Task SendAsync(EmailRecipients recipients, string subject, string header, string message,
            CancellationToken cancellationToken = default)
        {
            Deliveries++;
            return Task.CompletedTask;
        }

        public Task SendTableAsync(EmailRecipients recipients, string subject, string header, string message,
            IReadOnlyList<NotificationTableRow> rows, decimal totalAmount, CancellationToken cancellationToken = default)
        {
            Deliveries++;
            return Task.CompletedTask;
        }
    }
#pragma warning restore S1172
}
