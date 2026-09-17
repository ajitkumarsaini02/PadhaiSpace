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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E293B] flex flex-col overflow-hidden w-full max-w-2xl transition-colors">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#1E293B] bg-slate-50/80 dark:bg-[#111827] flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#818CF8] border border-indigo-200 dark:border-indigo-800 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#F8FAFC] truncate">
                {resource.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] truncate font-mono">
                {resource.subjectId?.name || 'Subject'} {resource.unitId?.unitNumber ? `• Unit ${resource.unitId.unitNumber}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <BookmarkButton resource={resource} />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="bg-slate-900 p-8 flex flex-col items-center justify-center text-white text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold">Free Academic Document</h3>
          <p className="text-xs text-slate-300 max-w-md font-mono">
            This engineering study resource is 100% free under PadhaiSpace's Academic Open Access policy. Launch the PDF Reader to view immediately.
          </p>
          <Link
            to={`/resources/${resource._id}/read`}
            onClick={onClose}
            className="px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] text-white font-mono font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center border border-indigo-300 dark:border-[#38BDF8]/30"
          >
            <BookOpen className="w-4 h-4 mr-2" /> Launch PDF Reader
          </Link>
        </div>
      </div>
    </div>
  );
}
