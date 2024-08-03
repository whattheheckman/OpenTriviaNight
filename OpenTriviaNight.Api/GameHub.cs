using AutoMapper;
using Microsoft.AspNetCore.SignalR;

namespace OpenTriviaNight.Api;

public sealed class GameHub(GameManager manager, IMapper mapper, ILogger<GameHub> logger) : Hub
{
    private const string GameId = "GameId";
    private const string Username = "Username";

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        if (Context.Items.TryGetValue(GameId, out var gameId) && Context.Items.TryGetValue(Username, out var username))
        {
            logger.LogWarning("Client {Username} disconnected from game {GameId}", username, gameId);
        }

        return base.OnDisconnectedAsync(exception);
    }

    public async Task<GameData> CreateGame(GameCreateDto createRequest)
    {
        var gameData = new GameData
        {
            Id = IdGenerator.GenerateGameId(),
            Rounds = createRequest.Rounds,
            Players = [new Player { Role = PlayerRole.Host, Score = 0, Username = createRequest.Username }],
            State = new GameState.WaitingToStart(),
            CurrentRound = 0,
        };

        // TODO: Need to validate questions etc are set correctly

        manager.CreateGame(gameData);
        await Groups.AddToGroupAsync(Context.ConnectionId, gameData.Id);

        SetContext(gameData.Id, createRequest.Username);

        return gameData;
    }

    public async Task<GameData> JoinGame(string gameId, string username, PlayerRole role)
    {
        var gameData = manager.JoinGame(gameId, username, role);
        await UpdateAllPlayers(gameData);

        await Groups.AddToGroupAsync(Context.ConnectionId, gameId);

        SetContext(gameData.Id, username);

        return gameData;
    }

    public async Task StartGame()
    {
        var gameId = Context.Items[GameId]!.ToString()!;
        var username = Context.Items[Username]!.ToString()!;
        var gameData = await manager.StartGameAsync(gameId, username);
        await UpdateAllPlayers(gameData);
    }

    public async Task PickQuestion(Guid questionId)
    {
        var gameId = Context.Items[GameId]!.ToString()!;
        var gameData = await manager.PickQuestion(gameId, questionId);
        await UpdateAllPlayers(gameData);
    }

    public async Task AllowAnswering()
    {
        var gameId = Context.Items[GameId]!.ToString()!;
        var gameData = await manager.AllowAnswering(gameId);
        await UpdateAllPlayers(gameData);
    }

    public async Task AnswerQuestion()
    {
        var gameId = Context.Items[GameId]!.ToString()!;
        var username = Context.Items[Username]!.ToString()!;
        var gameData = await manager.AnswerQuestion(gameId, username);
        await UpdateAllPlayers(gameData);
    }

    public async Task ConfirmAnswer(bool isCorrect)
    {
        var gameId = Context.Items[GameId]!.ToString()!;
        var gameData = await manager.ConfirmAnswer(gameId, isCorrect);
        await UpdateAllPlayers(gameData);
    }

    public async Task EndQuestion()
    {
        var gameId = Context.Items[GameId]!.ToString()!;
        var gameData = await manager.EndQuestion(gameId);
        await UpdateAllPlayers(gameData);
    }

    private async Task UpdateAllPlayers(GameData gameData)
    {
        var dto = mapper.Map<GameUpdateDto>(gameData);
        await Clients.Group(gameData.Id).SendAsync("game-update", dto);
    }

    private void SetContext(string gameId, string username)
    {
        if (Context.Items.ContainsKey(GameId))
        {
            Context.Items[GameId] = gameId;
        }
        else
        {
            Context.Items.TryAdd(GameId, gameId);
        }

        if (Context.Items.ContainsKey(Username))
        {
            Context.Items[Username] = username;
        }
        else
        {
            Context.Items.TryAdd(Username, username);
        }
    }
}