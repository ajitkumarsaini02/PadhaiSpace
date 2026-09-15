import React from 'react';
import { GraduationCap, BookOpen, FileText, ShieldCheck, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About PadhaiSpace
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Your Engineering Study Space — Purpose-built for B.Tech & BE students
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
        <h2 className="text-lg font-bold text-slate-900">Our Mission</h2>
        <p>
          PadhaiSpace is a modern ed-tech platform designed specifically for engineering undergraduates in <strong>Computer Science & Engineering (CSE)</strong>, <strong>CSE (Artificial Intelligence & Machine Learning - CSE-AIML)</strong>, and <strong>CSE (Data Science - CSE-DS)</strong>.
        </p>

        <p>
          Finding reliable, semester-wise study material, unit-wise notes, and previous year question papers (PYQs) before university examinations is often chaotic. PadhaiSpace brings all academic resources under one roof with a clean, student-friendly interface.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <BookOpen className="w-6 h-6 text-brand-600 mb-2" />
            <h4 className="font-bold text-slate-900 mb-1">Semester Notes</h4>
            <p className="text-xs text-slate-500">Curated lecture notes and unit-wise summaries.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <FileText className="w-6 h-6 text-amber-500 mb-2" />
            <h4 className="font-bold text-slate-900 mb-1">Official PYQs</h4>
            <p className="text-xs text-slate-500">Mid-Sem and End-Sem question papers with keys.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
            <h4 className="font-bold text-slate-900 mb-1">Student Centric</h4>
            <p className="text-xs text-slate-500">Fast, ad-free PDF reading experience.</p>
          </div>
        </div>

        <div className="p-4 bg-brand-50/60 rounded-2xl border border-brand-100 text-xs text-brand-900">
          <strong>Notice:</strong> PadhaiSpace is an independent study repository created to support engineering students. It is not officially affiliated with or endorsed by any specific university or examination body.
        </div>
      </div>
    </div>
  );
}
