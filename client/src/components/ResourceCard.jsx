import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Eye, Download, BookOpen, Layers } from 'lucide-react';
import BookmarkButton from './BookmarkButton';

export default function ResourceCard({ resource }) {
  const getTypeBadge = (type) => {
    switch (type) {
      case 'notes':
        return { label: 'Semester Notes', bg: 'bg-[#EFF5FF] dark:bg-[#161D31] text-[#4F8FEF] border-[#DCE2EC] dark:border-[#252D42]' };
      case 'pdf':
        return { label: 'Unit PDF', bg: 'bg-[#EFF5FF] dark:bg-[#161D31] text-[#4F8FEF] border-[#DCE2EC] dark:border-[#252D42]' };
      case 'pyq':
        return { label: 'PYQ Paper', bg: 'bg-[#F2A93B]/10 text-[#F2A93B] border-[#F2A93B]/30' };
      case 'syllabus':
        return { label: 'Syllabus', bg: 'bg-[#EFF5FF] dark:bg-[#161D31] text-[#4F8FEF] border-[#DCE2EC] dark:border-[#252D42]' };
      case 'exam-resource':
        return { label: 'Exam Resource', bg: 'bg-[#F2A93B]/10 text-[#F2A93B] border-[#F2A93B]/30' };
      default:
        return { label: 'Study Resource', bg: 'bg-[#F5F7FB] dark:bg-[#161D31] text-[#64748B] dark:text-[#9AA6BC] border-[#DCE2EC] dark:border-[#252D42]' };
    }
  };

  const badge = getTypeBadge(resource.type);
  const branchName = resource.branchId?.code || resource.branchId?.name || 'Common (All Branches)';
  const semNum = resource.semesterId?.number || 1;
  const subjectName = resource.subjectId?.name || 'Engineering Subject';
  const unitNum = resource.unitId?.unitNumber;

  return (
    <div className="group bg-white dark:bg-[#111729] rounded-xl p-5 border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle hover:shadow-elevated hover:border-[#4F8FEF] dark:hover:border-[#4F8FEF] transition-all flex flex-col justify-between">
      <div>
        {/* Top Badges & Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center flex-wrap gap-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badge.bg}`}>
              {badge.label}
            </span>
            {unitNum && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F5F7FB] dark:bg-[#161D31] text-[#64748B] dark:text-[#9AA6BC] border border-[#DCE2EC] dark:border-[#252D42]">
                Unit {unitNum}
              </span>
            )}
            {resource.examYear && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F2A93B]/10 text-[#F2A93B] border border-[#F2A93B]/30">
                {resource.examYear} {resource.examType ? `(${resource.examType})` : ''}
              </span>
            )}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              Free
            </span>
          </div>
          <BookmarkButton resource={resource} />
        </div>

        {/* Title */}
        <h4 className="text-sm md:text-base font-bold text-[#172033] dark:text-[#F8FAFC] group-hover:text-[#4F8FEF] transition-colors line-clamp-2 mb-1.5 leading-snug">
          <Link to={`/resources/${resource._id}`}>{resource.title}</Link>
        </h4>

        {/* Subject & Branch Meta */}
        <p className="text-xs text-[#64748B] dark:text-[#9AA6BC] font-medium mb-3 truncate flex items-center">
          <BookOpen className="w-3.5 h-3.5 mr-1 text-[#4F8FEF]" />
          {subjectName} • <span className="ml-1 text-[#172033] dark:text-[#F8FAFC] font-semibold">{branchName} Sem {semNum}</span>
        </p>

        {/* Description */}
        {resource.description && (
          <p className="text-xs text-[#64748B] dark:text-[#9AA6BC] line-clamp-2 leading-relaxed mb-4">
            {resource.description}
          </p>
        )}
      </div>

      {/* Footer Stats & Actions */}
      <div className="pt-3 border-t border-[#DCE2EC] dark:border-[#252D42] flex items-center justify-between text-xs text-[#64748B] dark:text-[#9AA6BC]">
        <div className="flex items-center space-x-3">
          <span className="flex items-center" title="Views">
            <Eye className="w-3.5 h-3.5 mr-1 text-[#64748B] dark:text-[#9AA6BC]" /> {resource.views || 0}
          </span>
          <span className="flex items-center" title="Downloads">
            <Download className="w-3.5 h-3.5 mr-1 text-[#64748B] dark:text-[#9AA6BC]" /> {resource.downloads || 0}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to={`/resources/${resource._id}/read`}
            className="px-3.5 py-1.5 bg-[#4F8FEF] hover:bg-[#3D7FE5] text-white font-bold rounded-lg transition-colors text-xs flex items-center shadow-subtle"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Read PDF
          </Link>
        </div>
      </div>
    </div>
  );
}
