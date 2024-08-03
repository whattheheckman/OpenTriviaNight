using System.Text.Json.Serialization;
using OpenTriviaNight.Api;

var builder = WebApplication.CreateBuilder(args);

builder
    .Services.AddLogging(options => options.ClearProviders().AddSimpleConsole())
    .AddEndpointsApiExplorer()
    .AddSwaggerGen()
    .ConfigureHttpJsonOptions(options =>
        options.SerializerOptions.Converters.Add(new JsonStringEnumConverter())
    );

builder
    .Services.AddAutoMapper(typeof(AutoMapperProfiles))
    .AddSingleton<GameManager>()
    // .AddSingleton<HubResponseFilter>()
    .AddSignalR(options =>
    {
        // options.AddFilter<HubResponseFilter>();
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
