import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import SubjectCard from '../components/SubjectCard';
import ResourceCard from '../components/ResourceCard';
import PDFViewerModal from '../components/PDFViewerModal';
import { CardSkeleton } from '../components/SkeletonLoader';
import { subjectService, resourceService } from '../services/api';
import {
  BookOpen,
  FileText,
  HelpCircle,
  FolderArchive,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export default function Home() {
  const [popularSubjects, setPopularSubjects] = useState([]);
  const [latestNotes, setLatestNotes] = useState([]);
  const [browseResources, setBrowseResources] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePDF, setActivePDF] = useState(null);
  const [resourceFilter, setResourceFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sRes, nRes, rRes, srcRes] = await Promise.all([
          subjectService.getAll(),
          resourceService.getAll({ type: 'Notes', limit: 6, sort: '-createdAt' }),
          resourceService.getAll({ limit: 6, sort: '-createdAt' }),
          resourceService.getSources(),
        ]);

        if (sRes.success) {
          // Sort subjects by resource count / unit count or database order
          const sorted = [...(sRes.data || [])].sort(
            (a, b) => (b.resourceCount || 0) - (a.resourceCount || 0)
          );
          setPopularSubjects(sorted.slice(0, 6));
        }

        if (nRes.success) setLatestNotes(nRes.data || []);
        if (rRes.success) setBrowseResources(rRes.data || []);
        if (srcRes.success) setSources(srcRes.data || []);
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const quickAccessItems = [
    {
      title: 'Unit Notes',
      desc: 'Syllabus-aligned notes organized unit-by-unit',
      icon: BookOpen,
      color: 'text-indigo-600 dark:text-[#818CF8]',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
      borderColor: 'border-indigo-200 dark:border-indigo-800/40',
      link: '/notes',
    },
    {
      title: 'PYQ Papers',
      desc: 'University past exam papers sorted by year',
      icon: FolderArchive,
      color: 'text-blue-600 dark:text-[#38BDF8]',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      borderColor: 'border-blue-200 dark:border-blue-800/40',
      link: '/pyqs',
    },
    {
      title: 'All Resources',
      desc: 'Free PDF study materials, syllabus & exam resources',
      icon: FileText,
      color: 'text-emerald-600 dark:text-[#34D399]',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-200 dark:border-emerald-800/40',
      link: '/resources',
    },
  ];

  const filteredBrowseResources =
    resourceFilter === 'All'
      ? browseResources
      : browseResources.filter((r) => r.type === resourceFilter);

  return (
    <div className="space-y-16 pb-20 text-slate-900 dark:text-[#F8FAFC] transition-colors">
      {/* 1. HERO + SEARCH */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] tech-grid-pattern overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight max-w-4xl mx-auto leading-tight mb-6">
            Everything You Need for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F46E5] via-[#2563EB] to-[#6366F1] dark:from-[#38BDF8] dark:via-[#3B82F6] dark:to-[#8B5CF6]">
              Engineering
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-[#94A3B8] max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Notes, study material, previous papers and exam resources — all in one place.
          </p>

          <div className="flex justify-center mb-8">
            <SearchBar placeholder="Search subjects, notes, PYQs and resources..." />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-mono font-bold">
            <Link
              to="/resources"
              className="px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] text-white rounded-xl shadow-md transition-all flex items-center border border-indigo-300 dark:border-[#3B82F6]/30 cursor-pointer"
            >
              Explore Resources <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              to="/notes"
              className="px-6 py-3 bg-white hover:bg-slate-100 dark:bg-[#0B0F19] dark:hover:bg-[#1E293B] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#1E293B] rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Browse Notes
            </Link>
          </div>
        </div>
      </section>

      {/* 2. QUICK ACCESS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {quickAccessItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                to={item.link}
                className="group p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] hover:border-indigo-400 dark:hover:border-[#38BDF8] shadow-sm hover:shadow-md transition-all duration-200 flex items-start space-x-4"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${item.bgColor} ${item.borderColor} border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}
                >
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] group-hover:text-[#4F46E5] dark:group-hover:text-[#38BDF8] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                  <span className="inline-flex items-center text-xs font-mono font-bold text-[#4F46E5] dark:text-[#38BDF8] mt-3 group-hover:underline">
                    Access now →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. POPULAR SUBJECTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-5 bg-[#4F46E5] dark:bg-[#3B82F6] rounded-full"></span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[#F8FAFC]">
                Popular Subjects
              </h2>
            </div>
            <p className="text-xs font-mono text-slate-500 dark:text-[#94A3B8] mt-1 pl-3.5">
              Core engineering subjects with unit-wise syllabus coverage & free PDF notes
            </p>
          </div>
          <Link
            to="/resources"
            className="text-xs font-mono font-bold text-[#4F46E5] dark:text-[#38BDF8] hover:underline flex items-center"
          >
            Explore Resources <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {loading ? (
          <CardSkeleton count={6} />
        ) : popularSubjects.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B]">
            <p className="text-sm text-slate-500 dark:text-[#94A3B8]">No subjects found in database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {popularSubjects.map((subject) => (
              <SubjectCard key={subject._id} subject={subject} />
            ))}
          </div>
        )}
      </section>

      {/* 4. NOTES SOURCES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center">
                <GraduationCap className="w-5 h-5 text-[#4F46E5] dark:text-[#38BDF8] mr-2" /> Notes Sources
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
                Browse verified notes organized by coaching institutes and faculty creators
              </p>
            </div>
            <Link
              to="/notes"
              className="text-xs font-mono font-bold text-[#4F46E5] dark:text-[#38BDF8] hover:underline"
            >
              View All Sources →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {['Gateway Classes', 'EduShine Classes', 'Multi Atom', 'Other Notes'].map((sourceName) => (
              <button
                key={sourceName}
                onClick={() => navigate(`/notes?source=${encodeURIComponent(sourceName)}`)}
                className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F19] hover:bg-indigo-50 dark:hover:bg-[#111827] border border-slate-200 dark:border-[#1E293B] hover:border-indigo-300 dark:hover:border-[#38BDF8] transition-all text-left cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#818CF8] flex items-center justify-center font-mono font-bold text-xs mb-2 group-hover:scale-105 transition-transform">
                  {sourceName.charAt(0)}
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] group-hover:text-[#4F46E5] dark:group-hover:text-[#38BDF8]">
                  {sourceName}
                </h4>
                <span className="text-[10px] font-mono text-slate-500 dark:text-[#94A3B8] mt-1 block">
                  Browse Notes →
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LATEST NOTES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-5 bg-[#2563EB] dark:bg-[#8B5CF6] rounded-full"></span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[#F8FAFC] flex items-center">
                <BookOpen className="w-5 h-5 text-[#2563EB] dark:text-[#8B5CF6] mr-2" /> Latest Notes
              </h2>
            </div>
            <p className="text-xs font-mono text-slate-500 dark:text-[#94A3B8] mt-1 pl-3.5">
              Recently uploaded unit notes and study resources
            </p>
          </div>
          <Link
            to="/notes"
            className="text-xs font-mono font-bold text-[#4F46E5] dark:text-[#38BDF8] hover:underline flex items-center"
          >
            All Notes <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {loading ? (
          <CardSkeleton count={6} />
        ) : latestNotes.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B]">
            <p className="text-sm text-slate-500 dark:text-[#94A3B8]">No notes uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {latestNotes.map((item) => (
              <ResourceCard
                key={item._id}
                resource={item}
                onOpenPDF={(res) => setActivePDF(res)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 6. ENGINEERING PYQ BANK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="tech-card p-6 sm:p-10 tech-grid-pattern relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-indigo-200 dark:border-[#1E293B]">
          <div className="space-y-3 max-w-2xl text-center md:text-left z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-[#38BDF8] text-xs font-mono font-bold">
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Exam Prep Repository</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-wide">
              ENGINEERING PYQ BANK
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              Previous year question papers and exam resources in one place — structured by Academic Year, Paper Year & Subject.
            </p>
          </div>

          <div className="z-10 flex-shrink-0">
            <Link
              to="/pyqs"
              className="px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] text-white font-mono font-bold text-xs rounded-xl transition-all shadow-lg flex items-center border border-indigo-300 dark:border-[#A78BFA]/30 cursor-pointer"
            >
              Explore PYQs <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. BROWSE RESOURCES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-5 bg-emerald-500 rounded-full"></span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[#F8FAFC]">
                Browse Resources
              </h2>
            </div>
            <p className="text-xs font-mono text-slate-500 dark:text-[#94A3B8] mt-1 pl-3.5">
              Filter engineering study material by resource type
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {['All', 'Notes', 'PYQs', 'Syllabus'].map((type) => (
              <button
                key={type}
                onClick={() => setResourceFilter(type)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                  resourceFilter === type
                    ? 'bg-[#4F46E5] dark:bg-[#2563EB] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-[#0B0F19] text-slate-600 dark:text-[#94A3B8] hover:bg-slate-200 dark:hover:bg-[#111827] border border-slate-200 dark:border-[#1E293B]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <CardSkeleton count={6} />
        ) : filteredBrowseResources.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B]">
            <p className="text-sm text-slate-500 dark:text-[#94A3B8]">
              No resources found for "{resourceFilter}".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBrowseResources.map((item) => (
              <ResourceCard
                key={item._id}
                resource={item}
                onOpenPDF={(res) => setActivePDF(res)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 8. WHY PADHAISPACE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-[#F8FAFC]">
            Why Engineering Students Choose PadhaiSpace
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] mt-2 max-w-xl mx-auto">
            Built from the ground up for clean, distraction-free study and fast document viewing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B]">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#818CF8] flex items-center justify-center font-bold mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] mb-2">
              100% Free & Open Access
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
              No subscriptions, hidden paywalls, or coin unlocks. All notes, syllabus resources, and PYQ papers are completely free for all students.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B]">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#38BDF8] flex items-center justify-center font-bold mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] mb-2">
              Protected PDF Viewing
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
              In-browser secure canvas PDF reader with zero static download links, anti-tamper stream validation, and custom reader controls.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B]">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-[#34D399] flex items-center justify-center font-bold mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] mb-2">
              Unit & Subject Organized
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
              Clean academic structure — Subject → Unit → Resource → PDF. Never waste time searching through unorganized folders.
            </p>
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#4F46E5] to-[#2563EB] dark:from-[#1E1B4B] dark:to-[#0F172A] text-white text-center border border-indigo-300 dark:border-[#38BDF8]/20 shadow-xl relative overflow-hidden">
          <h2 className="text-2xl sm:text-4xl font-black mb-4">
            Ready to Supercharge Your Engineering Studies?
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 dark:text-[#94A3B8] max-w-xl mx-auto mb-8 font-normal leading-relaxed">
            Access thousands of unit notes, question papers, and syllabus resources instantly.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono font-bold">
            <Link
              to="/resources"
              className="px-6 py-3 bg-white text-[#4F46E5] hover:bg-slate-100 rounded-xl transition-all shadow-md flex items-center"
            >
              Start Studying Now <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              to="/pyqs"
              className="px-6 py-3 bg-indigo-700/60 hover:bg-indigo-700 text-white rounded-xl border border-white/20 transition-all"
            >
              Browse PYQ Papers
            </Link>
          </div>
        </div>
      </section>

      {/* PDF Modal Viewer */}
      {activePDF && (
        <PDFViewerModal resource={activePDF} onClose={() => setActivePDF(null)} />
      )}
    </div>
  );
}
