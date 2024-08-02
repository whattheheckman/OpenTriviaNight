namespace OpenTriviaNight.Api;

public static class GameDataExtensions
{
    public static async Task ExecuteAsync(this GameData game, Action<GameData> action)
    {
        await game.Semaphore.WaitAsync();
        try
        {
            action(game);
        }
        finally
        {
            game.Semaphore.Release();
        }
    }

    public static Question GetQuestion(this GameData game, Guid questionId)
    {
        return game.Rounds[game.CurrentRound].FirstOrDefault(x => x.QuestionId == questionId)
            ?? throw new InvalidOperationException("Question {questionId} not found");
    }

    public static T AssertValidState<T>(this GameData game) where T : GameState
    {
        if (game.State is T casted)
        {
            return casted;
        }
        throw new InvalidOperationException($"Game is in an invalid state for this operation {game.State.State}");
    }

    public static void AssertValidState(this GameData game, params GameStateEnum[] expected)
    {
        if (!expected.Contains(game.State.State))
        {
            throw new InvalidOperationException($"Game is in an invalid state for this operation {game.State.State}");
        }
    }
}