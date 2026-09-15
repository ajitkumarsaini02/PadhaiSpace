import React, { useEffect, useState } from 'react';
import ResourceCard from '../components/ResourceCard';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';
import PDFViewerModal from '../components/PDFViewerModal';
import { CardSkeleton } from '../components/SkeletonLoader';
import { resourceService, branchService, subjectService } from '../services/api';
import { BookOpen } from 'lucide-react';

export default function Notes() {
  const [notes, setNotes] = useState([]);
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
        console.error('Metadata fetch error:', err);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const params = { type: 'notes' };
        if (filters.branchId) params.branchId = filters.branchId;
        if (filters.semesterNumber) params.semesterId = filters.semesterNumber;
        if (filters.subjectId) params.subjectId = filters.subjectId;
        if (filters.q) params.q = filters.q;

        const res = await resourceService.getAll(params);
        if (res.success) setNotes(res.data);
      } catch (err) {
        console.error('Notes fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
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
        <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] dark:text-[#F8FAFC] tracking-tight flex items-center">
          <BookOpen className="w-7 h-7 text-[#4F8FEF] mr-2.5" /> Engineering Semester & Unit Notes
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9AA6BC] mt-1">
          Handwritten and digital engineering lecture notes for CSE, CSE-AIML, and CSE-DS
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
      ) : notes.length === 0 ? (
        <EmptyState
          title="No notes found"
          message="Try changing your branch, semester, or subject filters."
          actionLabel="Reset Filters"
          onAction={handleReset}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note) => (
            <ResourceCard
              key={note._id}
              resource={note}
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
