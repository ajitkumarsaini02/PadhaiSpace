import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  BookOpen,
  FileText,
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
    { name: 'Subjects', path: '/subjects' },
    { name: 'Notes', path: '/notes' },
    { name: 'PYQs', path: '/pyqs' },
    { name: 'Resources', path: '/resources' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#0B1020] border-b border-[#DCE2EC] dark:border-[#252D42] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#4F8FEF] flex items-center justify-center text-white font-bold shadow-subtle">
              <GraduationCap className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#172033] dark:text-[#F8FAFC]">
                PadhaiSpace
              </span>
              <span className="block text-[10px] font-semibold text-[#64748B] dark:text-[#9AA6BC] -mt-1 tracking-wider uppercase">
                Engineering Study Space
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-[#EFF5FF] dark:bg-[#161D31] text-[#4F8FEF] dark:text-[#4F8FEF] font-semibold'
                    : 'text-[#475569] dark:text-[#9AA6BC] hover:text-[#172033] dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#161D31]'
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
              className="p-2 text-[#64748B] hover:text-[#4F8FEF] hover:bg-slate-100 dark:hover:bg-[#161D31] rounded-lg transition-colors flex items-center space-x-1.5 text-xs font-medium border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle cursor-pointer"
              title="Search subjects, notes, PYQs"
            >
              <Search className="w-4 h-4 text-[#64748B]" />
              <span className="text-[#64748B] text-xs font-normal">Search...</span>
            </button>

            <ThemeToggle />

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-lg border border-[#DCE2EC] dark:border-[#252D42] bg-white dark:bg-[#111729] hover:bg-slate-50 dark:hover:bg-[#161D31] transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-md bg-[#EFF5FF] dark:bg-[#161D31] text-[#4F8FEF] flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-[#172033] dark:text-[#F8FAFC] max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#111729] rounded-xl shadow-elevated border border-[#DCE2EC] dark:border-[#252D42] py-1.5 text-xs z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#DCE2EC] dark:border-[#252D42]">
                      <p className="font-bold text-[#172033] dark:text-[#F8FAFC] truncate">{user.name}</p>
                      <p className="text-xs text-[#64748B] dark:text-[#9AA6BC] truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#EFF5FF] dark:bg-[#161D31] text-[#4F8FEF]">
                        {user.branch || 'CSE'} • Sem {user.semester || 1}
                      </span>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-[#F5F7FB] dark:hover:bg-[#161D31] hover:text-[#4F8FEF]"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2.5 text-[#64748B]" />
                      Dashboard
                    </Link>

                    <Link
                      to="/bookmarks"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-[#F5F7FB] dark:hover:bg-[#161D31] hover:text-[#4F8FEF]"
                    >
                      <Bookmark className="w-4 h-4 mr-2.5 text-[#64748B]" />
                      My Bookmarks
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-[#F5F7FB] dark:hover:bg-[#161D31] hover:text-[#4F8FEF]"
                    >
                      <User className="w-4 h-4 mr-2.5 text-[#64748B]" />
                      Profile Settings
                    </Link>

                    {isAdmin && (
                      <>
                        <div className="border-t border-[#DCE2EC] dark:border-[#252D42] my-1"></div>
                        <div className="px-4 py-1 text-[10px] font-bold text-[#64748B] dark:text-[#9AA6BC] uppercase tracking-wider">
                          Admin Section
                        </div>

                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-1.5 text-[#F2A93B] hover:bg-[#F5F7FB] dark:hover:bg-[#161D31] font-medium"
                        >
                          <ShieldAlert className="w-4 h-4 mr-2.5 text-[#F2A93B]" />
                          Admin Dashboard
                        </Link>
                      </>
                    )}

                    <div className="border-t border-[#DCE2EC] dark:border-[#252D42] my-1"></div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full text-left flex items-center px-4 py-2 text-[#E05252] hover:bg-rose-50 dark:hover:bg-[#161D31] cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2.5 text-[#E05252]" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#172033] dark:text-[#F8FAFC] border border-[#DCE2EC] dark:border-[#252D42] bg-white dark:bg-[#161D31] hover:bg-[#F5F7FB] dark:hover:bg-slate-800 rounded-md transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#4F8FEF] hover:bg-[#3D7FE5] rounded-md transition-colors shadow-subtle"
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
              className="p-2 rounded-lg text-[#64748B] dark:text-[#9AA6BC] hover:bg-slate-100 dark:hover:bg-[#161D31] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0B1020] border-b border-[#DCE2EC] dark:border-[#252D42] px-4 pt-2 pb-6 space-y-3 animate-in fade-in duration-150">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(link.path)
                    ? 'bg-[#EFF5FF] dark:bg-[#161D31] text-[#4F8FEF] font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#161D31]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="border-t border-[#DCE2EC] dark:border-[#252D42] pt-3">
            {isAuthenticated ? (
              <div className="space-y-1">
                <div className="px-3 py-2 bg-[#F5F7FB] dark:bg-[#111729] rounded-md mb-2">
                  <p className="font-semibold text-xs text-[#172033] dark:text-[#F8FAFC]">{user.name}</p>
                  <p className="text-[11px] text-[#64748B] dark:text-[#9AA6BC]">{user.email}</p>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 text-sm text-slate-700 dark:text-slate-300"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                </Link>
                <Link
                  to="/bookmarks"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 text-sm text-slate-700 dark:text-slate-300"
                >
                  <Bookmark className="w-4 h-4 mr-2" /> Bookmarks
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 text-sm text-slate-700 dark:text-slate-300"
                >
                  <User className="w-4 h-4 mr-2" /> Profile
                </Link>
                {isAdmin && (
                  <>
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-3 py-2 text-sm font-semibold text-[#F2A93B]"
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
                  className="w-full text-left flex items-center px-3 py-2 text-sm text-[#E05252] font-medium cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold text-[#172033] bg-white border border-[#DCE2EC] rounded-md"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold text-white bg-[#4F8FEF] rounded-md shadow-subtle"
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
