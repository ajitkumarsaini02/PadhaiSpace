import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

export default function FilterBar({
  filters,
  onChange,
  onReset,
  subjects = [],
  units = [],
  sources = [],
  showTypeFilter = true,
  showUnitFilter = false,
  showSubjectTypeFilter = false,
  showSourceFilter = true,
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

  const [localSearch, setLocalSearch] = React.useState(filters.q || '');

  React.useEffect(() => {
    setLocalSearch(filters.q || '');
  }, [filters.q]);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if ((filters.q || '') !== localSearch) {
        onChange('q', localSearch);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch]);

  return (
    <div className="tech-card p-4 mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search subjects, resources..."
            className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-slate-50 dark:bg-[#070A12] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none focus:border-[#4F46E5] dark:focus:border-[#38BDF8] text-slate-900 dark:text-[#F8FAFC] font-mono"
          />
        </div>

        {/* Dropdown Selects */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* 1. Source Filter */}
          {showSourceFilter && (filters.source !== undefined || showSourceFilter) && (
            <select
              value={filters.source || ''}
              onChange={(e) => onChange('source', e.target.value)}
              className="px-3 py-2 text-xs font-mono font-bold bg-slate-50 dark:bg-[#070A12] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none text-slate-900 dark:text-[#F8FAFC] max-w-[180px] truncate"
            >
              <option value="" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">
                All Sources
              </option>
              {sources && sources.length > 0 ? (
                sources.map((s) => {
                  const val = typeof s === 'string' ? s : (s.id || s.name);
                  const label = typeof s === 'string' ? s : (s.name || s.id);
                  const count = typeof s === 'object' && s.count !== undefined ? ` (${s.count})` : '';
                  return (
                    <option key={val} value={val} className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">
                      {label}{count}
                    </option>
                  );
                })
              ) : (
                <>
                  <option value="gateway-classes" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">Gateway Classes</option>
                  <option value="edushine-classes" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">EduShine Classes</option>
                  <option value="multi-atom" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">Multi Atom</option>
                  <option value="other-notes" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">Other Notes</option>
                </>
              )}
            </select>
          )}

          {/* 2. Academic Year Filter */}
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

          {/* 3. Subject Filter */}
          <select
            value={filters.subjectId || ''}
            onChange={(e) => onChange('subjectId', e.target.value)}
            disabled={subjects.length === 0}
            className="px-3 py-2 text-xs font-mono font-bold bg-slate-50 dark:bg-[#070A12] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none text-slate-900 dark:text-[#F8FAFC] max-w-[200px] truncate disabled:opacity-60"
          >
            <option value="" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">
              {subjects.length === 0
                ? 'All Subjects'
                : filters?.academicYear && filters.academicYear !== 'all'
                ? `All ${filters.academicYear} Subjects`
                : 'All Subjects'}
            </option>
            {filteredSubjects.map((s) => (
              <option key={s._id} value={s._id} className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">
                {s.name}
              </option>
            ))}
          </select>

          {/* 4. Unit Filter */}
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

          {/* 5. Paper Year Filter */}
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

          {/* 6. Resource Type Filter */}
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
