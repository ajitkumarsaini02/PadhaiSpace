import React, { useEffect, useState } from 'react';
import { subjectService, branchService, semesterService } from '../../services/api';
import { Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    branchId: '',
    semesterNumber: 1,
    subjectType: 'theory',
    credits: 3,
  });

  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sRes, bRes] = await Promise.all([
        subjectService.getAll(),
        branchService.getAll(),
      ]);
      if (sRes.success) setSubjects(sRes.data);
      if (bRes.success) {
        setBranches(bRes.data);
        if (bRes.data.length > 0) setForm((prev) => ({ ...prev, branchId: bRes.data[0]._id }));
      }
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    try {
      const semRes = await semesterService.getAll(form.branchId);
      let semObj = semRes.data?.find((s) => s.number === Number(form.semesterNumber));

      if (!semObj && semRes.data?.length > 0) {
        semObj = semRes.data[0];
      }

      const res = await subjectService.create({
        ...form,
        semesterId: semObj?._id || form.branchId,
        semesterNumber: Number(form.semesterNumber),
        credits: Number(form.credits),
      });

      if (res.success) {
        setMsg({ type: 'success', text: `Subject "${res.data.name}" created successfully!` });
        setForm((prev) => ({
          ...prev,
          name: '',
          code: '',
          description: '',
        }));
        fetchData();
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to create subject' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await subjectService.delete(id);
      setSubjects((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert('Delete subject failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172033] dark:text-[#F8FAFC]">Manage B.Tech Subjects</h1>
          <p className="text-xs text-[#64748B] dark:text-[#9AA6BC] mt-1">Configure B.Tech subjects, course codes, credits & types (Theory, Lab, Elective, Other)</p>
        </div>
        <Link to="/admin" className="text-xs font-bold text-[#F2A93B] bg-[#161D31] px-3.5 py-2 rounded-lg border border-[#252D42]">
          ← Back to Admin
        </Link>
      </div>

      {msg.text && (
        <div className={`p-3 rounded-xl text-xs font-semibold flex items-center ${msg.type === 'success' ? 'bg-[#36B37E]/10 text-[#36B37E] border border-[#36B37E]/30' : 'bg-[#E05252]/10 text-[#E05252] border border-[#E05252]/30'}`}>
          {msg.type === 'success' ? <Check className="w-4 h-4 mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
          {msg.text}
        </div>
      )}

      {/* Add Form */}
      <div className="bg-white dark:bg-[#111729] rounded-2xl p-6 border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle space-y-4">
        <h3 className="text-sm font-bold text-[#172033] dark:text-[#F8FAFC] flex items-center">
          <Plus className="w-4 h-4 mr-1.5 text-[#F2A93B]" /> Create New Subject
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Subject Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Operating System"
                required
                className="w-full px-3 py-2 text-xs bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#9AA6BC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Subject Code (Verified or blank)</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="e.g. BCS401"
                className="w-full px-3 py-2 text-xs bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#9AA6BC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl focus:outline-none font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Branch</label>
              <select
                value={form.branchId}
                onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl font-medium"
              >
                {branches.map((b) => (
                  <option key={b._id} value={b._id} className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Semester</label>
              <select
                value={form.semesterNumber}
                onChange={(e) => setForm({ ...form, semesterNumber: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl font-medium"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s} className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">Semester {s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Subject Type</label>
              <select
                value={form.subjectType}
                onChange={(e) => setForm({ ...form, subjectType: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl font-semibold"
              >
                <option value="theory" className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">Theory Subject</option>
                <option value="lab" className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">Lab / Practical</option>
                <option value="elective" className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">Elective Subject</option>
                <option value="other" className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">Common / Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Credits</label>
              <input
                type="number"
                min="0"
                max="10"
                value={form.credits}
                onChange={(e) => setForm({ ...form, credits: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short summary of subject syllabus"
              className="w-full px-3 py-2 text-xs bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#9AA6BC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl font-medium"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-[#4F8FEF] hover:bg-[#3D7FE5] text-white font-bold text-xs rounded-xl shadow-subtle transition-colors cursor-pointer"
          >
            Save Subject
          </button>
        </form>
      </div>

      {/* Existing Subjects Table */}
      <div className="bg-white dark:bg-[#111729] rounded-2xl border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle overflow-hidden">
        <div className="p-4 bg-[#F5F7FB] dark:bg-[#161D31] border-b border-[#DCE2EC] dark:border-[#252D42] font-bold text-xs text-[#172033] dark:text-[#F8FAFC] flex items-center justify-between">
          <span>All B.Tech Subjects ({subjects.length})</span>
        </div>

        <div className="divide-y divide-[#DCE2EC] dark:divide-[#252D42]">
          {subjects.map((s) => (
            <div key={s._id} className="p-4 flex items-center justify-between hover:bg-[#F5F7FB] dark:hover:bg-[#161D31] text-xs transition-colors">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-[#172033] dark:text-[#F8FAFC] text-sm">{s.name}</span>
                  {s.code && (
                    <span className="px-2 py-0.5 rounded bg-[#0B1020] text-white font-bold text-[10px] uppercase border border-[#252D42]">
                      {s.code}
                    </span>
                  )}
                  {(() => {
                    const branchList = s.offerings && s.offerings.length > 0
                      ? Array.from(new Set(s.offerings.map(o => o.branchId?.code || o.branchId?.name).filter(Boolean)))
                      : [s.branchId?.code || s.branchId?.name || 'CSE'];
                    return (
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-[#F2A93B] font-bold border border-[#F2A93B]/30">
                        {branchList.join(', ')}
                      </span>
                    );
                  })()}
                  <span className="px-2 py-0.5 rounded bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] font-semibold border border-[#DCE2EC] dark:border-[#252D42]">
                    Sem {s.semesterNumber || 1}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#EFF5FF] dark:bg-[#161D31] text-[#4F8FEF] font-bold uppercase text-[10px] border border-[#DCE2EC] dark:border-[#252D42]">
                    {s.subjectType || s.type || 'theory'} ({s.credits || 3} Cr)
                  </span>
                </div>
                {s.description && <p className="text-[#64748B] dark:text-[#9AA6BC] mt-1">{s.description}</p>}
              </div>

              <button
                onClick={() => handleDelete(s._id)}
                className="p-2 text-[#64748B] dark:text-[#9AA6BC] hover:text-[#E05252] hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                title="Delete Subject"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
