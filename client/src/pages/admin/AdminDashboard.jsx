import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api';
import {
  ShieldAlert,
  Users,
  BookOpen,
  FileText,
  PlusCircle,
  Search,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await adminService.getStats();
        if (res.success) setStats(res.data);
      } catch (err) {
        console.error('Fetch admin stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-[#0B1020] border border-[#252D42] rounded-xl p-6 sm:p-8 text-[#F8FAFC] shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#161D31] text-[#F2A93B] border border-[#252D42] text-xs font-bold mb-2">
            <ShieldAlert className="w-4 h-4 text-[#F2A93B]" />
            <span>Platform Administrator Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-[#F8FAFC]">
            PadhaiSpace Admin Console
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA6BC] mt-1">
            Complete management of CSE / AIML / DS curriculum, subjects, unit PDFs, student accounts, and audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <Link
            to="/admin/search"
            className="px-4 py-2.5 bg-[#161D31] hover:bg-[#252D42] text-[#F8FAFC] border border-[#252D42] font-bold text-xs rounded-lg shadow-subtle transition-colors flex items-center"
          >
            <Search className="w-4 h-4 mr-1.5 text-[#4F8FEF]" /> Global Search
          </Link>
          <Link
            to="/admin/resources"
            className="px-4 py-2.5 bg-[#4F8FEF] hover:bg-[#3D7FE5] text-white font-bold text-xs rounded-lg shadow-subtle transition-colors flex items-center"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" /> Upload Resource
          </Link>
        </div>
      </div>

      {/* Admin Navigation Quick Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-[#DCE2EC] dark:border-[#252D42]">
        {[
          { to: '/admin', label: 'Overview', active: true },
          { to: '/admin/users', label: 'Student Accounts' },
          { to: '/admin/subjects', label: 'Subjects' },
          { to: '/admin/units', label: 'Units' },
          { to: '/admin/resources', label: 'Resources' },
          { to: '/admin/activity', label: 'Resource Activity' },
          { to: '/admin/audit-logs', label: 'Admin Audit Logs' },
        ].map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              tab.active
                ? 'bg-[#4F8FEF] text-white shadow-subtle'
                : 'bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC] hover:bg-[#F5F7FB] dark:hover:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42]'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Platform Statistics */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-[#DCE2EC] dark:bg-[#161D31] rounded-xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#111729] p-5 rounded-xl border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle">
            <p className="text-xs font-semibold text-[#64748B] dark:text-[#9AA6BC] uppercase flex items-center">
              <Users className="w-3.5 h-3.5 mr-1.5 text-[#4F8FEF]" /> Total Students
            </p>
            <h3 className="text-2xl font-bold text-[#172033] dark:text-[#F8FAFC] mt-1">{stats?.totalUsers || 0}</h3>
          </div>

          <div className="bg-white dark:bg-[#111729] p-5 rounded-xl border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle">
            <p className="text-xs font-semibold text-[#64748B] dark:text-[#9AA6BC] uppercase flex items-center">
              <BookOpen className="w-3.5 h-3.5 mr-1.5 text-[#4F8FEF]" /> Total Subjects
            </p>
            <h3 className="text-2xl font-bold text-[#172033] dark:text-[#F8FAFC] mt-1">{stats?.totalSubjects || 0}</h3>
          </div>

          <div className="bg-white dark:bg-[#111729] p-5 rounded-xl border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle">
            <p className="text-xs font-semibold text-[#64748B] dark:text-[#9AA6BC] uppercase flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1.5 text-[#4F8FEF]" /> Total Resources
            </p>
            <h3 className="text-2xl font-bold text-[#172033] dark:text-[#F8FAFC] mt-1">{stats?.totalResources || 0}</h3>
          </div>

          <div className="bg-white dark:bg-[#111729] p-5 rounded-xl border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle">
            <p className="text-xs font-semibold text-[#64748B] dark:text-[#9AA6BC] uppercase flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1.5 text-[#6EA8FF]" /> Total PDFs
            </p>
            <h3 className="text-2xl font-bold text-[#172033] dark:text-[#F8FAFC] mt-1">{stats?.totalPDFs || 0}</h3>
          </div>
        </div>
      )}

      {/* Recent Registered Students Section */}
      <div className="bg-white dark:bg-[#111729] rounded-xl border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle overflow-hidden">
        <div className="p-4 bg-[#F5F7FB] dark:bg-[#161D31] border-b border-[#DCE2EC] dark:border-[#252D42] flex items-center justify-between font-bold text-xs text-[#172033] dark:text-[#F8FAFC]">
          <span className="flex items-center"><Users className="w-4 h-4 mr-2 text-[#4F8FEF]" /> Recent Registered Students</span>
          <Link to="/admin/users" className="text-[#4F8FEF] hover:underline text-[11px]">View All →</Link>
        </div>

        <div className="divide-y divide-[#DCE2EC] dark:divide-[#252D42]">
          {stats?.recentUsers?.map((u) => (
            <div key={u._id} className="p-3.5 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-[#172033] dark:text-[#F8FAFC]">{u.name}</p>
                <p className="text-[#64748B] dark:text-[#9AA6BC] text-[11px]">{u.email} • {u.branch} Sem {u.semester}</p>
              </div>
              <span className="text-[11px] text-[#64748B] dark:text-[#9AA6BC]">
                {new Date(u.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
