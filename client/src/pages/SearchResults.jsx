import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';
import PDFViewerModal from '../components/PDFViewerModal';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/SkeletonLoader';
import { searchService } from '../services/api';
import { Search, BookOpen, Layers, FileText, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState({
    subjects: [],
    units: [],
    notes: [],
    pyqs: [],
    resources: [],
  });
  const [counts, setCounts] = useState({
    subjects: 0,
    units: 0,
    notes: 0,
    pyqs: 0,
    resources: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePDF, setActivePDF] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const executeSearch = async () => {
    if (!query.trim()) {
      setResults({ subjects: [], units: [], notes: [], pyqs: [], resources: [] });
      setCounts({ subjects: 0, units: 0, notes: 0, pyqs: 0, resources: 0, total: 0 });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await searchService.globalSearch(query.trim());
      if (res.success) {
        setResults({
          subjects: res.subjects || [],
          units: res.units || [],
          notes: res.notes || [],
          pyqs: res.pyqs || [],
          resources: res.resources || [],
        });
        setCounts(res.counts || { subjects: 0, units: 0, notes: 0, pyqs: 0, resources: 0, total: 0 });
      } else {
        setError(res.message || 'Search failed. Please try again.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900 dark:text-[#F8FAFC]">
      {/* HEADER */}
      <div className="border-b border-slate-200 dark:border-[#1E293B] pb-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#38BDF8] border border-indigo-200 dark:border-indigo-800 text-xs font-mono font-bold mb-2">
          <Search className="w-3.5 h-3.5" />
          <span>MongoDB Global Search</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight">
          Search Results for "{query}"
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] mt-1">
          Found {counts.total} matching items across Subjects, Units, Notes, PYQs, and Resources in MongoDB
        </p>
      </div>

      {/* CATEGORY TABS */}
      <div className="border-b border-slate-200 dark:border-[#1E293B] flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-mono font-bold">
        {[
          { id: 'all', label: `All Results (${counts.total})` },
          { id: 'subjects', label: `Subjects (${counts.subjects})` },
          { id: 'units', label: `Units (${counts.units})` },
          { id: 'notes', label: `Notes (${counts.notes})` },
          { id: 'pyqs', label: `PYQs (${counts.pyqs})` },
          { id: 'resources', label: `Other Resources (${counts.resources})` },
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

      {/* ERROR STATE */}
      {error ? (
        <div className="tech-card p-8 text-center space-y-4 max-w-lg mx-auto">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">Search Error</h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono">{error}</p>
          </div>
          <button
            onClick={executeSearch}
            className="px-4 py-2 bg-[#4F46E5] dark:bg-[#2563EB] text-white text-xs font-mono font-bold rounded-xl flex items-center justify-center mx-auto space-x-2 shadow-md cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : loading ? (
        <CardSkeleton count={6} />
      ) : counts.total === 0 ? (
        <EmptyState
          title={`No results found for "${query}"`}
          message="No matching subjects, units, or academic resources exist in MongoDB."
        />
      ) : (
        <div className="space-y-10">
          {/* SUBJECTS RESULTS SECTION */}
          {(activeTab === 'all' || activeTab === 'subjects') && results.subjects.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] uppercase tracking-wider flex items-center font-mono">
                <BookOpen className="w-4 h-4 text-[#4F46E5] dark:text-[#38BDF8] mr-2" />
                Subjects ({results.subjects.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.subjects.map((s) => (
                  <Link
                    key={s._id}
                    to={`/subjects/${s._id}`}
                    className="tech-card p-5 hover:border-[#4F46E5] dark:hover:border-[#38BDF8] transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        {s.code && <span className="tech-badge tech-badge-blue">{s.code}</span>}
                        <span className="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8]">Subject</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] group-hover:text-[#4F46E5] dark:group-hover:text-[#38BDF8] transition-colors">
                        {s.name}
                      </h3>
                      {s.description && (
                        <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-1 line-clamp-2 leading-relaxed">
                          {s.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-end text-xs font-mono font-bold text-[#4F46E5] dark:text-[#38BDF8]">
                      <span>View Subject</span> <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* UNITS RESULTS SECTION */}
          {(activeTab === 'all' || activeTab === 'units') && results.units.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] uppercase tracking-wider flex items-center font-mono">
                <Layers className="w-4 h-4 text-[#2563EB] dark:text-[#C084FC] mr-2" />
                Units ({results.units.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.units.map((u) => (
                  <Link
                    key={u._id}
                    to={`/subjects/${u.subjectId?._id || u.subjectId}`}
                    className="tech-card p-5 hover:border-[#2563EB] dark:hover:border-[#C084FC] transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="tech-badge tech-badge-cyan">Unit {u.unitNumber}</span>
                        <span className="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8]">
                          {u.subjectId?.name}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] group-hover:text-[#2563EB] dark:group-hover:text-[#C084FC] transition-colors">
                        {u.title}
                      </h3>
                      {u.description && (
                        <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-1 line-clamp-2 leading-relaxed">
                          {u.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-end text-xs font-mono font-bold text-[#2563EB] dark:text-[#C084FC]">
                      <span>Open Unit</span> <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* NOTES RESULTS SECTION */}
          {(activeTab === 'all' || activeTab === 'notes') && results.notes.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] uppercase tracking-wider flex items-center font-mono">
                <FileText className="w-4 h-4 text-[#4F46E5] dark:text-[#38BDF8] mr-2" />
                Study Notes ({results.notes.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.notes.map((note) => (
                  <ResourceCard key={note._id} resource={note} onOpenPDF={(r) => setActivePDF(r)} />
                ))}
              </div>
            </div>
          )}

          {/* PYQS RESULTS SECTION */}
          {(activeTab === 'all' || activeTab === 'pyqs') && results.pyqs.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] uppercase tracking-wider flex items-center font-mono">
                <FileText className="w-4 h-4 text-[#6D28D9] dark:text-[#C084FC] mr-2" />
                Previous Year Papers ({results.pyqs.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.pyqs.map((pyq) => (
                  <ResourceCard key={pyq._id} resource={pyq} onOpenPDF={(r) => setActivePDF(r)} />
                ))}
              </div>
            </div>
          )}

          {/* OTHER RESOURCES SECTION */}
          {(activeTab === 'all' || activeTab === 'resources') && results.resources.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] uppercase tracking-wider flex items-center font-mono">
                <FileText className="w-4 h-4 text-[#059669] dark:text-[#34D399] mr-2" />
                Other Resources ({results.resources.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.resources.map((res) => (
                  <ResourceCard key={res._id} resource={res} onOpenPDF={(r) => setActivePDF(r)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activePDF && (
        <PDFViewerModal resource={activePDF} onClose={() => setActivePDF(null)} />
      )}
    </div>
  );
}
