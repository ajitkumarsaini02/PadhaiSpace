import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

export default function FilterBar({
  filters,
  onChange,
  onReset,
  branches = [],
  subjects = [],
  showTypeFilter = true,
  showSubjectTypeFilter = false,
}) {
  return (
    <div className="bg-white dark:bg-[#111729] rounded-xl p-4 border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-[#64748B] dark:text-[#9AA6BC] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.q || ''}
            onChange={(e) => onChange('q', e.target.value)}
            placeholder="Search subjects, codes..."
            className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg focus:outline-none focus:border-[#4F8FEF] text-[#172033] dark:text-[#F8FAFC]"
          />
        </div>

        {/* Dropdown Selects */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">

          {/* Branch Filter */}
          <select
            value={filters.branchId || ''}
            onChange={(e) => onChange('branchId', e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg focus:outline-none text-[#172033] dark:text-[#F8FAFC]"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Semester Filter */}
          <select
            value={filters.semesterNumber || ''}
            onChange={(e) => onChange('semesterNumber', e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg focus:outline-none text-[#172033] dark:text-[#F8FAFC]"
          >
            <option value="">All Semesters (1 - 8)</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>

          {/* Subject Type Filter (Theory/Lab/Elective/Other) */}
          {showSubjectTypeFilter && (
            <select
              value={filters.subjectType || filters.type || ''}
              onChange={(e) => {
                onChange('subjectType', e.target.value);
                onChange('type', e.target.value);
              }}
              className="px-3 py-2 text-xs font-medium bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg focus:outline-none text-[#172033] dark:text-[#F8FAFC]"
            >
              <option value="">All Subject Types</option>
              <option value="theory">Theory Subjects</option>
              <option value="lab">Lab Courses</option>
              <option value="elective">Elective Subjects</option>
              <option value="other">Common & Other Subjects</option>
            </select>
          )}

          {/* Subject Filter (if array provided) */}
          {subjects.length > 0 && (
            <select
              value={filters.subjectId || ''}
              onChange={(e) => onChange('subjectId', e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg focus:outline-none text-[#172033] dark:text-[#F8FAFC] max-w-[180px] truncate"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
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
              className="px-3 py-2 text-xs font-medium bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg focus:outline-none text-[#172033] dark:text-[#F8FAFC]"
            >
              <option value="">All Resource Types</option>
              <option value="notes">Semester Notes</option>
              <option value="pdf">Unit PDFs</option>
              <option value="pyq">PYQs (Past Papers)</option>
              <option value="syllabus">Syllabus</option>
              <option value="exam-resource">Exam Resources</option>
            </select>
          )}

          {/* Reset Button */}
          {onReset && (
            <button
              onClick={onReset}
              className="p-2 text-[#64748B] dark:text-[#9AA6BC] hover:text-[#172033] dark:hover:text-white hover:bg-[#F5F7FB] dark:hover:bg-[#161D31] rounded-lg transition-colors"
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
