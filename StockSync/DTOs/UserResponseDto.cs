namespace StockSync.DTOs;

/// <summary>
/// Represents the authenticated or newly registered user
/// returned by authentication endpoints.
/// </summary>
public class UserResponseDto
{
    /// <summary>
    /// Unique identifier of the application user.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// User's full display name.
    /// </summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// User's registered email address.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Authorization role assigned to the user.
    /// </summary>
    public string Role { get; set; } = string.Empty;
}