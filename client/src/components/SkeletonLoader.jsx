import React from 'react';

export function CardSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="tech-card p-5 animate-pulse space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-200 dark:bg-[#1E293B] rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 dark:bg-[#1E293B] rounded w-1/6"></div>
          </div>
          <div className="h-5 bg-slate-200 dark:bg-[#1E293B] rounded w-3/4"></div>
          <div className="h-3 bg-slate-200/70 dark:bg-[#1E293B]/70 rounded w-full"></div>
          <div className="h-3 bg-slate-200/70 dark:bg-[#1E293B]/70 rounded w-2/3"></div>
          <div className="pt-3 border-t border-slate-100 dark:border-[#1E293B] flex justify-between">
            <div className="h-4 bg-slate-200 dark:bg-[#1E293B] rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-[#1E293B] rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="tech-card overflow-hidden animate-pulse">
      <div className="p-4 bg-slate-100 dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#1E293B] flex justify-between">
        <div className="h-4 bg-slate-200 dark:bg-[#1E293B] rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-[#1E293B] rounded w-1/6"></div>
      </div>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="p-4 border-b border-slate-100 dark:border-[#1E293B] flex justify-between items-center space-x-4">
          <div className="h-4 bg-slate-200 dark:bg-[#1E293B] rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 dark:bg-[#1E293B] rounded w-1/4"></div>
          <div className="h-4 bg-slate-200 dark:bg-[#1E293B] rounded w-1/6"></div>
        </div>
      ))}
    </div>
  );
}
