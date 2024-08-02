namespace OpenTriviaNight.Api;

/// <summary>
/// Contains the information that should be provided to create a new game.
/// </summary>
public record GameCreateDto
{
    /// <summary>
    /// The username of the user who is creating the game. 
    /// They will be added as a <see cref="Player"/>.
    /// </summary>
    public required string Username { get; set; }

    /// <summary>
    /// All the questions involved in this game, grouped by Round Number (0-indexed).
    /// </summary>
    public List<List<Question>> Rounds { get; init; } = [];
}