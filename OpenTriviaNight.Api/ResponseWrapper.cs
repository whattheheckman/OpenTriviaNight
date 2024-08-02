namespace OpenTriviaNight.Api;

public sealed record ResponseWrapper<T>
{
    public T? Response { get; set; }
    public ErrorDetail? Error { get; set; }

    public sealed record ErrorDetail
    {
        public required string Type { get; set; }
        public required string Message { get; set; }
    }
}