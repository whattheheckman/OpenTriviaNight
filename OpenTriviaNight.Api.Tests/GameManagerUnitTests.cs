using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace OpenTriviaNight.Api.Tests;

public sealed class GameManagerUnitTests
{
    private const string InitialUser = "User1";
    private const string NewUser = "User2";

    [Fact]
    public void TestCreateGame()
    {
        var game = CreateGame();
        var manager = new GameManager(Substitute.For<IHubContext<GameHub>>(), Substitute.For<ILogger<GameManager>>());

        manager.CreateGame(game);

        // Creating the game twice should result in an error
        Assert.Throws<InvalidOperationException>(() => manager.CreateGame(game));
    }

    [Fact]
    public void TestJoinGame()
    {
        var game = CreateGame();
        var manager = new GameManager(Substitute.For<IHubContext<GameHub>>(), Substitute.For<ILogger<GameManager>>());

        manager.CreateGame(game);

        var result = manager.JoinGame(game.Id, NewUser, PlayerRole.Contestant);

        Assert.Equal(game, result);
        Assert.Equal(2, result.Players.Count);
    }

    private static GameData CreateGame() =>
        new()
        {
            Id = "1",
            CurrentRound = 0,
            Players =
            [
                new Player
                {
                    Username = InitialUser,
                    Role = PlayerRole.Host,
                    Score = 0
                }
            ],
            State = new GameState.WaitingToStart(),
            Rounds =
            [
                [
                    new()
                    {
                        CategoryId = Guid.NewGuid(),
                        Name = "Category 1",
                        Questions =
                        [
                            new Question
                            {
                                QuestionId = Guid.NewGuid(),
                                Detail = "Some Question",
                                CorrectAnswer = "blas",
                                Value = 100
                            }
                        ]
                    }
                ]
            ]
        };
}
