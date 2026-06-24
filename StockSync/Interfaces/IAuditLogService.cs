using StockSync.Entities;

namespace StockSync.Interfaces;

public interface IAuditLogService
{
    Task<IEnumerable<AuditLog>> GetAllAsync();
}