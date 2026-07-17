namespace StockSync.DTOs;

/// <summary>
/// Represents a successful login response containing
/// access credentials and authenticated user details.
/// </summary>
public class LoginResponseDto
{
    /// <summary>
    /// Human-readable authentication result.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Short-lived JWT access token.
    /// </summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// Refresh token used to renew the access token.
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;

    /// <summary>
    /// Authenticated user details.
    /// </summary>
    public UserResponseDto User { get; set; } = new();
}