namespace Server.Examples.Notifications;

public static class NotificationExampleServiceCollectionExtensions
{
    public static IServiceCollection AddNotificationExamples(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<SampleNotificationOptions>()
            .Bind(configuration.GetSection(SampleNotificationOptions.SectionName))
            .Validate(options => options.TryParseBaseUrl(out _), SampleNotificationOptions.BaseUrlError)
            .ValidateOnStart();
        services.AddScoped<ISampleNotificationService, SampleNotificationService>();
        return services;
    }
}
