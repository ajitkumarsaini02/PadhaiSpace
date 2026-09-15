import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import BranchCard from '../components/BranchCard';
import SubjectCard from '../components/SubjectCard';
import ResourceCard from '../components/ResourceCard';
import PDFViewerModal from '../components/PDFViewerModal';
import { CardSkeleton } from '../components/SkeletonLoader';
import { branchService, subjectService, resourceService } from '../services/api';
import {
  GraduationCap,
  BookOpen,
  FileText,
  HelpCircle,
  ArrowRight,
  Search,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export default function Home() {
  const [branches, setBranches] = useState([]);
  const [popularSubjects, setPopularSubjects] = useState([]);
  const [latestNotes, setLatestNotes] = useState([]);
  const [pyqs, setPyqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePDF, setActivePDF] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bRes, sRes, nRes, pRes] = await Promise.all([
          branchService.getAll(),
          subjectService.getAll(),
          resourceService.getAll({ type: 'notes', limit: 6 }),
          resourceService.getAll({ type: 'pyq', limit: 6 }),
        ]);

        if (bRes.success) setBranches(bRes.data);
        if (sRes.success) setPopularSubjects(sRes.data.slice(0, 6));
        if (nRes.success) setLatestNotes(nRes.data);
        if (pRes.success) setPyqs(pRes.data);
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="space-y-16 pb-16 bg-[#F5F7FB] dark:bg-[#0B1020] text-[#172033] dark:text-[#F8FAFC] transition-colors">
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-20 border-b border-[#DCE2EC] dark:border-[#252D42] bg-[#F5F7FB] dark:bg-[#0B1020]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#EFF5FF] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] text-[#4F8FEF] text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-[#F2A93B] mr-1 inline-block"></span>
            <span>CSE • CSE-AIML • CSE-DS Engineering Academic Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#172033] dark:text-[#F8FAFC] tracking-tight max-w-4xl mx-auto leading-tight mb-6">
            Everything You Need for <span className="text-[#4F8FEF]">Engineering</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[#64748B] dark:text-[#9AA6BC] max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Notes, unit-wise study material, previous year papers, and syllabus resources — all in one place.
          </p>

          <div className="flex justify-center mb-8">
            <SearchBar placeholder="Search notes, subjects, PYQs (e.g. Operating Systems, DBMS)..." />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-semibold">
            <Link
              to="/resources"
              className="px-6 py-2.5 bg-[#4F8FEF] hover:bg-[#3D7FE5] text-white rounded-lg shadow-subtle transition-colors flex items-center"
            >
              Explore Resources <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              to="/subjects"
              className="px-6 py-2.5 bg-white dark:bg-[#161D31] hover:bg-[#F5F7FB] dark:hover:bg-[#252D42] text-[#172033] dark:text-[#F8FAFC] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg transition-colors shadow-subtle"
            >
              Browse Subjects
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Engineering Branches (CSE, CSE-AIML, CSE-DS ONLY) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#172033] dark:text-[#F8FAFC] mb-2">
            Engineering Branches
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9AA6BC]">
            Tailored academic content specifically curated for B.Tech & BE branches
          </p>
        </div>

        {loading ? (
          <CardSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {branches.map((b) => (
              <BranchCard key={b._id} branch={b} />
            ))}
          </div>
        )}
      </section>

      {/* 3. Browse by Semester */}
      <section className="bg-white dark:bg-[#111729] border-y border-[#DCE2EC] dark:border-[#252D42] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-[#172033] dark:text-[#F8FAFC] mb-2">Browse by Semester</h2>
          <p className="text-xs text-[#64748B] dark:text-[#9AA6BC] mb-8">
            Filter core engineering subjects across all 8 semesters
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {semesters.map((sem) => (
              <Link
                key={sem}
                to={`/subjects?semesterNumber=${sem}`}
                className="p-4 rounded-xl bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] hover:border-[#4F8FEF] hover:bg-[#EFF5FF] dark:hover:border-[#4F8FEF] transition-all text-center group"
              >
                <div className="text-[11px] font-bold text-[#64748B] dark:text-[#9AA6BC] uppercase tracking-wider mb-1">
                  Sem
                </div>
                <div className="text-xl font-bold text-[#172033] dark:text-[#F8FAFC] group-hover:text-[#4F8FEF] dark:group-hover:text-[#4F8FEF]">
                  {sem}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Popular Subjects */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#172033] dark:text-[#F8FAFC]">
              Popular Subjects
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#9AA6BC]">
              Core subjects with unit-wise PDFs and notes
            </p>
          </div>
          <Link
            to="/subjects"
            className="text-xs font-bold text-[#4F8FEF] hover:text-[#3D7FE5] flex items-center"
          >
            View All Subjects <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {loading ? (
          <CardSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {popularSubjects.map((subject) => (
              <SubjectCard key={subject._id} subject={subject} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Latest Semester Notes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#172033] dark:text-[#F8FAFC] flex items-center">
              <BookOpen className="w-5 h-5 text-[#4F8FEF] mr-2" /> Latest Semester Notes
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#9AA6BC]">Recently uploaded unit & semester notes</p>
          </div>
          <Link
            to="/notes"
            className="text-xs font-bold text-[#4F8FEF] hover:text-[#3D7FE5] flex items-center"
          >
            All Notes <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {loading ? (
          <CardSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

      {/* 6. Previous Year Papers (PYQs) - Dark Navy (#0B1020) + Amber (#F2A93B) */}
      <section className="bg-[#0B1020] text-[#F8FAFC] py-14 border-t border-[#252D42]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#F2A93B] bg-[#161D31] px-3 py-1 rounded-md border border-[#252D42] inline-block">
                Exam Preparation
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] mt-3">
                Previous Year Question Papers (PYQs)
              </h2>
              <p className="text-xs sm:text-sm text-[#9AA6BC] mt-1">
                Mid-Semester, End-Semester, and University Papers with solutions
              </p>
            </div>
            <Link
              to="/pyqs"
              className="px-5 py-2.5 bg-[#F2A93B] hover:bg-[#E39A2E] text-[#0B1020] font-bold text-xs rounded-lg transition-colors self-start md:self-auto shadow-subtle flex items-center"
            >
              Browse All PYQs <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>

          {loading ? (
            <CardSkeleton count={3} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {pyqs.map((paper) => (
                <ResourceCard
                  key={paper._id}
                  resource={paper}
                  onOpenPDF={(res) => setActivePDF(res)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. PDF Modal Viewer */}
      {activePDF && (
        <PDFViewerModal resource={activePDF} onClose={() => setActivePDF(null)} />
      )}
    </div>
  );
}
