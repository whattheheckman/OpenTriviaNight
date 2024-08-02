using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;

namespace OpenTriviaNight.Api;

public sealed class GameManager(IHubContext<GameHub> gameHub)
{
    private readonly ConcurrentDictionary<string, GameData> _games = new();

    public void CreateGame(GameData gameData)
    {
        if (!_games.TryAdd(gameData.Id, gameData))
        {
            throw new InvalidOperationException($"Game with ID {gameData.Id} already exists.");
        }
    }
}