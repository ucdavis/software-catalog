using Microsoft.Extensions.Options;

namespace Server.Examples.Notifications;

public sealed class SampleNotificationOptions
{
    public const string SectionName = "Notification";
    internal const string BaseUrlError = "Notification:BaseUrl must be an absolute HTTP(S) URL without embedded credentials.";

    public string BaseUrl { get; init; } = string.Empty;
    public string DefaultAppName { get; init; } = string.Empty;
    public string DefaultButtonText { get; init; } = "Open the application";

    internal bool TryParseBaseUrl(out Uri? uri)
    {
        uri = null;
        if (string.IsNullOrWhiteSpace(BaseUrl))
        {
            return true;
        }

        return Uri.TryCreate(BaseUrl, UriKind.Absolute, out uri) &&
               (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps) &&
               !string.IsNullOrEmpty(uri.Host) && string.IsNullOrEmpty(uri.UserInfo);
    }

    internal Uri? ParseBaseUrl()
    {
        if (!TryParseBaseUrl(out var uri))
        {
            throw new OptionsValidationException(Options.DefaultName, typeof(SampleNotificationOptions), [BaseUrlError]);
        }

        return uri;
    }
}
