import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Search,
  User,
  LogOut,
  Bookmark,
  ShieldAlert,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchClick = () => {
    navigate('/resources');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Notes', path: '/notes' },
    { name: 'PYQs', path: '/pyqs' },
    { name: 'Syllabus', path: '/syllabus' },
    { name: 'Resources', path: '/resources' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (path) => {
    if (path === '/' && location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-200 dark:border-[#1E293B] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" onClick={handleLogoClick} className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#2563EB] dark:from-[#6366F1] dark:to-[#3B82F6] flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform border border-indigo-200 dark:border-indigo-500/30">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                Padhai<span className="text-[#4F46E5] dark:text-[#6366F1]">Space</span>
              </span>
              <span className="block text-[9px] font-mono font-semibold text-slate-500 dark:text-[#94A3B8] -mt-1 tracking-widest uppercase">
                Your Engineering Study Space
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wide transition-colors ${
                  isActive(link.path)
                    ? 'bg-slate-100 dark:bg-[#111827] text-[#4F46E5] dark:text-[#818CF8] border border-slate-200 dark:border-[#1E293B]'
                    : 'text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-[#111827]/60'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action Bar */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={handleSearchClick}
              className="px-3 py-1.5 text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-[#F8FAFC] bg-slate-100 dark:bg-[#0B0F19] hover:bg-slate-200 dark:hover:bg-[#111827] rounded-xl transition-all flex items-center space-x-2 text-xs font-mono font-semibold border border-slate-200 dark:border-[#1E293B] cursor-pointer"
              title="Search subjects, notes, PYQs"
            >
              <Search className="w-3.5 h-3.5 text-[#4F46E5] dark:text-[#6366F1]" />
              <span className="text-slate-400 dark:text-[#94A3B8] text-xs">Search...</span>
            </button>

            <ThemeToggle />

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl border border-slate-200 dark:border-[#1E293B] bg-slate-100 dark:bg-[#0B0F19] hover:bg-slate-200 dark:hover:bg-[#111827] transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#818CF8] border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-bold text-xs font-mono">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-[#94A3B8]" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0F172A] rounded-xl shadow-2xl border border-slate-200 dark:border-[#1E293B] py-1.5 text-xs z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-200 dark:border-[#1E293B]">
                      <p className="font-bold text-slate-900 dark:text-[#F8FAFC] truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-[#94A3B8] truncate">{user.email}</p>
                      <span className="inline-block mt-1 tech-badge tech-badge-blue">
                        {user.role || 'Student'}
                      </span>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#111827] hover:text-[#4F46E5] dark:hover:text-[#818CF8]"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2.5 text-[#4F46E5] dark:text-[#818CF8]" />
                      Dashboard
                    </Link>

                    <Link
                      to="/bookmarks"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#111827] hover:text-[#4F46E5] dark:hover:text-[#818CF8]"
                    >
                      <Bookmark className="w-4 h-4 mr-2.5 text-[#4F46E5] dark:text-[#818CF8]" />
                      My Bookmarks
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#111827] hover:text-[#4F46E5] dark:hover:text-[#818CF8]"
                    >
                      <User className="w-4 h-4 mr-2.5 text-[#4F46E5] dark:text-[#818CF8]" />
                      Profile Settings
                    </Link>

                    {isAdmin && (
                      <>
                        <div className="border-t border-slate-200 dark:border-[#1E293B] my-1"></div>
                        <div className="px-4 py-1 text-[10px] font-mono font-bold text-slate-400 dark:text-[#94A3B8] uppercase tracking-wider">
                          Admin Section
                        </div>

                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-1.5 text-[#F59E0B] hover:bg-slate-100 dark:hover:bg-[#111827] font-medium"
                        >
                          <ShieldAlert className="w-4 h-4 mr-2.5 text-[#F59E0B]" />
                          Admin Dashboard
                        </Link>
                      </>
                    )}

                    <div className="border-t border-slate-200 dark:border-[#1E293B] my-1"></div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full text-left flex items-center px-4 py-2 text-rose-600 dark:text-[#EF4444] hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer font-semibold"
                    >
                      <LogOut className="w-4 h-4 mr-2.5 text-rose-600 dark:text-[#EF4444]" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-mono font-bold text-slate-800 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#1E293B] bg-slate-100 dark:bg-[#0B0F19] hover:bg-slate-200 dark:hover:bg-[#111827] rounded-xl transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-xs font-mono font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] rounded-xl transition-colors shadow-md border border-indigo-300 dark:border-[#38BDF8]/30"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger & Theme Toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#111827] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#1E293B] px-4 pt-2 pb-6 space-y-3 animate-in fade-in duration-150">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleNavClick(link.path);
                }}
                className={`px-3 py-2 rounded-md text-sm font-mono font-bold ${
                  isActive(link.path)
                    ? 'bg-indigo-50 dark:bg-[#111827] text-[#4F46E5] dark:text-[#818CF8]'
                    : 'text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#111827]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="border-t border-slate-200 dark:border-[#1E293B] pt-3">
            {isAuthenticated ? (
              <div className="space-y-1">
                <div className="px-3 py-2 bg-slate-100 dark:bg-[#111827] rounded-md mb-2">
                  <p className="font-bold text-xs text-slate-900 dark:text-[#F8FAFC]">{user.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">{user.email}</p>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 text-sm text-slate-700 dark:text-[#CBD5E1]"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                </Link>
                <Link
                  to="/bookmarks"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 text-sm text-slate-700 dark:text-[#CBD5E1]"
                >
                  <Bookmark className="w-4 h-4 mr-2" /> Bookmarks
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 text-sm text-slate-700 dark:text-[#CBD5E1]"
                >
                  <User className="w-4 h-4 mr-2" /> Profile
                </Link>
                {isAdmin && (
                  <>
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-3 py-2 text-sm font-semibold text-[#F59E0B]"
                    >
                      <ShieldAlert className="w-4 h-4 mr-2" /> Admin Dashboard
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="w-full text-left flex items-center px-3 py-2 text-sm text-rose-600 dark:text-[#EF4444] font-semibold cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-mono font-bold text-slate-800 dark:text-[#F8FAFC] bg-slate-100 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#1E293B] rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-mono font-bold text-white bg-[#4F46E5] dark:bg-[#2563EB] rounded-lg shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
