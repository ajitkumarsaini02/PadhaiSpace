import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, AlertCircle } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await register({
        name,
        email,
        password,
        college,
      });

      if (res.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setErrorMsg(res.message || 'Registration failed');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-[#334155] shadow-xl space-y-6 transition-colors">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[#4F46E5] dark:text-[#818CF8] flex items-center justify-center mx-auto shadow-sm">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-[#F8FAFC]">Student Registration</h2>
          <p className="text-xs font-mono text-slate-500 dark:text-[#94A3B8]">
            Create a student account to access free engineering study materials, notes & bookmarks
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-mono font-bold rounded-xl flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-900 dark:text-[#F8FAFC] mb-1">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              required
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl focus:outline-none focus:border-[#4F46E5] dark:focus:border-[#6366F1] text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-[#94A3B8] font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-900 dark:text-[#F8FAFC] mb-1">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@example.com"
                required
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl focus:outline-none focus:border-[#4F46E5] dark:focus:border-[#6366F1] text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-[#94A3B8] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-900 dark:text-[#F8FAFC] mb-1">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                minLength={6}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl focus:outline-none focus:border-[#4F46E5] dark:focus:border-[#6366F1] text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-[#94A3B8] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-900 dark:text-[#F8FAFC] mb-1">College / Institute Name</label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. ABES Engineering College"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl focus:outline-none focus:border-[#4F46E5] dark:focus:border-[#6366F1] text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-[#94A3B8] font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] text-white text-xs font-mono font-bold rounded-xl shadow-md transition-colors flex items-center justify-center cursor-pointer disabled:opacity-60 border border-indigo-300 dark:border-[#38BDF8]/30"
          >
            {loading ? 'Creating Account...' : 'Register Student Account'}
          </button>
        </form>

        <div className="text-center text-xs font-mono text-slate-500 dark:text-[#94A3B8]">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-[#4F46E5] dark:text-[#38BDF8] hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
