using System.ComponentModel.DataAnnotations;
using MimeKit;

namespace Server.Core.Notification;

internal static class EmailValidation
{
    private static readonly EmailAddressAttribute EmailAddressValidator = new();

    internal static bool IsValidMailbox(string? email)
    {
        return TryParseMailbox(email, out _);
    }

    internal static MailboxAddress ParseMailbox(string? email, string field)
    {
        if (!TryParseMailbox(email, out var mailbox) || mailbox == null)
        {
            throw new ValidationException($"'{field}' contains an invalid email address.");
        }

        return mailbox;
    }

    private static bool TryParseMailbox(string? email, out MailboxAddress? mailbox)
    {
        mailbox = null;
        return !string.IsNullOrWhiteSpace(email) &&
               EmailAddressValidator.IsValid(email) &&
               MailboxAddress.TryParse(email, out mailbox);
    }
}
