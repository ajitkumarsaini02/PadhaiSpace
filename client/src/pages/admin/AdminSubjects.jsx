import React, { useEffect, useState } from 'react';
import { subjectService } from '../../services/api';
import AdminNav from '../../components/AdminNav';
import { Plus, Trash2, Check, AlertCircle, BookOpen, Edit3, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    thumbnail: '',
  });

  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const sRes = await subjectService.getAll();
      if (sRes.success) setSubjects(sRes.data);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: '', code: '', description: '', thumbnail: '' });
  };

  const startEdit = (s) => {
    setEditingId(s._id);
    setForm({
      name: s.name || '',
      code: s.code || '',
      description: s.description || '',
      thumbnail: s.thumbnail || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!form.name.trim() || !form.code.trim()) {
      setMsg({ type: 'error', text: 'Subject Name and Subject Code are required' });
      return;
    }

    try {
      let res;
      if (editingId) {
        res = await subjectService.update(editingId, form);
      } else {
        res = await subjectService.create(form);
      }

      if (res.success) {
        setMsg({
          type: 'success',
          text: editingId ? `Subject "${res.data.name}" updated successfully!` : `Subject "${res.data.name}" created successfully!`,
        });
        resetForm();
        fetchData();
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to save subject' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject? Linked units and resources will be removed.')) return;
    try {
      await subjectService.delete(id);
      setSubjects((prev) => prev.filter((s) => s._id !== id));
      setMsg({ type: 'success', text: 'Subject deleted cleanly.' });
    } catch (err) {
      alert('Delete subject failed: ' + err.message);
    }
  };

  const displayedSubjects = subjects.filter((s) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.code?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q)
    );
  });

  return (

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900 dark:text-[#F8FAFC]">
      <AdminNav
        title="Subject Management"
        subtitle="Create, edit, and manage independent engineering subjects"
      />

      {msg.text && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30'}`}>
          {msg.type === 'success' ? <Check className="w-4 h-4 mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
          {msg.text}
        </div>
      )}

      {/* Subject Form */}
      <div className="tech-card p-6 space-y-4 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#1E293B]">
        <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center">
          {editingId ? <Edit3 className="w-4 h-4 mr-2 text-blue-600 dark:text-[#38BDF8]" /> : <Plus className="w-4 h-4 mr-2 text-amber-500" />}
          {editingId ? 'Edit Subject' : 'Create New Subject'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-800 dark:text-[#F8FAFC] mb-1">Subject Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Operating System"
                required
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-[#38BDF8] font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-800 dark:text-[#F8FAFC] mb-1">Subject Code *</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="e.g. BCS401"
                required
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-[#38BDF8] font-semibold uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-800 dark:text-[#F8FAFC] mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short summary of subject syllabus..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-[#38BDF8] font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-800 dark:text-[#F8FAFC] mb-1">Thumbnail URL</label>
              <input
                type="text"
                value={form.thumbnail}
                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                placeholder="https://example.com/subject-thumb.png"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-[#38BDF8] font-semibold"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-colors border border-blue-500/30 cursor-pointer"
            >
              {editingId ? 'Update Subject' : 'Save Subject'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-[#94A3B8] font-mono text-xs font-bold rounded-xl hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border border-slate-200 dark:border-transparent"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Existing Subjects List with Search */}
      <div className="tech-card overflow-hidden space-y-4 p-4 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#1E293B]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-[#1E293B]">
          <div className="font-mono font-bold text-xs flex items-center text-slate-900 dark:text-[#F8FAFC]">
            <BookOpen className="w-4 h-4 mr-2 text-blue-600 dark:text-[#38BDF8]" /> All Subjects ({displayedSubjects.length})
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search subjects..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-[#38BDF8] font-mono"
            />
          </div>
        </div>

        {displayedSubjects.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-[#94A3B8] font-mono">No subjects found.</div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-[#1E293B]">
            {displayedSubjects.map((s) => (
              <div key={s._id} className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 text-xs transition-colors rounded-xl">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-[#F8FAFC] text-sm">{s.name}</span>
                    {s.code && (
                      <span className="tech-badge tech-badge-blue">
                        {s.code}
                      </span>
                    )}
                  </div>
                  {s.description && <p className="text-slate-500 dark:text-[#94A3B8] mt-1">{s.description}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/subjects/${s._id}`}
                    className="p-2 text-blue-600 dark:text-[#38BDF8] hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-lg transition-colors font-mono font-bold text-[11px]"
                    title="View Subject Details"
                  >
                    View →
                  </Link>
                  <button
                    onClick={() => startEdit(s)}
                    className="p-2 text-slate-500 dark:text-[#94A3B8] hover:text-blue-600 dark:hover:text-[#38BDF8] hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-lg transition-colors cursor-pointer"
                    title="Edit Subject"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(s._id)}
                    className="p-2 text-slate-500 dark:text-[#94A3B8] hover:text-rose-600 dark:hover:text-[#EF4444] hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete Subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

