import React from 'react';
import { FolderOpen } from 'lucide-react';

export default function EmptyState({
  title = 'No resources found',
  message = 'Try changing your subject filter or search query.',
  actionLabel = '',
  onAction = null,
}) {
  return (
    <div className="tech-card p-10 text-center my-6 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#818CF8] border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mx-auto mb-4">
        <FolderOpen className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] mb-1.5">{title}</h3>
      <p className="text-xs font-mono text-slate-500 dark:text-[#94A3B8] leading-relaxed max-w-xs mx-auto mb-6">
        {message}
      </p>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] text-white text-xs font-mono font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
