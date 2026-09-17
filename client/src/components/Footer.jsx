import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-[#F8FAFC] border-t border-[#1E293B] pt-12 pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#2563EB] flex items-center justify-center text-white font-bold">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-xl text-[#F8FAFC] tracking-tight">
                Padhai<span className="text-[#6366F1]">Space</span>
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Your Engineering Study Space — Unit notes, syllabus PDFs, previous year papers, and study resources for engineering students. 100% free access.
            </p>

          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase tracking-wider mb-4">
              Explore Resources
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link to="/subjects" className="text-[#94A3B8] hover:text-[#38BDF8] transition-colors">
                  All Subjects
                </Link>
              </li>
              <li>
                <Link to="/notes" className="text-[#94A3B8] hover:text-[#38BDF8] transition-colors">
                  Study Notes
                </Link>
              </li>
              <li>
                <Link to="/pyqs" className="text-[#94A3B8] hover:text-[#38BDF8] transition-colors">
                  Previous Year Papers (PYQs)
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-[#94A3B8] hover:text-[#38BDF8] transition-colors">
                  Syllabus & Exam Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Subjects */}
          <div>
            <h4 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase tracking-wider mb-4">
              Core Subjects
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link to="/subjects" className="text-[#94A3B8] hover:text-[#38BDF8] transition-colors">
                  Operating System
                </Link>
              </li>
              <li>
                <Link to="/subjects" className="text-[#94A3B8] hover:text-[#38BDF8] transition-colors">
                  Database Management System
                </Link>
              </li>
              <li>
                <Link to="/subjects" className="text-[#94A3B8] hover:text-[#38BDF8] transition-colors">
                  Computer Networks
                </Link>
              </li>
              <li>
                <Link to="/subjects" className="text-[#94A3B8] hover:text-[#38BDF8] transition-colors">
                  Design & Analysis of Algorithms
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & About */}
          <div>
            <h4 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase tracking-wider mb-4">
              Platform & Legal
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link to="/about" className="text-[#94A3B8] hover:text-[#38BDF8] transition-colors">
                  About PadhaiSpace
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[#94A3B8] hover:text-[#38BDF8] transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-[#94A3B8] hover:text-[#38BDF8] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-[#94A3B8] hover:text-[#38BDF8] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-[#94A3B8] hover:text-[#38BDF8] transition-colors">
                  Academic Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#1E293B] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#94A3B8]">
          <p>© {new Date().getFullYear()} PadhaiSpace. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center">
            Built for Engineering Students with <Heart className="w-3.5 h-3.5 text-rose-500 mx-1 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
