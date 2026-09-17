import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { User, Check, AlertCircle } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { theme } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [college, setCollege] = useState(user?.college || '');
  const [password, setPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      const payload = { name, college };
      if (password) payload.password = password;

      const res = await updateProfile(payload);
      if (res.success) {
        setSuccessMsg('Profile updated successfully!');
        setPassword('');
      } else {
        setErrorMsg(res.message || 'Failed to update profile');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="tech-card p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-[#F8FAFC] flex items-center">
            <User className="w-6 h-6 text-[#4F46E5] dark:text-[#38BDF8] mr-2" /> Profile & Account Settings
          </h1>
          <p className="text-xs font-mono text-slate-500 dark:text-[#94A3B8] mt-1">
            Manage your personal details, college affiliation, and theme preferences
          </p>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold rounded-xl flex items-center">
            <Check className="w-4 h-4 mr-2" /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-mono font-bold rounded-xl flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-900 dark:text-[#F8FAFC] mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#4F46E5] dark:focus:border-[#6366F1] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-900 dark:text-[#F8FAFC] mb-1">Email Address (Read Only)</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-100 dark:bg-[#070A12] border border-slate-200 dark:border-[#334155] rounded-xl text-slate-500 dark:text-[#94A3B8] cursor-not-allowed font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-900 dark:text-[#F8FAFC] mb-1">College / University Name</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. ABES Engineering College"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] dark:focus:border-[#6366F1] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-900 dark:text-[#F8FAFC] mb-1">Role (Read Only)</label>
              <input
                type="text"
                value={user?.role ? user.role.toUpperCase() : 'STUDENT'}
                disabled
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-100 dark:bg-[#070A12] border border-slate-200 dark:border-[#334155] rounded-xl text-slate-500 dark:text-[#94A3B8] cursor-not-allowed font-mono font-bold"
              />
            </div>
          </div>

          {/* Theme Preference Setting */}
          <div className="pt-4 border-t border-slate-200 dark:border-[#1E293B] space-y-2">
            <label className="block text-xs font-mono font-bold text-slate-900 dark:text-[#F8FAFC]">
              Appearance & Theme Mode
            </label>
            <div className="flex items-center space-x-3">
              <ThemeToggle showLabel={true} />
              <span className="text-xs font-mono text-slate-500 dark:text-[#94A3B8]">
                Current preference: <strong className="capitalize text-slate-900 dark:text-[#F8FAFC]">{theme} mode</strong>.
              </span>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-mono font-bold text-slate-900 dark:text-[#F8FAFC] mb-1">
              New Password (Leave blank to keep current)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] dark:focus:border-[#6366F1] font-mono"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] text-white font-mono font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-60 border border-indigo-300 dark:border-[#38BDF8]/30"
            >
              {loading ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
