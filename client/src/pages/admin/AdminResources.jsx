import React, { useEffect, useState } from 'react';
import { resourceService, subjectService, unitService } from '../../services/api';
import AdminNav from '../../components/AdminNav';
import { Trash2, Upload, Check, AlertCircle, Edit3, Search, FileText, X, Eye } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export default function AdminResources() {
  const [searchParams] = useSearchParams();
  const initialSubjectId = searchParams.get('subjectId') || '';

  const [resources, setResources] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for Table List
  const [listFilters, setListFilters] = useState({
    subjectId: initialSubjectId,
    type: '',
    q: '',
  });

  // Upload / Edit Form State
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'notes',
    subjectId: initialSubjectId,
    unitId: '',
    externalUrl: '',
    tags: '',
    source: '',
    academicYear: '',
    paperYear: '',
    year: '',
  });

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [rRes, sRes] = await Promise.all([
        resourceService.getAll({ limit: 100 }),
        subjectService.getAll(),
      ]);

      if (rRes.success) setResources(rRes.data);
      if (sRes.success) setAllSubjects(sRes.data);
    } catch (err) {
      console.error('Fetch admin resources error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // DEPENDENT DROPDOWN LOGIC: Fetch Units when Form Subject changes
  useEffect(() => {
    if (form.subjectId) {
      unitService.getAll(form.subjectId).then((res) => {
        if (res.success) setUnits(res.data);
      });
    } else {
      setUnits([]);
      setForm((prev) => ({ ...prev, unitId: '' }));
    }
  }, [form.subjectId]);

  // Handle PDF File selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFileError('');
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const filename = selectedFile.name.toLowerCase();
    if (!filename.endsWith('.pdf')) {
      setFileError('Invalid file format. Only .pdf files are allowed.');
      setFile(null);
      e.target.value = '';
      return;
    }

    if (selectedFile.size > 25 * 1024 * 1024) {
      setFileError('File size exceeds the 25 MB limit.');
      setFile(null);
      e.target.value = '';
      return;
    }

    setFile(selectedFile);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: '',
      description: '',
      type: 'notes',
      subjectId: '',
      unitId: '',
      externalUrl: '',
      tags: '',
      source: '',
      academicYear: '',
      paperYear: '',
      year: '',
    });
    setFile(null);
    setFileError('');
    setMsg({ type: '', text: '' });
  };

  const startEdit = (r) => {
    setEditingId(r._id);
    setForm({
      title: r.title || '',
      description: r.description || '',
      type: r.type || 'notes',
      subjectId: r.subjectId?._id || r.subjectId || '',
      unitId: r.unitId?._id || r.unitId || '',
      externalUrl: r.externalUrl || '',
      tags: Array.isArray(r.tags) ? r.tags.join(', ') : r.tags || '',
      source: r.source || '',
      academicYear: r.academicYear || '',
      paperYear: r.paperYear || '',
      year: r.year || '',
    });
    setFile(null);
    setFileError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!form.title.trim()) {
      setMsg({ type: 'error', text: 'Resource Title is required' });
      return;
    }

    const isNotesOrUnitPdf = form.type === 'notes' || form.type === 'unit-pdf';
    const isPyq = form.type === 'pyq';

    if (isNotesOrUnitPdf) {
      if (!form.source.trim()) {
        setMsg({
          type: 'error',
          text: `Source / Provider is required for ${form.type === 'notes' ? 'Notes' : 'Unit PDF'}`,
        });
        return;
      }
      if (!form.academicYear) {
        setMsg({
          type: 'error',
          text: `Academic Year is required for ${form.type === 'notes' ? 'Notes' : 'Unit PDF'}`,
        });
        return;
      }
      if (!form.subjectId) {
        setMsg({
          type: 'error',
          text: `Subject is required for ${form.type === 'notes' ? 'Notes' : 'Unit PDF'}`,
        });
        return;
      }
      if (!form.unitId) {
        setMsg({
          type: 'error',
          text: `Unit is required for ${form.type === 'notes' ? 'Notes' : 'Unit PDF'}`,
        });
        return;
      }
    } else if (isPyq) {
      if (!form.academicYear) {
        setMsg({
          type: 'error',
          text: 'Academic Year is required for Previous Year Question Paper (PYQ)',
        });
        return;
      }
      if (!form.paperYear || isNaN(Number(form.paperYear))) {
        setMsg({
          type: 'error',
          text: 'Paper Year (e.g. 2025) is required for Previous Year Question Paper (PYQ)',
        });
        return;
      }
      if (!form.subjectId) {
        setMsg({
          type: 'error',
          text: 'Subject is required for Previous Year Question Paper (PYQ)',
        });
        return;
      }
    }

    if (!editingId && !file && !form.externalUrl) {
      setMsg({ type: 'error', text: 'PDF File upload is required' });
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('description', form.description.trim());
      formData.append('type', form.type);

      if (form.subjectId) formData.append('subjectId', form.subjectId);
      if (form.unitId && !isPyq && form.type !== 'syllabus') formData.append('unitId', form.unitId);
      if (form.externalUrl) formData.append('externalUrl', form.externalUrl.trim());
      if (form.tags) formData.append('tags', form.tags);
      if (form.source) formData.append('source', form.source.trim());
      if (form.academicYear) formData.append('academicYear', form.academicYear);
      if (isPyq && form.paperYear) formData.append('paperYear', form.paperYear);
      if (form.year) formData.append('year', form.year);
      if (file) formData.append('file', file);

      let res;
      if (editingId) {
        res = await resourceService.update(editingId, formData);
      } else {
        res = await resourceService.create(formData);
      }

      if (res.success) {
        setMsg({
          type: 'success',
          text: editingId ? 'Resource updated successfully!' : 'Resource uploaded successfully!',
        });
        resetForm();
        fetchData();
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to save resource' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource permanently? Linked PDF will be deleted.')) return;
    try {
      await resourceService.delete(id);
      setResources((prev) => prev.filter((r) => r._id !== id));
      setMsg({ type: 'success', text: 'Resource deleted cleanly.' });
    } catch (err) {
      alert('Delete resource failed: ' + err.message);
    }
  };

  const displayedResources = resources.filter((r) => {
    if (listFilters.subjectId) {
      if ((r.subjectId?._id || r.subjectId) !== listFilters.subjectId) return false;
    }

    if (listFilters.type) {
      if (r.type !== listFilters.type) return false;
    }

    if (listFilters.q) {
      const search = listFilters.q.toLowerCase();
      const matchTitle = r.title?.toLowerCase().includes(search);
      const matchSubject = r.subjectId?.name?.toLowerCase().includes(search);
      const matchTags = Array.isArray(r.tags) ? r.tags.join(' ').toLowerCase().includes(search) : false;
      if (!matchTitle && !matchSubject && !matchTags) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F8FAFC]">
      <AdminNav
        title="Resource Management"
        subtitle="Upload and edit free engineering notes, PYQs, syllabi, and PDF documents"
      />

      {msg.text && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
          <div className="flex items-center space-x-2">
            {msg.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{msg.text}</span>
          </div>
          <button onClick={() => setMsg({ type: '', text: '' })} className="p-1 hover:bg-white/5 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ADMIN RESOURCE UPLOAD / EDIT FORM */}
      <div className="tech-card p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
          <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center">
            {editingId ? <Edit3 className="w-4 h-4 mr-2 text-[#38BDF8]" /> : <Upload className="w-4 h-4 mr-2 text-[#F59E0B]" />}
            {editingId ? 'Edit Resource' : 'Upload Resource'}
          </h3>
          {editingId && (
            <button
              onClick={resetForm}
              className="text-xs font-mono font-bold text-[#94A3B8] hover:text-white bg-[#0B0F19] px-3 py-1 rounded-lg border border-[#1E293B]"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-[#F8FAFC] mb-1">
                Resource Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={
                  form.type === 'notes' || form.type === 'unit-pdf'
                    ? 'e.g. Operating System Unit 1 Master Notes'
                    : form.type === 'pyq'
                    ? 'e.g. DBMS End-Semester Question Paper 2025'
                    : form.type === 'syllabus'
                    ? 'e.g. Computer Science Official Syllabus 2025-26'
                    : 'e.g. Engineering Mathematics Quick Formula Sheet'
                }
                required
                className="w-full px-3.5 py-2.5 text-xs bg-[#070A12] text-[#F8FAFC] border border-[#1E293B] rounded-xl focus:outline-none focus:border-[#38BDF8] font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#F8FAFC] mb-1">
                Resource Type *
              </label>
              <select
                value={form.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    type: newType,
                    paperYear: newType === 'pyq' ? prev.paperYear : '',
                    unitId: (newType === 'pyq' || newType === 'syllabus') ? '' : prev.unitId,
                  }));
                }}
                className="w-full px-3.5 py-2.5 text-xs bg-[#070A12] text-[#F8FAFC] border border-[#1E293B] rounded-xl focus:outline-none focus:border-[#38BDF8] font-mono font-semibold"
              >
                <option value="notes" className="bg-[#0B0F19] text-[#F8FAFC]">1. Notes</option>
                <option value="unit-pdf" className="bg-[#0B0F19] text-[#F8FAFC]">2. Unit PDF</option>
                <option value="pyq" className="bg-[#0B0F19] text-[#F8FAFC]">3. Previous Year Question Paper</option>
                <option value="syllabus" className="bg-[#0B0F19] text-[#F8FAFC]">4. Syllabus</option>
                <option value="exam-resource" className="bg-[#0B0F19] text-[#F8FAFC]">5. Exam Resource</option>
                <option value="pdf" className="bg-[#0B0F19] text-[#F8FAFC]">6. PDF Document</option>
                <option value="other" className="bg-[#0B0F19] text-[#F8FAFC]">7. Other</option>
              </select>
            </div>
          </div>

          {/* DYNAMIC FIELD HELPERS DEPENDING ON TYPE */}
          <div className="p-3 bg-[#0B0F19] rounded-xl border border-[#1E293B] text-xs font-mono text-[#38BDF8] flex items-center justify-between">
            <span>
              {form.type === 'notes'
                ? '📚 Notes Mode: Title, Source, Academic Year, Subject, Unit, and PDF File are required.'
                : form.type === 'unit-pdf'
                ? '📄 Unit PDF Mode: Title, Source, Academic Year, Subject, Unit, and PDF File are required.'
                : form.type === 'pyq'
                ? '📋 PYQ Mode: Title, Academic Year, Paper Year (e.g. 2025), Subject, and PDF File are required.'
                : form.type === 'syllabus'
                ? '📑 Syllabus Mode: Title and PDF File are required. Academic Year and Subject are optional.'
                : form.type === 'exam-resource'
                ? '📝 Exam Resource Mode: Title and PDF File are required. Academic Year, Subject, and Unit are optional.'
                : '📄 Generic PDF / Other Mode: Title and PDF File are required. Academic Year, Subject, and Unit are optional.'}
            </span>
          </div>

          <div className="p-4 bg-[#0F172A] rounded-xl border border-[#1E293B] space-y-4">
            <p className="text-[11px] font-mono font-bold text-[#38BDF8] uppercase tracking-wider">
              Dynamic Configuration Fields
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* SOURCE / PROVIDER FIELD (Shown for notes, unit-pdf, pyq) */}
              {(form.type === 'notes' || form.type === 'unit-pdf' || form.type === 'pyq') && (
                <div>
                  <label className="block text-xs font-mono font-bold text-[#F8FAFC] mb-1">
                    Source / Provider {(form.type === 'notes' || form.type === 'unit-pdf') ? '*' : '(Optional)'}
                  </label>
                  <input
                    type="text"
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                    placeholder={
                      form.type === 'pyq'
                        ? 'e.g. AKTU / University / Gateway Classes'
                        : 'e.g. Gateway Classes, EduShine Classes, Multi Atom'
                    }
                    required={form.type === 'notes' || form.type === 'unit-pdf'}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#070A12] text-[#F8FAFC] border border-[#1E293B] rounded-xl focus:outline-none focus:border-[#38BDF8] font-semibold"
                  />
                </div>
              )}

              {/* ACADEMIC YEAR FIELD (Shown for all types) */}
              <div>
                <label className="block text-xs font-mono font-bold text-[#F8FAFC] mb-1">
                  Academic Year {(form.type === 'notes' || form.type === 'unit-pdf' || form.type === 'pyq') ? '*' : '(Optional)'}
                </label>
                <select
                  value={form.academicYear}
                  onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                  required={form.type === 'notes' || form.type === 'unit-pdf' || form.type === 'pyq'}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#070A12] text-[#F8FAFC] border border-[#1E293B] rounded-xl focus:outline-none focus:border-[#38BDF8] font-mono font-semibold"
                >
                  <option value="" className="bg-[#0B0F19] text-[#F8FAFC]">Select Academic Year</option>
                  <option value="1st Year" className="bg-[#0B0F19] text-[#F8FAFC]">1st Year</option>
                  <option value="2nd Year" className="bg-[#0B0F19] text-[#F8FAFC]">2nd Year</option>
                  <option value="3rd Year" className="bg-[#0B0F19] text-[#F8FAFC]">3rd Year</option>
                  <option value="4th Year" className="bg-[#0B0F19] text-[#F8FAFC]">4th Year</option>
                </select>
              </div>

              {/* PAPER YEAR FIELD (ONLY Shown for PYQ!) */}
              {form.type === 'pyq' && (
                <div>
                  <label className="block text-xs font-mono font-bold text-[#F8FAFC] mb-1">
                    Paper Year (e.g. 2026, 2025) *
                  </label>
                  <input
                    type="number"
                    value={form.paperYear}
                    onChange={(e) => setForm({ ...form, paperYear: e.target.value })}
                    placeholder="e.g. 2025"
                    required
                    min="1900"
                    max="2100"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#070A12] text-[#F8FAFC] border border-[#1E293B] rounded-xl focus:outline-none focus:border-[#38BDF8] font-semibold"
                  />
                  <span className="text-[10px] font-mono text-[#94A3B8] mt-0.5 block">
                    Exact exam question paper year
                  </span>
                </div>
              )}

              {/* SUBJECT FIELD (Shown for all types) */}
              <div>
                <label className="block text-xs font-mono font-bold text-[#F8FAFC] mb-1">
                  Subject {(form.type === 'notes' || form.type === 'unit-pdf' || form.type === 'pyq') ? '*' : '(Optional)'}
                </label>
                <select
                  value={form.subjectId}
                  onChange={(e) => setForm({ ...form, subjectId: e.target.value, unitId: '' })}
                  required={form.type === 'notes' || form.type === 'unit-pdf' || form.type === 'pyq'}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#070A12] text-[#F8FAFC] border border-[#1E293B] rounded-xl font-mono font-bold focus:outline-none focus:border-[#38BDF8]"
                >
                  <option value="" className="bg-[#0B0F19] text-[#F8FAFC]">
                    Select Subject ({allSubjects.length} Available)
                  </option>
                  {allSubjects.map((s) => (
                    <option key={s._id} value={s._id} className="bg-[#0B0F19] text-[#F8FAFC]">
                      {s.name} {s.code ? `(${s.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* UNIT FIELD (Shown for notes, unit-pdf, exam-resource, pdf, other. NOT shown for pyq or syllabus!) */}
              {form.type !== 'pyq' && form.type !== 'syllabus' && (
                <div>
                  <label className="block text-xs font-mono font-bold text-[#F8FAFC] mb-1">
                    Unit {(form.type === 'notes' || form.type === 'unit-pdf') ? '*' : '(Optional)'}
                  </label>
                  <select
                    value={form.unitId}
                    onChange={(e) => setForm({ ...form, unitId: e.target.value })}
                    required={form.type === 'notes' || form.type === 'unit-pdf'}
                    disabled={!form.subjectId || units.length === 0}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#070A12] text-[#F8FAFC] border border-[#1E293B] rounded-xl font-mono font-semibold focus:outline-none focus:border-[#38BDF8] disabled:opacity-40"
                  >
                    <option value="" className="bg-[#0B0F19] text-[#F8FAFC]">
                      {!form.subjectId
                        ? 'Select Subject first'
                        : units.length === 0
                        ? 'No Units available'
                        : (form.type === 'notes' || form.type === 'unit-pdf')
                        ? 'Select Specific Unit'
                        : 'Entire Subject / All Units'}
                    </option>
                    {units.map((u) => (
                      <option key={u._id} value={u._id} className="bg-[#0B0F19] text-[#F8FAFC]">
                        Unit {u.unitNumber}: {u.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-[#F8FAFC] mb-1">
                {editingId ? 'Replace PDF File (.pdf max 25MB)' : 'PDF File (.pdf max 25MB) *'}
              </label>
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                className="w-full px-3 py-2 text-xs bg-[#070A12] text-[#F8FAFC] border border-[#1E293B] rounded-xl file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-mono file:font-bold file:bg-[#1E293B] file:text-[#38BDF8] cursor-pointer"
              />
              {fileError && <p className="text-[11px] font-mono font-bold text-rose-400 mt-1">{fileError}</p>}
              {file && (
                <p className="text-[11px] font-mono font-bold text-emerald-400 mt-1">
                  ✓ Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#F8FAFC] mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief summary of resource content..."
                className="w-full px-3.5 py-2.5 text-xs bg-[#070A12] text-[#F8FAFC] border border-[#1E293B] rounded-xl focus:outline-none focus:border-[#38BDF8] font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[#F8FAFC] mb-1">Tags</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="Comma separated tags e.g. Operating System, Notes, PYQ"
              className="w-full px-3.5 py-2.5 text-xs bg-[#070A12] text-[#F8FAFC] border border-[#1E293B] rounded-xl focus:outline-none focus:border-[#38BDF8] font-semibold"
            />
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-mono font-bold text-xs rounded-xl shadow-md transition-colors border border-[#38BDF8]/30 cursor-pointer disabled:opacity-50"
            >
              {submitting
                ? 'Processing...'
                : editingId
                ? 'Update Resource'
                : 'Upload Resource'}
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

      {/* RESOURCE LISTING TABLE WITH SEARCH & FILTERS */}
      <div className="tech-card p-6 space-y-4 overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
          <div>
            <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center">
              <FileText className="w-4 h-4 mr-2 text-[#38BDF8]" /> All Academic Resources ({displayedResources.length})
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">Filter by subject, type, or search term</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={listFilters.q}
                onChange={(e) => setListFilters({ ...listFilters, q: e.target.value })}
                placeholder="Search..."
                className="pl-8 pr-3 py-1.5 text-xs bg-[#070A12] text-[#F8FAFC] border border-[#1E293B] rounded-xl focus:outline-none focus:border-[#38BDF8] font-mono"
              />
            </div>

            <select
              value={listFilters.subjectId}
              onChange={(e) => setListFilters({ ...listFilters, subjectId: e.target.value })}
              className="px-3 py-1.5 text-xs bg-[#070A12] text-[#F8FAFC] border border-[#1E293B] rounded-xl font-mono font-semibold"
            >
              <option value="" className="bg-[#0B0F19] text-[#F8FAFC]">All Subjects</option>
              {allSubjects.map((s) => (
                <option key={s._id} value={s._id} className="bg-[#0B0F19] text-[#F8FAFC]">
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={listFilters.type}
              onChange={(e) => setListFilters({ ...listFilters, type: e.target.value })}
              className="px-3 py-1.5 text-xs bg-[#070A12] text-[#F8FAFC] border border-[#1E293B] rounded-xl font-mono font-semibold"
            >
              <option value="" className="bg-[#0B0F19] text-[#F8FAFC]">All Types</option>
              <option value="notes" className="bg-[#0B0F19] text-[#F8FAFC]">Notes</option>
              <option value="unit-pdf" className="bg-[#0B0F19] text-[#F8FAFC]">Unit PDF</option>
              <option value="pyq" className="bg-[#0B0F19] text-[#F8FAFC]">PYQ</option>
              <option value="syllabus" className="bg-[#0B0F19] text-[#F8FAFC]">Syllabus</option>
              <option value="exam-resource" className="bg-[#0B0F19] text-[#F8FAFC]">Exam Resource</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-[#94A3B8] text-xs font-mono">Loading resources...</div>
        ) : displayedResources.length === 0 ? (
          <div className="py-8 text-center text-[#94A3B8] text-xs font-mono">
            No resources found matching filters.
          </div>
        ) : (
          <div className="divide-y divide-[#1E293B]">
            {displayedResources.map((r) => (
              <div key={r._id} className="py-3 px-2 flex items-center justify-between hover:bg-[#0F172A] text-xs transition-colors rounded-xl">
                <div className="space-y-1.5 min-w-0 pr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[#F8FAFC] text-sm">{r.title}</span>
                    <span className="tech-badge tech-badge-blue">
                      {r.type}
                    </span>
                    <span className="tech-badge tech-badge-purple">
                      {r.subjectId?.name || 'Subject'}
                    </span>
                    {r.unitId?.unitNumber && (
                      <span className="tech-badge tech-badge-cyan">
                        Unit {r.unitId.unitNumber}
                      </span>
                    )}
                  </div>
                  {r.description && <p className="text-[#94A3B8] text-xs truncate max-w-2xl">{r.description}</p>}
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Link
                    to={`/resources/${r._id}`}
                    className="p-2 text-[#38BDF8] hover:bg-[#1E293B] rounded-lg transition-colors font-mono font-bold text-[11px] flex items-center"
                    title="View Resource"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" /> View
                  </Link>
                  <button
                    onClick={() => startEdit(r)}
                    className="p-2 text-[#94A3B8] hover:text-[#38BDF8] hover:bg-[#1E293B] rounded-lg transition-colors cursor-pointer"
                    title="Edit Resource"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(r._id)}
                    className="p-2 text-[#94A3B8] hover:text-[#EF4444] hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete Resource"
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
