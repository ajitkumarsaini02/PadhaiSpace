import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import AdminNav from '../../components/AdminNav';
import {
  Activity,
  Eye,
  EyeOff,
  Maximize2,
  Printer,
  ShieldAlert,
  Clock,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

export default function AdminActivityLog() {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    eventType: '',
    q: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [actRes, statsRes] = await Promise.all([
        adminService.getActivities({ limit: 100, ...filters }),
        adminService.getActivityStats(),
      ]);

      if (actRes.success) setActivities(actRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      console.error('Fetch activity audit logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.eventType]);

  const getEventBadge = (eventType) => {
    switch (eventType) {
      case 'PDF_OPEN':
        return (
          <span className="tech-badge tech-badge-blue">
            <Eye className="w-3 h-3 mr-1" /> PDF OPEN
          </span>
        );
      case 'PDF_CLOSE':
        return (
          <span className="tech-badge tech-badge-purple">
            <Clock className="w-3 h-3 mr-1" /> PDF CLOSE
          </span>
        );
      case 'TAB_HIDDEN':
        return (
          <span className="tech-badge text-amber-400 bg-amber-500/10 border-amber-500/30">
            <EyeOff className="w-3 h-3 mr-1" /> TAB HIDDEN
          </span>
        );
      case 'TAB_VISIBLE':
        return (
          <span className="tech-badge tech-badge-green">
            <Eye className="w-3 h-3 mr-1" /> TAB VISIBLE
          </span>
        );
      case 'FULLSCREEN_ENTER':
        return (
          <span className="tech-badge tech-badge-cyan">
            <Maximize2 className="w-3 h-3 mr-1" /> FULLSCREEN ENTER
          </span>
        );
      case 'FULLSCREEN_EXIT':
        return (
          <span className="tech-badge tech-badge-purple">
            FULLSCREEN EXIT
          </span>
        );
      case 'PRINT_ATTEMPT':
        return (
          <span className="tech-badge text-rose-400 bg-rose-500/10 border-rose-500/30">
            <Printer className="w-3 h-3 mr-1" /> PRINT ATTEMPT
          </span>
        );
      case 'SCREEN_CAPTURE_SIGNAL':
        return (
          <span className="tech-badge text-rose-400 bg-rose-500/10 border-rose-500/30">
            <ShieldAlert className="w-3 h-3 mr-1" /> SCREEN CAPTURE SIGNAL
          </span>
        );
      default:
        return (
          <span className="tech-badge text-[#94A3B8] bg-[#0F172A] border-[#1E293B]">
            {eventType}
          </span>
        );
    }
  };

  const parseBrowser = (ua) => {
    if (!ua) return 'Browser';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edg')) return 'Edge';
    return 'Web Browser';
  };

  const displayedActivities = activities.filter((act) => {
    if (!filters.q) return true;
    const search = filters.q.toLowerCase();
    const userName = act.userId?.name?.toLowerCase() || '';
    const userEmail = act.userId?.email?.toLowerCase() || '';
    const resourceTitle = act.resourceId?.title?.toLowerCase() || '';
    return userName.includes(search) || userEmail.includes(search) || resourceTitle.includes(search);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900 dark:text-[#F8FAFC]">
      <AdminNav
        title="Resource Activity Monitoring"
        subtitle="Real-time audit log of student resource interactions, PDF view events, tab visibility changes, and session metadata"
      />

      {/* Audit Stats Overview Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="tech-card p-4 space-y-1 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#1E293B]">
            <p className="text-[10px] font-mono font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">Total Events</p>
            <p className="text-xl font-black text-slate-900 dark:text-[#F8FAFC]">{stats.totalEvents}</p>
          </div>

          <div className="tech-card p-4 space-y-1 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#1E293B]">
            <p className="text-[10px] font-mono font-bold text-blue-600 dark:text-[#38BDF8] uppercase tracking-wider">PDF Opens</p>
            <p className="text-xl font-black text-blue-600 dark:text-[#38BDF8]">{stats.pdfOpens}</p>
          </div>

          <div className="tech-card p-4 space-y-1 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#1E293B]">
            <p className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Tab Hidden</p>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400">{stats.tabHiddenEvents}</p>
          </div>

          <div className="tech-card p-4 space-y-1 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#1E293B]">
            <p className="text-[10px] font-mono font-bold text-purple-600 dark:text-[#C084FC] uppercase tracking-wider">Fullscreen</p>
            <p className="text-xl font-black text-purple-600 dark:text-[#C084FC]">{stats.fullscreenEnters}</p>
          </div>

          <div className="tech-card p-4 space-y-1 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#1E293B]">
            <p className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Print Attempts</p>
            <p className="text-xl font-black text-rose-600 dark:text-rose-400">{stats.printAttempts}</p>
          </div>

          <div className="tech-card p-4 space-y-1 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#1E293B]">
            <p className="text-[10px] font-mono font-bold text-emerald-600 dark:text-[#10B981] uppercase tracking-wider">Unique Viewers</p>
            <p className="text-xl font-black text-emerald-600 dark:text-[#10B981]">{stats.uniqueViewers}</p>
          </div>
        </div>
      )}

      {/* Filters & Activity Table */}
      <div className="tech-card p-6 space-y-4 overflow-hidden bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#1E293B]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1E293B] pb-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-blue-600 dark:text-[#38BDF8]" />
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-[#F8FAFC] uppercase tracking-wider">Resource Activity Logs</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                placeholder="Search user or resource..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-[#38BDF8] font-mono"
              />
            </div>

            <select
              value={filters.eventType}
              onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#1E293B] rounded-xl font-mono font-semibold cursor-pointer"
            >
              <option value="" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">All Event Types</option>
              <option value="PDF_OPEN" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">PDF_OPEN</option>
              <option value="PDF_CLOSE" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">PDF_CLOSE</option>
              <option value="TAB_HIDDEN" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">TAB_HIDDEN</option>
              <option value="TAB_VISIBLE" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">TAB_VISIBLE</option>
              <option value="FULLSCREEN_ENTER" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">FULLSCREEN_ENTER</option>
              <option value="FULLSCREEN_EXIT" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">FULLSCREEN_EXIT</option>
              <option value="PRINT_ATTEMPT" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">PRINT_ATTEMPT</option>
              <option value="SCREEN_CAPTURE_SIGNAL" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">SCREEN_CAPTURE_SIGNAL</option>
            </select>

            <button
              onClick={fetchData}
              className="p-2 bg-slate-100 dark:bg-[#0B0F19] hover:bg-slate-200 dark:hover:bg-[#1E293B] text-blue-600 dark:text-[#38BDF8] border border-slate-200 dark:border-[#1E293B] rounded-xl transition-colors cursor-pointer"
              title="Refresh Activity Log"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Audit Table */}
        {displayedActivities.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-[#94A3B8] text-xs font-mono">
            {loading ? 'Loading activity logs...' : 'No activity logs recorded matching selected filters.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#0F172A] text-[11px] font-mono font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Session ID</th>
                  <th className="py-3 px-4">Browser</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4">Fullscreen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1E293B] text-xs">
                {displayedActivities.map((act) => (
                  <tr key={act._id} className="hover:bg-slate-50 dark:hover:bg-[#0F172A] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-[#F8FAFC]">{act.userId?.name || 'Student'}</div>
                      <div className="text-[10px] text-slate-500 dark:text-[#94A3B8] font-mono">{act.userId?.email || 'authenticated'}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">
                      <div className="font-bold text-slate-900 dark:text-[#F8FAFC] truncate">{act.resourceId?.title || 'PDF Document'}</div>
                      <div className="text-[10px] text-slate-500 dark:text-[#94A3B8] font-mono uppercase">{act.resourceId?.type || 'notes'}</div>
                    </td>
                    <td className="py-3 px-4">{getEventBadge(act.eventType)}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-[#94A3B8] font-mono whitespace-nowrap">
                      {new Date(act.timestamp).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-500 dark:text-[#94A3B8]">
                      {act.sessionId ? act.sessionId.substring(0, 13) + '...' : 'n/a'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-[#94A3B8] font-mono">
                      {parseBrowser(act.metadata?.userAgent)}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${act.metadata?.visibilityState === 'hidden' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'}`}>
                        {act.metadata?.visibilityState || 'visible'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${act.metadata?.fullscreen ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400' : 'bg-slate-100 dark:bg-[#0B0F19] text-slate-600 dark:text-[#94A3B8]'}`}>
                        {act.metadata?.fullscreen ? 'true' : 'false'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

