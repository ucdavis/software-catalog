using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using FluentAssertions;
using Server.Core.Notification;

namespace Server.Tests.Notification;

public class EmailRecipientsTests
{
    [Fact]
    public void Parsing_accepts_valid_email_lists()
    {
        var recipients = EmailRecipients.Parse(
            ["person@example.com"], ["copy@example.com"], ["blind@example.com"]);

        recipients.To.Should().Equal("person@example.com");
        recipients.Cc.Should().Equal("copy@example.com");
        recipients.Bcc.Should().Equal("blind@example.com");
    }

    [Theory]
    [InlineData("not-an-email")]
    [InlineData("person@bad domain.test")]
    [InlineData("person@example.test extra")]
    [InlineData(null)]
    public void Parsing_rejects_invalid_email_addresses(string? email)
    {
        var parse = () => EmailRecipients.Parse([email!]);

        parse.Should().Throw<ValidationException>().WithMessage("'To' contains an invalid email address.");
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void Parsing_requires_at_least_one_to_recipient(bool absent)
    {
        var parse = () => EmailRecipients.Parse(absent ? null : []);

        parse.Should().Throw<ValidationException>().WithMessage("'To' requires at least 1 email address.");
    }

    [Theory]
    [InlineData("To")]
    [InlineData("Cc")]
    [InlineData("Bcc")]
    public void Parsing_rejects_a_mixed_recipient_list(string field)
    {
        string[] mixedRecipients = ["valid@example.test", "person@bad domain.test"];
        var parse = () => EmailRecipients.Parse(
                field == "To" ? mixedRecipients : ["person@example.test"],
                field == "Cc" ? mixedRecipients : [],
                field == "Bcc" ? mixedRecipients : []);

        parse.Should().Throw<ValidationException>()
            .WithMessage($"'{field}' contains an invalid email address.");
    }

    [Fact]
    public void Parsed_recipients_cannot_be_changed_through_source_or_exposed_collections()
    {
        string[] source = ["Original@example.test"];
        var recipients = EmailRecipients.Parse(source, source, source);
        source[0] = "changed@example.test";

        foreach (var addresses in new[] { recipients.To, recipients.Cc, recipients.Bcc })
        {
            addresses.Should().Equal("Original@example.test");
            var mutate = () => ((IList<string>)addresses)[0] = "changed@example.test";
            mutate.Should().Throw<NotSupportedException>();
        }
    }

    [Fact]
    public void Missing_optional_lists_become_empty_collections()
    {
        var recipients = EmailRecipients.Parse(["person@example.test"], cc: null, bcc: null);

        recipients.Cc.Should().BeEmpty();
        recipients.Bcc.Should().BeEmpty();
    }

    [Fact]
    public void Json_cannot_bypass_domain_factories()
    {
        var parseRecipients = () => JsonSerializer.Deserialize<EmailRecipients>("{\"To\":[]}");
        var parseMessage = () => JsonSerializer.Deserialize<EmailMessage>("{\"Subject\":null}");

        parseRecipients.Should().Throw<NotSupportedException>();
        parseMessage.Should().Throw<NotSupportedException>();
    }

    [Theory]
    [InlineData(null, "Body")]
    [InlineData(" ", "Body")]
    [InlineData("Subject", null)]
    [InlineData("Subject", "")]
    public void Message_factory_rejects_missing_required_content(string? subject, string? textBody)
    {
        var create = () => EmailMessage.Create(EmailRecipients.Parse(["person@example.test"]), subject!, textBody!);

        create.Should().Throw<ValidationException>();
    }

    [Fact]
    public void Message_factory_preserves_content_and_normalizes_absent_html()
    {
        var recipients = EmailRecipients.Parse(["person@example.test"]);
        var message = EmailMessage.Create(recipients, "Subject", "Body");

        message.Recipients.Should().BeSameAs(recipients);
        message.Subject.Should().Be("Subject");
        message.TextBody.Should().Be("Body");
        message.HtmlBody.Should().BeEmpty();
    }
}
