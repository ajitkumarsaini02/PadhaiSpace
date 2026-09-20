import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';
import PDFViewerModal from '../components/PDFViewerModal';
import Pagination from '../components/Pagination';
import { CardSkeleton } from '../components/SkeletonLoader';
import { resourceService, subjectService, unitService } from '../services/api';
import { BookOpen, Layers, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';

export default function Notes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePDF, setActivePDF] = useState(null);

  // Read initial page from URL searchParams
  const initialPage = parseInt(searchParams.get('page'), 10) || 1;
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState({
    subjectId: searchParams.get('subjectId') || '',
    unitId: searchParams.get('unitId') || '',
    type: 'notes',
    academicYear: searchParams.get('academicYear') || '',
    source: searchParams.get('source') || '',
    q: searchParams.get('q') || '',
    sort: 'newest',
  });

  const updateUrlParams = (newFilters, newPage) => {
    const params = new URLSearchParams();
    if (newPage > 1) params.set('page', String(newPage));
    if (newFilters.subjectId) params.set('subjectId', newFilters.subjectId);
    if (newFilters.unitId) params.set('unitId', newFilters.unitId);
    if (newFilters.academicYear) params.set('academicYear', newFilters.academicYear);
    if (newFilters.source) params.set('source', newFilters.source);
    if (newFilters.q) params.set('q', newFilters.q);

    setSearchParams(params, { replace: true });
  };

  // Fetch Units when Subject changes
  useEffect(() => {
    if (filters.subjectId && filters.subjectId !== 'all') {
      unitService.getAll(filters.subjectId).then((res) => {
        if (res.success) setUnits(res.data || []);
      }).catch(() => setUnits([]));
    } else {
      setUnits([]);
    }
  }, [filters.subjectId]);

  // Fetch sources list with real counts from MongoDB
  const fetchMetadata = async () => {
    try {
      const [srcRes, subjRes] = await Promise.all([
        resourceService.getSources({ type: 'notes' }),
        subjectService.getAll(),
      ]);
      if (srcRes.success) setSources(srcRes.data);
      if (subjRes.success) setSubjects(subjRes.data);
    } catch (err) {
      console.warn('Metadata fetch warning:', err.message);
    }
  };

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        type: filters.type || 'notes',
        page,
        limit: 12,
      };

      if (filters.subjectId) params.subjectId = filters.subjectId;
      if (filters.unitId) params.unitId = filters.unitId;
      if (filters.academicYear) params.academicYear = filters.academicYear;
      if (filters.source) params.source = filters.source;
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
      console.error('Notes fetch error:', err);
      setError(err.message || 'Unable to load resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [filters, page]);

  const handleFilterChange = (key, value) => {
    const newPage = 1;
    const newFilters = {
      ...filters,
      [key]: value,
      ...(key === 'subjectId' ? { unitId: '' } : {}),
    };
    setPage(newPage);
    setFilters(newFilters);
    updateUrlParams(newFilters, newPage);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateUrlParams(filters, newPage);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleReset = () => {
    const defaultFilters = { subjectId: '', unitId: '', type: 'notes', academicYear: '', source: '', q: '', sort: 'newest' };
    setPage(1);
    setFilters(defaultFilters);
    updateUrlParams(defaultFilters, 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900 dark:text-[#F8FAFC]">
      {/* HERO SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/90 via-slate-900 to-black p-8 sm:p-10 border border-indigo-500/20 shadow-2xl">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-mono font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>PadhaiSpace Notes Repository</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Engineering Notes & Study Material
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Browse structured unit notes, PDF lectures, and exam summaries organized by Source, Academic Year, Subject, and Unit.
          </p>
        </div>
      </div>

      {/* SOURCE CARDS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center">
            <Layers className="w-5 h-5 text-[#4F46E5] dark:text-[#38BDF8] mr-2" />
            Browse Notes by Source
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sources.length === 0 ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="tech-card p-5 animate-pulse space-y-3 min-h-[140px] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-4 bg-slate-200 dark:bg-[#1E293B] rounded w-16"></div>
                    <div className="h-4 bg-slate-200 dark:bg-[#1E293B] rounded w-20"></div>
                  </div>
                  <div className="h-5 bg-slate-200 dark:bg-[#1E293B] rounded w-3/4 mb-2 font-bold"></div>
                  <div className="h-3 bg-slate-200 dark:bg-[#1E293B] rounded w-full"></div>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-[#1E293B] flex justify-between items-center">
                  <div className="h-3 bg-slate-200 dark:bg-[#1E293B] rounded w-28"></div>
                </div>
              </div>
            ))
          ) : (
            sources.map((src) => (
              <Link
                key={src.id}
                to={`/notes/source/${src.id}`}
                className="group tech-card p-5 hover:border-[#4F46E5] dark:hover:border-[#38BDF8] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#38BDF8] border border-indigo-200 dark:border-indigo-800">
                      Source
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500 dark:text-[#94A3B8]">
                      {src.count} {src.count === 1 ? 'Resource' : 'Resources'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] group-hover:text-[#4F46E5] dark:group-hover:text-[#38BDF8] transition-colors">
                    {src.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 line-clamp-2">
                    Complete unit notes & PDF materials provided by {src.name}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-between text-xs font-mono font-bold text-[#4F46E5] dark:text-[#38BDF8]">
                  <span>Explore Academic Years</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* FILTER BAR */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
            All Notes Resources ({totalCount})
          </h2>
        </div>

        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleReset}
          subjects={subjects}
          units={units}
          showTypeFilter={false}
          showUnitFilter={true}
        />
      </div>

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
          message="No engineering notes matched your selected criteria."
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

          {/* PAGINATION */}
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
