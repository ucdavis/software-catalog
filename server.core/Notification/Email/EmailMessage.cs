using System.ComponentModel.DataAnnotations;

namespace Server.Core.Notification;

public sealed class EmailMessage
{
    private EmailMessage(EmailRecipients recipients, string subject, string textBody, string htmlBody)
    {
        Recipients = recipients;
        Subject = subject;
        TextBody = textBody;
        HtmlBody = htmlBody;
    }

    public EmailRecipients Recipients { get; }
    public string Subject { get; }
    public string TextBody { get; }
    public string HtmlBody { get; }

    public static EmailMessage Create(EmailRecipients recipients, string subject, string textBody, string? htmlBody = null)
    {
        ArgumentNullException.ThrowIfNull(recipients);
        if (string.IsNullOrWhiteSpace(subject))
        {
            throw new ValidationException("Email subject is required.");
        }

        if (string.IsNullOrWhiteSpace(textBody))
        {
            throw new ValidationException("Email text body is required.");
        }

        return new EmailMessage(recipients, subject, textBody, htmlBody ?? string.Empty);
    }
}
