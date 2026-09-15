import React, { useEffect, useState } from 'react';
import ResourceCard from '../components/ResourceCard';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';
import PDFViewerModal from '../components/PDFViewerModal';
import { CardSkeleton } from '../components/SkeletonLoader';
import { resourceService, branchService, subjectService } from '../services/api';
import { FileText, Sparkles } from 'lucide-react';

export default function PYQs() {
  const [pyqs, setPyqs] = useState([]);
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePDF, setActivePDF] = useState(null);

  const [filters, setFilters] = useState({
    branchId: '',
    semesterNumber: '',
    subjectId: '',
    q: '',
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
    const fetchPYQs = async () => {
      try {
        setLoading(true);
        const params = { type: 'pyq' };
        if (filters.branchId) params.branchId = filters.branchId;
        if (filters.subjectId) params.subjectId = filters.subjectId;
        if (filters.q) params.q = filters.q;

        const res = await resourceService.getAll(params);
        if (res.success) setPyqs(res.data);
      } catch (err) {
        console.error('Fetch PYQs error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPYQs();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({ branchId: '', semesterNumber: '', subjectId: '', q: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#F2A93B]/10 text-[#F2A93B] border border-[#F2A93B]/30 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Engineering Exam Preparation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] dark:text-[#F8FAFC] tracking-tight flex items-center">
          <FileText className="w-7 h-7 text-[#F2A93B] mr-2.5" /> Previous Year Question Papers (PYQs)
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9AA6BC] mt-1">
          Mid Semester, End Semester, and University Exam question papers with solution keys
        </p>
      </div>

      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        branches={branches}
        subjects={subjects}
        showTypeFilter={false}
      />

      {loading ? (
        <CardSkeleton count={6} />
      ) : pyqs.length === 0 ? (
        <EmptyState
          title="No PYQ papers found"
          message="Try selecting a different branch, semester, or subject filter."
          actionLabel="Reset Filters"
          onAction={handleReset}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pyqs.map((paper) => (
            <ResourceCard
              key={paper._id}
              resource={paper}
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
