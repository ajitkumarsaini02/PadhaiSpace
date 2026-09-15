import React from 'react';
import { GraduationCap, BookOpen, FileText, ShieldCheck, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#4F8FEF] text-white flex items-center justify-center mx-auto shadow-md">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172033] dark:text-[#F8FAFC] tracking-tight">
          About PadhaiSpace
        </h1>
        <p className="text-sm text-[#64748B] dark:text-[#9AA6BC] max-w-xl mx-auto">
          Your Engineering Study Space — Purpose-built for B.Tech & BE students
        </p>
      </div>

      <div className="bg-white dark:bg-[#111729] rounded-3xl p-6 sm:p-8 border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle space-y-6 text-[#172033] dark:text-[#F8FAFC] text-xs sm:text-sm leading-relaxed">
        <h2 className="text-lg font-bold text-[#172033] dark:text-[#F8FAFC]">Our Mission</h2>
        <p className="text-[#64748B] dark:text-[#9AA6BC]">
          PadhaiSpace is a modern ed-tech platform designed specifically for engineering undergraduates in <strong className="text-[#172033] dark:text-[#F8FAFC]">Computer Science & Engineering (CSE)</strong>, <strong className="text-[#172033] dark:text-[#F8FAFC]">CSE (Artificial Intelligence & Machine Learning - CSE-AIML)</strong>, and <strong className="text-[#172033] dark:text-[#F8FAFC]">CSE (Data Science - CSE-DS)</strong>.
        </p>

        <p className="text-[#64748B] dark:text-[#9AA6BC]">
          Finding reliable, semester-wise study material, unit-wise notes, and previous year question papers (PYQs) before university examinations is often chaotic. PadhaiSpace brings all academic resources under one roof with a clean, student-friendly interface.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-2xl bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42]">
            <BookOpen className="w-6 h-6 text-[#4F8FEF] mb-2" />
            <h4 className="font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Semester Notes</h4>
            <p className="text-xs text-[#64748B] dark:text-[#9AA6BC]">Curated lecture notes and unit-wise summaries.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42]">
            <FileText className="w-6 h-6 text-[#F2A93B] mb-2" />
            <h4 className="font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Official PYQs</h4>
            <p className="text-xs text-[#64748B] dark:text-[#9AA6BC]">Mid-Sem and End-Sem question papers with keys.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42]">
            <ShieldCheck className="w-6 h-6 text-[#36B37E] mb-2" />
            <h4 className="font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Student Centric</h4>
            <p className="text-xs text-[#64748B] dark:text-[#9AA6BC]">Fast, ad-free PDF reading experience.</p>
          </div>
        </div>

        <div className="p-4 bg-[#EFF5FF] dark:bg-[#161D31] rounded-2xl border border-[#4F8FEF]/30 text-xs text-[#4F8FEF]">
          <strong className="text-[#172033] dark:text-[#F8FAFC]">Notice:</strong> PadhaiSpace is an independent study repository created to support engineering students. It is not officially affiliated with or endorsed by any specific university or examination body.
        </div>
      </div>
    </div>
  );
}
