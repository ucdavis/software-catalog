using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Server.Tests.Integration;

public sealed class AuthenticationPipelineTests(ApplicationFactory application) : IClassFixture<ApplicationFactory>
{
    private HttpClient CreateClient() => application.CreateClient(new WebApplicationFactoryClientOptions
    {
        AllowAutoRedirect = false,
        BaseAddress = new Uri("https://localhost"),
    });

    [Theory]
    [InlineData("/api/user/me")]
    [InlineData("/api/weatherforecast")]
    public async Task Anonymous_api_requests_return_401_without_redirect(string path)
    {
        using var client = CreateClient();
        using var response = await client.GetAsync(path);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Null(response.Headers.Location);
    }

    [Fact]
    public async Task Health_check_uses_the_configured_relational_database()
    {
        using var client = CreateClient();
        using var response = await client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Healthy", await response.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Local_login_requires_antiforgery_and_does_not_issue_a_session_on_failure()
    {
        using var client = CreateClient();
        using var response = await client.PostAsync("/login/local",
            new FormUrlEncodedContent(new Dictionary<string, string> { ["persona"] = "sample" }));
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        using var me = await client.GetAsync("/api/user/me");
        Assert.Equal(HttpStatusCode.Unauthorized, me.StatusCode);
    }

    [Theory]
    [InlineData("basic", HttpStatusCode.Forbidden)]
    [InlineData("sample", HttpStatusCode.OK)]
    public async Task Local_login_cookie_and_role_authorization_work_through_the_real_pipeline(
        string persona, HttpStatusCode forecastStatus)
    {
        using var client = CreateClient();
        var html = await client.GetStringAsync("/login?returnUrl=%2Ffetch");
        var token = Regex.Match(html, "name=\"__RequestVerificationToken\"[^>]*value=\"([^\"]+)\"",
            RegexOptions.CultureInvariant, TimeSpan.FromSeconds(1));
        Assert.True(token.Success, "The real login view must render an antiforgery field.");
        using var login = await client.PostAsync("/login/local", new FormUrlEncodedContent(
            new Dictionary<string, string>
            {
                ["persona"] = persona,
                ["returnUrl"] = "https://untrusted.example/",
                ["__RequestVerificationToken"] = WebUtility.HtmlDecode(token.Groups[1].Value),
            }));
        Assert.Equal(HttpStatusCode.Redirect, login.StatusCode);
        Assert.Equal("/", login.Headers.Location?.OriginalString);
        var user = await client.GetFromJsonAsync<JsonElement>("/api/user/me");
        Assert.Equal($"sandbox-{persona}", user.GetProperty("id").GetString());
        using var forecasts = await client.GetAsync("/api/weatherforecast");
        Assert.Equal(forecastStatus, forecasts.StatusCode);
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task Local_logout_requires_antiforgery_and_clears_the_session_only_on_success(bool includeToken)
    {
        using var client = CreateClient();
        var token = await GetAntiforgeryToken(client);
        using var login = await client.PostAsync("/login/local", new FormUrlEncodedContent(
            new Dictionary<string, string>
            {
                ["persona"] = "sample",
                ["__RequestVerificationToken"] = token,
            }));
        Assert.Equal(HttpStatusCode.Redirect, login.StatusCode);
        using var beforeLogout = await client.GetAsync("/api/user/me");
        Assert.Equal(HttpStatusCode.OK, beforeLogout.StatusCode);

        // Antiforgery tokens are bound to identity: obtain a new one after sign-in.
        var form = new Dictionary<string, string>();
        if (includeToken)
        {
            form["__RequestVerificationToken"] = await GetAntiforgeryToken(client);
        }
        using var logout = await client.PostAsync("/logout/local", new FormUrlEncodedContent(form));
        Assert.Equal(includeToken ? HttpStatusCode.Redirect : HttpStatusCode.BadRequest, logout.StatusCode);
        Assert.Equal(includeToken ? "/login" : null, logout.Headers.Location?.OriginalString);
        using var afterLogout = await client.GetAsync("/api/user/me");
        Assert.Equal(includeToken ? HttpStatusCode.Unauthorized : HttpStatusCode.OK, afterLogout.StatusCode);
        Assert.Null(afterLogout.Headers.Location);
    }

    private static async Task<string> GetAntiforgeryToken(HttpClient client)
    {
        var html = await client.GetStringAsync("/login");
        var token = Regex.Match(html, "name=\"__RequestVerificationToken\"[^>]*value=\"([^\"]+)\"",
            RegexOptions.CultureInvariant, TimeSpan.FromSeconds(1));
        Assert.True(token.Success, "The real login view must render an antiforgery field.");
        return WebUtility.HtmlDecode(token.Groups[1].Value);
    }
}
