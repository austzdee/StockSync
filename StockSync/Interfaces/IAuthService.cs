using StockSync.DTOs;

namespace StockSync.Interfaces;

/// <summary>
/// Defines authentication operations for registration,
/// login, token renewal and logout workflows.
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Registers a new application user.
    /// </summary>
    Task<RegisterResponseDto> RegisterAsync(RegisterDto dto);

    /// <summary>
    /// Authenticates a user and returns a token pair.
    /// </summary>
    Task<LoginResponseDto?> LoginAsync(LoginDto dto);

    /// <summary>
    /// Rotates a valid refresh token.
    /// </summary>
    Task<RefreshTokenResponseDto?> RefreshTokenAsync(
        RefreshTokenDto dto);

    /// <summary>
    /// Invalidates a valid refresh token.
    /// </summary>
    Task<bool> LogoutAsync(RefreshTokenDto dto);
}