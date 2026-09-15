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
          <h1 className="text-2xl font-extrabold text-slate-900">Manage B.Tech Subjects</h1>
          <p className="text-xs text-slate-500 mt-1">Configure B.Tech subjects, course codes, credits & types (Theory, Lab, Elective, Other)</p>
        </div>
        <Link to="/admin" className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
          ← Back to Admin
        </Link>
      </div>

      {msg.text && (
        <div className={`p-3 rounded-xl text-xs font-semibold flex items-center ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {msg.type === 'success' ? <Check className="w-4 h-4 mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
          {msg.text}
        </div>
      )}

      {/* Add Form */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
          <Plus className="w-4 h-4 mr-1 text-amber-600" /> Create New CSE Subject
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Operating System"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject Code (Verified or blank)</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="e.g. BCS401"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Branch</label>
              <select
                value={form.branchId}
                onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
              <select
                value={form.semesterNumber}
                onChange={(e) => setForm({ ...form, semesterNumber: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject Type</label>
              <select
                value={form.subjectType}
                onChange={(e) => setForm({ ...form, subjectType: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                <option value="theory">Theory Subject</option>
                <option value="lab">Lab / Practical</option>
                <option value="elective">Elective Subject</option>
                <option value="other">Common / Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Credits</label>
              <input
                type="number"
                min="0"
                max="10"
                value={form.credits}
                onChange={(e) => setForm({ ...form, credits: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short summary of subject syllabus"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Save Subject
          </button>
        </form>
      </div>

      {/* Existing Subjects Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
          <span>All B.Tech Subjects ({subjects.length})</span>
        </div>

        <div className="divide-y divide-slate-100">
          {subjects.map((s) => (
            <div key={s._id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 text-xs">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                  {s.code && (
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-bold text-[10px] uppercase">
                      {s.code}
                    </span>
                  )}
                  {(() => {
                    const branchList = s.offerings && s.offerings.length > 0
                      ? Array.from(new Set(s.offerings.map(o => o.branchId?.code || o.branchId?.name).filter(Boolean)))
                      : [s.branchId?.code || s.branchId?.name || 'CSE'];
                    return (
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200">
                        {branchList.join(', ')}
                      </span>
                    );
                  })()}
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                    Sem {s.semesterNumber || 1}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-bold uppercase text-[10px]">
                    {s.subjectType || s.type || 'theory'} ({s.credits || 3} Cr)
                  </span>
                </div>
                <p className="text-slate-500 mt-1">{s.description}</p>
              </div>

              <button
                onClick={() => handleDelete(s._id)}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
