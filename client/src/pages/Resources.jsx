import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';
import PDFViewerModal from '../components/PDFViewerModal';
import Pagination from '../components/Pagination';
import { CardSkeleton } from '../components/SkeletonLoader';
import { resourceService, subjectService, unitService } from '../services/api';
import { FolderKanban, RefreshCw, AlertTriangle } from 'lucide-react';

export default function Resources() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePDF, setActivePDF] = useState(null);

  // Read initial page from URL param to preserve state on back navigation
  const initialPage = parseInt(searchParams.get('page'), 10) || 1;
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState({
    subjectId: searchParams.get('subjectId') || '',
    unitId: searchParams.get('unitId') || '',
    type: searchParams.get('type') || '',
    academicYear: searchParams.get('academicYear') || '',
    paperYear: searchParams.get('paperYear') || '',
    source: searchParams.get('source') || '',
    q: searchParams.get('q') || '',
    sort: 'newest',
  });

  // Sync state to URL search parameters so Back navigation restores exact page & filters
  const updateUrlParams = (newFilters, newPage) => {
    const params = new URLSearchParams();
    if (newPage > 1) params.set('page', String(newPage));
    if (newFilters.subjectId) params.set('subjectId', newFilters.subjectId);
    if (newFilters.unitId) params.set('unitId', newFilters.unitId);
    if (newFilters.type) params.set('type', newFilters.type);
    if (newFilters.academicYear) params.set('academicYear', newFilters.academicYear);
    if (newFilters.paperYear) params.set('paperYear', newFilters.paperYear);
    if (newFilters.source) params.set('source', newFilters.source);
    if (newFilters.q) params.set('q', newFilters.q);

    setSearchParams(params, { replace: true });
  };

  // Fetch Subjects metadata
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const sRes = await subjectService.getAll();
        if (sRes.success) setSubjects(sRes.data);
      } catch (err) {
        console.warn('Fetch subjects error:', err.message);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch Units when Subject changes
  useEffect(() => {
    if (filters.subjectId && filters.subjectId !== 'all') {
      unitService.getAll(filters.subjectId).then((res) => {
        if (res.success) setUnits(res.data);
      }).catch(() => setUnits([]));
    } else {
      setUnits([]);
    }
  }, [filters.subjectId]);

  // Fetch Resources from MongoDB
  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: 12,
      };

      if (filters.subjectId && filters.subjectId !== 'all') params.subjectId = filters.subjectId;
      if (filters.unitId && filters.unitId !== 'all') params.unitId = filters.unitId;
      if (filters.type && filters.type !== 'all') params.type = filters.type;
      if (filters.academicYear && filters.academicYear !== 'all') params.academicYear = filters.academicYear;
      if (filters.paperYear && filters.paperYear !== 'all') params.paperYear = filters.paperYear;
      if (filters.source && filters.source !== 'all') params.source = filters.source;
      if (filters.q && filters.q.trim()) params.q = filters.q.trim();
      if (filters.sort) params.sort = filters.sort;

      const res = await resourceService.getAll(params);
      if (res.success) {
        setResources(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.count || 0);
      } else {
        setError(res.message || 'Unable to load resources. Please try again.');
      }
    } catch (err) {
      console.error('Fetch resources error:', err);
      setError(err.message || 'Unable to load resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [filters, page]);

  const handleFilterChange = (key, value) => {
    const newPage = 1;
    const newFilters = {
      ...filters,
      [key]: value === 'all' ? '' : value,
      ...(key === 'subjectId' ? { unitId: '' } : {}),
    };
    setPage(newPage);
    setFilters(newFilters);
    updateUrlParams(newFilters, newPage);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateUrlParams(filters, newPage);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleReset = () => {
    const defaultFilters = {
      subjectId: '',
      unitId: '',
      type: '',
      academicYear: '',
      paperYear: '',
      source: '',
      q: '',
      sort: 'newest',
    };
    setPage(1);
    setFilters(defaultFilters);
    updateUrlParams(defaultFilters, 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-900 dark:text-[#F8FAFC]">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center">
          <FolderKanban className="w-7 h-7 text-[#4F46E5] dark:text-[#38BDF8] mr-2.5" /> Engineering Resource Library
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] mt-1">
          Browse study notes, PYQs, syllabi, and study resources for all subjects ({totalCount} Resources)
        </p>
      </div>

      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        subjects={subjects}
        units={units}
        showTypeFilter={true}
      />

      {error ? (
        <div className="tech-card p-8 text-center space-y-4 max-w-lg mx-auto">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">Unable to load resources</h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono">{error}</p>
          </div>
          <button
            onClick={fetchResources}
            className="px-4 py-2 bg-[#4F46E5] dark:bg-[#2563EB] text-white text-xs font-mono font-bold rounded-xl flex items-center justify-center mx-auto space-x-2 shadow-md cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : loading ? (
        <CardSkeleton count={6} />
      ) : resources.length === 0 ? (
        <EmptyState
          title="No resources found"
          message="No matching resources exist for your selected criteria."
          actionLabel="Reset All Filters"
          onAction={handleReset}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {resources.map((res) => (
              <ResourceCard
                key={res._id}
                resource={res}
                onOpenPDF={(r) => setActivePDF(r)}
              />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={handlePageChange}
            itemLabel="resources"
          />
        </>
      )}

      {activePDF && (
        <PDFViewerModal resource={activePDF} onClose={() => setActivePDF(null)} />
      )}
    </div>
  );
}
