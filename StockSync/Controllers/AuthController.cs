using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StockSync.Data;
using StockSync.DTOs;
using StockSync.Entities;

namespace StockSync.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var emailExists = await _context.AppUsers
            .AnyAsync(u => u.Email == dto.Email);

        if (emailExists)
            return Conflict(new { message = "Email already exists." });

        var user = new AppUser
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = "User"
        };

        _context.AppUsers.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "User registered successfully.",
            user.Id,
            user.FullName,
            user.Email,
            user.Role
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _context.AppUsers
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user is null)
            return Unauthorized(new { message = "Invalid email or password." });

        var passwordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);

        if (!passwordValid)
            return Unauthorized(new { message = "Invalid email or password." });

        var token = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAtUtc = DateTime.UtcNow.AddDays(7);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Login successful.",
            token,
            refreshToken,
            user = new
            {
                user.Id,
                user.FullName,
                user.Email,
                user.Role
            }
        });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken(RefreshTokenDto dto)
    {
        var user = await _context.AppUsers
            .FirstOrDefaultAsync(u => u.RefreshToken == dto.RefreshToken);

        if (user is null || user.RefreshTokenExpiresAtUtc < DateTime.UtcNow)
            return Unauthorized(new { message = "Invalid or expired refresh token." });

        var token = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAtUtc = DateTime.UtcNow.AddDays(7);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Token refreshed successfully.",
            token,
            refreshToken
        });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(RefreshTokenDto dto)
    {
        var user = await _context.AppUsers
            .FirstOrDefaultAsync(u => u.RefreshToken == dto.RefreshToken);

        if (user is null)
            return Unauthorized(new { message = "Invalid refresh token." });

        user.RefreshToken = null;
        user.RefreshTokenExpiresAtUtc = null;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Logout successful." });
    }

    private string GenerateJwtToken(AppUser user)
    {
        var jwtKey = _configuration["Jwt:Key"]!;
        var issuer = _configuration["Jwt:Issuer"];
        var audience = _configuration["Jwt:Audience"];

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(60),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];

        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);

        return Convert.ToBase64String(randomBytes);
    }
}