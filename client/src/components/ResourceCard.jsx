import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Download, BookOpen, ArrowRight, Calendar } from 'lucide-react';
import BookmarkButton from './BookmarkButton';

export default function ResourceCard({ resource }) {
  const getTypeBadge = (type) => {
    switch (type) {
      case 'notes':
      case 'pdf':
      case 'unit-pdf':
        return { label: 'Notes', cls: 'tech-badge-blue' };
      case 'pyq':
        return { label: 'PYQ', cls: 'tech-badge-purple' };
      case 'syllabus':
        return { label: 'Syllabus', cls: 'tech-badge-blue' };
      default:
        return { label: 'Resource', cls: 'tech-badge-cyan' };
    }
  };

  const badge = getTypeBadge(resource.type);
  const subjectName = resource.subjectId?.name || 'Engineering Subject';
  const unitNum = resource.unitId?.unitNumber;
  const formattedDate = resource.createdAt ? new Date(resource.createdAt).toLocaleDateString() : '';

  return (
    <div className="group tech-card p-5 flex flex-col justify-between">
      <div>
        {/* Top Badges & Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center flex-wrap gap-1.5">
            <span className={`tech-badge ${badge.cls}`}>
              {badge.label}
            </span>
            {unitNum && (
              <span className="tech-badge tech-badge-cyan">
                Unit {unitNum}
              </span>
            )}
            {resource.academicYear && (
              <span className="tech-badge tech-badge-purple">
                {resource.academicYear}
              </span>
            )}
            {resource.paperYear && (
              <span className="tech-badge tech-badge-green font-mono">
                {resource.paperYear}
              </span>
            )}
            {resource.source && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-[#94A3B8]">
                {resource.source}
              </span>
            )}
          </div>
          <BookmarkButton resource={resource} />
        </div>

        {/* Title */}
        <h4 className="text-sm md:text-base font-bold text-slate-900 dark:text-[#F8FAFC] group-hover:text-[#4F46E5] dark:group-hover:text-[#38BDF8] transition-colors line-clamp-2 mb-2 leading-snug">
          <Link to={`/resources/${resource._id}/read`}>
            {resource.title}
          </Link>
        </h4>

        {/* Subject & Date Meta */}
        <div className="space-y-1 mb-3 text-xs text-slate-600 dark:text-[#94A3B8]">
          <p className="font-semibold truncate flex items-center">
            <BookOpen className="w-3.5 h-3.5 mr-1.5 text-[#4F46E5] dark:text-[#38BDF8]" />
            {subjectName}
          </p>
          {formattedDate && (
            <p className="text-[11px] font-mono flex items-center text-slate-400 dark:text-[#64748B]">
              <Calendar className="w-3 h-3 mr-1" />
              {formattedDate}
            </p>
          )}
        </div>

        {/* Description */}
        {resource.description && (
          <p className="text-xs text-slate-600 dark:text-[#94A3B8] line-clamp-2 leading-relaxed mb-4">
            {resource.description}
          </p>
        )}
      </div>

      {/* Footer Stats & Open Action */}
      <div className="pt-3 border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-between text-xs font-mono text-slate-500 dark:text-[#94A3B8]">
        <div className="flex items-center space-x-3">
          <span className="flex items-center" title="Views">
            <Eye className="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-[#64748B]" /> {resource.views || 0}
          </span>
          <span className="flex items-center" title="Downloads">
            <Download className="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-[#64748B]" /> {resource.downloads || 0}
          </span>
        </div>

        <Link
          to={`/resources/${resource._id}/read`}
          className="px-3.5 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] text-white font-mono font-bold rounded-xl transition-colors text-xs flex items-center border border-indigo-200 dark:border-[#38BDF8]/30 shadow-sm cursor-pointer"
        >
          Open <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>


      </div>
    </div>
  );
}
