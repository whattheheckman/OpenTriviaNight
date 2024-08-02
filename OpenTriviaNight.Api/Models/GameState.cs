using System.Text.Json.Serialization;

namespace OpenTriviaNight.Api;

public enum GameStateEnum
{
    WaitingToStart,
    PickAQuestion,
    ReadQuestion,
    WaitingForAnswer,
    CheckAnswer,
    Finished
}

/// <summary>
/// The abstract base state of the game. 
/// Actual game states are repesented as derived types which may contain extra data.
/// </summary>
[JsonDerivedType(typeof(WaitingToStart), nameof(State))]
public abstract record GameState
{
    /// <summary>
    /// The current state of the game. Used as a type discriminator
    /// </summary>
    public abstract GameStateEnum State { get; }

    public sealed record WaitingToStart : GameState
    {
        public override GameStateEnum State => GameStateEnum.WaitingToStart;
    }

    public sealed record PickAQuestion : GameState
    {
        public override GameStateEnum State => GameStateEnum.PickAQuestion;
    }

    public sealed record ReadQuestion : GameState
    {
        public override GameStateEnum State => GameStateEnum.ReadQuestion;

        /// <summary>
        /// The <see cref="Question"/> that has been picked and should be read out.
        /// </summary>
        public required Question Question { get; init; }
    }

    public sealed record WaitingForAnswer : GameState
    {
        public override GameStateEnum State => GameStateEnum.WaitingForAnswer;

        /// <summary>
        /// The <see cref="Question"/> that has been asked and is waiting to be answered.
        /// </summary>
        public required Question Question { get; init; }

    }

    public sealed record CheckAnswer : GameState
    {
        public override GameStateEnum State => GameStateEnum.CheckAnswer;

        /// <summary>
        /// The <see cref="Question"/> that has been answered by the <see cref="Player"/> and is being checked by the host.
        /// </summary>
        public required Question Question { get; init; }

        /// <summary>
        /// The player who "buzzed in" to answer this question
        /// </summary>
        public required Player Player { get; init; }
    }

    public sealed record Finished : GameState
    {
        public override GameStateEnum State => GameStateEnum.Finished;
    }
}