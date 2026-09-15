import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0B1020] text-[#F8FAFC] border-t border-[#252D42] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#4F8FEF] flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-[#F8FAFC] tracking-tight">
                PadhaiSpace
              </span>
            </div>
            <p className="text-xs text-[#9AA6BC] leading-relaxed">
              Your Engineering Study Space — Semester notes, unit PDFs, previous year papers, syllabi, and exam resources for CSE, CSE-AIML, and CSE-DS students.
            </p>
            <div className="flex items-center space-x-2 pt-1 text-[11px] text-[#9AA6BC]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#4F8FEF]"></span>
              <span>CSE • CSE-AIML • CSE-DS Supported</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#F2A93B] ml-1"></span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider mb-4">
              Explore Resources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/subjects" className="text-[#9AA6BC] hover:text-white transition-colors">
                  All Subjects
                </Link>
              </li>
              <li>
                <Link to="/notes" className="text-[#9AA6BC] hover:text-white transition-colors">
                  Semester Notes
                </Link>
              </li>
              <li>
                <Link to="/pyqs" className="text-[#9AA6BC] hover:text-white transition-colors">
                  Previous Year Papers (PYQs)
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-[#9AA6BC] hover:text-white transition-colors">
                  Syllabus & Exam Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Branches */}
          <div>
            <h4 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider mb-4">
              Supported Branches
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/subjects?branch=cse" className="text-[#9AA6BC] hover:text-white transition-colors">
                  CSE
                </Link>
              </li>
              <li>
                <Link to="/subjects?branch=cse-aiml" className="text-[#9AA6BC] hover:text-white transition-colors">
                  CSE-AIML
                </Link>
              </li>
              <li>
                <Link to="/subjects?branch=cse-ds" className="text-[#9AA6BC] hover:text-white transition-colors">
                  CSE-DS
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & About */}
          <div>
            <h4 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider mb-4">
              Platform & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="text-[#9AA6BC] hover:text-white transition-colors">
                  About PadhaiSpace
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[#9AA6BC] hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-[#9AA6BC] hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-[#9AA6BC] hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-[#9AA6BC] hover:text-white transition-colors">
                  Academic Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#252D42] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#9AA6BC]">
          <p>© {new Date().getFullYear()} PadhaiSpace. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center">
            Built for Engineering Students with <Heart className="w-3.5 h-3.5 text-red-500 mx-1 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
