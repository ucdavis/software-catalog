using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Server.Core.Notification;
using Server.Examples.Notifications;

namespace Server.Tests.Examples.Notifications;

public class SampleNotificationServiceTests
{
    [Fact]
    public async Task SendAsync_renders_the_template_and_sends_the_email()
    {
        var emailService = new CaptureEmailService();
        var notificationRenderer = new CaptureNotificationRenderer();
        var service = new SampleNotificationService(
            emailService,
            notificationRenderer,
            Options.Create(new SampleNotificationOptions
            {
                BaseUrl = "https://example.test",
                DefaultAppName = "Notification Center",
                DefaultButtonText = "Review notification",
            }),
            Options.Create(new SmtpOptions
            {
                FromName = "Template App",
            }));

        await service.SendAsync(EmailRecipients.Parse(["person@example.com"]), "Notification subject", "Notification header", "Notification message");

        notificationRenderer.TemplatePath.Should().Be("/Examples/Notifications/Views/DefaultNotification_mjml.cshtml");
        notificationRenderer.Model.Should().BeOfType<DefaultNotificationTemplateModel>();

        var model = (DefaultNotificationTemplateModel)notificationRenderer.Model!;
        model.AppName.Should().Be("Notification Center");
        model.Header.Should().Be("Notification header");
        model.Paragraphs.Should().Contain("Notification message");
        model.ButtonText.Should().Be("Review notification");
        model.ButtonUrl.Should().Be("https://example.test/");

        emailService.Message.Should().NotBeNull();
        emailService.Message!.Recipients.Should().BeEquivalentTo(EmailRecipients.Parse(["person@example.com"]));
        emailService.Message.Subject.Should().Be("Notification subject");
        emailService.Message.TextBody.Should().Be(
            $"Notification header{Environment.NewLine}{Environment.NewLine}Notification message");
        emailService.Message.HtmlBody.Should().Be(CaptureNotificationRenderer.RenderedHtml);
    }

    [Fact]
    public async Task SendAsync_falls_back_to_smtp_from_name_when_app_name_is_empty()
    {
        var emailService = new CaptureEmailService();
        var notificationRenderer = new CaptureNotificationRenderer();
        var service = new SampleNotificationService(
            emailService,
            notificationRenderer,
            Options.Create(new SampleNotificationOptions
            {
                BaseUrl = "",
                DefaultAppName = "",
                DefaultButtonText = "Open the application",
            }),
            Options.Create(new SmtpOptions
            {
                FromName = "Fallback App Name",
            }));

        await service.SendAsync(EmailRecipients.Parse(["person@example.com"]), "Subject", "Header", "Message");

        var model = notificationRenderer.Model.Should().BeOfType<DefaultNotificationTemplateModel>().Subject;
        model.AppName.Should().Be("Fallback App Name");
        model.ButtonText.Should().BeEmpty();
        model.ButtonUrl.Should().BeEmpty();
    }

    [Fact]
    public async Task SendTableAsync_renders_the_table_template_and_sends_the_email()
    {
        var emailService = new CaptureEmailService();
        var notificationRenderer = new CaptureNotificationRenderer();
        var service = new SampleNotificationService(
            emailService,
            notificationRenderer,
            Options.Create(new SampleNotificationOptions
            {
                DefaultAppName = "Notification Center",
            }),
            Options.Create(new SmtpOptions
            {
                FromName = "Template App",
            }));

        await service.SendTableAsync(EmailRecipients.Parse(["person@example.com"]),
        "Statement subject",
        "Weekly project summary",
        "Five sample rows are rendered into the MJML table.",
        [
            new NotificationTableRow
            {
                Title = "Kickoff",
                Details = "Planning and alignment",
                Amount = 125.50m,
            },
            new NotificationTableRow
            {
                Title = "Build",
                Details = "Implementation sprint",
                Amount = 340m,
            },
        ],
        465.50m);

        notificationRenderer.TemplatePath.Should().Be("/Examples/Notifications/Views/TableNotification_mjml.cshtml");
        notificationRenderer.Model.Should().BeOfType<TableNotificationTemplateModel>();

        var model = (TableNotificationTemplateModel)notificationRenderer.Model!;
        model.AppName.Should().Be("Notification Center");
        model.Header.Should().Be("Weekly project summary");
        model.LayoutWidth.Should().Be("800px");
        model.Message.Should().Be("Five sample rows are rendered into the MJML table.");
        model.Rows.Should().HaveCount(2);
        model.TotalAmount.Should().Be(465.50m);

        emailService.Message.Should().NotBeNull();
        emailService.Message!.Subject.Should().Be("Statement subject");
        emailService.Message.TextBody.Should().Contain("Kickoff");
        emailService.Message.TextBody.Should().Contain("Total: $465.50");
        emailService.Message.HtmlBody.Should().Be(CaptureNotificationRenderer.RenderedHtml);
    }

    [Fact]
    public async Task SendAsync_preserves_recipients_while_rendering_is_awaited()
    {
        string[] addresses = ["original@example.test"];
        var recipients = EmailRecipients.Parse(addresses);
        var emailService = new CaptureEmailService();
        var renderer = new PausedNotificationRenderer();
        var service = CreateService(emailService, renderer);

        var sending = service.SendAsync(recipients, "Subject", "Header", "Message");
        await renderer.Started.Task.WaitAsync(TimeSpan.FromSeconds(5));
        addresses[0] = "changed@example.test";
        renderer.Resume.SetResult();
        await sending.WaitAsync(TimeSpan.FromSeconds(5));

        emailService.Message!.Recipients.To.Should().Equal("original@example.test");
    }

