import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({
  title = 'Failed to load data',
  message = 'An unexpected server error occurred. Please try again.',
  onRetry = null,
}) {
  return (
    <div className="bg-rose-50/50 rounded-2xl p-8 border border-rose-200 text-center my-6 max-w-md mx-auto">
      <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-slate-900 mb-1">{title}</h4>
      <p className="text-xs text-slate-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Try Again
        </button>
      )}
    </div>
  );
}
