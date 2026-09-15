import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import { CardSkeleton } from '../../components/SkeletonLoader';
import { History, ShieldCheck, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAuditLogs();
      if (res.success) {
        setLogs(res.data || []);
      }
    } catch (err) {
      console.error('Fetch audit logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <CardSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE2EC] dark:border-[#252D42] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] dark:text-[#F8FAFC] flex items-center">
            <History className="w-8 h-8 mr-3 text-[#4F8FEF]" /> Admin Action Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9AA6BC] mt-1">
            Immutable security audit trail of sensitive administrative actions (user block/unblock, access grants, resources).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchAuditLogs}
            className="inline-flex items-center px-4 py-2 bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] border border-[#DCE2EC] dark:border-[#252D42] text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-2" /> Refresh Logs
          </button>
          <Link to="/admin" className="text-xs font-bold text-[#4F8FEF] hover:text-[#3D7FE5] bg-[#EFF5FF] dark:bg-[#161D31] px-3.5 py-2 rounded-lg border border-[#DCE2EC] dark:border-[#252D42]">
            ← Back to Admin
          </Link>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-[#111729] rounded-xl border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F5F7FB] dark:bg-[#161D31] border-b border-[#DCE2EC] dark:border-[#252D42] text-[#64748B] dark:text-[#9AA6BC] font-bold uppercase tracking-wider">
                <th className="p-3.5">Admin</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Target Type</th>
                <th className="p-3.5">Target ID</th>
                <th className="p-3.5">Metadata / Notes</th>
                <th className="p-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE2EC] dark:divide-[#252D42] font-medium">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-[#64748B] dark:text-[#9AA6BC]">
                    No audit log records recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#F5F7FB] dark:hover:bg-[#161D31] transition-colors">
                    <td className="p-3.5 font-bold text-[#172033] dark:text-[#F8FAFC]">
                      {log.adminId?.name || 'Admin'} ({log.adminId?.email || '-'})
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-[#4F8FEF]/10 text-[#4F8FEF] border border-[#4F8FEF]/30">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#64748B] dark:text-[#9AA6BC]">
                      {log.targetType || '—'}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-[#64748B] dark:text-[#9AA6BC]">
                      {log.targetId || '—'}
                    </td>
                    <td className="p-3.5 text-[#172033] dark:text-[#F8FAFC]">
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
                    </td>
                    <td className="p-3.5 text-[#64748B] dark:text-[#9AA6BC]">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
