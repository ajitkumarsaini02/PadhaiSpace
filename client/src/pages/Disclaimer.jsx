import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Academic Disclaimer</h1>
          <p className="text-slate-500 text-xs">Educational Reference Guidance</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Educational Use Only</h3>
        <p>
          PadhaiSpace is an independent open educational repository providing study materials, notes, and past question papers for engineering students in CSE, CSE-AIML, and CSE-DS.
        </p>

        <p>
          PadhaiSpace is not officially affiliated with, endorsed by, or connected to any college, institute, or university board. All trademarks, subject names, and course titles belong to their respective university authorities.
        </p>
      </div>
    </div>
  );
}
