import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api';
import AdminNav from '../../components/AdminNav';
import {
  Users,
  BookOpen,
  FileText,
  Layers,
  Eye,
  Download,
  Activity,
  FileCode,
  Sparkles,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F8FAFC]">
      {/* Shared Admin Navigation Header */}
      <AdminNav
        title="PadhaiSpace Admin Console"
        subtitle="Free Engineering Resources — Management of subjects, units, PDFs, PYQs, student accounts & activity logs"
      />

      {/* Platform Statistics */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 animate-pulse">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-24 bg-[#0B0F19] border border-[#1E293B] rounded-xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="tech-card p-4">
            <p className="text-xs font-mono font-semibold text-[#94A3B8] uppercase flex items-center">
              <Users className="w-3.5 h-3.5 mr-1.5 text-[#38BDF8]" /> Total Students
            </p>
            <h3 className="text-2xl font-black text-[#F8FAFC] mt-1.5">{stats?.totalUsers || 0}</h3>
          </div>

          <div className="tech-card p-4">
            <p className="text-xs font-mono font-semibold text-[#94A3B8] uppercase flex items-center">
              <BookOpen className="w-3.5 h-3.5 mr-1.5 text-[#38BDF8]" /> Total Subjects
            </p>
            <h3 className="text-2xl font-black text-[#F8FAFC] mt-1.5">{stats?.totalSubjects || 0}</h3>
          </div>

          <div className="tech-card p-4">
            <p className="text-xs font-mono font-semibold text-[#94A3B8] uppercase flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1.5 text-[#38BDF8]" /> Total Units
            </p>
            <h3 className="text-2xl font-black text-[#F8FAFC] mt-1.5">{stats?.totalUnits || 0}</h3>
          </div>

          <div className="tech-card p-4">
            <p className="text-xs font-mono font-semibold text-[#94A3B8] uppercase flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1.5 text-[#8B5CF6]" /> Total Resources
            </p>
            <h3 className="text-2xl font-black text-[#F8FAFC] mt-1.5">{stats?.totalResources || 0}</h3>
          </div>

          <div className="tech-card p-4">
            <p className="text-xs font-mono font-semibold text-[#94A3B8] uppercase flex items-center">
              <FileCode className="w-3.5 h-3.5 mr-1.5 text-[#38BDF8]" /> Total PDFs
            </p>
            <h3 className="text-2xl font-black text-[#F8FAFC] mt-1.5">{stats?.totalPDFs || 0}</h3>
          </div>

          <div className="tech-card p-4">
            <p className="text-xs font-mono font-semibold text-[#94A3B8] uppercase flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#C084FC]" /> Total PYQs
            </p>
            <h3 className="text-2xl font-black text-[#F8FAFC] mt-1.5">{stats?.totalPYQs || 0}</h3>
          </div>

          <div className="tech-card p-4">
            <p className="text-xs font-mono font-semibold text-[#94A3B8] uppercase flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1.5 text-[#10B981]" /> Total Notes
            </p>
            <h3 className="text-2xl font-black text-[#F8FAFC] mt-1.5">{stats?.totalNotes || 0}</h3>
          </div>

          <div className="tech-card p-4">
            <p className="text-xs font-mono font-semibold text-[#94A3B8] uppercase flex items-center">
              <Eye className="w-3.5 h-3.5 mr-1.5 text-[#38BDF8]" /> Resource Views
            </p>
            <h3 className="text-2xl font-black text-[#F8FAFC] mt-1.5">{stats?.totalViews || 0}</h3>
          </div>

          <div className="tech-card p-4 col-span-2 sm:col-span-1">
            <p className="text-xs font-mono font-semibold text-[#94A3B8] uppercase flex items-center">
              <Download className="w-3.5 h-3.5 mr-1.5 text-[#10B981]" /> Resource Downloads
            </p>
            <h3 className="text-2xl font-black text-[#F8FAFC] mt-1.5">{stats?.totalDownloads || 0}</h3>
          </div>
        </div>
      )}

      {/* Grid for Recent Students & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registered Students */}
        <div className="tech-card overflow-hidden">
          <div className="p-4 bg-[#0F172A] border-b border-[#1E293B] flex items-center justify-between font-mono font-bold text-xs">
            <span className="flex items-center text-[#F8FAFC]"><Users className="w-4 h-4 mr-2 text-[#38BDF8]" /> Registered Students</span>
            <Link to="/admin/users" className="text-[#38BDF8] hover:underline text-[11px]">View All →</Link>
          </div>

          <div className="divide-y divide-[#1E293B]">
            {stats?.recentUsers?.map((u) => (
              <div key={u._id} className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#F8FAFC]">{u.name}</p>
                  <p className="text-[#94A3B8] text-[11px] font-mono">{u.email}</p>
                  {u.college && <p className="text-[#64748B] text-[10px] mt-0.5">{u.college}</p>}
                </div>
                <span className="text-[11px] text-[#64748B] font-mono">
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="tech-card overflow-hidden">
          <div className="p-4 bg-[#0F172A] border-b border-[#1E293B] flex items-center justify-between font-mono font-bold text-xs">
            <span className="flex items-center text-[#F8FAFC]"><Activity className="w-4 h-4 mr-2 text-[#C084FC]" /> Recent Resource Activity</span>
            <Link to="/admin/activity" className="text-[#38BDF8] hover:underline text-[11px]">View All →</Link>
          </div>

          <div className="divide-y divide-[#1E293B]">
            {stats?.recentActivities?.length > 0 ? (
              stats.recentActivities.map((act) => (
                <div key={act._id} className="p-3.5 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#F8FAFC]">{act.resourceId?.title || 'Resource'}</p>
                    <p className="text-[11px] text-[#94A3B8]">
                      {act.userId?.name || 'Student'} • <span className="font-mono text-[#38BDF8]">{act.eventType}</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B]">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-[#94A3B8]">No recent resource activity recorded.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
