import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

export default function FilterBar({
  filters,
  onChange,
  onReset,
  subjects = [],
  showTypeFilter = true,
  showSubjectTypeFilter = false,
}) {
  return (
    <div className="tech-card p-4 mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.q || ''}
            onChange={(e) => onChange('q', e.target.value)}
            placeholder="Search subjects, resources..."
            className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-slate-50 dark:bg-[#070A12] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none focus:border-[#4F46E5] dark:focus:border-[#38BDF8] text-slate-900 dark:text-[#F8FAFC] font-mono"
          />
        </div>

        {/* Dropdown Selects */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Subject Filter */}
          {subjects.length > 0 && (
            <select
              value={filters.subjectId || ''}
              onChange={(e) => onChange('subjectId', e.target.value)}
              className="px-3 py-2 text-xs font-mono font-bold bg-slate-50 dark:bg-[#070A12] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none text-slate-900 dark:text-[#F8FAFC] max-w-[200px] truncate"
            >
              <option value="" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">All Subjects</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id} className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">
                  {s.name}
                </option>
              ))}
            </select>
          )}

          {/* Resource Type Filter */}
          {showTypeFilter && (
            <select
              value={filters.type || ''}
              onChange={(e) => onChange('type', e.target.value)}
              className="px-3 py-2 text-xs font-mono font-bold bg-slate-50 dark:bg-[#070A12] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none text-slate-900 dark:text-[#F8FAFC]"
            >
              <option value="" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">All Resource Types</option>
              <option value="notes" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">Study Notes</option>
              <option value="pdf" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">Unit PDFs</option>
              <option value="pyq" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">PYQs (Past Papers)</option>
              <option value="syllabus" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">Syllabus</option>
              <option value="exam-resource" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">Exam Resources</option>
            </select>
          )}

          {/* Academic Year Filter */}
          {filters.academicYear !== undefined && (
            <select
              value={filters.academicYear || ''}
              onChange={(e) => onChange('academicYear', e.target.value)}
              className="px-3 py-2 text-xs font-mono font-bold bg-slate-50 dark:bg-[#070A12] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none text-slate-900 dark:text-[#F8FAFC]"
            >
              <option value="" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">All Years</option>
              <option value="1st Year" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">1st Year</option>
              <option value="2nd Year" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">2nd Year</option>
              <option value="3rd Year" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">3rd Year</option>
              <option value="4th Year" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">4th Year</option>
            </select>
          )}

          {/* Paper Year Filter */}
          {filters.paperYear !== undefined && (
            <select
              value={filters.paperYear || ''}
              onChange={(e) => onChange('paperYear', e.target.value)}
              className="px-3 py-2 text-xs font-mono font-bold bg-slate-50 dark:bg-[#070A12] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none text-slate-900 dark:text-[#F8FAFC]"
            >
              <option value="" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">All Paper Years</option>
              <option value="2026" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">2026</option>
              <option value="2025" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">2025</option>
              <option value="2024" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">2024</option>
              <option value="2023" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">2023</option>
              <option value="2022" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">2022</option>
            </select>
          )}

          {/* Reset Button */}
          {onReset && (
            <button
              onClick={onReset}
              className="p-2 text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-xl transition-colors cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
