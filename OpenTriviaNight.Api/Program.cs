using System.Text.Json.Serialization;
using Microsoft.AspNetCore.SignalR;
using OpenTriviaNight.Api;

var builder = WebApplication.CreateBuilder(args);

builder
    .Services
    .AddLogging(options => options.ClearProviders().AddSimpleConsole(c =>
    {
        c.IncludeScopes = true;
        c.SingleLine = true;
        c.UseUtcTimestamp = true;
        c.TimestampFormat = "yyyy-MM-dd'T'HH:mm:ss.fff'Z' ";
    }))
    .AddEndpointsApiExplorer()
    .AddSwaggerGen()
    .ConfigureHttpJsonOptions(options =>
        options.SerializerOptions.Converters.Add(new JsonStringEnumConverter())
    );

builder
    .Services.AddAutoMapper(typeof(AutoMapperProfiles))
    .AddSingleton<GameManager>()
    .AddSingleton<HubResponseFilter>()
    .AddSignalR(options =>
    {
        options.AddFilter<HubResponseFilter>();
        options.EnableDetailedErrors = true;
    })
    .AddJsonProtocol(opt =>
    {
        opt.PayloadSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        opt.PayloadSerializerOptions.NumberHandling = JsonNumberHandling.AllowReadingFromString;
    });

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapHub<GameHub>("/api/stream").WithOpenApi();

app.Run();
