using Microsoft.EntityFrameworkCore;
using ResumeRanker.Api.Data;
using ResumeRanker.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Controller & JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

builder.Services.AddOpenApi();

// 2. CORS Policy for React Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// 3. MySQL EF Core Configuration
var defaultConn = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=localhost;Port=3306;Database=resumeranker_db;User=root;Password=root;TreatTinyAsBoolean=true;";

builder.Services.AddDbContext<ResumeRankingDbContext>(options =>
{
    options.UseMySql(defaultConn, new MySqlServerVersion(new Version(8, 0, 36)), mySqlOptions =>
    {
        mySqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorNumbersToAdd: null);
    });
});

// 4. Register Services
builder.Services.AddSingleton<KeyPoolManager>();
builder.Services.AddHttpClient<IGeminiAiService, GeminiAiService>();
builder.Services.AddScoped<IDocumentParserService, DocumentParserService>();
builder.Services.AddScoped<IAuthService, AuthService>();

var app = builder.Build();

// 5. Initialize MySQL Database Schema & Key Pool
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var db = scope.ServiceProvider.GetRequiredService<ResumeRankingDbContext>();

    try
    {
        logger.LogInformation("[Database] Checking MySQL connectivity and schema...");
        db.Database.EnsureCreated();
        logger.LogInformation("[Database] MySQL database and tables successfully initialized!");
    }
    catch (Exception ex)
    {
        logger.LogWarning("[Database] Could not auto-initialize MySQL ({Message}). Please verify connection string in appsettings.json.", ex.Message);
    }

    try
    {
        var keyPool = scope.ServiceProvider.GetRequiredService<KeyPoolManager>();
        await keyPool.InitializeAsync();
        logger.LogInformation("[KeyPool] Gemini Multi-Key Pool ready.");
    }
    catch (Exception ex)
    {
        logger.LogWarning("[KeyPool] KeyPool initialization note: {Message}", ex.Message);
    }
}

// 6. Request Pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

Console.WriteLine("==========================================================");
Console.WriteLine("[ResumeRanker .NET API] Running on http://localhost:5000");
Console.WriteLine("[ResumeRanker .NET API] Database: MySQL (Entity Framework Core)");
Console.WriteLine("==========================================================");

app.Run();
