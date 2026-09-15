import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, AlertCircle } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [semester, setSemester] = useState(1);
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
        branch,
        semester,
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
      <div className="w-full max-w-lg bg-white dark:bg-[#111729] rounded-xl p-6 sm:p-8 border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-lg bg-[#4F8FEF] text-white flex items-center justify-center mx-auto shadow-subtle">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-[#172033] dark:text-[#F8FAFC]">Student Sign Up</h2>
          <p className="text-xs text-[#64748B] dark:text-[#9AA6BC]">
            Create a student user account to access study materials, notes & bookmarks
          </p>
          <div className="inline-flex items-center px-3 py-1 bg-[#F2A93B]/10 border border-[#F2A93B]/30 text-[#F2A93B] rounded-lg text-[11px] font-bold">
            🔒 Public Sign Up is restricted to Student Users only
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-[#E05252] text-xs font-semibold rounded-lg flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              required
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg focus:outline-none focus:border-[#4F8FEF] text-[#172033] dark:text-[#F8FAFC]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@example.com"
                required
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg focus:outline-none focus:border-[#4F8FEF] text-[#172033] dark:text-[#F8FAFC]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg focus:outline-none focus:border-[#4F8FEF] text-[#172033] dark:text-[#F8FAFC]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">College / Institute Name</label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. Delhi Technological University"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg focus:outline-none focus:border-[#4F8FEF] text-[#172033] dark:text-[#F8FAFC]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg focus:outline-none focus:border-[#4F8FEF] text-[#172033] dark:text-[#F8FAFC]"
              >
                <option value="CSE">CSE — Computer Science & Engineering</option>
                <option value="CSE-AIML">CSE-AIML — Artificial Intelligence & Machine Learning</option>
                <option value="CSE-DS">CSE-DS — Data Science</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg focus:outline-none focus:border-[#4F8FEF] text-[#172033] dark:text-[#F8FAFC]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#4F8FEF] hover:bg-[#3D7FE5] text-white text-xs font-bold rounded-lg shadow-subtle transition-colors flex items-center justify-center cursor-pointer disabled:opacity-60"
          >
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div className="text-center text-xs text-[#64748B] dark:text-[#9AA6BC]">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-[#4F8FEF] hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
