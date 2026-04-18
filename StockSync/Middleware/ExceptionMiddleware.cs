using System.Net;
using System.Text.Json;

namespace StockSync.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    // Constructor receives next middleware and logger
    public ExceptionMiddleware(
        RequestDelegate next,
        ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    // Runs for every request
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            // Continue request pipeline
            await _next(context);
        }
        catch (Exception ex)
        {
            // Log unexpected error
            _logger.LogError(ex, "Unhandled exception occurred.");

            // Return clean JSON response
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var response = new
            {
                message = "An unexpected error occurred.",
                statusCode = 500
            };

            // Convert object to JSON
            var json = JsonSerializer.Serialize(response);

            // Write JSON to response body
            await context.Response.WriteAsync(json);
        }
    }
}