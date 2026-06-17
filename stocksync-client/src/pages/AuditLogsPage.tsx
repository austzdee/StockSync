import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getAuditLogs, type AuditLog } from "../services/auditService";

/**
 * Displays inventory activity history.
 */
const AuditLogsPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuditLogs = async () => {
      try {
        const data = await getAuditLogs();
        setLogs(data);
      } catch (error) {
        console.error("Failed to load audit logs", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuditLogs();
  }, []);

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-white">Audit Logs</h1>

        <p className="mt-2 text-slate-400">
          Track inventory activity across the platform.
        </p>

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">
              Activity History
            </h2>
          </div>

          {isLoading ? (
            <p className="p-6 text-slate-400">Loading audit logs...</p>
          ) : logs.length === 0 ? (
            <p className="p-6 text-slate-400">No audit records found.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Product ID</th>
                  <th className="px-6 py-3">Warehouse ID</th>
                  <th className="px-6 py-3">Quantity</th>
                  <th className="px-6 py-3">Performed By</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t border-slate-800">
                    <td className="px-6 py-4 text-white">{log.action}</td>

                    <td className="px-6 py-4 text-slate-300">
                      {log.productId}
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {log.warehouseId}
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {log.quantityChanged}
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {log.performedBy}
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {new Date(log.createdAtUtc).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuditLogsPage;
