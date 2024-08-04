using Microsoft.AspNetCore.SignalR;

namespace OpenTriviaNight.Api;

public sealed class HubResponseFilter(ILogger<HubResponseFilter> logger) : IHubFilter
{
    private readonly Func<ILogger, string, string, IDisposable?> gameScope =
        LoggerMessage.DefineScope<string, string>("[GameId={GameId},Username={Username}]");

    public async ValueTask<object?> InvokeMethodAsync(
        HubInvocationContext invocationContext,
        Func<HubInvocationContext, ValueTask<object?>> next
    )
    {
        try
        {
            var gameId = invocationContext.Context.Items["GameId"]?.ToString() ?? string.Empty;
            var username = invocationContext.Context.Items["Username"]?.ToString() ?? string.Empty;
            using var scope = gameScope(logger, gameId, username);

            logger.LogInformation(
                "Calling hub method '{HubMethodName}'",
                invocationContext.HubMethodName
            );
            var result = await next(invocationContext);
            return new ResponseWrapper<object>() { Response = result };
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Exception raised when calling '{HubMethodName}'",
                invocationContext.HubMethodName
            );
            return new ResponseWrapper<object>()
            {
                Error = new() { Type = ex.GetType().Name, Message = ex.Message, }
            };
        }
    }
}
