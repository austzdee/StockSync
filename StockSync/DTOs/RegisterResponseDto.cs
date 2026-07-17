namespace StockSync.DTOs;

/// <summary>
/// Represents a successful user-registration response.
/// </summary>
public class RegisterResponseDto
{
    /// <summary>
    /// Human-readable registration result.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Unique identifier of the registered user.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Full name of the registered user.
    /// </summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Registered email address.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Assigned authorization role.
    /// </summary>
    public string Role { get; set; } = string.Empty;
}