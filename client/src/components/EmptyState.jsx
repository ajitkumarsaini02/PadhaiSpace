import React from 'react';
import { FolderOpen } from 'lucide-react';

export default function EmptyState({
  title = 'No resources found',
  message = 'Try changing your branch, semester, or search filters.',
  actionLabel = '',
  onAction = null,
}) {
  return (
    <div className="bg-white rounded-2xl p-10 border border-slate-200/80 text-center my-6 max-w-lg mx-auto shadow-xs">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
        <FolderOpen className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1.5">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto mb-6">
        {message}
      </p>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
