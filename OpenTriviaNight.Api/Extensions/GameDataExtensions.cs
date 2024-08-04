namespace OpenTriviaNight.Api;

public static class GameDataExtensions
{
    public static async Task ExecuteAsync(this GameData game, Func<GameData, Task> action)
    {
        await game.Semaphore.WaitAsync();
        try
        {
            await action(game);
            game.LastModified = DateTimeOffset.UtcNow;
        }
        finally
        {
            game.Semaphore.Release();
        }
    }

    public static Question GetQuestion(this GameData game, Guid questionId)
    {
        return game.Rounds[game.CurrentRound]
                .Values.SelectMany(x => x)
                .FirstOrDefault(x => x.QuestionId == questionId)
            ?? throw new InvalidOperationException("Question {questionId} not found");
    }

    public static T AssertValidState<T>(this GameData game, string? errorMessage = null)
        where T : GameState
    {
        if (game.State is T casted)
        {
            return casted;
        }
        throw new InvalidOperationException(
            errorMessage ?? $"Game is in an invalid state for this operation {game.State.State}"
        );
    }

    public static void AssertValidState(this GameData game, params GameStateEnum[] expected)
    {
        if (!expected.Contains(game.State.State))
        {
            throw new InvalidOperationException(
                $"Game is in an invalid state for this operation {game.State.State}"
            );
        }
    }
}
