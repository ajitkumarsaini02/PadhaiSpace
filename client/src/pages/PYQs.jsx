import React, { useEffect, useState } from 'react';
import ResourceCard from '../components/ResourceCard';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';
import PDFViewerModal from '../components/PDFViewerModal';
import { CardSkeleton } from '../components/SkeletonLoader';
import { resourceService, subjectService } from '../services/api';
import { FileText, Calendar, BookOpen, RefreshCw, AlertTriangle, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export default function PYQs() {
  const [pyqs, setPyqs] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [availablePaperYears, setAvailablePaperYears] = useState([]);
  const [loadingPaperYears, setLoadingPaperYears] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePDF, setActivePDF] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Active Selections for Flow: Academic Year -> Paper Year -> Subject
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedPaperYear, setSelectedPaperYear] = useState('');
  const [filters, setFilters] = useState({
    subjectId: '',
    source: '',
    q: '',
    sort: 'newest',
  });

  // 1. Fetch available Subjects having PYQs or All subjects
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const sRes = await subjectService.getAll();
        if (sRes.success) setSubjects(sRes.data);
      } catch (err) {
        console.warn('Metadata fetch warning:', err.message);
      }
    };
    fetchMetadata();
  }, []);

  // 2. Fetch available Paper Years dynamically from MongoDB whenever Academic Year changes
  useEffect(() => {
    const fetchPaperYears = async () => {
      try {
        setLoadingPaperYears(true);
        const params = { type: 'pyq' };
        if (selectedAcademicYear) params.academicYear = selectedAcademicYear;
        if (filters.subjectId) params.subjectId = filters.subjectId;

        const res = await resourceService.getPaperYears(params);
        if (res.success && Array.isArray(res.data)) {
          setAvailablePaperYears(res.data);
          // If selected paper year is no longer available in the new list, clear selection
          if (selectedPaperYear && !res.data.includes(Number(selectedPaperYear))) {
            setSelectedPaperYear('');
          }
        }
      } catch (err) {
        console.warn('Failed to fetch paper years:', err.message);
      } finally {
        setLoadingPaperYears(false);
      }
    };

    fetchPaperYears();
  }, [selectedAcademicYear, filters.subjectId]);

  // 3. Fetch PYQs from MongoDB matching flow selections & filters
  const fetchPYQs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        type: 'pyq',
        page,
        limit: 12,
      };

      if (selectedAcademicYear) params.academicYear = selectedAcademicYear;
      if (selectedPaperYear) params.paperYear = selectedPaperYear;
      if (filters.subjectId) params.subjectId = filters.subjectId;
      if (filters.source) params.source = filters.source;
      if (filters.q) params.q = filters.q;
      if (filters.sort) params.sort = filters.sort;

      const res = await resourceService.getAll(params);
      if (res.success) {
        setPyqs(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.count || 0);
      } else {
        setError(res.message || 'Unable to load PYQs.');
      }
    } catch (err) {
      console.error('Fetch PYQs error:', err);
      setError(err.message || 'Unable to load PYQs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPYQs();
  }, [selectedAcademicYear, selectedPaperYear, filters, page]);

  const handleAcademicYearClick = (year) => {
    setPage(1);
    setSelectedAcademicYear((prev) => (prev === year ? '' : year));
  };

  const handlePaperYearClick = (year) => {
    setPage(1);
    const yrStr = String(year);
    setSelectedPaperYear((prev) => (prev === yrStr ? '' : yrStr));
  };

  const handleFilterChange = (key, value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setPage(1);
    setSelectedAcademicYear('');
    setSelectedPaperYear('');
    setFilters({ subjectId: '', source: '', q: '', sort: 'newest' });
  };

  const academicYearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900 dark:text-[#F8FAFC]">
      {/* HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/90 via-slate-900 to-black p-8 sm:p-10 border border-purple-500/20 shadow-2xl">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-mono font-bold">
            <FileText className="w-3.5 h-3.5" />
            <span>Previous Year Question Papers</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Engineering PYQ Archives
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Access previous end-semester exam question papers organized by Academic Year, Paper Year, and Engineering Subject.
          </p>
        </div>
      </div>

      {/* STEP 1: ACADEMIC YEAR SELECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] uppercase tracking-wider flex items-center">
            <Calendar className="w-4 h-4 text-[#6D28D9] dark:text-[#C084FC] mr-2" />
            1. Select Academic Year (Student Year)
          </h2>
          {selectedAcademicYear && (
            <span className="text-xs font-mono font-bold text-[#6D28D9] dark:text-[#C084FC]">
              Selected: {selectedAcademicYear}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setPage(1);
              setSelectedAcademicYear('');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              selectedAcademicYear === ''
                ? 'bg-[#6D28D9] dark:bg-[#7C3AED] text-white shadow-md border border-purple-300 dark:border-[#C084FC]/40'
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
                  ? 'bg-[#6D28D9] dark:bg-[#7C3AED] text-white shadow-md border border-purple-300 dark:border-[#C084FC]/40'
                  : 'bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-[#94A3B8] hover:bg-slate-200 dark:hover:bg-[#334155]'
              }`}
            >
              {selectedAcademicYear === year && <Check className="w-3.5 h-3.5" />}
              <span>{year}</span>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 2: DYNAMIC PAPER YEAR SELECTION (MONGODB DRIVEN ONLY) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] uppercase tracking-wider flex items-center">
            <FileText className="w-4 h-4 text-[#6D28D9] dark:text-[#C084FC] mr-2" />
            2. Select Question Paper Year
          </h2>
          <span className="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8]">
            Dynamic MongoDB Exam Years
          </span>
        </div>

        {loadingPaperYears ? (
          <div className="py-2 text-xs font-mono text-slate-500">
            Checking available paper years in database...
          </div>
        ) : availablePaperYears.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070A12] border border-slate-200 dark:border-[#1E293B] text-xs font-mono text-slate-500 dark:text-[#94A3B8]">
            No exam paper years indexed in MongoDB {selectedAcademicYear ? `for ${selectedAcademicYear}` : ''}.
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setPage(1);
                setSelectedPaperYear('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedPaperYear === ''
                  ? 'bg-slate-900 dark:bg-[#334155] text-white shadow-md'
                  : 'bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-[#94A3B8] hover:bg-slate-200 dark:hover:bg-[#334155]'
              }`}
            >
              All Paper Years
            </button>
            {availablePaperYears.map((yr) => {
              const yrStr = String(yr);
              return (
                <button
                  key={yr}
                  onClick={() => handlePaperYearClick(yr)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    selectedPaperYear === yrStr
                      ? 'bg-purple-600 dark:bg-purple-700 text-white shadow-md border border-purple-300'
                      : 'bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-[#94A3B8] hover:bg-slate-200 dark:hover:bg-[#334155]'
                  }`}
                >
                  {selectedPaperYear === yrStr && <Check className="w-3.5 h-3.5" />}
                  <span>{yr} Paper</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* FILTER BAR & SEARCH */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
            PYQ Results ({totalCount})
          </h2>
        </div>

        <FilterBar
          filters={{
            ...filters,
            academicYear: selectedAcademicYear,
            paperYear: selectedPaperYear,
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
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">Unable to load PYQs.</h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono">{error}</p>
          </div>
          <button
            onClick={fetchPYQs}
            className="px-4 py-2 bg-[#6D28D9] dark:bg-[#7C3AED] text-white text-xs font-mono font-bold rounded-xl flex items-center justify-center mx-auto space-x-2 shadow-md cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : loading ? (
        <CardSkeleton count={6} />
      ) : pyqs.length === 0 ? (
        <EmptyState
          title="No PYQs available yet."
          message="No question papers found matching your selected Academic Year and Paper Year."
          actionLabel="Reset Filters"
          onAction={handleReset}
        />
      ) : (
        <>
          {/* PYQ GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pyqs.map((paper) => (
              <ResourceCard
                key={paper._id}
                resource={paper}
                onOpenPDF={(r) => setActivePDF(r)}
              />
            ))}
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-[#1E293B]">
              <p className="text-xs font-mono text-slate-500 dark:text-[#94A3B8]">
                Page {page} of {totalPages} ({totalCount} total PYQs)
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-mono font-bold bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-[#F8FAFC] rounded-xl disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-[#334155] transition-colors flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs font-mono font-bold bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-[#F8FAFC] rounded-xl disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-[#334155] transition-colors flex items-center"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {activePDF && (
        <PDFViewerModal resource={activePDF} onClose={() => setActivePDF(null)} />
      )}
    </div>
  );
}
