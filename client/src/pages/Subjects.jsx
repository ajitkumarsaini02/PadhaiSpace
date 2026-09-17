import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SubjectCard from '../components/SubjectCard';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/SkeletonLoader';
import { subjectService } from '../services/api';
import { GraduationCap, Layers, BookOpen, FlaskConical, Sparkles, Award } from 'lucide-react';

export default function Subjects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialFilters = {
    subjectType: searchParams.get('subjectType') || searchParams.get('type') || '',
    q: searchParams.get('q') || '',
  };

  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const params = {};
        if (filters.subjectType) params.subjectType = filters.subjectType;
        if (filters.q) params.q = filters.q;

        const res = await subjectService.getAll(params);
        if (res.success) setSubjects(res.data);
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
    setFilters({ subjectType: '', q: '' });
    setSearchParams({});
  };

  const coreSubjects = subjects.filter((s) => (s.subjectType || s.type || '').toLowerCase() === 'theory');
  const electiveSubjects = subjects.filter((s) => (s.subjectType || s.type || '').toLowerCase() === 'elective');
  const labSubjects = subjects.filter((s) => (s.subjectType || s.type || '').toLowerCase() === 'lab');
  const otherSubjects = subjects.filter((s) => (s.subjectType || s.type || '').toLowerCase() === 'other');

  const showGroupedSections = !filters.subjectType && !filters.q;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-900 dark:text-[#F8FAFC]">
      {/* Header Banner */}
      <div className="tech-card p-6 sm:p-8 tech-grid-pattern relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight">
            Academic Subjects
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] mt-1">
            Course codes, syllabus units, lecture notes, and previous year question papers
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
        showSubjectTypeFilter={true}
      />

      {/* Content */}
      {loading ? (
        <CardSkeleton count={9} />
      ) : subjects.length === 0 ? (
        <EmptyState
          title="No subjects found"
          message="Try adjusting your search query or subject type filter."
          actionLabel="Clear Filters"
          onAction={handleReset}
        />
      ) : showGroupedSections ? (
        <div className="space-y-10">
          {/* Core Theory Subjects */}
          {coreSubjects.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-[#1E293B] pb-2">
                <BookOpen className="w-5 h-5 text-[#4F46E5] dark:text-[#38BDF8]" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
                  Core Theory Subjects
                </h2>
                <span className="tech-badge tech-badge-blue">
                  {coreSubjects.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {coreSubjects.map((subj) => (
                  <SubjectCard key={subj._id} subject={subj} />
                ))}
              </div>
            </div>
          )}

          {/* Elective Subjects */}
          {electiveSubjects.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-[#1E293B] pb-2">
                <Sparkles className="w-5 h-5 text-[#2563EB] dark:text-[#C084FC]" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
                  Elective Subjects
                </h2>
                <span className="tech-badge tech-badge-purple">
                  {electiveSubjects.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {electiveSubjects.map((subj) => (
                  <SubjectCard key={subj._id} subject={subj} />
                ))}
              </div>
            </div>
          )}

          {/* Lab Courses */}
          {labSubjects.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-[#1E293B] pb-2">
                <FlaskConical className="w-5 h-5 text-[#16A34A] dark:text-[#34D399]" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
                  Practical & Laboratory Courses
                </h2>
                <span className="tech-badge tech-badge-green">
                  {labSubjects.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {labSubjects.map((subj) => (
                  <SubjectCard key={subj._id} subject={subj} />
                ))}
              </div>
            </div>
          )}

          {/* Other Courses */}
          {otherSubjects.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-[#1E293B] pb-2">
                <Award className="w-5 h-5 text-[#F59E0B]" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
                  Common & Other Subjects
                </h2>
                <span className="tech-badge tech-badge-cyan">
                  {otherSubjects.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {otherSubjects.map((subj) => (
                  <SubjectCard key={subj._id} subject={subj} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((subj) => (
            <SubjectCard key={subj._id} subject={subj} />
          ))}
        </div>
      )}
    </div>
  );
}
