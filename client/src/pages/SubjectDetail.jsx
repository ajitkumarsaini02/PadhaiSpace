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
  Award,
  CheckCircle,
  BookOpen,
} from 'lucide-react';

export default function SubjectDetail() {
  const { id } = useParams();

  const [subject, setSubject] = useState(null);
  const [units, setUnits] = useState([]);
  const [resources, setResources] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'notes', 'pdf', 'pyq', 'syllabus-exam'
  const [selectedUnit, setSelectedUnit] = useState('');
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
        <h2 className="text-xl font-bold text-slate-800">Subject Not Found</h2>
        <Link to="/subjects" className="text-brand-600 underline mt-2 inline-block">
          Return to Subjects
        </Link>
      </div>
    );
  }

  // Filter resources based on tab & unit
  const filteredResources = resources.filter((res) => {
    if (selectedUnit && res.unitId?._id !== selectedUnit) return false;
    if (activeTab === 'notes') return res.type === 'notes';
    if (activeTab === 'pdf') return res.type === 'pdf';
    if (activeTab === 'pyq') return res.type === 'pyq';
    if (activeTab === 'syllabus-exam') return res.type === 'syllabus' || res.type === 'exam-resource';
    return true;
  });

  const offeredBranches = subject.offerings && subject.offerings.length > 0
    ? Array.from(new Set(subject.offerings.map(o => o.branchId?.code || o.branchId?.name).filter(Boolean)))
    : (subject.branchIds && subject.branchIds.length > 0
        ? subject.branchIds.map(b => b.code || b.name)
        : [subject.branchId?.code || subject.branchId?.name].filter(Boolean));

  const offeredSemesters = subject.offerings && subject.offerings.length > 0
    ? Array.from(new Set(subject.offerings.map(o => o.semesterId?.number || o.semesterNumber).filter(Boolean))).sort((a, b) => a - b)
    : [subject.semesterNumber || subject.semesterId?.number].filter(Boolean);

  const subjectTypeDisplay = subject.subjectType || subject.type || 'theory';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <Link
        to="/subjects"
        className="inline-flex items-center text-xs font-semibold text-[#64748B] dark:text-[#9AA6BC] hover:text-[#4F8FEF] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Subjects
      </Link>

      {/* Header Banner - Dark Navy #0B1020 */}
      <div className="bg-[#0B1020] text-[#F8FAFC] border border-[#252D42] rounded-xl p-6 sm:p-8 shadow-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              {subject.code && (
                <span className="px-2.5 py-1 rounded bg-[#161D31] text-[#F8FAFC] text-xs font-bold uppercase tracking-wider border border-[#252D42]">
                  {subject.code}
                </span>
              )}
              {offeredBranches.length > 0 && (
                <span className="px-2.5 py-1 rounded bg-[#161D31] text-[#9AA6BC] text-xs font-semibold border border-[#252D42]">
                  Branches: {offeredBranches.join(', ')}
                </span>
              )}
              {offeredSemesters.length > 0 && (
                <span className="px-2.5 py-1 rounded bg-[#161D31] text-[#9AA6BC] text-xs font-semibold border border-[#252D42]">
                  {offeredSemesters.length === 1 ? `Semester ${offeredSemesters[0]}` : `Semesters: ${offeredSemesters.join(', ')}`}
                </span>
              )}
              <span className="px-2.5 py-1 rounded bg-[#4F8FEF]/10 text-[#6EA8FF] border border-[#6EA8FF]/30 text-xs font-bold capitalize">
                {subjectTypeDisplay} Course
              </span>
              {subject.credits && (
                <span className="px-2.5 py-1 rounded bg-[#161D31] text-[#F2A93B] text-xs font-semibold flex items-center border border-[#252D42]">
                  <Award className="w-3 h-3 mr-1 text-[#F2A93B]" /> {subject.credits} Credits
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {subject.name}
            </h1>

            <p className="text-xs sm:text-sm text-[#9AA6BC] leading-relaxed">
              {subject.description || 'Access official B.Tech semester notes, unit PDFs, previous year question papers, syllabi, and revision materials.'}
            </p>

            <div className="inline-flex items-center space-x-2 bg-[#36B37E]/10 text-[#36B37E] border border-[#36B37E]/30 px-3 py-1.5 rounded-lg text-xs font-bold">
              <CheckCircle className="w-4 h-4 text-[#36B37E]" />
              <span>✓ 100% Free Access — All {units.length || 5} Units & Resources Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Free Access Banner */}
      <div className="bg-[#36B37E]/10 border border-[#36B37E]/30 rounded-xl p-4 flex items-center space-x-3 text-[#36B37E]">
        <CheckCircle className="w-5 h-5 text-[#36B37E] flex-shrink-0" />
        <p className="text-xs sm:text-sm font-semibold">
          ✓ Free Academic Access — Full access to all {units.length || 5} units and PDF study materials for all students.
        </p>
      </div>

      {/* Units Section */}
      {units.length > 0 && (
        <div className="bg-white dark:bg-[#111729] rounded-xl p-5 border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#172033] dark:text-[#F8FAFC] flex items-center">
              <Layers className="w-4 h-4 mr-2 text-[#4F8FEF]" /> Syllabus Units ({units.length})
            </h3>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#36B37E]/10 text-[#36B37E] border border-[#36B37E]/30 flex items-center">
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> All {units.length} Units Free
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedUnit('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedUnit === ''
                  ? 'bg-[#4F8FEF] text-white shadow-subtle'
                  : 'bg-[#F5F7FB] dark:bg-[#161D31] text-[#64748B] dark:text-[#9AA6BC] hover:text-[#172033] dark:hover:text-white border border-[#DCE2EC] dark:border-[#252D42]'
              }`}
            >
              All Units
            </button>
            {units.map((u) => (
              <button
                key={u._id}
                onClick={() => setSelectedUnit(u._id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                  selectedUnit === u._id
                    ? 'bg-[#4F8FEF] text-white shadow-subtle'
                    : 'bg-[#F5F7FB] dark:bg-[#161D31] text-[#64748B] dark:text-[#9AA6BC] hover:text-[#172033] dark:hover:text-white border border-[#DCE2EC] dark:border-[#252D42]'
                }`}
              >
                <CheckCircle className="w-3 h-3 text-[#36B37E]" />
                <span>Unit {u.unitNumber}: {u.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="border-b border-[#DCE2EC] dark:border-[#252D42] flex items-center space-x-2 sm:space-x-4 overflow-x-auto pb-1 text-xs sm:text-sm font-medium">
        {[
          { id: 'all', label: 'All Resources' },
          { id: 'notes', label: 'Semester Notes' },
          { id: 'pdf', label: 'Unit PDFs' },
          { id: 'pyq', label: 'PYQs (Past Papers)' },
          { id: 'syllabus-exam', label: 'Syllabus & Exam Resources' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-3 border-b-2 font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-[#4F8FEF] text-[#4F8FEF]'
                : 'border-transparent text-[#64748B] dark:text-[#9AA6BC] hover:text-[#172033] dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <EmptyState
          title="No resources available in this category"
          message="Select another category tab or unit to find academic materials."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => (
            <ResourceCard
              key={res._id}
              resource={res}
              onOpenPDF={(r) => setActivePDF(r)}
            />
          ))}
        </div>
      )}

      {/* PDF Modal */}
      {activePDF && (
        <PDFViewerModal resource={activePDF} onClose={() => setActivePDF(null)} />
      )}
    </div>
  );
}
