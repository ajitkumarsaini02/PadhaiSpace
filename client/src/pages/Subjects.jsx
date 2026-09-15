import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SubjectCard from '../components/SubjectCard';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/SkeletonLoader';
import { subjectService, branchService } from '../services/api';
import { GraduationCap, Layers, Sparkles, BookOpen, FlaskConical, Award } from 'lucide-react';

export default function Subjects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [subjects, setSubjects] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialFilters = {
    branchId: searchParams.get('branchId') || searchParams.get('branch') || '',
    semesterNumber: searchParams.get('semesterNumber') || '',
    subjectType: searchParams.get('subjectType') || searchParams.get('type') || '',
    q: searchParams.get('q') || '',
  };

  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const bRes = await branchService.getAll();
        if (bRes.success) setBranches(bRes.data);
      } catch (err) {
        console.error('Fetch metadata error:', err);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const params = {};
        if (filters.branchId) params.branchId = filters.branchId;
        if (filters.semesterNumber) params.semesterNumber = filters.semesterNumber;
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
    setFilters({ branchId: '', semesterNumber: '', subjectType: '', q: '' });
    setSearchParams({});
  };

  const selectedSem = Number(filters.semesterNumber);

  // Group subjects by Core vs Electives vs Labs for Semesters 5-8
  const coreSubjects = subjects.filter((s) => (s.subjectType || s.type || '').toLowerCase() === 'theory');
  const electiveSubjects = subjects.filter((s) => (s.subjectType || s.type || '').toLowerCase() === 'elective');
  const labSubjects = subjects.filter((s) => (s.subjectType || s.type || '').toLowerCase() === 'lab');
  const otherSubjects = subjects.filter((s) => (s.subjectType || s.type || '').toLowerCase() === 'other');

  const showGroupedSections = selectedSem >= 5 && !filters.subjectType && !filters.q;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0B1020] border border-[#252D42] rounded-xl p-6 sm:p-8 text-[#F8FAFC] shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#161D31] text-[#F2A93B] border border-[#252D42] text-xs font-bold mb-2">
            <GraduationCap className="w-4 h-4 text-[#F2A93B]" />
            <span>B.Tech Engineering Curriculum</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-[#F8FAFC] tracking-tight">
            Computer Science & Engineering (CSE)
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA6BC] mt-1">
            Official semester-wise curriculum, course codes, syllabus units, notes & PYQs (Semesters 1 to 8)
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-[#161D31] px-4 py-2.5 rounded-lg border border-[#252D42] self-start md:self-auto text-xs">
          <Layers className="w-4 h-4 text-[#4F8FEF]" />
          <span className="font-bold text-[#F8FAFC]">
            {subjects.length} Engineering Subjects
          </span>
        </div>
      </div>

      {/* Semester Selection Tabs (Semester 1 to Semester 8) */}
      <div className="bg-white dark:bg-[#111729] rounded-xl p-3 border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle">
        <div className="text-[11px] font-bold text-[#64748B] dark:text-[#9AA6BC] uppercase tracking-wider mb-2 px-1">
          Select Semester:
        </div>
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => handleFilterChange('semesterNumber', '')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              !filters.semesterNumber
                ? 'bg-[#0B1020] text-white shadow-subtle'
                : 'bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] hover:bg-[#EFF5FF] border border-[#DCE2EC] dark:border-[#252D42]'
            }`}
          >
            All Semesters (1–8)
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
            <button
              key={sem}
              onClick={() => handleFilterChange('semesterNumber', String(sem))}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filters.semesterNumber === String(sem)
                  ? 'bg-[#4F8FEF] text-white shadow-subtle'
                  : 'bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] hover:bg-[#EFF5FF] border border-[#DCE2EC] dark:border-[#252D42]'
              }`}
            >
              Semester {sem}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        branches={branches}
        showTypeFilter={false}
        showSubjectTypeFilter={true}
      />

      {/* Content */}
      {loading ? (
        <CardSkeleton count={9} />
      ) : subjects.length === 0 ? (
        <EmptyState
          title="No CSE subjects found"
          message="Try selecting another semester or subject type filter."
          actionLabel="Clear Filters"
          onAction={handleReset}
        />
      ) : showGroupedSections ? (
        /* Sectioned Layout for Semesters 5-8: Core vs Electives vs Labs */
        <div className="space-y-10">
          {/* Core Subjects Section */}
          {coreSubjects.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#DCE2EC] dark:border-[#252D42] pb-2">
                <BookOpen className="w-5 h-5 text-[#4F8FEF]" />
                <h2 className="text-lg font-bold text-[#172033] dark:text-[#F8FAFC]">
                  Core Subjects (Semester {selectedSem})
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#EFF5FF] dark:bg-[#161D31] text-[#4F8FEF] text-xs font-bold border border-[#DCE2EC] dark:border-[#252D42]">
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

          {/* Departmental & Open Elective Subjects Section */}
          {electiveSubjects.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#DCE2EC] dark:border-[#252D42] pb-2">
                <Sparkles className="w-5 h-5 text-[#4F8FEF]" />
                <h2 className="text-lg font-bold text-[#172033] dark:text-[#F8FAFC]">
                  Elective Subjects (Departmental & Open Electives)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#EFF5FF] dark:bg-[#161D31] text-[#4F8FEF] text-xs font-bold border border-[#DCE2EC] dark:border-[#252D42]">
                  {electiveSubjects.length}
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#9AA6BC] -mt-2">
                Individual elective options available for selection in Semester {selectedSem}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {electiveSubjects.map((subj) => (
                  <SubjectCard key={subj._id} subject={subj} />
                ))}
              </div>
            </div>
          )}

          {/* Practical & Lab Courses Section */}
          {labSubjects.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#DCE2EC] dark:border-[#252D42] pb-2">
                <FlaskConical className="w-5 h-5 text-[#36B37E]" />
                <h2 className="text-lg font-bold text-[#172033] dark:text-[#F8FAFC]">
                  Practical & Laboratory Courses
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#36B37E]/10 text-[#36B37E] text-xs font-bold border border-[#36B37E]/30">
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

          {/* Common & Other Courses Section */}
          {otherSubjects.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#DCE2EC] dark:border-[#252D42] pb-2">
                <Award className="w-5 h-5 text-[#F2A93B]" />
                <h2 className="text-lg font-bold text-[#172033] dark:text-[#F8FAFC]">
                  Common & Traditional Knowledge Courses
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#F2A93B]/10 text-[#F2A93B] text-xs font-bold border border-[#F2A93B]/30">
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
        /* Normal Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((subj) => (
            <SubjectCard key={subj._id} subject={subj} />
          ))}
        </div>
      )}
    </div>
  );
}
