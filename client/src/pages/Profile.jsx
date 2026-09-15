import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { User, Building2, GraduationCap, Lock, Check, AlertCircle, Sun, Moon, Monitor } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { themeMode } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [college, setCollege] = useState(user?.college || '');
  const [branch, setBranch] = useState(user?.branch || 'CSE');
  const [semester, setSemester] = useState(user?.semester || 1);
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
      const payload = { name, college, branch, semester };
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
      <div className="bg-white dark:bg-[#111729] rounded-xl p-6 sm:p-8 border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] dark:text-[#F8FAFC] flex items-center">
            <User className="w-6 h-6 text-[#4F8FEF] mr-2" /> Profile & Academic Settings
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#9AA6BC] mt-1">
            Manage your personal details, college affiliation, enrolled branch, and theme preferences
          </p>
        </div>

        {successMsg && (
          <div className="p-3 bg-[#36B37E]/10 border border-[#36B37E]/30 text-[#36B37E] text-xs font-semibold rounded-lg flex items-center">
            <Check className="w-4 h-4 mr-2" /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-[#E05252] text-xs font-semibold rounded-lg flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg text-[#172033] dark:text-[#F8FAFC] focus:outline-none focus:border-[#4F8FEF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Email Address (Read Only)</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F5F7FB]/50 dark:bg-[#161D31]/50 border border-[#DCE2EC] dark:border-[#252D42] rounded-lg text-[#64748B] dark:text-[#9AA6BC] cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">College / University Name</label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. National Institute of Technology"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg text-[#172033] dark:text-[#F8FAFC] focus:outline-none focus:border-[#4F8FEF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Engineering Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg text-[#172033] dark:text-[#F8FAFC] focus:outline-none focus:border-[#4F8FEF]"
              >
                <option value="CSE">CSE — Computer Science & Engineering</option>
                <option value="CSE-AIML">CSE-AIML — Artificial Intelligence & Machine Learning</option>
                <option value="CSE-DS">CSE-DS — Data Science</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Current Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg text-[#172033] dark:text-[#F8FAFC] focus:outline-none focus:border-[#4F8FEF]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Theme Preference Setting */}
          <div className="pt-4 border-t border-[#DCE2EC] dark:border-[#252D42] space-y-2">
            <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC]">
              Appearance & Theme Mode
            </label>
            <div className="flex items-center space-x-3">
              <ThemeToggle showLabel={true} />
              <span className="text-xs text-[#64748B] dark:text-[#9AA6BC]">
                Current selection: <strong className="capitalize text-[#172033] dark:text-[#F8FAFC]">{themeMode} mode</strong>.
              </span>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">
              New Password (Leave blank to keep current)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg text-[#172033] dark:text-[#F8FAFC] focus:outline-none focus:border-[#4F8FEF]"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#4F8FEF] hover:bg-[#3D7FE5] text-white font-bold text-xs rounded-lg shadow-subtle transition-colors cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
