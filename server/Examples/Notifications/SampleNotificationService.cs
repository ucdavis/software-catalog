using System.ComponentModel.DataAnnotations;
using System.Globalization;
using Microsoft.Extensions.Options;
using Server.Core.Notification;

namespace Server.Examples.Notifications;

public interface ISampleNotificationService
{
    Task SendAsync(
        EmailRecipients recipients,
        string subject,
        string header,
        string message,
        CancellationToken cancellationToken = default);

    Task SendTableAsync(
        EmailRecipients recipients,
        string subject,
        string header,
        string message,
        IReadOnlyList<NotificationTableRow> rows,
        decimal totalAmount,
        CancellationToken cancellationToken = default);
}

public sealed class SampleNotificationService : ISampleNotificationService
{
    private const string DefaultTemplatePath = "/Examples/Notifications/Views/DefaultNotification_mjml.cshtml";
    private const string TableTemplatePath = "/Examples/Notifications/Views/TableNotification_mjml.cshtml";
    private static readonly CultureInfo CurrencyCulture = CultureInfo.GetCultureInfo("en-US");

    private readonly IEmailService _emailService;
    private readonly SampleNotificationOptions _notificationOptions;
    private readonly INotificationRenderer _notificationRenderer;
    private readonly SmtpOptions _smtpOptions;
    private readonly Uri? _baseUri;

    public SampleNotificationService(
        IEmailService emailService,
        INotificationRenderer notificationRenderer,
        IOptions<SampleNotificationOptions> notificationOptions,
        IOptions<SmtpOptions> smtpOptions)
    {
        _emailService = emailService;
        _notificationRenderer = notificationRenderer;
        _notificationOptions = notificationOptions.Value;
        _baseUri = _notificationOptions.ParseBaseUrl();
        _smtpOptions = smtpOptions.Value;
    }

    public async Task SendAsync(
        EmailRecipients recipients,
        string subject,
        string header,
        string message,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(subject))
        {
            throw new ValidationException("Notification subject is required.");
        }

        if (string.IsNullOrWhiteSpace(header))
        {
            throw new ValidationException("Notification header is required.");
        }

        if (string.IsNullOrWhiteSpace(message))
        {
            throw new ValidationException("Notification message is required.");
        }

        ArgumentNullException.ThrowIfNull(recipients);

        var appName = string.IsNullOrWhiteSpace(_notificationOptions.DefaultAppName)
            ? _smtpOptions.FromName
            : _notificationOptions.DefaultAppName;

        var model = new DefaultNotificationTemplateModel
        {
            AppName = appName,
            Header = header,
            Paragraphs =
            [
                message,
            ],
            ButtonText = _baseUri == null ? string.Empty : _notificationOptions.DefaultButtonText,
            ButtonUrl = _baseUri?.AbsoluteUri ?? string.Empty,
        };

        var textBody = $"{header}{Environment.NewLine}{Environment.NewLine}{message}";
        var htmlBody = await _notificationRenderer.RenderAsync(
            DefaultTemplatePath,
            model,
            cancellationToken);

        await _emailService.SendAsync(EmailMessage.Create(recipients, subject, textBody, htmlBody), cancellationToken);
    }

    public async Task SendTableAsync(
        EmailRecipients recipients,
        string subject,
        string header,
        string message,
        IReadOnlyList<NotificationTableRow> rows,
        decimal totalAmount,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(subject))
        {
            throw new ValidationException("Notification subject is required.");
        }

        if (string.IsNullOrWhiteSpace(header))
        {
            throw new ValidationException("Notification header is required.");
        }

        var parsedRows = ParseTableRows(rows);

        ArgumentNullException.ThrowIfNull(recipients);

        var appName = string.IsNullOrWhiteSpace(_notificationOptions.DefaultAppName)
            ? _smtpOptions.FromName
            : _notificationOptions.DefaultAppName;

        var model = new TableNotificationTemplateModel
        {
            AppName = appName,
            Header = header,
            LayoutWidth = "800px",
            Message = message,
            Rows = parsedRows,
            TotalAmount = totalAmount,
            ButtonText = _baseUri == null ? string.Empty : _notificationOptions.DefaultButtonText,
            ButtonUrl = _baseUri?.AbsoluteUri ?? string.Empty,
        };


        var textBody = BuildTableText(header, message, parsedRows, totalAmount);
        var htmlBody = await _notificationRenderer.RenderAsync(
            TableTemplatePath,
            model,
            cancellationToken);

        await _emailService.SendAsync(EmailMessage.Create(recipients, subject, textBody, htmlBody), cancellationToken);
    }

    private static IReadOnlyList<NotificationTableRow> ParseTableRows(IReadOnlyList<NotificationTableRow> rows)
    {
        if (rows == null || rows.Count == 0)
        {
            throw new ValidationException("At least one table row is required.");
        }

        var parsedRows = Array.AsReadOnly(rows.ToArray());
        if (parsedRows.Any(row => row == null || string.IsNullOrWhiteSpace(row.Title) || string.IsNullOrWhiteSpace(row.Details)))
        {
            throw new ValidationException("Each table row requires a title and details.");
        }

        return parsedRows;
    }

    private static string BuildTableText(string header, string message, IReadOnlyList<NotificationTableRow> rows, decimal totalAmount)
    {
        var textLines = new List<string>
        {
            header,
        };

        if (!string.IsNullOrWhiteSpace(message))
        {
            textLines.Add(string.Empty);
            textLines.Add(message);
        }

        textLines.Add(string.Empty);
        textLines.AddRange(rows.Select(row =>
            $"- {row.Title}: {row.Details} ({row.Amount.ToString("C2", CurrencyCulture)})"));
        textLines.Add(string.Empty);
        textLines.Add($"Total: {totalAmount.ToString("C2", CurrencyCulture)}");

        return string.Join(Environment.NewLine, textLines);
    }
}
