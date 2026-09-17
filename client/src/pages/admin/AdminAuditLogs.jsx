import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import AdminNav from '../../components/AdminNav';
import { CardSkeleton } from '../../components/SkeletonLoader';
import { History, RefreshCw } from 'lucide-react';

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900 dark:text-[#F8FAFC]">
      <AdminNav
        title="Admin Action Audit Logs"
        subtitle="Security audit trail of sensitive administrative actions and management operations"
      />

      {/* Logs Table */}
      <div className="tech-card overflow-hidden bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#1E293B]">
        <div className="p-4 bg-slate-50 dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#1E293B] font-mono font-bold text-xs flex justify-between items-center text-slate-900 dark:text-[#F8FAFC]">
          <span className="flex items-center">
            <History className="w-4 h-4 mr-2 text-blue-600 dark:text-[#38BDF8]" /> Admin Audit Entries ({logs.length})
          </span>
          <button
            onClick={fetchAuditLogs}
            className="p-1.5 bg-slate-100 dark:bg-[#0B0F19] hover:bg-slate-200 dark:hover:bg-[#1E293B] text-blue-600 dark:text-[#38BDF8] border border-slate-200 dark:border-[#1E293B] rounded-lg transition-colors cursor-pointer text-xs font-mono flex items-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500 dark:text-[#94A3B8]">Loading security logs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#1E293B] text-slate-500 dark:text-[#94A3B8] font-mono font-bold uppercase tracking-wider">
                  <th className="p-3.5">Admin</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Target Type</th>
                  <th className="p-3.5">Target ID</th>
                  <th className="p-3.5">Metadata / Notes</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1E293B] font-medium">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500 dark:text-[#94A3B8] font-mono">
                      No audit log records recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-[#0F172A] transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-[#F8FAFC]">
                        {log.adminId?.name || 'Admin'} ({log.adminId?.email || '-'})
                      </td>
                      <td className="p-3.5">
                        <span className="tech-badge tech-badge-blue">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 dark:text-[#94A3B8]">
                        {log.targetType || '—'}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-500 dark:text-[#94A3B8]">
                        {log.targetId || '—'}
                      </td>
                      <td className="p-3.5 text-slate-900 dark:text-[#F8FAFC]">
                        {log.metadata ? JSON.stringify(log.metadata) : '—'}
                      </td>
                      <td className="p-3.5 text-slate-500 dark:text-[#94A3B8] font-mono">
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
        )}
      </div>
    </div>
  );
}
