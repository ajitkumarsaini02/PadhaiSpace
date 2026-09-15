import React, { useState } from 'react';
import { useBookmarks } from '../context/BookmarkContext';
import ResourceCard from '../components/ResourceCard';
import EmptyState from '../components/EmptyState';
import PDFViewerModal from '../components/PDFViewerModal';
import { CardSkeleton } from '../components/SkeletonLoader';
import { Bookmark, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Bookmarks() {
  const { bookmarks, loading } = useBookmarks();
  const [activePDF, setActivePDF] = useState(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
          <Bookmark className="w-7 h-7 text-amber-500 fill-amber-500 mr-2.5" /> Saved Bookmarks
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Quick access to your saved semester notes, PYQs, and exam resources
        </p>
      </div>

      {loading ? (
        <CardSkeleton count={6} />
      ) : bookmarks.length === 0 ? (
        <EmptyState
          title="No bookmarks yet."
          message="Save useful resources here for quick access during your semester exams."
          actionLabel="Explore Notes & PYQs"
          onAction={() => window.location.href = '/resources'}
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
