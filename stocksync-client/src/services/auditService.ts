import { api } from "./api";

export interface AuditLog {
  id: number;
  productId: number;
  warehouseId: number;
  action: string;
  quantityChanged: number;
  performedBy: string;
  createdAtUtc: string;
}

/**
 * Retrieves audit log records from the backend API.
 */
export const getAuditLogs = async (): Promise<AuditLog[]> => {
  const response = await api.get<AuditLog[]>("/Stock/audit-logs");

  return response.data;
};