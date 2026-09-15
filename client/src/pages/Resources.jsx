import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';
import PDFViewerModal from '../components/PDFViewerModal';
import { CardSkeleton } from '../components/SkeletonLoader';
import { resourceService, branchService, subjectService } from '../services/api';
import { FolderKanban } from 'lucide-react';

export default function Resources() {
  const [searchParams] = useSearchParams();
  const [resources, setResources] = useState([]);
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePDF, setActivePDF] = useState(null);

  const [filters, setFilters] = useState({
    branchId: searchParams.get('branchId') || '',
    semesterNumber: searchParams.get('semesterNumber') || '',
    subjectId: searchParams.get('subjectId') || '',
    type: searchParams.get('type') || '',
    q: searchParams.get('q') || '',
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [bRes, sRes] = await Promise.all([
          branchService.getAll(),
          subjectService.getAll(),
        ]);
        if (bRes.success) setBranches(bRes.data);
        if (sRes.success) setSubjects(sRes.data);
      } catch (err) {
        console.error('Fetch metadata error:', err);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const params = {};
        if (filters.branchId) params.branchId = filters.branchId;
        if (filters.subjectId) params.subjectId = filters.subjectId;
        if (filters.type) params.type = filters.type;
        if (filters.q) params.q = filters.q;

        const res = await resourceService.getAll(params);
        if (res.success) setResources(res.data);
      } catch (err) {
        console.error('Fetch resources error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({ branchId: '', semesterNumber: '', subjectId: '', type: '', q: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] dark:text-[#F8FAFC] tracking-tight flex items-center">
          <FolderKanban className="w-7 h-7 text-[#4F8FEF] mr-2.5" /> AKTU Academic Resource Library
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9AA6BC] mt-1">
          Browse semester notes, unit PDFs, PYQs, syllabi, and exam revision guides
        </p>
      </div>

      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        branches={branches}
        subjects={subjects}
        showTypeFilter={true}
      />

      {loading ? (
        <CardSkeleton count={6} />
      ) : resources.length === 0 ? (
        <EmptyState
          title="No resources found"
          message="Try adjusting your filters or search keywords."
          actionLabel="Reset All Filters"
          onAction={handleReset}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((res) => (
            <ResourceCard
              key={res._id}
              resource={res}
              onOpenPDF={(r) => setActivePDF(r)}
            />
          ))}
        </div>
      )}

      {activePDF && (
        <PDFViewerModal resource={activePDF} onClose={() => setActivePDF(null)} />
      )}
    </div>
  );
}
