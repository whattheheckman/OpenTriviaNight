using Microsoft.AspNetCore.SignalR;

namespace OpenTriviaNight.Api;

public sealed class GameHub(GameManager manager) : Hub
{
    public async Task<GameData> CreateGame(GameData gameData)
    {
        manager.CreateGame(gameData);
        await Groups.AddToGroupAsync(Context.ConnectionId, gameData.Id);
    }
}