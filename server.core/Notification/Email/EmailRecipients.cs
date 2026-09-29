using System.ComponentModel.DataAnnotations;
using MimeKit;

namespace Server.Core.Notification;

public sealed class EmailRecipients
{
    private readonly MailboxAddress[] _to;
    private readonly MailboxAddress[] _cc;
    private readonly MailboxAddress[] _bcc;

    private EmailRecipients(MailboxAddress[] to, MailboxAddress[] cc, MailboxAddress[] bcc)
    {
        _to = to;
        _cc = cc;
        _bcc = bcc;
        To = Array.AsReadOnly(to.Select(mailbox => mailbox.ToString()).ToArray());
        Cc = Array.AsReadOnly(cc.Select(mailbox => mailbox.ToString()).ToArray());
        Bcc = Array.AsReadOnly(bcc.Select(mailbox => mailbox.ToString()).ToArray());
    }

    public IReadOnlyList<string> To { get; }
    public IReadOnlyList<string> Cc { get; }
    public IReadOnlyList<string> Bcc { get; }

    public static EmailRecipients Parse(
        IEnumerable<string>? to, IEnumerable<string>? cc = null, IEnumerable<string>? bcc = null)
    {
        var parsedTo = ParseList(to, nameof(To));
        if (parsedTo.Length == 0)
        {
            throw new ValidationException("'To' requires at least 1 email address.");
        }

        return new EmailRecipients(parsedTo, ParseList(cc, nameof(Cc)), ParseList(bcc, nameof(Bcc)));
    }

    internal void CopyTo(MimeMessage message)
    {
        CopyMailboxes(message.To, _to);
        CopyMailboxes(message.Cc, _cc);
        CopyMailboxes(message.Bcc, _bcc);
    }

    private static MailboxAddress[] ParseList(IEnumerable<string>? emails, string field)
    {
        return emails?.Select(email => EmailValidation.ParseMailbox(email, field)).ToArray() ?? [];
    }

    private static void CopyMailboxes(InternetAddressList destination, IEnumerable<MailboxAddress> source)
    {
        foreach (var mailbox in source)
        {
            // MimeKit mailboxes are mutable; keep the parsed originals private.
            destination.Add(new MailboxAddress(mailbox.Name, mailbox.Address));
        }
    }
}
