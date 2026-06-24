using Microsoft.EntityFrameworkCore;
using StockSync.Data;
using StockSync.Entities;
using StockSync.Interfaces;

namespace StockSync.Services;

public class AuditLogService : IAuditLogService
{
    private readonly AppDbContext _context;

    public AuditLogService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<AuditLog>> GetAllAsync()
    {
        return await _context.AuditLogs
            .OrderByDescending(a => a.CreatedAtUtc)
            .ToListAsync();
    }
}