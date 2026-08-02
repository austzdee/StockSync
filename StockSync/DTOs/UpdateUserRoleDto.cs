using System.ComponentModel.DataAnnotations;

namespace StockSync.DTOs;

public class UpdateUserRoleDto
{
    [Required]
    [RegularExpression(
        "^(Admin|User)$",
        ErrorMessage = "Role must be either Admin or User.")]
    public string Role { get; set; } = string.Empty;
}