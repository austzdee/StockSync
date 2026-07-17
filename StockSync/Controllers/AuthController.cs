using Microsoft.AspNetCore.Mvc;
using StockSync.DTOs;
using StockSync.Interfaces;

namespace StockSync.Controllers;

/// <summary>
/// Exposes registration, login, token refresh,
/// and logout endpoints.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    /// <summary>
    /// Initializes the authentication controller.
    /// </summary>
    /// <param name="authService">
    /// Service responsible for authentication workflows.
    /// </param>
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Registers a new StockSync application user.
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        try
        {
            var result = await _authService.RegisterAsync(dto);

            return Ok(result);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new
            {
                message = exception.Message
            });
        }
    }

    /// <summary>
    /// Authenticates a user and returns an access token,
    /// refresh token, and user details.
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);

        if (result is null)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        return Ok(result);
    }

    /// <summary>
    /// Rotates a valid refresh token and issues
    /// a new access-token and refresh-token pair.
    /// </summary>
    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken(RefreshTokenDto dto)
    {
        var result = await _authService.RefreshTokenAsync(dto);

        if (result is null)
        {
            return Unauthorized(new
            {
                message = "Invalid or expired refresh token."
            });
        }

        return Ok(result);
    }

    /// <summary>
    /// Invalidates an active refresh token.
    /// </summary>
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(RefreshTokenDto dto)
    {
        var loggedOut = await _authService.LogoutAsync(dto);

        if (!loggedOut)
        {
            return Unauthorized(new
            {
                message = "Invalid refresh token."
            });
        }

        return Ok(new
        {
            message = "Logout successful."
        });
    }
}