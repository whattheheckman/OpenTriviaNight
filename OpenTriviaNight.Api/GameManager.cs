using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;

namespace OpenTriviaNight.Api;

public sealed class GameManager
{
    private readonly ConcurrentDictionary<string, GameData> _games = new();

    private readonly IHubContext<GameHub> gameHub;
    private readonly ILogger<GameManager> logger;

    public GameManager(IHubContext<GameHub> gameHub, ILogger<GameManager> logger)
    {
        this.gameHub = gameHub;
        this.logger = logger;

        var timer = new Timer((_) => CleanupOldGames(), null, 60000, 60000);
    }

    public void CreateGame(GameData gameData)
    {
        if (gameData.Rounds.Count == 0)
            throw new InvalidOperationException("Game must contain at least 1 round.");
        if (gameData.Rounds.Any(x => x.Count == 0))
            throw new InvalidOperationException("All rounds must contain at least 1 category.");
        if (gameData.Rounds.Any(x => !x.Values.SelectMany(x => x).Any()))
            throw new InvalidOperationException("All categories must contain at least 1 question.");

        gameData.LastModified = DateTimeOffset.UtcNow;

        if (!_games.TryAdd(gameData.Id, gameData))
        {
            throw new InvalidOperationException($"Game with ID {gameData.Id} already exists.");
        }
        logger.LogInformation("Created game with ID {Id}", gameData.Id);
    }

    public GameData JoinGame(string gameId, string username, PlayerRole role)
    {
        var game = GetGame(gameId);
        var existingPlayer = game.Players.FirstOrDefault(x => x.Username == username);
        if (existingPlayer is null)
        {
            // Only spectators are allowed to join after the game starts
            if (role is not PlayerRole.Spectator && game.State is not GameState.WaitingToStart)
            {
                throw new InvalidOperationException(
                    "Contestants cannot join a game already in progress. If you are trying to rejoin a game, make sure you use the same username (case sensitive)."
                );
            }
            game.Players.Add(
                new Player
                {
                    Username = username,
                    Role = role,
                    Score = 0
                }
            );

            game.LastModified = DateTimeOffset.UtcNow;

            logger.LogInformation("{Username} joined game {GameId}", username, gameId);
        }
        else
        {
            logger.LogInformation("{Username} is rejoining a game {GameId}", username, gameId);
        }

        return game;
    }

    public async Task<GameData> LeaveGame(string gameId, string username)
    {
        var game = GetGame(gameId);
        await game.ExecuteAsync(x =>
        {
            x.Players.RemoveAll(x => x.Username == username);
            return Task.CompletedTask;
        });
        return game;
    }

    public async Task<GameData> StartGameAsync(string gameId, string username)
    {
        var game = GetGame(gameId);
        var player = GetPlayer(game, username);
        if (player.Role == PlayerRole.Host)
        {
            await game.ExecuteAsync(x =>
            {
                x.AssertValidState(GameStateEnum.WaitingToStart);
                x.State = new GameState.PickAQuestion();
                return Task.CompletedTask;
            });
        }

        return game;
    }

    public async Task<GameData> PickQuestion(string gameId, Guid questionId)
    {
        var game = GetGame(gameId);
        await game.ExecuteAsync(async x =>
        {
            x.AssertValidState(GameStateEnum.PickAQuestion);
            var question = x.GetQuestion(questionId);
            if (question.Answered)
            {
                // A client must have a stale state for this question, so ensure that they know it's been answered
                await UpdateQuestionToAllPlayers(gameId, question);
                throw new InvalidOperationException(
                    $"Question {questionId} has already been answered"
                );
            }
            x.State = new GameState.ReadQuestion { Question = question };
        });

        return game;
    }

    public async Task<GameData> AllowAnswering(string gameId)
    {
        var game = GetGame(gameId);
        await game.ExecuteAsync(x =>
        {
            var currentState = x.AssertValidState<GameState.ReadQuestion>();
            x.State = new GameState.WaitingForAnswer { Question = currentState.Question };
            return Task.CompletedTask;
        });

        return game;
    }

