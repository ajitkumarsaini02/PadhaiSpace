import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';
import PDFViewerModal from '../components/PDFViewerModal';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/SkeletonLoader';
import { subjectService, unitService, resourceService } from '../services/api';
import {
  Layers,
  ArrowLeft,
  ArrowRight,
  FileText,
} from 'lucide-react';

export default function SubjectDetail() {
  const { id } = useParams();

  const [subject, setSubject] = useState(null);
  const [units, setUnits] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activePDF, setActivePDF] = useState(null);

  useEffect(() => {
    const fetchSubjectData = async () => {
      try {
        setLoading(true);
        const [subjRes, unitsRes, resRes] = await Promise.all([
          subjectService.getById(id),
          unitService.getAll(id),
          resourceService.getAll({ subjectId: id }),
        ]);

        if (subjRes.success) setSubject(subjRes.data);
        if (unitsRes.success) setUnits(unitsRes.data);
        if (resRes.success) setResources(resRes.data);
      } catch (err) {
        console.error('Fetch subject detail error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSubjectData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CardSkeleton count={4} />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">Subject Not Found</h2>
        <Link to="/subjects" className="text-[#4F46E5] dark:text-[#38BDF8] underline mt-2 inline-block font-mono text-xs">
          Return to Subjects
        </Link>
      </div>
    );
  }

  const filteredResources = resources.filter((res) => {
    if (selectedUnit && res.unitId?._id !== selectedUnit && res.unitId !== selectedUnit) return false;
    if (activeTab === 'notes') return ['notes', 'pdf', 'unit-pdf', 'Unit PDF'].includes(res.type);
    if (activeTab === 'pyq') return res.type === 'pyq';
    return true;
  });

  // Calculate resources count per unit
  const unitResourceCounts = {};
  resources.forEach((r) => {
    const uId = r.unitId?._id || r.unitId;
    if (uId) {
      unitResourceCounts[uId] = (unitResourceCounts[uId] || 0) + 1;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900 dark:text-[#F8FAFC]">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs font-mono text-slate-500 dark:text-[#94A3B8]">
        <Link to="/" className="hover:text-[#4F46E5] dark:hover:text-[#38BDF8]">Home</Link>
        <span>/</span>
        <Link to="/subjects" className="hover:text-[#4F46E5] dark:hover:text-[#38BDF8]">Subjects</Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-[#F8FAFC] font-bold">{subject.name} {subject.code ? `(${subject.code})` : ''}</span>
      </nav>

      {/* Header Banner */}
      <div className="tech-card p-6 sm:p-8 tech-grid-pattern relative overflow-hidden">
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            {subject.code && (
              <span className="tech-badge tech-badge-blue">
                {subject.code}
              </span>
            )}
            <span className="tech-badge tech-badge-cyan">
              {subject.unitCount || units.length} Units
            </span>
            <span className="tech-badge tech-badge-purple">
              {subject.resourceCount || resources.length} Resources
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-[#F8FAFC]">
            {subject.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
            {subject.description || 'Access official engineering syllabus units, notes, unit PDFs, previous year question papers, and study resources.'}
          </p>
        </div>
      </div>

      {/* Units Section */}
      {units.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E293B] pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center font-mono">
              <Layers className="w-4 h-4 mr-2 text-[#4F46E5] dark:text-[#38BDF8]" /> Syllabus Units ({units.length})
            </h3>
            {selectedUnit && (
              <button
                onClick={() => setSelectedUnit('')}
                className="text-xs font-mono text-[#4F46E5] dark:text-[#38BDF8] hover:underline cursor-pointer"
              >
                Clear Unit Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {units.map((u) => {
              const resCount = unitResourceCounts[u._id] || 0;
              const isSelected = selectedUnit === u._id;
              return (
                <div
                  key={u._id}
                  onClick={() => setSelectedUnit(isSelected ? '' : u._id)}
                  className={`tech-card p-4 cursor-pointer transition-all ${
                    isSelected ? 'border-[#4F46E5] dark:border-[#38BDF8] bg-indigo-50/50 dark:bg-[#0F172A]' : 'hover:border-[#4F46E5]/50 dark:hover:border-[#38BDF8]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="tech-badge tech-badge-cyan">
                      Unit {u.unitNumber}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8] flex items-center">
                      <FileText className="w-3 h-3 mr-1 text-[#2563EB] dark:text-[#C084FC]" /> {resCount} Resources
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] mb-1 line-clamp-1">
                    {u.title}
                  </h4>

                  {u.description && (
                    <p className="text-xs text-slate-600 dark:text-[#94A3B8] line-clamp-2 leading-relaxed mb-3">
                      {u.description}
                    </p>
                  )}

                  <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-[#1E293B]">
                    <span className="text-xs font-mono font-bold text-[#4F46E5] dark:text-[#38BDF8] flex items-center">
                      {isSelected ? 'Selected' : 'Open'} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Tabs & Resources */}
      <div className="space-y-6 pt-4">
        <div className="border-b border-slate-200 dark:border-[#1E293B] flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-mono font-bold">
          {[
            { id: 'all', label: 'All Resources' },
            { id: 'notes', label: 'Study Notes' },
            { id: 'pyq', label: 'PYQs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#4F46E5] text-[#4F46E5] dark:border-[#38BDF8] dark:text-[#38BDF8]'
                  : 'border-transparent text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredResources.length === 0 ? (
          <EmptyState
            title="No resources found"
            message="Select another unit or category tab to view study materials."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResources.map((res) => (
              <ResourceCard
                key={res._id}
                resource={res}
                onOpenPDF={(r) => setActivePDF(r)}
              />
            ))}
          </div>
        )}
      </div>

      {/* PDF Modal */}
      {activePDF && (
        <PDFViewerModal resource={activePDF} onClose={() => setActivePDF(null)} />
      )}
    </div>
  );
}
