using Microsoft.AspNetCore.SignalR;
using OpenTriviaNight.Api;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddEndpointsApiExplorer()
    .AddSwaggerGen();

builder.Services
    .AddSingleton<GameManager>()
    .AddSingleton<HubResponseFilter>()
    .AddSignalR(options => options.AddFilter<HubResponseFilter>());

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app
    .MapHub<GameHub>("/api/stream")
    .WithOpenApi();

app.Run();
