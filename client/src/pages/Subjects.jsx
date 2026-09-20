import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SubjectCard from '../components/SubjectCard';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/SkeletonLoader';
import { subjectService } from '../services/api';
import { BookOpen, GraduationCap, Layers } from 'lucide-react';

export default function Subjects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialFilters = {
    academicYear: searchParams.get('academicYear') || searchParams.get('year') || '',
    q: searchParams.get('q') || '',
  };

  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const params = {};
        if (filters.academicYear && filters.academicYear !== 'all') {
          params.academicYear = filters.academicYear;
        }
        if (filters.q) params.q = filters.q;

        const res = await subjectService.getAll(params);
        if (res.success) setSubjects(res.data || []);
      } catch (err) {
        console.error('Fetch subjects error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({ academicYear: '', q: '' });
    setSearchParams({});
  };

  const academicYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const isFiltered = Boolean(filters.academicYear || filters.q);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-900 dark:text-[#F8FAFC]">
      {/* Header Banner */}
      <div className="tech-card p-6 sm:p-8 tech-grid-pattern relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight">
            Academic Engineering Subjects
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] mt-1">
            Organized year-wise — Course codes, syllabus units, lecture notes, and exam papers
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-[#0B0F19] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E293B] self-start md:self-auto text-xs font-mono font-bold">
          <Layers className="w-4 h-4 text-[#4F46E5] dark:text-[#38BDF8]" />
          <span className="text-slate-900 dark:text-[#F8FAFC]">
            {subjects.length} Subjects Available
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        showTypeFilter={false}
      />

      {/* Content */}
      {loading ? (
        <CardSkeleton count={9} />
      ) : subjects.length === 0 ? (
        <EmptyState
          title="No subjects available yet."
          message="No engineering subjects were found matching your criteria in the database."
          actionLabel="Clear Filters"
          onAction={handleReset}
        />
      ) : isFiltered ? (
        /* Flat Grid when search or explicit year filter is active */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((subj) => (
            <SubjectCard key={subj._id} subject={subj} />
          ))}
        </div>
      ) : (
        /* Year-Wise Sections */
        <div className="space-y-10">
          {academicYears.map((year) => {
            const yearSubjects = subjects.filter((s) => s.academicYear === year);
            if (yearSubjects.length === 0) return null;

            return (
              <div key={year} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E293B] pb-2.5">
                  <div className="flex items-center space-x-2.5">
                    <GraduationCap className="w-5 h-5 text-[#4F46E5] dark:text-[#38BDF8]" />
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#F8FAFC]">
                      {year}
                    </h2>
                    <span className="tech-badge tech-badge-purple">
                      {yearSubjects.length} {yearSubjects.length === 1 ? 'Subject' : 'Subjects'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {yearSubjects.map((subj) => (
                    <SubjectCard key={subj._id} subject={subj} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
