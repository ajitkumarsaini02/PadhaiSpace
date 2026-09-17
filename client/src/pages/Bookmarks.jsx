import React, { useState } from 'react';
import { useBookmarks } from '../context/BookmarkContext';
import ResourceCard from '../components/ResourceCard';
import EmptyState from '../components/EmptyState';
import PDFViewerModal from '../components/PDFViewerModal';
import { CardSkeleton } from '../components/SkeletonLoader';
import { Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Bookmarks() {
  const { bookmarks, loading } = useBookmarks();
  const [activePDF, setActivePDF] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-900 dark:text-[#F8FAFC]">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center">
          <Bookmark className="w-7 h-7 text-[#4F46E5] dark:text-[#38BDF8] fill-current mr-2.5" /> Saved Bookmarks
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] mt-1 font-mono">
          Quick access to your bookmarked notes, PYQs, and study resources
        </p>
      </div>

      {loading ? (
        <CardSkeleton count={6} />
      ) : bookmarks.length === 0 ? (
        <EmptyState
          title="No bookmarks yet"
          message="Save useful resources here for quick access during your studies."
          actionLabel="Explore Notes & PYQs"
          onAction={() => navigate('/resources')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bookmarks.map((res) => (
            <ResourceCard
              key={res._id || res}
              resource={res}
              onOpenPDF={(r) => setActivePDF(r)}
            />
          ))}
        </div>
      )}

      {activePDF && (
        <PDFViewerModal resource={activePDF} onClose={() => setActivePDF(null)} />
      )}
    </div>
  );
}
