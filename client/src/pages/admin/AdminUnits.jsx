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
          <h1 className="text-2xl font-extrabold text-[#172033] dark:text-[#F8FAFC]">Manage Syllabus Units</h1>
          <p className="text-xs text-[#64748B] dark:text-[#9AA6BC] mt-1">Categorize unit topics (Unit 1 to Unit 5) per subject</p>
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

      {/* Select Subject Selector */}
      <div className="bg-white dark:bg-[#111729] rounded-2xl p-4 border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
        <label className="text-xs font-bold text-[#172033] dark:text-[#F8FAFC]">Select Subject:</label>
        <select
          value={selectedSubjectId}
          onChange={(e) => {
            setSelectedSubjectId(e.target.value);
            setForm((prev) => ({ ...prev, subjectId: e.target.value }));
          }}
          className="px-3 py-2 text-xs bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl focus:outline-none font-medium flex-grow max-w-xl"
        >
          {subjects.map((s) => (
            <option key={s._id} value={s._id} className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">
              {s.name} ({s.code}) - {s.branchId?.name} Sem {s.semesterNumber}
            </option>
          ))}
        </select>
      </div>

      {/* Create Unit Form */}
      <div className="bg-white dark:bg-[#111729] rounded-2xl p-6 border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle space-y-4">
        <h3 className="text-sm font-bold text-[#172033] dark:text-[#F8FAFC] flex items-center">
          <Plus className="w-4 h-4 mr-1.5 text-[#F2A93B]" /> Create Unit for Selected Subject
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Unit Number</label>
              <input
                type="number"
                min="1"
                max="10"
                value={form.unitNumber}
                onChange={(e) => setForm({ ...form, unitNumber: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Unit Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Process Management & CPU Scheduling"
                required
                className="w-full px-3 py-2 text-xs bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#9AA6BC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Unit Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Key topics covered in this unit..."
              className="w-full px-3 py-2 text-xs bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#9AA6BC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl font-medium"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-[#4F8FEF] hover:bg-[#3D7FE5] text-white font-bold text-xs rounded-xl shadow-subtle transition-colors cursor-pointer"
          >
            Save Unit
          </button>
        </form>
      </div>

      {/* Units List */}
      <div className="bg-white dark:bg-[#111729] rounded-2xl border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle overflow-hidden">
        <div className="p-4 bg-[#F5F7FB] dark:bg-[#161D31] border-b border-[#DCE2EC] dark:border-[#252D42] font-bold text-xs text-[#172033] dark:text-[#F8FAFC]">
          Units for Selected Subject ({units.length})
        </div>

        <div className="divide-y divide-[#DCE2EC] dark:divide-[#252D42]">
          {units.map((u) => (
            <div key={u._id} className="p-4 flex items-center justify-between hover:bg-[#F5F7FB] dark:hover:bg-[#161D31] text-xs transition-colors">
              <div>
                <span className="font-bold text-[#172033] dark:text-[#F8FAFC] text-sm">
                  Unit {u.unitNumber}: {u.title}
                </span>
                {u.description && <p className="text-[#64748B] dark:text-[#9AA6BC] mt-1">{u.description}</p>}
              </div>
              <button
                onClick={() => handleDelete(u._id)}
                className="p-2 text-[#64748B] dark:text-[#9AA6BC] hover:text-[#E05252] hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                title="Delete Unit"
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
