import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';
import ResourceCard from '../components/ResourceCard';
import PDFViewerModal from '../components/PDFViewerModal';
import { CardSkeleton } from '../components/SkeletonLoader';
import { resourceService, subjectService } from '../services/api';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Bookmark,
  FileText,
  ArrowRight,
  UserCheck,
  TrendingUp,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-brand-100 text-xs font-semibold backdrop-blur-xs">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Welcome back, {user?.name || 'Student'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            Student Academic Workspace
          </h1>
          <p className="text-xs sm:text-sm text-brand-100 max-w-xl">
            {user?.college ? `${user.college} • ` : ''}
            Branch: <span className="font-bold text-white uppercase">{user?.branch || 'CSE'}</span> • Semester:{' '}
            <span className="font-bold text-white">Sem {user?.semester || 1}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/profile"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors border border-white/20"
          >
            Edit Profile
          </Link>
          <Link
            to="/bookmarks"
            className="px-4 py-2 bg-white text-brand-700 font-bold text-xs rounded-xl shadow-md transition-transform hover:scale-105"
          >
            My Bookmarks ({bookmarks.length})
          </Link>
        </div>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Branch</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">{user?.branch || 'CSE'}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Semester</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">Semester {user?.semester || 1}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saved Bookmarks</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">{bookmarks.length} Resources</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Bookmark className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Bookmarked Quick View */}
      {bookmarks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500 mr-2" /> Bookmarked Materials
            </h2>
            <Link to="/bookmarks" className="text-xs font-bold text-brand-600">
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
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <BookOpen className="w-5 h-5 text-brand-600 mr-2" /> Recommended Semester Notes
          </h2>
          <Link to="/notes" className="text-xs font-bold text-brand-600">
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
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <FileText className="w-5 h-5 text-amber-500 mr-2" /> Exam Question Papers (PYQs)
          </h2>
          <Link to="/pyqs" className="text-xs font-bold text-brand-600">
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
