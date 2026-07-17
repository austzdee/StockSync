namespace StockSync.DTOs;

/// <summary>
/// Represents a successful refresh-token rotation response.
/// </summary>
public class RefreshTokenResponseDto
{
    /// <summary>
    /// Human-readable refresh result.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Newly issued JWT access token.
    /// </summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// Newly rotated refresh token.
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;
}