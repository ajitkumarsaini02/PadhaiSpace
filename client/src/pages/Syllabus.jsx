import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';
import PDFViewerModal from '../components/PDFViewerModal';
import Pagination from '../components/Pagination';
import { CardSkeleton } from '../components/SkeletonLoader';
import { resourceService, subjectService } from '../services/api';
import { BookOpenCheck, Calendar, RefreshCw, AlertTriangle, Check, Layers } from 'lucide-react';

export default function Syllabus() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [syllabusList, setSyllabusList] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePDF, setActivePDF] = useState(null);

  // Read initial page from URL param to preserve state on back navigation
  const initialPage = parseInt(searchParams.get('page'), 10) || 1;
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Active Selections
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(searchParams.get('academicYear') || '');
  const [filters, setFilters] = useState({
    subjectId: searchParams.get('subjectId') || '',
    q: searchParams.get('q') || '',
    sort: 'newest',
  });

  const updateUrlParams = (acadYear, newFilters, newPage) => {
    const params = new URLSearchParams();
    if (newPage > 1) params.set('page', String(newPage));
    if (acadYear) params.set('academicYear', acadYear);
    if (newFilters.subjectId) params.set('subjectId', newFilters.subjectId);
    if (newFilters.q) params.set('q', newFilters.q);

    setSearchParams(params, { replace: true });
  };

  // 1. Fetch available Subjects
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const sRes = await subjectService.getAll();
        if (sRes.success) setSubjects(sRes.data || []);
      } catch (err) {
        console.warn('Metadata fetch warning:', err.message);
      }
    };
    fetchMetadata();
  }, []);

  // 2. Fetch Syllabus items from MongoDB
  const fetchSyllabus = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        type: 'syllabus',
        page,
        limit: 12,
      };

      if (selectedAcademicYear) params.academicYear = selectedAcademicYear;
      if (filters.subjectId) params.subjectId = filters.subjectId;
      if (filters.q) params.q = filters.q;
      if (filters.sort) params.sort = filters.sort;

      const res = await resourceService.getAll(params);
      if (res.success) {
        setSyllabusList(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.count || 0);
      } else {
        setError(res.message || 'Unable to load syllabus documents.');
      }
    } catch (err) {
      console.error('Fetch syllabus error:', err);
      setError(err.message || 'Unable to load syllabus documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyllabus();
  }, [selectedAcademicYear, filters, page]);

  const handleAcademicYearClick = (year) => {
    const newYear = selectedAcademicYear === year ? '' : year;
    setSelectedAcademicYear(newYear);
    setPage(1);
    updateUrlParams(newYear, filters, 1);
  };

  const handleFilterChange = (key, value) => {
    const newPage = 1;
    if (key === 'academicYear') {
      setSelectedAcademicYear(value);
      setPage(newPage);
      updateUrlParams(value, filters, newPage);
    } else {
      const newFilters = { ...filters, [key]: value };
      setPage(newPage);
      setFilters(newFilters);
      updateUrlParams(selectedAcademicYear, newFilters, newPage);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateUrlParams(selectedAcademicYear, filters, newPage);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleReset = () => {
    const defaultFilters = { subjectId: '', q: '', sort: 'newest' };
    setPage(1);
    setSelectedAcademicYear('');
    setFilters(defaultFilters);
    updateUrlParams('', defaultFilters, 1);
  };

  const academicYearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900 dark:text-[#F8FAFC]">
      {/* HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/90 via-slate-900 to-black p-8 sm:p-10 border border-emerald-500/20 shadow-2xl">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold">
            <BookOpenCheck className="w-3.5 h-3.5" />
            <span>Official Curriculum Repository</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Engineering Syllabus & Course Structure
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Access official year-wise engineering syllabi, course structures, credit distribution, and subject curriculum.
          </p>
        </div>
      </div>

      {/* ACADEMIC YEAR SELECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] uppercase tracking-wider flex items-center font-mono">
            <Calendar className="w-4 h-4 text-[#059669] dark:text-[#34D399] mr-2" />
            Select Academic Year
          </h2>
          {selectedAcademicYear && (
            <span className="text-xs font-mono font-bold text-[#059669] dark:text-[#34D399]">
              Selected: {selectedAcademicYear}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setPage(1);
              setSelectedAcademicYear('');
              updateUrlParams('', filters, 1);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              selectedAcademicYear === ''
                ? 'bg-[#059669] dark:bg-[#10B981] text-white shadow-md border border-emerald-300 dark:border-[#34D399]/40'
                : 'bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-[#94A3B8] hover:bg-slate-200 dark:hover:bg-[#334155]'
            }`}
          >
            All Academic Years
          </button>
          {academicYearOptions.map((year) => (
            <button
              key={year}
              onClick={() => handleAcademicYearClick(year)}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                selectedAcademicYear === year
                  ? 'bg-[#059669] dark:bg-[#10B981] text-white shadow-md border border-emerald-300 dark:border-[#34D399]/40'
                  : 'bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-[#94A3B8] hover:bg-slate-200 dark:hover:bg-[#334155]'
              }`}
            >
              {selectedAcademicYear === year && <Check className="w-3.5 h-3.5" />}
              <span>{year}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FILTER BAR */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
            Syllabus Documents ({totalCount})
          </h2>
        </div>

        <FilterBar
          filters={{
            ...filters,
            academicYear: selectedAcademicYear,
          }}
          onChange={handleFilterChange}
          onReset={handleReset}
          subjects={subjects}
          showTypeFilter={false}
        />
      </div>

      {/* ERROR STATE */}
      {error ? (
        <div className="tech-card p-8 text-center space-y-4 max-w-lg mx-auto">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">Unable to load syllabus documents</h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono">{error}</p>
          </div>
          <button
            onClick={fetchSyllabus}
            className="px-4 py-2 bg-[#059669] dark:bg-[#10B981] text-white text-xs font-mono font-bold rounded-xl flex items-center justify-center mx-auto space-x-2 shadow-md cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : loading ? (
        <CardSkeleton count={6} />
      ) : syllabusList.length === 0 ? (
        <EmptyState
          title="No syllabus available yet."
          message="No syllabus documents matched your selected criteria."
          actionLabel="Reset Filters"
          onAction={handleReset}
        />
      ) : (
        <>
          {/* SYLLABUS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {syllabusList.map((item) => (
              <ResourceCard
                key={item._id}
                resource={item}
                onOpenPDF={(r) => setActivePDF(r)}
              />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={handlePageChange}
            itemLabel="syllabus documents"
          />
        </>
      )}

      {activePDF && (
        <PDFViewerModal resource={activePDF} onClose={() => setActivePDF(null)} />
      )}
    </div>
  );
}
