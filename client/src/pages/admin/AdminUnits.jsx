import React, { useEffect, useState } from 'react';
import { unitService, subjectService, resourceService } from '../../services/api';
import AdminNav from '../../components/AdminNav';
import { Plus, Trash2, Check, AlertCircle, Edit3, ArrowUp, ArrowDown, FileText, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminUnits() {
  const [units, setUnits] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [unitResourcesCount, setUnitResourcesCount] = useState({});
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

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
      if (res.success) {
        setUnits(res.data);
        
        // Also fetch resource counts for each unit
        const rRes = await resourceService.getAll({ subjectId: subjId, limit: 200 });
        if (rRes.success) {
          const counts = {};
          rRes.data.forEach((r) => {
            const uId = r.unitId?._id || r.unitId;
            if (uId) {
              counts[uId] = (counts[uId] || 0) + 1;
            }
          });
          setUnitResourcesCount(counts);
        }
      }
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

  const resetForm = () => {
    setEditingId(null);
    setForm({
      subjectId: selectedSubjectId,
      unitNumber: units.length > 0 ? Math.max(...units.map((u) => u.unitNumber)) + 1 : 1,
      title: '',
      description: '',
    });
  };

  const startEdit = (u) => {
    setEditingId(u._id);
    setForm({
      subjectId: selectedSubjectId,
      unitNumber: u.unitNumber,
      title: u.title || '',
      description: u.description || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!form.title.trim()) {
      setMsg({ type: 'error', text: 'Unit Title is required' });
      return;
    }

    try {
      let res;
      if (editingId) {
        res = await unitService.update(editingId, {
          ...form,
          unitNumber: Number(form.unitNumber),
        });
      } else {
        res = await unitService.create({
          ...form,
          subjectId: selectedSubjectId,
          unitNumber: Number(form.unitNumber),
        });
      }

      if (res.success) {
        setMsg({
          type: 'success',
          text: editingId ? 'Unit updated successfully!' : 'Unit created successfully!',
        });
        resetForm();
        fetchUnits(selectedSubjectId);
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to save unit' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this unit? Linked resources will become unassigned.')) return;
    try {
      await unitService.delete(id);
      setUnits((prev) => prev.filter((u) => u._id !== id));
      setMsg({ type: 'success', text: 'Unit deleted cleanly.' });
    } catch (err) {
      alert('Failed to delete unit: ' + err.message);
    }
  };

  const handleReorder = async (unitId, newNumber) => {
    if (newNumber < 1) return;
    try {
      await unitService.update(unitId, { unitNumber: newNumber });
      fetchUnits(selectedSubjectId);
    } catch (err) {
      console.error('Reorder unit failed:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F8FAFC]">
      <AdminNav
        title="Unit Management"
        subtitle="Manage syllabus unit topics, reorder unit numbers, and view linked resources"
      />

      {msg.text && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
          {msg.type === 'success' ? <Check className="w-4 h-4 mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
          {msg.text}
        </div>
      )}

      {/* Select Subject Dropdown Selector */}
      <div className="tech-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="text-xs font-mono font-bold text-[#F8FAFC]">Select Academic Subject:</label>
        <select
          value={selectedSubjectId}
          onChange={(e) => {
            setSelectedSubjectId(e.target.value);
            setForm((prev) => ({ ...prev, subjectId: e.target.value }));
            setEditingId(null);
          }}
          className="px-3.5 py-2 text-xs bg-[#070A12] text-[#F8FAFC] border border-[#1E293B] rounded-xl focus:outline-none focus:border-[#38BDF8] font-mono font-semibold flex-grow max-w-xl"
        >
          {subjects.map((s) => (
            <option key={s._id} value={s._id} className="bg-[#0B0F19] text-[#F8FAFC]">
              {s.name} {s.code ? `(${s.code})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Unit Form (Create & Edit) */}
      <div className="tech-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center">
          {editingId ? <Edit3 className="w-4 h-4 mr-2 text-[#38BDF8]" /> : <Plus className="w-4 h-4 mr-2 text-[#F59E0B]" />}
          {editingId ? 'Edit Unit Details' : 'Create Unit for Selected Subject'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-[#F8FAFC] mb-1">Unit Number *</label>
              <input
                type="number"
                min="1"
                max="20"
                value={form.unitNumber}
                onChange={(e) => setForm({ ...form, unitNumber: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 text-xs bg-[#070A12] text-[#F8FAFC] border border-[#1E293B] rounded-xl focus:outline-none focus:border-[#38BDF8] font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-mono font-bold text-[#F8FAFC] mb-1">Unit Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Process Synchronization & Deadlocks"
                required
                className="w-full px-3.5 py-2.5 text-xs bg-[#070A12] text-[#F8FAFC] border border-[#1E293B] rounded-xl focus:outline-none focus:border-[#38BDF8] font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[#F8FAFC] mb-1">Unit Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Key topics and syllabus outline covered in this unit..."
              className="w-full px-3.5 py-2.5 text-xs bg-[#070A12] text-[#F8FAFC] border border-[#1E293B] rounded-xl focus:outline-none focus:border-[#38BDF8] font-semibold"
            />
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-mono font-bold text-xs rounded-xl shadow-md transition-colors border border-[#38BDF8]/30 cursor-pointer"
            >
              {editingId ? 'Update Unit' : 'Save Unit'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 bg-[#1E293B] text-[#94A3B8] font-mono text-xs font-bold rounded-xl hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Units List with Reordering & Resource Count */}
      <div className="tech-card overflow-hidden">
        <div className="p-4 bg-[#0F172A] border-b border-[#1E293B] font-mono font-bold text-xs flex items-center justify-between">
          <span className="flex items-center"><Layers className="w-4 h-4 mr-2 text-[#38BDF8]" /> Units for Selected Subject ({units.length})</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[#94A3B8] font-mono">Loading units...</div>
        ) : units.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#94A3B8] font-mono">No units found for this subject. Create unit above.</div>
        ) : (
          <div className="divide-y divide-[#1E293B]">
            {units.map((u, idx) => (
              <div key={u._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#0F172A] text-xs transition-colors">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="tech-badge tech-badge-blue">
                      Unit {u.unitNumber}
                    </span>
                    <span className="font-bold text-[#F8FAFC] text-sm">{u.title}</span>
                    <span className="tech-badge tech-badge-purple">
                      <FileText className="w-3 h-3 mr-1" /> {unitResourcesCount[u._id] || 0} Resources
                    </span>
                  </div>
                  {u.description && <p className="text-[#94A3B8] text-xs mt-1">{u.description}</p>}
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-auto">
                  {/* Reorder Buttons */}
                  <div className="flex items-center space-x-1 border-r border-[#1E293B] pr-2 mr-1">
                    <button
                      onClick={() => handleReorder(u._id, u.unitNumber - 1)}
                      disabled={u.unitNumber <= 1}
                      className="p-1.5 text-[#94A3B8] hover:text-[#38BDF8] disabled:opacity-30 rounded hover:bg-[#1E293B]"
                      title="Move Up (Decrease Unit Number)"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleReorder(u._id, u.unitNumber + 1)}
                      className="p-1.5 text-[#94A3B8] hover:text-[#38BDF8] rounded hover:bg-[#1E293B]"
                      title="Move Down (Increase Unit Number)"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <Link
                    to={`/admin/resources?subjectId=${selectedSubjectId}`}
                    className="p-2 text-[#38BDF8] hover:bg-[#1E293B] rounded-lg font-mono text-[11px] font-bold"
                    title="View Resources in this Unit"
                  >
                    Resources →
                  </Link>

                  <button
                    onClick={() => startEdit(u)}
                    className="p-2 text-[#94A3B8] hover:text-[#38BDF8] hover:bg-[#1E293B] rounded-lg transition-colors cursor-pointer"
                    title="Edit Unit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(u._id)}
                    className="p-2 text-[#94A3B8] hover:text-[#EF4444] hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete Unit"
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
