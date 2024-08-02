using System.Security.Cryptography;

namespace OpenTriviaNight.Api;

public static class IdGenerator
{
    private static readonly char[] _validChars = Enumerable.Range('A', 26).Select(i => (char)i).ToArray();

    /// <summary>
    /// Generates a random 6 character alphanumeric ID.
    /// </summary>
    /// <returns>A 6 character alphanumeric ID</returns>
    public static string GenerateGameId()
    {
        // TODO: Make this a nice ID generator. Right now we'll just randonly generate 6 chars,
        // but this probably doesn't stand up to scutiny entropy wise.
        var generatedChars = RandomNumberGenerator.GetItems<char>(_validChars.AsSpan(), 6);
        return new string(generatedChars);
    }
}