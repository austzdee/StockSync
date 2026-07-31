using Microsoft.EntityFrameworkCore;
using StockSync.Data;
using StockSync.DTOs;
using StockSync.Interfaces;

namespace StockSync.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<UserResponseDto>> GetUsersAsync()
    {
        return await _context.AppUsers
            .AsNoTracking()
            .OrderBy(user => user.FullName)
            .Select(user => new UserResponseDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role
            })
            .ToListAsync();
    }

    public async Task<UserResponseDto?> GetUserByIdAsync(int id)
    {
        return await _context.AppUsers
            .AsNoTracking()
            .Where(user => user.Id == id)
            .Select(user => new UserResponseDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role
            })
            .FirstOrDefaultAsync();
    }

    public async Task<UserResponseDto?> UpdateUserRoleAsync(
        int id,
        string role,
        int currentUserId)
    {
        var user = await _context.AppUsers
            .FirstOrDefaultAsync(existingUser => existingUser.Id == id);

        if (user is null)
        {
            return null;
        }

        if (user.Id == currentUserId &&
            string.Equals(
                user.Role,
                "Admin",
                StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(
                role,
                "Admin",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "You cannot remove your own administrator role.");
        }

        user.Role = role;

        await _context.SaveChangesAsync();

        return new UserResponseDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role
        };
    }
}