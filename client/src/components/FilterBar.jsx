import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

export default function FilterBar({
  filters,
  onChange,
  onReset,
  subjects = [],
  units = [],
  showTypeFilter = true,
  showUnitFilter = false,
  showSubjectTypeFilter = false,
}) {
  // Dynamically filter subjects by selected Academic Year
  const filteredSubjects = React.useMemo(() => {
    if (!filters?.academicYear || filters.academicYear === 'all' || filters.academicYear === '') {
      return subjects;
    }
    return subjects.filter((s) => s.academicYear === filters.academicYear);
  }, [subjects, filters?.academicYear]);

  const handleYearChange = (e) => {
    const newYear = e.target.value;
    onChange('academicYear', newYear);

    // If currently selected subject doesn't belong to the newly selected year, reset subjectId
    if (filters.subjectId) {
      const currentSubj = subjects.find((s) => s._id === filters.subjectId);
      if (currentSubj && newYear && newYear !== 'all' && currentSubj.academicYear !== newYear) {
        onChange('subjectId', '');
      }
    }
  };

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
              <option value="" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">
                {filters?.academicYear && filters.academicYear !== 'all' ? `All ${filters.academicYear} Subjects` : 'All Subjects'}
              </option>
              {filteredSubjects.map((s) => (
                <option key={s._id} value={s._id} className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">
                  {s.name}
                </option>
              ))}
            </select>
          )}

          {/* Unit Filter */}
          {(showUnitFilter || filters.unitId !== undefined || units.length > 0) && (
            <select
              value={filters.unitId || ''}
              onChange={(e) => onChange('unitId', e.target.value)}
              className="px-3 py-2 text-xs font-mono font-bold bg-slate-50 dark:bg-[#070A12] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none text-slate-900 dark:text-[#F8FAFC] max-w-[180px] truncate"
            >
              <option value="" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">
                All Units
              </option>
              {units.length > 0 ? (
                units.map((u) => (
                  <option key={u._id} value={u._id} className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">
                    Unit {u.unitNumber}: {u.title}
                  </option>
                ))
              ) : (
                <>
                  <option value="1" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">Unit 1</option>
                  <option value="2" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">Unit 2</option>
                  <option value="3" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">Unit 3</option>
                  <option value="4" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">Unit 4</option>
                  <option value="5" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">Unit 5</option>
                </>
              )}
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
              <option value="pyq" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">PYQs (Past Papers)</option>
              <option value="syllabus" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">Syllabus</option>
            </select>
          )}

          {/* Academic Year Filter */}
          {filters.academicYear !== undefined && (
            <select
              value={filters.academicYear || ''}
              onChange={handleYearChange}
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
