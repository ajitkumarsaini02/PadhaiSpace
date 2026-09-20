import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';
import PDFViewerModal from '../components/PDFViewerModal';
import Pagination from '../components/Pagination';
import { CardSkeleton } from '../components/SkeletonLoader';
import { resourceService, subjectService } from '../services/api';
import { ArrowLeft, Layers, RefreshCw, AlertTriangle, Calendar } from 'lucide-react';

const SOURCE_NAMES = {
  'gateway-classes': 'Gateway Classes',
  'edushine-classes': 'EduShine Classes',
  'multi-atom': 'Multi Atom',
  'other-notes': 'Other Notes',
};

export default function NotesSource() {
  const { sourceSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const sourceName = SOURCE_NAMES[sourceSlug] || sourceSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [loadingYears, setLoadingYears] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePDF, setActivePDF] = useState(null);

  // Read initial page from URL param to preserve state on back navigation
  const initialPage = parseInt(searchParams.get('page'), 10) || 1;
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedYear, setSelectedYear] = useState(searchParams.get('academicYear') || '');
  const [filters, setFilters] = useState({
    subjectId: searchParams.get('subjectId') || '',
    type: 'notes',
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

  // 1. Fetch available academic years dynamically from MongoDB for this source
  const fetchAvailableYears = async () => {
    try {
      setLoadingYears(true);
      const res = await resourceService.getAcademicYears({
        source: sourceSlug,
        type: 'notes',
      });
      if (res.success && Array.isArray(res.data)) {
        setAvailableYears(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch available academic years:', err.message);
    } finally {
      setLoadingYears(false);
    }
  };

  // 2. Fetch subjects & metadata
  const fetchSubjects = async () => {
    try {
      const sRes = await subjectService.getAll();
      if (sRes.success) setSubjects(sRes.data);
    } catch (err) {
      console.warn('Failed to fetch subjects:', err.message);
    }
  };

  // 3. Fetch resources matching source, academicYear, subject, unit, etc.
  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        source: sourceSlug,
        type: filters.type || 'notes',
        page,
        limit: 12,
      };

      if (selectedYear) params.academicYear = selectedYear;
      if (filters.subjectId) params.subjectId = filters.subjectId;
      if (filters.q) params.q = filters.q;
      if (filters.sort) params.sort = filters.sort;

      const res = await resourceService.getAll(params);
      if (res.success) {
        setNotes(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.count || 0);
      } else {
        setError(res.message || 'Unable to load resources. Please try again.');
      }
    } catch (err) {
      console.error('Notes source fetch error:', err);
      setError(err.message || 'Unable to load resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableYears();
    fetchSubjects();
  }, [sourceSlug]);

  useEffect(() => {
    fetchNotes();
  }, [sourceSlug, selectedYear, filters, page]);

  const handleYearSelect = (year) => {
    const newYr = selectedYear === year ? '' : year;
    setSelectedYear(newYr);
    setPage(1);
    updateUrlParams(newYr, filters, 1);
  };

  const handleFilterChange = (key, value) => {
    const newPage = 1;
    const newFilters = { ...filters, [key]: value };
    setPage(newPage);
    setFilters(newFilters);
    updateUrlParams(selectedYear, newFilters, newPage);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateUrlParams(selectedYear, filters, newPage);
    window.scrollTo({ top: 250, behavior: 'smooth' });
  };

  const handleReset = () => {
    const defaultFilters = { subjectId: '', type: 'notes', q: '', sort: 'newest' };
    setPage(1);
    setSelectedYear('');
    setFilters(defaultFilters);
    updateUrlParams('', defaultFilters, 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900 dark:text-[#F8FAFC]">
      {/* SOURCE HEADER */}
      <div className="space-y-4">
        <Link
          to="/notes"
          className="inline-flex items-center text-xs font-mono font-bold text-[#4F46E5] dark:text-[#38BDF8] hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to All Notes
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-[#1E293B] pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#38BDF8] border border-indigo-200 dark:border-indigo-800 text-xs font-mono font-bold mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Notes Provider</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              {sourceName} Notes
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] mt-1">
              Showing verified engineering resources provided by {sourceName}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#1E293B] text-xs font-mono font-bold text-slate-700 dark:text-[#F8FAFC]">
              {totalCount} {totalCount === 1 ? 'Resource' : 'Resources'}
            </span>
          </div>
        </div>
      </div>

      {/* DYNAMIC ACADEMIC YEAR SELECTOR */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] uppercase tracking-wider flex items-center">
            <Calendar className="w-4 h-4 text-[#4F46E5] dark:text-[#38BDF8] mr-2" />
            Browse by Academic Year
          </h2>
          <span className="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8]">
            Dynamic Database Filter
          </span>
        </div>

        {loadingYears ? (
          <div className="flex items-center space-x-2 py-2 text-xs font-mono text-slate-500">
            <span>Checking available academic years...</span>
          </div>
        ) : availableYears.length === 0 ? (
          <p className="text-xs font-mono text-slate-500 dark:text-[#94A3B8] italic">
            No distinct academic years indexed for this source yet.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setPage(1);
                setSelectedYear('');
                updateUrlParams('', filters, 1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedYear === ''
                  ? 'bg-[#4F46E5] dark:bg-[#2563EB] text-white shadow-md border border-indigo-300 dark:border-[#38BDF8]/40'
                  : 'bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-[#94A3B8] hover:bg-slate-200 dark:hover:bg-[#334155]'
              }`}
            >
              All Academic Years
            </button>
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => handleYearSelect(year)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedYear === year
                    ? 'bg-[#4F46E5] dark:bg-[#2563EB] text-white shadow-md border border-indigo-300 dark:border-[#38BDF8]/40'
                    : 'bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-[#94A3B8] hover:bg-slate-200 dark:hover:bg-[#334155]'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FILTER BAR */}
      <FilterBar
        filters={{ ...filters, academicYear: selectedYear }}
        onChange={handleFilterChange}
        onReset={handleReset}
        subjects={subjects}
        showTypeFilter={true}
      />

      {/* ERROR STATE */}
      {error ? (
        <div className="tech-card p-8 text-center space-y-4 max-w-lg mx-auto">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">Unable to load resources</h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono">{error}</p>
          </div>
          <button
            onClick={fetchNotes}
            className="px-4 py-2 bg-[#4F46E5] dark:bg-[#2563EB] text-white text-xs font-mono font-bold rounded-xl flex items-center justify-center mx-auto space-x-2 shadow-md cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : loading ? (
        <CardSkeleton count={6} />
      ) : notes.length === 0 ? (
        <EmptyState
          title="No resources available yet."
          message={`No notes found for ${sourceName} ${selectedYear ? `(${selectedYear})` : ''}.`}
          actionLabel="Reset Filters"
          onAction={handleReset}
        />
      ) : (
        <>
          {/* NOTES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {notes.map((note) => (
              <ResourceCard
                key={note._id}
                resource={note}
                onOpenPDF={(r) => setActivePDF(r)}
              />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={handlePageChange}
            itemLabel="notes"
          />
        </>
      )}

      {activePDF && (
        <PDFViewerModal resource={activePDF} onClose={() => setActivePDF(null)} />
      )}
    </div>
  );
}
