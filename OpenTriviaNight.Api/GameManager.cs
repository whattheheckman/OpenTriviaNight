using System.Collections.Concurrent;

namespace OpenTriviaNight.Api;

public sealed class GameManager(ILogger<GameManager> logger)
{
    private readonly ConcurrentDictionary<string, GameData> _games = new();

    public void CreateGame(GameData gameData)
    {
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
            if (game.State is not GameState.WaitingToStart)
            {
                throw new InvalidOperationException(
                    "Players cannot join a game already in progress. If you are trying to rejoin a game, make sure you use the same username (case sensitive)."
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

            logger.LogInformation("{Username} joined game {GameId}", username, gameId);
        }
        else
        {
            logger.LogInformation("{Username} is rejoining a game {GameId}", username, gameId);
        }

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
                game.AssertValidState(GameStateEnum.WaitingToStart);
                x.State = new GameState.PickAQuestion();
            });
        }

        return game;
    }

    public async Task<GameData> PickQuestion(string gameId, Guid questionId)
    {
        var game = GetGame(gameId);
        await game.ExecuteAsync(x =>
        {
            game.AssertValidState(GameStateEnum.PickAQuestion);
            var question = game.GetQuestion(questionId);
            if (question.Answered)
            {
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
            var currentState = game.AssertValidState<GameState.ReadQuestion>();
            x.State = new GameState.WaitingForAnswer { Question = currentState.Question };
        });

        return game;
    }

    public async Task<GameData> AnswerQuestion(string gameId, string username)
    {
        var game = GetGame(gameId);
        var player = GetPlayer(game, username);
        await game.ExecuteAsync(x =>
        {
            var currentState = game.AssertValidState<GameState.WaitingForAnswer>();
            x.State = new GameState.CheckAnswer
            {
                Question = currentState.Question,
                Player = player
            };
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
        await game.ExecuteAsync(x =>
        {
            var currentState = game.AssertValidState<GameState.CheckAnswer>();
            if (isCorrect)
            {
                currentState.Question.Answered = true;
                // TODO: Handle the round end where all questions in the current round have been answered.
                currentState.Player.Score += currentState.Question.Value;
                x.State = new GameState.PickAQuestion();
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
        await game.ExecuteAsync(x =>
        {
            var currentState = game.AssertValidState<GameState.WaitingForAnswer>();
            currentState.Question.Answered = true;
            x.State = new GameState.PickAQuestion();
        });

        return game;
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
}
