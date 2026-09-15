import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, FileText, BookOpen } from 'lucide-react';
import BookmarkButton from './BookmarkButton';
import { resourceService } from '../services/api';

export default function PDFViewerModal({ resource, onClose }) {
  useEffect(() => {
    if (resource?._id) {
      resourceService.incrementViews(resource._id).catch(() => {});
    }
  }, [resource?._id]);

  if (!resource) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden w-full max-w-2xl">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {resource.title}
              </h3>
              <p className="text-xs text-slate-500 truncate">
                {resource.subjectId?.name || 'Subject'} • {resource.branchId?.name || 'CSE'} Sem {resource.semesterId?.number || 1}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <BookmarkButton resource={resource} />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="bg-slate-900 p-8 flex flex-col items-center justify-center text-white text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-500/30 text-brand-400 flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold">Protected Academic Document</h3>
          <p className="text-xs text-slate-300 max-w-md">
            This study resource is protected under PadhaiSpace's Read-Only security policy. Launch the reader to view with your personalized watermark.
          </p>
          <Link
            to={`/resources/${resource._id}/read`}
            onClick={onClose}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center"
          >
            <BookOpen className="w-4 h-4 mr-2" /> Launch Protected PDF Reader
          </Link>
        </div>
      </div>
    </div>
  );
}
