using Microsoft.AspNetCore.SignalR;

namespace OpenTriviaNight.Api;

public sealed class HubResponseFilter(ILogger<HubResponseFilter> logger) : IHubFilter
{
    public async ValueTask<object?> InvokeMethodAsync(
        HubInvocationContext invocationContext,
        Func<HubInvocationContext, ValueTask<object?>> next)
    {
        logger.LogInformation("Calling hub method '{HubMethodName}'", invocationContext.HubMethodName);
        try
        {
            var result = await next(invocationContext);
            return new ResponseWrapper<object>() { Response = result };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Exception raised when calling '{HubMethodName}'", invocationContext.HubMethodName);
            return new ResponseWrapper<object>()
            {
                Error = new()
                {
                    Type = ex.GetType().Name,
                    Message = ex.Message,
                }
            };
        }
    }
}