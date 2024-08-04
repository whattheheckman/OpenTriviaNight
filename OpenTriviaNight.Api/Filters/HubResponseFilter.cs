using Microsoft.AspNetCore.SignalR;

namespace OpenTriviaNight.Api;

public sealed class HubResponseFilter(ILogger<HubResponseFilter> logger) : IHubFilter
{
    private readonly Func<ILogger, string, IDisposable?> gameIdScope =
        LoggerMessage.DefineScope<string>("GameId:{GameId}");
    private readonly Func<ILogger, string, IDisposable?> usernameScope =
        LoggerMessage.DefineScope<string>("Username:{Username}");

    public async ValueTask<object?> InvokeMethodAsync(
        HubInvocationContext invocationContext,
        Func<HubInvocationContext, ValueTask<object?>> next
    )
    {
        try
        {
            var gameId = invocationContext.Context.Items["GameId"]?.ToString() ?? string.Empty;
            var username = invocationContext.Context.Items["Username"]?.ToString() ?? string.Empty;
            using var _ = gameIdScope(logger, gameId);
            using var _a = usernameScope(logger, username);

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
