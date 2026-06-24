using System.ComponentModel.DataAnnotations;

namespace StockSync.DTOs;

public class RefreshTokenDto
{
    [Required]
    [StringLength(500)]
    public string RefreshToken { get; set; } = string.Empty;
}