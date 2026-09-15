import React from 'react';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
      <h1 className="text-3xl font-extrabold text-slate-900">Terms of Service</h1>
      <p className="text-slate-500 text-xs">Last updated: September 2026</p>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base">1. Acceptance of Terms</h3>
        <p>
          By accessing PadhaiSpace, you agree to comply with these terms. The platform is designed solely for educational reference and academic study purposes.
        </p>

        <h3 className="font-bold text-slate-900 text-base">2. Acceptable Use</h3>
        <p>
          Students may browse, view, download, and bookmark notes and question papers for personal academic preparation. Commercial redistribution or unauthorized scraping of content is strictly prohibited.
        </p>
      </div>
    </div>
  );
}