    [Fact]
    public async Task SendTableAsync_preserves_rows_while_rendering_is_awaited()
    {
        var rows = new List<NotificationTableRow>
        {
            new() { Title = "Original", Details = "Original details", Amount = 12m },
        };
        var emailService = new CaptureEmailService();
        var renderer = new PausedNotificationRenderer();
        var service = CreateService(emailService, renderer);

        var sending = service.SendTableAsync(EmailRecipients.Parse(["person@example.test"]),
            "Subject", "Header", "Message", rows, 12m);
        await renderer.Started.Task.WaitAsync(TimeSpan.FromSeconds(5));
        rows.Clear();
        renderer.Resume.SetResult();
        await sending.WaitAsync(TimeSpan.FromSeconds(5));

        var model = renderer.Model.Should().BeOfType<TableNotificationTemplateModel>().Subject;
        model.Rows.Should().ContainSingle().Which.Title.Should().Be("Original");
        emailService.Message!.TextBody.Should().Contain("Original");
    }

    [Theory]
    [InlineData("javascript:alert(1)")]
    [InlineData("data:text/html,hello")]
    [InlineData("/relative")]
    [InlineData("//example.test/path")]
#pragma warning disable S2068 // Synthetic credentials verify that credential-bearing URLs are rejected.
    [InlineData("https://user:secret@example.test")]
#pragma warning restore S2068
    public void Composition_rejects_unsafe_configured_links(string baseUrl)
    {
        var create = () => new SampleNotificationService(
            new CaptureEmailService(), new CaptureNotificationRenderer(),
            Options.Create(new SampleNotificationOptions { BaseUrl = baseUrl }),
            Options.Create(new SmtpOptions { FromName = "Template App" }));

        var error = create.Should().Throw<OptionsValidationException>().Which;
        error.Message.Should().Contain("Notification:BaseUrl");
        error.Message.Should().NotContain(baseUrl);
    }

    [Fact]
    public void Bound_notification_options_reject_unsafe_links_at_startup()
    {
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Notification:BaseUrl"] = "https://user:secret@example.test",
        }).Build();
        var services = new ServiceCollection();
        services.AddNotificationExamples(configuration);
        using var provider = services.BuildServiceProvider();

        var startup = () => provider.GetRequiredService<IStartupValidator>().Validate();

        var error = startup.Should().Throw<OptionsValidationException>().Which;
        error.Message.Should().Contain("Notification:BaseUrl");
        error.Message.Should().NotContain("secret");
    }

    [Theory]
    [InlineData(null, "")]
    [InlineData("   ", "")]
    [InlineData("http://localhost:5173", "http://localhost:5173/")]
    [InlineData("https://example.test/path?view=summary", "https://example.test/path?view=summary")]
    public async Task Composition_parses_optional_application_links(string? baseUrl, string expected)
    {
        var renderer = new CaptureNotificationRenderer();
        var service = new SampleNotificationService(new CaptureEmailService(), renderer,
            Options.Create(new SampleNotificationOptions { BaseUrl = baseUrl! }),
            Options.Create(new SmtpOptions { FromName = "Template App" }));

        await service.SendAsync(EmailRecipients.Parse(["person@example.test"]), "Subject", "Header", "Message");

        var model = renderer.Model.Should().BeOfType<DefaultNotificationTemplateModel>().Subject;
        model.ButtonUrl.Should().Be(expected);
        if (expected.Length == 0)
        {
            model.ButtonText.Should().BeEmpty();
        }
    }

    [Theory]
    [InlineData("null")]
    [InlineData("[]")]
    [InlineData("[null]")]
    [InlineData("[{\"Title\":null,\"Details\":\"Details\"}]")]
    public async Task Composition_rejects_invalid_rows_before_rendering(string json)
    {
        var rows = System.Text.Json.JsonSerializer.Deserialize<List<NotificationTableRow>>(json);
        var email = new CaptureEmailService();
        var renderer = new CaptureNotificationRenderer();
        var service = CreateService(email, renderer);

        var send = () => service.SendTableAsync(EmailRecipients.Parse(["person@example.test"]),
            "Subject", "Header", "Message", rows!, 0m);

        await send.Should().ThrowAsync<System.ComponentModel.DataAnnotations.ValidationException>();
        renderer.Model.Should().BeNull();
        email.Message.Should().BeNull();
    }

    private static SampleNotificationService CreateService(IEmailService email, INotificationRenderer renderer)
    {
        return new SampleNotificationService(email, renderer,
            Options.Create(new SampleNotificationOptions()),
            Options.Create(new SmtpOptions { FromName = "Template App" }));
    }

#pragma warning disable S1172 // Test doubles must retain the interface parameter list.
    private sealed class PausedNotificationRenderer : INotificationRenderer
    {
        public TaskCompletionSource Started { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);
        public TaskCompletionSource Resume { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);
        public object? Model { get; private set; }

        public async Task<string> RenderAsync<TModel>(string templatePath, TModel model,
            CancellationToken cancellationToken = default)
        {
            Model = model;
            Started.SetResult();
            await Resume.Task.WaitAsync(TimeSpan.FromSeconds(5), cancellationToken);
            return "<html><body>Rendered</body></html>";
        }
    }

    private sealed class CaptureEmailService : IEmailService
    {
        public EmailMessage? Message { get; private set; }

        public Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default)
        {
            Message = message;
            return Task.CompletedTask;
        }
    }

    private sealed class CaptureNotificationRenderer : INotificationRenderer
    {
        public const string RenderedHtml = "<html><body>Rendered notification</body></html>";

        public string? TemplatePath { get; private set; }
        public object? Model { get; private set; }

        public Task<string> RenderAsync<TModel>(
            string templatePath,
            TModel model,
            CancellationToken cancellationToken = default)
        {
            TemplatePath = templatePath;
            Model = model;

            return Task.FromResult(RenderedHtml);
        }
    }
#pragma warning restore S1172
}
