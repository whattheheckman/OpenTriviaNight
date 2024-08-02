namespace OpenTriviaNight.Api.Tests;

public class IdGeneratorUnitTests
{
    [Fact]
    public void Generate100IdsAndEnsureUnique()
    {
        var generated = new List<string>();
        for (var i = 0; i < 100; i++)
        {
            generated.Add(IdGenerator.GenerateGameId());
        }

        Assert.All(generated, x => Assert.Equal(6, x.Length));
        Assert.Equal(100, generated.Distinct().Count());
    }
}