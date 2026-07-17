using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace StockSync.Middleware;

/// <summary>
/// Converts unhandled application exceptions into consistent
/// RFC 7807 ProblemDetails responses.
/// </summary>
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    /// <summary>
    /// Initialises the global exception-handling middleware.
    /// </summary>
    public ExceptionMiddleware(
        RequestDelegate next,
        ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    /// <summary>
    /// Executes the next middleware component and converts
    /// supported exceptions into structured API responses.
    /// </summary>
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (DbUpdateConcurrencyException exception)
        {
            // Concurrency conflicts are recoverable client-retry cases.
            _logger.LogWarning(
                exception,
                "A database concurrency conflict occurred.");

            await WriteProblemDetailsAsync(
                context,
                HttpStatusCode.Conflict,
                "Inventory concurrency conflict",
                "The stock record was modified by another request. " +
                "Refresh the data and try again.");
        }
        catch (KeyNotFoundException exception)
        {
            _logger.LogWarning(
                exception,
                "A requested resource was not found.");

            await WriteProblemDetailsAsync(
                context,
                HttpStatusCode.NotFound,
                "Resource not found",
                exception.Message);
        }
        catch (InvalidOperationException exception)
        {
            _logger.LogWarning(
                exception,
                "A business-rule conflict occurred.");

            await WriteProblemDetailsAsync(
                context,
                HttpStatusCode.Conflict,
                "Business rule conflict",
                exception.Message);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "An unhandled exception occurred.");

            await WriteProblemDetailsAsync(
                context,
                HttpStatusCode.InternalServerError,
                "Internal server error",
                "An unexpected error occurred.");
        }
    }

    /// <summary>
    /// Writes a ProblemDetails response using the supplied
    /// status, title and explanatory detail.
    /// </summary>
    private static async Task WriteProblemDetailsAsync(
        HttpContext context,
        HttpStatusCode statusCode,
        string title,
        string detail)
    {
        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType =
            "application/problem+json";

        var problem = new ProblemDetails
        {
            Status = (int)statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path
        };

        problem.Extensions["traceId"] =
            context.TraceIdentifier;

        await context.Response.WriteAsJsonAsync(problem);
    }
}