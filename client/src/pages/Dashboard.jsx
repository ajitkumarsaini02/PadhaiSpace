import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';
import ResourceCard from '../components/ResourceCard';
import PDFViewerModal from '../components/PDFViewerModal';
import { CardSkeleton } from '../components/SkeletonLoader';
import { resourceService } from '../services/api';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Bookmark,
  FileText,
  UserCheck,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { bookmarks } = useBookmarks();
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [recommendedPYQs, setRecommendedPYQs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePDF, setActivePDF] = useState(null);

  useEffect(() => {
    const fetchDashboardContent = async () => {
      try {
        setLoading(true);
        const [nRes, pRes] = await Promise.all([
          resourceService.getAll({ type: 'notes', limit: 3 }),
          resourceService.getAll({ type: 'pyq', limit: 3 }),
        ]);

        if (nRes.success) setRecommendedNotes(nRes.data);
        if (pRes.success) setRecommendedPYQs(pRes.data);
      } catch (err) {
        console.error('Fetch dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardContent();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900 dark:text-[#F8FAFC]">
      {/* Welcome Hero Banner */}
      <div className="tech-card p-6 sm:p-8 tech-grid-pattern relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-[#0F172A] text-[#4F46E5] dark:text-[#818CF8] border border-indigo-200 dark:border-[#1E293B] text-xs font-mono font-bold">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Welcome back, {user?.name || 'Student'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-[#F8FAFC]">
            Student Academic Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] max-w-xl font-mono">
            {user?.college ? `${user.college} • ` : ''}
            Role: <span className="font-bold text-[#4F46E5] dark:text-[#38BDF8] uppercase">{user?.role || 'Student'}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/profile"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#0B0F19] dark:hover:bg-[#1E293B] text-slate-900 dark:text-[#F8FAFC] text-xs font-mono font-bold rounded-xl transition-colors border border-slate-200 dark:border-[#1E293B]"
          >
            Edit Profile
          </Link>
          <Link
            to="/bookmarks"
            className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] text-white font-mono font-bold text-xs rounded-xl shadow-md transition-transform hover:scale-105 border border-indigo-300 dark:border-[#38BDF8]/30"
          >
            My Bookmarks ({bookmarks.length})
          </Link>
        </div>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="tech-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">Account Status</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-[#F8FAFC] mt-1 capitalize">{user?.role || 'Student'} Access</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-[#161D31] text-[#4F46E5] dark:text-[#38BDF8] border border-indigo-200 dark:border-[#38BDF8]/30 flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="tech-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">Saved Bookmarks</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-[#F8FAFC] mt-1">{bookmarks.length} Resources</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#6D28D9] dark:text-[#C084FC] border border-purple-200 dark:border-purple-800 flex items-center justify-center font-bold">
            <Bookmark className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Bookmarked Quick View */}
      {bookmarks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-[#F8FAFC] flex items-center">
              <Bookmark className="w-5 h-5 text-[#6D28D9] dark:text-[#C084FC] fill-current mr-2" /> Bookmarked Materials
            </h2>
            <Link to="/bookmarks" className="text-xs font-mono font-bold text-[#4F46E5] dark:text-[#38BDF8]">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {bookmarks.slice(0, 3).map((res) => (
              <ResourceCard
                key={res._id || res}
                resource={res}
                onOpenPDF={(r) => setActivePDF(r)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recommended Notes */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 dark:text-[#F8FAFC] flex items-center">
            <BookOpen className="w-5 h-5 text-[#4F46E5] dark:text-[#38BDF8] mr-2" /> Recommended Study Notes
          </h2>
          <Link to="/notes" className="text-xs font-mono font-bold text-[#4F46E5] dark:text-[#38BDF8]">
            Browse Notes →
          </Link>
        </div>

        {loading ? (
          <CardSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recommendedNotes.map((note) => (
              <ResourceCard
                key={note._id}
                resource={note}
                onOpenPDF={(r) => setActivePDF(r)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recommended PYQs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 dark:text-[#F8FAFC] flex items-center">
            <FileText className="w-5 h-5 text-[#2563EB] dark:text-[#C084FC] mr-2" /> Exam Question Papers (PYQs)
          </h2>
          <Link to="/pyqs" className="text-xs font-mono font-bold text-[#4F46E5] dark:text-[#38BDF8]">
            Browse PYQs →
          </Link>
        </div>

        {loading ? (
          <CardSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recommendedPYQs.map((paper) => (
              <ResourceCard
                key={paper._id}
                resource={paper}
                onOpenPDF={(r) => setActivePDF(r)}
              />
            ))}
          </div>
        )}
      </section>

      {activePDF && (
        <PDFViewerModal resource={activePDF} onClose={() => setActivePDF(null)} />
      )}
    </div>
  );
}
