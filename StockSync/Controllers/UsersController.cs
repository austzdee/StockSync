using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockSync.DTOs;
using StockSync.Interfaces;

namespace StockSync.Controllers;

/// <summary>
/// Provides administrator-only endpoints for viewing users
/// and managing application roles.
/// </summary>
[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
[Route("api/v1/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    /// <summary>
    /// Initialises the users controller.
    /// </summary>
    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// Returns all registered application users.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetAll()
    {
        var users = await _userService.GetUsersAsync();

        return Ok(users);
    }

    /// <summary>
    /// Returns a registered user by identifier.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserResponseDto>> GetById(int id)
    {
        var user = await _userService.GetUserByIdAsync(id);

        if (user is null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        return Ok(user);
    }

    /// <summary>
    /// Updates the role assigned to a registered user.
    /// </summary>
    [HttpPut("{id:int}/role")]
    public async Task<ActionResult<UserResponseDto>> UpdateRole(
        int id,
        UpdateUserRoleDto dto)
    {
        // Read the authenticated administrator's identifier
        // from the JWT NameIdentifier claim.
        var currentUserIdValue = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!int.TryParse(currentUserIdValue, out var currentUserId))
        {
            return Unauthorized(new
            {
                message = "Authenticated user identity is invalid."
            });
        }

        try
        {
            var user = await _userService.UpdateUserRoleAsync(
                id,
                dto.Role,
                currentUserId);

            if (user is null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            return Ok(user);
        }
        catch (InvalidOperationException ex)
        {
            // The service rejects unsafe role changes,
            // including self-demotion by an administrator.
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }
}