    public async Task<GameData> AnswerQuestion(string gameId, string username)
    {
        var game = GetGame(gameId);
        var player = GetPlayer(game, username);
        await game.ExecuteAsync(x =>
        {
            var currentState = x.AssertValidState<GameState.WaitingForAnswer>();
            x.State = new GameState.CheckAnswer
            {
                Question = currentState.Question,
                Player = player
            };
            return Task.CompletedTask;
        });

        return game;
    }

    /// <summary>
    /// If the answer is correct, state moves to <see cref="GameStateEnum.PickAQuestion"/> to allow a new question to be picked.
    /// If the answer is not correct, the state moves back to <see cref="GameStateEnum.WaitingForAnswer"/> to allow other players to answer.
    /// </summary>
    /// <param name="gameId">The <see cref="GameData.Id"/>.</param>
    /// <param name="isCorrect">Whether or not the answer provided was correct.</param>
    /// <returns>The <see cref="GameData"/>.</returns>
    public async Task<GameData> ConfirmAnswer(string gameId, bool isCorrect)
    {
        var game = GetGame(gameId);
        await game.ExecuteAsync(async x =>
        {
            var currentState = x.AssertValidState<GameState.CheckAnswer>();
            if (isCorrect)
            {
                currentState.Question.Answered = true;
                // TODO: Handle the round end where all questions in the current round have been answered.
                currentState.Player.Score += currentState.Question.Value;
                x.State = new GameState.PickAQuestion();

                await UpdateQuestionToAllPlayers(gameId, currentState.Question);
            }
            else
            {
                currentState.Player.Score -= currentState.Question.Value;
                x.State = new GameState.WaitingForAnswer { Question = currentState.Question };
            }
        });

        return game;
    }

    /// <summary>
    /// Ends this question without an answer, usually when the question timer runs out.
    /// </summary>
    /// <param name="gameId">The <see cref="GameData.Id"/>.</param>
    /// <returns>The <see cref="GameData"/>.</returns>
    public async Task<GameData> EndQuestion(string gameId)
    {
        var game = GetGame(gameId);
        await game.ExecuteAsync(async x =>
        {
            var currentState = x.AssertValidState<GameState.WaitingForAnswer>();
            currentState.Question.Answered = true;
            x.State = new GameState.PickAQuestion();
            UpdateRoundIFApplicable(x);
            await UpdateQuestionToAllPlayers(gameId, currentState.Question);
        });

        return game;
    }

    private static void UpdateRoundIFApplicable(GameData game)
    {
        if (game.Rounds[game.CurrentRound].Values.SelectMany(x => x).All(x => x.Answered))
        {
            // All questions inside the round have been answered.
            // Move to the next round if applicable, or end
            if (game.Rounds.Count > game.CurrentRound + 1)
            {
                game.CurrentRound++;
            }
            else
            {
                game.State = new GameState.Finished();
            }
        }
    }

    private GameData GetGame(string gameId)
    {
        if (_games.TryGetValue(gameId, out var game))
        {
            return game;
        }
        else
        {
            throw new InvalidOperationException($"Game {gameId} could not be found.");
        }
    }

    private Player GetPlayer(GameData game, string username)
    {
        var player =
            game.Players.FirstOrDefault(x => x.Username == username)
            ?? throw new InvalidOperationException(
                $"Player {username} could not be found in game {game.Id}."
            );
        return player;
    }

    private async Task UpdateQuestionToAllPlayers(string gameId, Question question) =>
        await gameHub.Clients.Group(gameId).SendAsync("question-update", question);

    /// <summary>
    /// Cleans up games that haven't been played in the last 30 minutes.
    /// </summary>
    private void CleanupOldGames()
    {
        var gamesToRemove = _games
            .Where(x => DateTimeOffset.UtcNow - x.Value.LastModified > TimeSpan.FromMinutes(30))
            .ToList();
        foreach (var game in gamesToRemove)
        {
            if (_games.TryRemove(game))
            {
                logger.LogInformation(
                    "Removed game {GameId} which was last modified on {LastModified} due to inactivity",
                    game.Value.Id,
                    game.Value.LastModified
                );
            }
        }
    }
}
