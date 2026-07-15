using System.ComponentModel.DataAnnotations;

namespace StockSync.DTOs;

/// <summary>
/// Contains the information required to register a new application user.
/// </summary>
public class RegisterDto
{
    /// <summary>
    /// Gets or sets the user's full name.
    /// </summary>
    [Required]
    [StringLength(
        100,
        MinimumLength = 2,
        ErrorMessage = "Full name must be between 2 and 100 characters.")]
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the user's email address.
    /// </summary>
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the user's password.
    /// The password must contain uppercase, lowercase,
    /// numeric, and special characters.
    /// </summary>
    [Required]
    [StringLength(
        100,
        MinimumLength = 8,
        ErrorMessage = "Password must be at least 8 characters long.")]
    [RegularExpression(
        @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$",
        ErrorMessage =
            "Password must contain at least one uppercase letter, " +
            "one lowercase letter, one number, and one special character.")]
    public string Password { get; set; } = string.Empty;
}