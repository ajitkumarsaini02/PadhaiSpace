import React, { useEffect, useState } from 'react';
import { unitService, subjectService } from '../../services/api';
import { Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminUnits() {
  const [units, setUnits] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    subjectId: '',
    unitNumber: 1,
    title: '',
    description: '',
  });

  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await subjectService.getAll();
        if (res.success && res.data.length > 0) {
          setSubjects(res.data);
          setSelectedSubjectId(res.data[0]._id);
          setForm((prev) => ({ ...prev, subjectId: res.data[0]._id }));
        }
      } catch (err) {
        console.error('Fetch subjects error:', err);
      }
    };
    fetchSubjects();
  }, []);

  const fetchUnits = async (subjId) => {
    if (!subjId) return;
    try {
      setLoading(true);
      const res = await unitService.getAll(subjId);
      if (res.success) setUnits(res.data);
    } catch (err) {
      console.error('Fetch units error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubjectId) {
      fetchUnits(selectedSubjectId);
    }
  }, [selectedSubjectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    try {
      const res = await unitService.create({
        ...form,
        subjectId: selectedSubjectId,
        unitNumber: Number(form.unitNumber),
      });

      if (res.success) {
        setMsg({ type: 'success', text: 'Unit created successfully!' });
        setForm({ subjectId: selectedSubjectId, unitNumber: 1, title: '', description: '' });
        fetchUnits(selectedSubjectId);
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to create unit' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this unit?')) return;
    try {
      await unitService.delete(id);
      setUnits((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert('Failed to delete unit');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manage Syllabus Units</h1>
          <p className="text-xs text-slate-500 mt-1">Categorize unit topics (Unit 1 to Unit 5) per subject</p>
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

      {/* Select Subject Selector */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center space-x-3">
        <label className="text-xs font-bold text-slate-700">Select Subject:</label>
        <select
          value={selectedSubjectId}
          onChange={(e) => {
            setSelectedSubjectId(e.target.value);
            setForm((prev) => ({ ...prev, subjectId: e.target.value }));
          }}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
        >
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.code}) - {s.branchId?.name} Sem {s.semesterNumber}
            </option>
          ))}
        </select>
      </div>

      {/* Create Unit Form */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
          <Plus className="w-4 h-4 mr-1 text-amber-600" /> Create Unit for Selected Subject
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit Number</label>
              <input
                type="number"
                min="1"
                max="10"
                value={form.unitNumber}
                onChange={(e) => setForm({ ...form, unitNumber: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Process Management & CPU Scheduling"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Unit Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Key topics covered in this unit..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Save Unit
          </button>
        </form>
      </div>

      {/* Units List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
          Units for Selected Subject ({units.length})
        </div>

        <div className="divide-y divide-slate-100">
          {units.map((u) => (
            <div key={u._id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 text-xs">
              <div>
                <span className="font-bold text-slate-900 text-sm">
                  Unit {u.unitNumber}: {u.title}
                </span>
                <p className="text-slate-500 mt-1">{u.description}</p>
              </div>
              <button
                onClick={() => handleDelete(u._id)}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
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
