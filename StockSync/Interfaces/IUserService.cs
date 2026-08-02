using StockSync.DTOs;

namespace StockSync.Interfaces;

public interface IUserService
{
    Task<IReadOnlyList<UserResponseDto>> GetUsersAsync();

    Task<UserResponseDto?> GetUserByIdAsync(int id);

    Task<UserResponseDto?> UpdateUserRoleAsync(
        int id,
        string role,
        int currentUserId);
}