namespace OpenTriviaNight.Api;

public sealed record GameData
{
    /// <summary>
    /// A short generated ID for the game.
    /// </summary>
    public required string Id { get; init; }

    /// <summary>
    /// The list of players inside this game.
    /// </summary>
    public required List<Player> Players { get; init; } = [];

    /// <summary>
    /// The <see cref="Player.Username"/> of the last player to win. 
    /// This is usually used to highlight who should be choosing the next question.
    /// </summary>
    public string? LastWinner { get; init; }

    /// <summary>
    /// All the questions involved in this game, grouped by Round Number (0-indexed).
    /// </summary>
    public List<List<Question>> Rounds { get; init; } = [];

    public required int CurrentRound { get; set; } = 0;

    /// <summary>
    /// The current state of the game.
    /// </summary>
    public required GameState State { get; set; } = new GameState.WaitingToStart();

    /// <summary>
    /// Used for locking operations on this game. 
    /// ALL operations which will modify the game state should lock with the semaphore to ensure the game does not enter a invalid state.
    /// </summary>
    internal SemaphoreSlim Semaphore { get; } = new(1);
}

public sealed record Player
{
    public required string Username { get; init; }
    public required int Score { get; set; }
    public required PlayerRole Role { get; init; }
}

public enum PlayerRole
{
    Host,
    Contestant,
    Spectator
}

public sealed record Question
{
    /// <summary>
    /// A generated ID for this question.
    /// </summary>
    public required Guid QuestionId { get; init; } = Guid.NewGuid();

    /// <summary>
    /// The actual question text.
    /// </summary>
    public required string Detail { get; init; }

    /// <summary>
    /// The correct answer for this question.
    /// </summary>
    public required string CorrectAnswer { get; init; }

    /// <summary>
    /// The points value to be awarded to the <see cref="Player"/> who answers this question correctly.
    /// </summary>
    public required int Value { get; init; }

    /// <summary>
    /// Whether the question has already been answered or not.
    /// </summary>
    public bool Answered { get; set; } = false;
}