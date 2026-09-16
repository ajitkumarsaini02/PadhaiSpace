import React from 'react';
import { Link } from 'react-router-dom';
import { FolderGit2, ArrowRight, Award, CheckCircle } from 'lucide-react';

export default function SubjectCard({ subject }) {
  let branchLabels = [];
  if (subject.branches && subject.branches.length > 0) {
    branchLabels = subject.branches.map((b) => b.name || b.code || b);
  } else if (subject.branchId?.name) {
    branchLabels = [subject.branchId.name];
  } else {
    branchLabels = ['CSE'];
  }

  let semNums = [];
  if (subject.semesterNumbers && subject.semesterNumbers.length > 0) {
    semNums = subject.semesterNumbers;
  } else if (subject.semesterNumber || subject.semesterId?.number) {
    semNums = [subject.semesterNumber || subject.semesterId?.number];
  } else {
    semNums = [1];
  }

  const rawType = (subject.subjectType || subject.type || 'theory').toLowerCase();

  const getTypeStyle = (typeStr) => {
    switch (typeStr) {
      case 'lab':
        return 'bg-[#36B37E]/10 text-[#36B37E] border-[#36B37E]/30';
      case 'elective':
        return 'bg-[#4F8FEF]/10 text-[#4F8FEF] border-[#4F8FEF]/30';
      case 'other':
        return 'bg-[#F2A93B]/10 text-[#F2A93B] border-[#F2A93B]/30';
      default:
        return 'bg-[#EFF5FF] dark:bg-[#161D31] text-[#4F8FEF] border-[#DCE2EC] dark:border-[#252D42]';
    }
  };

  const formattedTypeLabel =
    rawType === 'lab'
      ? 'Lab'
      : rawType === 'elective'
      ? 'Elective'
      : rawType === 'other'
      ? 'Common'
      : 'Theory';

  return (
    <Link
      to={`/subjects/${subject._id}`}
      className="group bg-white dark:bg-[#111729] rounded-xl p-5 border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle hover:shadow-elevated hover:border-[#4F8FEF] dark:hover:border-[#4F8FEF] transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-2.5 gap-2">
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            {subject.code ? (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#0B1020] text-white uppercase tracking-wider">
                {subject.code}
              </span>
            ) : null}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getTypeStyle(rawType)}`}>
              {formattedTypeLabel}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" /> Free Access
            </span>
          </div>

          <div className="flex items-center space-x-1 text-[11px] font-semibold text-[#64748B] dark:text-[#9AA6BC] shrink-0">
            <span className="bg-[#F5F7FB] dark:bg-[#161D31] px-2 py-0.5 rounded text-[#172033] dark:text-[#F8FAFC] font-bold truncate max-w-[130px]" title={branchLabels.join(', ')}>
              {branchLabels.join(', ')}
            </span>
            <span className="bg-[#F5F7FB] dark:bg-[#161D31] px-2 py-0.5 rounded text-[#64748B] dark:text-[#9AA6BC]">
              Sem {semNums.join(', ')}
            </span>
          </div>
        </div>

        <h3 className="text-base font-bold text-[#172033] dark:text-[#F8FAFC] group-hover:text-[#4F8FEF] dark:group-hover:text-[#4F8FEF] transition-colors line-clamp-2 mb-1.5 leading-snug">
          {subject.name}
        </h3>

        <p className="text-xs text-[#64748B] dark:text-[#9AA6BC] line-clamp-2 leading-relaxed mb-4">
          {subject.description || 'B.Tech notes, syllabus units, PYQ papers, and shared resources.'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#DCE2EC] dark:border-[#252D42] text-xs font-medium">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-[#64748B] dark:text-[#9AA6BC]">
            <FolderGit2 className="w-3.5 h-3.5 mr-1 text-[#4F8FEF]" />
            {subject.resourceCount !== undefined ? `${subject.resourceCount} Materials` : 'View Resources'}
          </span>
          {subject.credits ? (
            <span className="flex items-center text-[#64748B] dark:text-[#9AA6BC] text-[11px] bg-[#F5F7FB] dark:bg-[#161D31] px-1.5 py-0.5 rounded border border-[#DCE2EC] dark:border-[#252D42] font-semibold">
              <Award className="w-3 h-3 mr-0.5 text-[#F2A93B]" /> {subject.credits} Cr
            </span>
          ) : null}
        </div>

        <span className="flex items-center text-[#4F8FEF] font-semibold group-hover:translate-x-0.5 transition-transform">
          Open <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </span>
      </div>
    </Link>
  );
}
