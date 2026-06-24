using System.ComponentModel.DataAnnotations;

namespace StockSync.DTOs;

public class LoginDto
{
    [Required]
    [EmailAddress]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Password { get; set; } = string.Empty;
}