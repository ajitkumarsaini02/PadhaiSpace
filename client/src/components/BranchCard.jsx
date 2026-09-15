import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, BrainCircuit, Server, ArrowRight } from 'lucide-react';

export default function BranchCard({ branch }) {
  const getIcon = (code) => {
    switch (code?.toLowerCase()) {
      case 'cse':
        return <Code2 className="w-6 h-6 text-[#4F8FEF]" />;
      case 'aiml':
      case 'cse-aiml':
        return <BrainCircuit className="w-6 h-6 text-[#4F8FEF]" />;
      case 'ds':
      case 'cse-ds':
        return <Server className="w-6 h-6 text-[#4F8FEF]" />;
      default:
        return <Code2 className="w-6 h-6 text-[#4F8FEF]" />;
    }
  };

  return (
    <Link
      to={`/subjects?branch=${branch.code || branch._id}`}
      className="group p-6 rounded-xl bg-white dark:bg-[#111729] border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle hover:border-[#4F8FEF] hover:shadow-elevated transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-11 h-11 rounded-lg bg-[#EFF5FF] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] flex items-center justify-center">
            {getIcon(branch.code)}
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] border border-[#DCE2EC] dark:border-[#252D42] uppercase tracking-wider">
            {branch.code || branch.name}
          </span>
        </div>

        <h3 className="text-base font-bold text-[#172033] dark:text-[#F8FAFC] mb-2 group-hover:text-[#4F8FEF] dark:group-hover:text-[#4F8FEF] transition-colors">
          {branch.name}
        </h3>

        <p className="text-xs text-[#64748B] dark:text-[#9AA6BC] line-clamp-3 leading-relaxed mb-6">
          {branch.description || 'Core engineering curriculum notes, unit PDFs, and previous year exam papers.'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#DCE2EC] dark:border-[#252D42] text-xs font-semibold">
        <span className="text-[#64748B] dark:text-[#9AA6BC] font-normal">
          Semester 1 - 8 Resources
        </span>
        <span className="flex items-center text-[#4F8FEF] group-hover:translate-x-0.5 transition-transform font-bold">
          Explore Subjects <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </span>
      </div>
    </Link>
  );
}
