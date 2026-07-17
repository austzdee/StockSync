using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StockSync.Data;
using StockSync.DTOs;
using StockSync.Entities;
using StockSync.Interfaces;

namespace StockSync.Services;

/// <summary>
/// Provides authentication workflows including registration,
/// login, JWT issuance and refresh-token rotation.
/// </summary>
public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    /// <summary>
    /// Initialises the authentication service.
    /// </summary>
    public AuthService(
        AppDbContext context,
        IConfiguration configuration,
        ILogger<AuthService> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Registers a user when the supplied email address
    /// is not already associated with an account.
    /// </summary>
    public async Task<RegisterResponseDto> RegisterAsync(
        RegisterDto dto)
    {
        var emailExists = await _context.AppUsers
            .AnyAsync(user => user.Email == dto.Email);

        if (emailExists)
        {
            throw new InvalidOperationException(
                "Email already exists.");
        }

        var user = new AppUser
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = "User"
        };

        _context.AppUsers.Add(user);
        await _context.SaveChangesAsync();

        return new RegisterResponseDto
        {
            Message = "User registered successfully.",
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role
        };
    }

    /// <summary>
    /// Authenticates a user and issues access and refresh tokens.
    /// </summary>
    public async Task<LoginResponseDto?> LoginAsync(
        LoginDto dto)
    {
        _logger.LogInformation(
            "Login attempt for email: {Email}",
            dto.Email);

        var user = await _context.AppUsers
            .FirstOrDefaultAsync(
                existingUser =>
                    existingUser.Email == dto.Email);

        if (user is null)
        {
            _logger.LogWarning(
                "Login failed. User not found for email: {Email}",
                dto.Email);

            return null;
        }

        var passwordValid = BCrypt.Net.BCrypt.Verify(
            dto.Password,
            user.PasswordHash);

        if (!passwordValid)
        {
            _logger.LogWarning(
                "Login failed. Invalid password for email: {Email}",
                dto.Email);

            return null;
        }

        var accessToken = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken();

        // Store only a hash so leaked database rows cannot
        // be reused directly as bearer credentials.
        user.RefreshToken = HashRefreshToken(refreshToken);
        user.RefreshTokenExpiresAtUtc =
            DateTime.UtcNow.AddDays(7);

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Login successful for user ID: {UserId}",
            user.Id);

        return new LoginResponseDto
        {
            Message = "Login successful.",
            Token = accessToken,
            RefreshToken = refreshToken,
            User = MapUser(user)
        };
    }

    /// <summary>
    /// Validates and rotates a refresh token before issuing
    /// a new access and refresh-token pair.
    /// </summary>
    public async Task<RefreshTokenResponseDto?>
        RefreshTokenAsync(RefreshTokenDto dto)
    {
        var refreshTokenHash =
            HashRefreshToken(dto.RefreshToken);

        var user = await _context.AppUsers
            .FirstOrDefaultAsync(
                existingUser =>
                    existingUser.RefreshToken ==
                    refreshTokenHash);

        if (user is null ||
            user.RefreshTokenExpiresAtUtc is null ||
            user.RefreshTokenExpiresAtUtc <= DateTime.UtcNow)
        {
            return null;
        }

        var accessToken = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken();

        // Rotate refresh tokens after every successful renewal
        // to reduce replay risk.
        user.RefreshToken = HashRefreshToken(refreshToken);
        user.RefreshTokenExpiresAtUtc =
            DateTime.UtcNow.AddDays(7);

        await _context.SaveChangesAsync();

        return new RefreshTokenResponseDto
        {
            Message = "Token refreshed successfully.",
            Token = accessToken,
            RefreshToken = refreshToken
        };
    }

    /// <summary>
    /// Invalidates the supplied refresh token when it belongs
    /// to an active application user.
    /// </summary>
    public async Task<bool> LogoutAsync(
        RefreshTokenDto dto)
    {
        var refreshTokenHash =
            HashRefreshToken(dto.RefreshToken);

        var user = await _context.AppUsers
            .FirstOrDefaultAsync(
                existingUser =>
                    existingUser.RefreshToken ==
                    refreshTokenHash);

        if (user is null)
        {
            return false;
        }

        user.RefreshToken = null;
        user.RefreshTokenExpiresAtUtc = null;

        await _context.SaveChangesAsync();

        return true;
    }

    /// <summary>
    /// Creates a signed JWT containing user identity
    /// and authorization claims.
    /// </summary>
    private string GenerateJwtToken(AppUser user)
    {
        var jwtKey = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException(
                "JWT signing key is not configured.");

        var issuer = _configuration["Jwt:Issuer"]
            ?? throw new InvalidOperationException(
                "JWT issuer is not configured.");

        var audience = _configuration["Jwt:Audience"]
            ?? throw new InvalidOperationException(
                "JWT audience is not configured.");

        var claims = new[]
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                user.Id.ToString()),

            new Claim(
                ClaimTypes.Name,
                user.FullName),

            new Claim(
                ClaimTypes.Email,
                user.Email),

            new Claim(
                ClaimTypes.Role,
                user.Role)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey));

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(60),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }

    /// <summary>
    /// Creates a cryptographically secure refresh token.
    /// </summary>
    private static string GenerateRefreshToken()
    {
        var randomBytes =
            RandomNumberGenerator.GetBytes(64);

        return Convert.ToBase64String(randomBytes);
    }

    /// <summary>
    /// Creates a one-way SHA-256 representation of a
    /// refresh token before database storage.
    /// </summary>
    private static string HashRefreshToken(
        string refreshToken)
    {
        var tokenBytes =
            Encoding.UTF8.GetBytes(refreshToken);

        var hashBytes =
            SHA256.HashData(tokenBytes);

        return Convert.ToBase64String(hashBytes);
    }

    /// <summary>
    /// Maps an application user to a safe response DTO.
    /// </summary>
    private static UserResponseDto MapUser(AppUser user)
    {
        return new UserResponseDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role
        };
    }
}