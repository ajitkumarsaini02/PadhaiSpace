import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Layers, FileText } from 'lucide-react';

export default function SubjectCard({ subject }) {
  return (
    <Link
      to={`/subjects/${subject._id}`}
      className="group tech-card p-5 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-[#2563EB]/15 border border-indigo-200 dark:border-[#38BDF8]/30 flex items-center justify-center text-[#4F46E5] dark:text-[#38BDF8]">
            <BookOpen className="w-4 h-4" />
          </div>

          <div className="flex items-center space-x-1.5">
            {subject.academicYear && (
              <span className="tech-badge tech-badge-purple">
                {subject.academicYear}
              </span>
            )}
            {subject.code && (
              <span className="tech-badge tech-badge-blue">
                {subject.code}
              </span>
            )}
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] group-hover:text-[#4F46E5] dark:group-hover:text-[#38BDF8] transition-colors line-clamp-1 mb-1.5">
          {subject.name}
        </h3>

        <p className="text-xs text-slate-600 dark:text-[#94A3B8] line-clamp-2 leading-relaxed mb-4">
          {subject.description || 'Core engineering syllabus notes, unit materials, and previous exam question papers.'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#1E293B] text-xs font-mono font-medium text-slate-500 dark:text-[#94A3B8]">
        <div className="flex items-center space-x-3">
          <span className="flex items-center">
            <Layers className="w-3.5 h-3.5 mr-1 text-[#4F46E5] dark:text-[#38BDF8]" />
            5 Units
          </span>
          <span className="flex items-center">
            <FileText className="w-3.5 h-3.5 mr-1 text-[#2563EB] dark:text-[#C084FC]" />
            {subject.resourceCount !== undefined ? `${subject.resourceCount} Materials` : 'View'}
          </span>
        </div>

        <span className="flex items-center text-[#4F46E5] dark:text-[#38BDF8] font-bold group-hover:translate-x-1 transition-transform">
          Open <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </span>
      </div>
    </Link>
  );
}
