import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import {
  Activity,
  FileText,
  User,
  Search,
  Filter,
  Eye,
  EyeOff,
  Maximize2,
  Printer,
  ShieldAlert,
  Clock,
  RefreshCw,
  Info,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminActivityLog() {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    eventType: '',
    sessionId: '',
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
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Eye className="w-3 h-3 mr-1" /> PDF OPEN
          </span>
        );
      case 'PDF_CLOSE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3 mr-1" /> PDF CLOSE
          </span>
        );
      case 'TAB_HIDDEN':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <EyeOff className="w-3 h-3 mr-1" /> TAB HIDDEN
          </span>
        );
      case 'TAB_VISIBLE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Eye className="w-3 h-3 mr-1" /> TAB VISIBLE
          </span>
        );
      case 'FULLSCREEN_ENTER':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Maximize2 className="w-3 h-3 mr-1" /> FULLSCREEN ENTER
          </span>
        );
      case 'FULLSCREEN_EXIT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            FULLSCREEN EXIT
          </span>
        );
      case 'PRINT_ATTEMPT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Printer className="w-3 h-3 mr-1" /> PRINT ATTEMPT
          </span>
        );
      case 'SCREEN_CAPTURE_SIGNAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
            <ShieldAlert className="w-3 h-3 mr-1" /> SCREEN CAPTURE SIGNAL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EFF5FF] dark:bg-[#161D31] border border-[#4F8FEF]/30 text-[#4F8FEF] text-xs font-bold mb-2">
            <Activity className="w-4 h-4" />
            <span>Resource Activity Audit Logs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] dark:text-[#F8FAFC]">
            PDF & Resource Activity Monitoring
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#9AA6BC] mt-1">
            Real-time audit logging for PDF viewing sessions, tab visibility changes, fullscreen state, and print attempts
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            className="px-3.5 py-2 bg-[#F5F7FB] dark:bg-[#161D31] hover:bg-[#E2E8F0] dark:hover:bg-[#1C253E] text-[#172033] dark:text-[#F8FAFC] text-xs font-bold rounded-xl flex items-center transition-colors border border-[#DCE2EC] dark:border-[#252D42]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Logs
          </button>
          <Link
            to="/admin"
            className="text-xs font-bold text-[#F2A93B] bg-[#161D31] hover:bg-[#1C253E] px-3.5 py-2 rounded-xl border border-[#252D42] transition-colors"
          >
            ← Back to Admin
          </Link>
        </div>
      </div>

      {/* Technically Accurate Browser Notice Banner */}
      <div className="p-4 bg-amber-500/10 dark:bg-[#161D31] border border-[#F2A93B]/30 dark:border-[#252D42] rounded-2xl text-xs text-[#F2A93B] flex items-start space-x-3">
        <Info className="w-5 h-5 text-[#F2A93B] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Technical Browser Audit Disclaimer:</p>
          <p className="text-[11px] text-[#64748B] dark:text-[#9AA6BC] leading-relaxed">
            Standard web browsers cannot detect external OS-level screenshot tools (Snipping Tool, Win+Shift+S, OBS, or camera capture). 
            <strong className="text-[#172033] dark:text-[#F8FAFC]"> TAB_HIDDEN</strong> indicates document visibility state changed (e.g. user minimized browser or switched tabs). 
            <strong className="text-[#172033] dark:text-[#F8FAFC]"> PRINT_ATTEMPT</strong> logs print keyboard shortcuts and print dialog requests. 
            <strong className="text-[#172033] dark:text-[#F8FAFC]"> SCREEN_CAPTURE_SIGNAL</strong> logs in-app display media screen sharing stream events.
          </p>
        </div>
      </div>

      {/* Audit Stats Overview Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-[#111729] p-4 rounded-2xl border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle space-y-1">
            <p className="text-[10px] font-bold text-[#64748B] dark:text-[#9AA6BC] uppercase tracking-wider">Total Events</p>
            <p className="text-xl font-extrabold text-[#172033] dark:text-[#F8FAFC]">{stats.totalEvents}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">PDF Opens</p>
            <p className="text-xl font-extrabold text-blue-900">{stats.pdfOpens}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Tab Hidden</p>
            <p className="text-xl font-extrabold text-amber-900">{stats.tabHiddenEvents}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Fullscreen</p>
            <p className="text-xl font-extrabold text-indigo-900">{stats.fullscreenEnters}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Print Attempts</p>
            <p className="text-xl font-extrabold text-rose-900">{stats.printAttempts}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Unique Viewers</p>
            <p className="text-xl font-extrabold text-emerald-900">{stats.uniqueViewers}</p>
          </div>
        </div>
      )}

      {/* Filters & Activity Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Filter Activity Logs</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                placeholder="Search user or resource..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            {/* Event Type Filter */}
            <select
              value={filters.eventType}
              onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="">All Event Types</option>
              <option value="PDF_OPEN">PDF_OPEN</option>
              <option value="PDF_CLOSE">PDF_CLOSE</option>
              <option value="TAB_HIDDEN">TAB_HIDDEN</option>
              <option value="TAB_VISIBLE">TAB_VISIBLE</option>
              <option value="FULLSCREEN_ENTER">FULLSCREEN_ENTER</option>
              <option value="FULLSCREEN_EXIT">FULLSCREEN_EXIT</option>
              <option value="PRINT_ATTEMPT">PRINT_ATTEMPT</option>
              <option value="SCREEN_CAPTURE_SIGNAL">SCREEN_CAPTURE_SIGNAL</option>
            </select>
          </div>
        </div>

        {/* Audit Table */}
        {displayedActivities.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">
            {loading ? 'Loading activity logs...' : 'No activity logs recorded matching selected filters.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Session ID</th>
                  <th className="py-3 px-4">Browser</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4">Fullscreen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {displayedActivities.map((act) => (
                  <tr key={act._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900">{act.userId?.name || 'Student'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{act.userId?.email || 'authenticated'}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">
                      <div className="font-bold text-slate-800 truncate">{act.resourceId?.title || 'PDF Document'}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">{act.resourceId?.type || 'notes'}</div>
                    </td>
                    <td className="py-3 px-4">{getEventBadge(act.eventType)}</td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(act.timestamp).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-500">
                      {act.sessionId ? act.sessionId.substring(0, 13) + '...' : 'n/a'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {parseBrowser(act.metadata?.userAgent)}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${act.metadata?.visibilityState === 'hidden' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'}`}>
                        {act.metadata?.visibilityState || 'visible'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${act.metadata?.fullscreen ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'}`}>
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
