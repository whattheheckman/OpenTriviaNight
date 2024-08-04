namespace OpenTriviaNight.Api;

/// <summary>
/// A shrunken DTO containing just enough data to update clients.
/// </summary>
public record GameUpdateDto
{
    /// <summary>
    /// A short generated ID for the game.
    /// </summary>
    public required string Id { get; init; }

    public required int CurrentRound { get; set; } = 0;

    /// <summary>
    /// The <see cref="Player.Username"/> of the last player to win. 
    /// This is usually used to highlight who should be choosing the next question.
    /// </summary>
    public string? LastWinner { get; init; }

    /// <summary>
    /// The list of players inside this game.
    /// </summary>
    public required List<Player> Players { get; init; } = [];

    /// <summary>
    /// The current state of the game.
    /// </summary>
    public required GameState State { get; set; } = new GameState.WaitingToStart();
}