using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

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
        catch (DbUpdateConcurrencyException ex)
        {
            // Log concurrency conflict
            _logger.LogWarning(ex, "Concurrency conflict occurred.");

            // Return clean JSON conflict response
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.Conflict;

            var response = new
            {
                message = "The stock record was modified by another request. Please try again.",
                statusCode = 409
            };

            var json = JsonSerializer.Serialize(response);
            await context.Response.WriteAsync(json);
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

            var json = JsonSerializer.Serialize(response);
            await context.Response.WriteAsync(json);
        }
    }
}