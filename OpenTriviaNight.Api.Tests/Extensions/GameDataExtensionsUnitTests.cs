namespace OpenTriviaNight.Api.Tests;

public class GameDataExtensionsUnitTests
{
    [Fact]
    public async Task VerifyThreadSafeAccessThroughExecuteAsync()
    {
        var game = CreateGame();

        // Spawn 50 tasks to increment the current round. If this is thread safe, they should never conflict
        var tasks = Enumerable
            .Range(0, 50)
            .Select(x => Task.Run(() => game.ExecuteAsync(x => x.CurrentRound++)));

        await Task.WhenAll(tasks);

        Assert.Equal(50, game.CurrentRound);
    }

    [Fact]
    public void VerifyGetQuestionWhenExists()
    {
        var game = CreateGame();
        var expectedQuestionId = game.Rounds.First().First().Value.First().QuestionId;

        var result = game.GetQuestion(expectedQuestionId);

        Assert.NotNull(result);
        Assert.Equal(expectedQuestionId, result.QuestionId);
    }

    [Fact]
    public void VerifyGetQuestionThrowsWhenNotExists()
    {
        var game = CreateGame();

        Assert.Throws<InvalidOperationException>(() => game.GetQuestion(Guid.NewGuid()));
    }

    [Fact]
    public void VerifyAssertValidState()
    {
        var game = CreateGame();
        game.State = new GameState.PickAQuestion();

        Assert.NotNull(game.AssertValidState<GameState.PickAQuestion>());
        Assert.Throws<InvalidOperationException>(game.AssertValidState<GameState.WaitingForAnswer>);

        game.AssertValidState(GameStateEnum.PickAQuestion);
        game.AssertValidState(GameStateEnum.PickAQuestion, GameStateEnum.CheckAnswer);
        Assert.Throws<InvalidOperationException>(
            () => game.AssertValidState(GameStateEnum.WaitingForAnswer)
        );
        Assert.Throws<InvalidOperationException>(
            () => game.AssertValidState(GameStateEnum.WaitingForAnswer, GameStateEnum.CheckAnswer)
        );
    }

    private static GameData CreateGame() =>
        new()
        {
            Id = "1",
            CurrentRound = 0,
            Players = [],
            State = new GameState.WaitingToStart(),
            Rounds =
            [
                new()
                {
                    ["Category 1"] =
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
        };
}
