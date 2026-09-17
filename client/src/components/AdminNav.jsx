import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Layers, FileText, Users, Activity, Search } from 'lucide-react';

export default function AdminNav({ title, subtitle }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const navTabs = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/subjects', label: 'Subjects', icon: BookOpen },
    { to: '/admin/units', label: 'Units', icon: Layers },
    { to: '/admin/resources', label: 'Resources', icon: FileText },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/resource-activities', label: 'Resource Activity', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="tech-card p-6 sm:p-8 tech-grid-pattern relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#1E293B]">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-[#F8FAFC]">
            {title || 'PadhaiSpace Admin Console'}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <Link
            to="/admin/search"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#0B0F19] dark:hover:bg-[#1E293B] text-slate-800 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#1E293B] font-mono font-bold text-xs rounded-xl transition-all flex items-center"
          >
            <Search className="w-4 h-4 mr-1.5 text-blue-600 dark:text-[#38BDF8]" /> Global Search
          </Link>
          <Link
            to="/admin/resources"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all flex items-center border border-blue-500/30"
          >
            <FileText className="w-4 h-4 mr-1.5" /> Upload Resource
          </Link>
        </div>
      </div>

      {/* Navigation Sub-header Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-[#1E293B]">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPath === tab.to || (tab.to === '/admin/resource-activities' && currentPath === '/admin/activity');
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white border border-blue-500 shadow-sm'
                  : 'bg-white dark:bg-[#0B0F19] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-blue-600 dark:text-[#38BDF8]'}`} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

