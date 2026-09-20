import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  onPageChange,
  itemLabel = 'resources',
}) {
  if (totalPages <= 1) return null;

  // Compute page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push('dots1');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('dots2');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-200 dark:border-[#1E293B]">
      {/* Total Count Info */}
      <div className="text-xs font-mono font-semibold text-slate-500 dark:text-[#94A3B8]">
        Showing Page <span className="text-slate-900 dark:text-white font-bold">{currentPage}</span> of{' '}
        <span className="text-slate-900 dark:text-white font-bold">{totalPages}</span>{' '}
        {totalCount > 0 && <span>({totalCount} total {itemLabel})</span>}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#1E293B] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="First Page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-[#F8FAFC] disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-[#334155] transition-colors flex items-center space-x-1 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Prev</span>
        </button>

        {/* Page Number Buttons */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((p, idx) => {
            if (typeof p === 'string') {
              return (
                <span
                  key={`${p}-${idx}`}
                  className="px-2 py-1 text-xs font-mono font-bold text-slate-400 dark:text-[#64748B]"
                >
                  •••
                </span>
              );
            }

            const isActive = p === currentPage;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`min-w-[32px] h-[32px] px-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#4F46E5] dark:bg-[#2563EB] text-white shadow-md shadow-indigo-500/20 dark:shadow-blue-500/20 border border-indigo-300 dark:border-[#38BDF8]/40 scale-105'
                    : 'bg-slate-100 dark:bg-[#0B0F19] text-slate-700 dark:text-[#94A3B8] hover:bg-slate-200 dark:hover:bg-[#1E293B] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#1E293B]'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-[#F8FAFC] disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-[#334155] transition-colors flex items-center space-x-1 cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#1E293B] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Last Page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
