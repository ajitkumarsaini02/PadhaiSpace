import React, { useEffect, useState } from 'react';
import { resourceService, branchService, subjectService, unitService } from '../../services/api';
import { Trash2, Upload, Check, AlertCircle, Edit3, Search, FileText, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminResources() {
  const [resources, setResources] = useState([]);
  const [branches, setBranches] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for Table List
  const [listFilters, setListFilters] = useState({
    branchId: '',
    semesterNumber: '',
    subjectId: '',
    type: '',
    q: '',
  });

  // Upload / Edit Form State
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'notes',
    branchId: '', // empty = Common Resource (branchId: null)
    semesterNumber: '',
    subjectId: '',
    unitId: '',
    externalUrl: '',
    tags: '',
    examYear: '',
    examType: '',
  });

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [rRes, bRes, sRes] = await Promise.all([
        resourceService.getAll({ limit: 100 }),
        branchService.getAll(),
        subjectService.getAll(),
      ]);

      if (rRes.success) setResources(rRes.data);
      if (bRes.success) setBranches(bRes.data);
      if (sRes.success) {
        setAllSubjects(sRes.data);
        setFilteredSubjects(sRes.data);
      }
    } catch (err) {
      console.error('Fetch admin resources error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // DEPENDENT DROPDOWN LOGIC: Update available Subjects when Form Branch or Semester changes
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const params = {};
        if (form.branchId) params.branchId = form.branchId;
        if (form.semesterNumber) params.semesterNumber = form.semesterNumber;

        const res = await subjectService.getAll(params);
        if (res.success) {
          setFilteredSubjects(res.data);
          if (allSubjects.length === 0 && !form.branchId && !form.semesterNumber) {
            setAllSubjects(res.data);
          }
        }
      } catch (err) {
        console.error('Fetch dependent subjects error:', err);
      }
    };

    loadSubjects();
  }, [form.branchId, form.semesterNumber]);

  useEffect(() => {
    if (form.subjectId && filteredSubjects.length > 0 && !filteredSubjects.some((s) => s._id === form.subjectId)) {
      setForm((prev) => ({ ...prev, subjectId: '', unitId: '' }));
    }
  }, [filteredSubjects, form.subjectId]);

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

  // Handle PDF File selection with strict client-side validation
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFileError('');
    if (!selectedFile) {
      setFile(null);
      return;
    }

    // 1. Extension check
    const filename = selectedFile.name.toLowerCase();
    if (!filename.endsWith('.pdf')) {
      setFileError('Invalid file extension. Only .pdf files are allowed.');
      setFile(null);
      e.target.value = '';
      return;
    }

    // 2. MIME type check
    if (selectedFile.type && selectedFile.type !== 'application/pdf' && selectedFile.type !== 'application/x-pdf') {
      setFileError('Invalid MIME type. Only application/pdf files are accepted.');
      setFile(null);
      e.target.value = '';
      return;
    }

    // 3. File size check (25MB limit)
    if (selectedFile.size > 25 * 1024 * 1024) {
      setFileError('File size exceeds the 25 MB limit.');
      setFile(null);
      e.target.value = '';
      return;
    }

    setFile(selectedFile);
  };

  // Reset Form
  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: '',
      description: '',
      type: 'notes',
      branchId: '',
      semesterNumber: '',
      subjectId: '',
      unitId: '',
      externalUrl: '',
      tags: '',
      examYear: '',
      examType: '',
    });
    setFile(null);
    setFileError('');
    setMsg({ type: '', text: '' });
  };

  // Edit Resource Prep
  const startEdit = (r) => {
    setEditingId(r._id);
    setForm({
      title: r.title || '',
      description: r.description || '',
      type: r.type || 'notes',
      branchId: r.branchId?._id || r.branchId || '',
      semesterNumber: r.semesterId?.number || '',
      subjectId: r.subjectId?._id || r.subjectId || '',
      unitId: r.unitId?._id || r.unitId || '',
      externalUrl: r.externalUrl || '',
      tags: Array.isArray(r.tags) ? r.tags.join(', ') : r.tags || '',
      examYear: r.examYear || '',
      examType: r.examType || '',
    });
    setFile(null);
    setFileError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Handler (Create or Update with PDF Upload/Replacement)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!form.title.trim()) {
      setMsg({ type: 'error', text: 'Resource Title is required' });
      return;
    }

    if (!form.subjectId) {
      setMsg({ type: 'error', text: 'Please select a valid Subject' });
      return;
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
      formData.append('branchId', form.branchId || ''); // empty string maps to common resource on backend
      formData.append('subjectId', form.subjectId);

      // Resolve target semester ID
      const subjObj = allSubjects.find((s) => s._id === form.subjectId);
      if (subjObj) {
        const targetSemId = subjObj.semesterId?._id || subjObj.semesterId;
        if (targetSemId) formData.append('semesterId', targetSemId);
      }

      if (form.unitId) formData.append('unitId', form.unitId);
      if (form.externalUrl) formData.append('externalUrl', form.externalUrl.trim());
      if (form.tags) formData.append('tags', form.tags);
      if (form.examYear) formData.append('examYear', form.examYear);
      if (form.examType) formData.append('examType', form.examType);
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
          text: editingId ? 'Resource updated & file replaced successfully!' : 'Resource uploaded successfully!',
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

  // Delete Handler
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource permanently? The associated PDF file will be removed.')) return;
    try {
      await resourceService.delete(id);
      setResources((prev) => prev.filter((r) => r._id !== id));
      setMsg({ type: 'success', text: 'Resource deleted cleanly.' });
    } catch (err) {
      alert('Delete resource failed: ' + err.message);
    }
  };

  // Filter List Resources
  const displayedResources = resources.filter((r) => {
    if (listFilters.branchId) {
      if (listFilters.branchId === 'common') {
        if (r.branchId) return false;
      } else {
        if ((r.branchId?._id || r.branchId) !== listFilters.branchId) return false;
      }
    }

    if (listFilters.semesterNumber) {
      if (Number(r.semesterId?.number) !== Number(listFilters.semesterNumber)) return false;
    }

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
      if (!matchTitle && !matchSubject) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172033] dark:text-[#F8FAFC]">Admin Resource Upload & Management</h1>
          <p className="text-xs text-[#64748B] dark:text-[#9AA6BC] mt-1">
            Upload PDF notes, PYQs, syllabi & exam resources using dependent dropdowns and file validation
          </p>
        </div>
        <Link to="/admin" className="text-xs font-bold text-[#F2A93B] bg-[#161D31] hover:bg-[#1C253E] px-3.5 py-2 rounded-xl border border-[#252D42] transition-colors">
          ← Back to Admin
        </Link>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between ${msg.type === 'success' ? 'bg-[#36B37E]/10 text-[#36B37E] border border-[#36B37E]/30' : 'bg-[#E05252]/10 text-[#E05252] border border-[#E05252]/30'}`}>
          <div className="flex items-center space-x-2">
            {msg.type === 'success' ? <Check className="w-4 h-4 text-[#36B37E]" /> : <AlertCircle className="w-4 h-4 text-[#E05252]" />}
            <span>{msg.text}</span>
          </div>
          <button onClick={() => setMsg({ type: '', text: '' })} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ADMIN RESOURCE UPLOAD / EDIT FORM */}
      <div className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC] rounded-3xl p-6 border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle space-y-5">
        <div className="flex items-center justify-between border-b border-[#DCE2EC] dark:border-[#252D42] pb-3">
          <h3 className="text-sm font-extrabold text-[#172033] dark:text-[#F8FAFC] flex items-center">
            {editingId ? <Edit3 className="w-4 h-4 mr-2 text-[#4F8FEF]" /> : <Upload className="w-4 h-4 mr-2 text-[#F2A93B]" />}
            {editingId ? 'Edit Resource & Replace PDF' : 'Upload New Resource'}
          </h3>
          {editingId && (
            <button
              onClick={resetForm}
              className="text-xs font-bold text-[#64748B] dark:text-[#9AA6BC] hover:text-[#172033] dark:hover:text-white bg-[#F5F7FB] dark:bg-[#161D31] px-2.5 py-1 rounded-lg border border-[#DCE2EC] dark:border-[#252D42]"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Resource Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Data Structure Unit 1 Complete Lecture Notes"
                required
                className="w-full px-3.5 py-2.5 text-xs bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#9AA6BC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl focus:outline-none focus:border-[#4F8FEF] font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Resource Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl focus:outline-none font-semibold"
              >
                <option value="notes" className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">Semester Notes</option>
                <option value="pdf" className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">Unit PDF</option>
                <option value="pyq" className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">PYQ (Past Exam Paper)</option>
                <option value="syllabus" className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">Syllabus</option>
                <option value="exam-resource" className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">Exam Resource</option>
                <option value="other" className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">Other Academic File</option>
              </select>
            </div>
          </div>

          {/* DEPENDENT DROPDOWNS: Branch -> Semester -> Subject -> Unit */}
          <div className="p-4 bg-[#F5F7FB] dark:bg-[#161D31]/80 rounded-2xl border border-[#DCE2EC] dark:border-[#252D42] space-y-3">
            <p className="text-[11px] font-extrabold text-[#64748B] dark:text-[#9AA6BC] uppercase tracking-wider">
              Academic Mapping (Dependent Dropdowns)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Step 1: Branch */}
              <div>
                <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">1. Branch</label>
                <select
                  value={form.branchId}
                  onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl font-semibold"
                >
                  <option value="" className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">🌐 Common (All Branches)</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id} className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">
                      {b.name} ({b.code.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Semester */}
              <div>
                <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">2. Semester</label>
                <select
                  value={form.semesterNumber}
                  onChange={(e) => setForm({ ...form, semesterNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl font-semibold"
                >
                  <option value="" className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">All Semesters (1 - 8)</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s} className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 3: Subject (Filtered based on Branch & Semester) */}
              <div>
                <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">3. Subject *</label>
                <select
                  value={form.subjectId}
                  onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl font-bold"
                >
                  <option value="" className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">Select Subject ({filteredSubjects.length} Available)</option>
                  {filteredSubjects.map((s) => (
                    <option key={s._id} value={s._id} className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">
                      {s.name} {s.code ? `(${s.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 4: Unit (Filtered based on selected Subject) */}
              <div>
                <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">4. Syllabus Unit</label>
                <select
                  value={form.unitId}
                  onChange={(e) => setForm({ ...form, unitId: e.target.value })}
                  disabled={!form.subjectId || units.length === 0}
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl font-semibold disabled:opacity-50"
                >
                  <option value="" className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">
                    {!form.subjectId
                      ? 'Select Subject first'
                      : units.length === 0
                      ? 'No Units available'
                      : 'Entire Subject / All Units'}
                  </option>
                  {units.map((u) => (
                    <option key={u._id} value={u._id} className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">
                      Unit {u.unitNumber}: {u.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* PDF FILE UPLOAD WITH VALIDATION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">
                {editingId ? 'Replace PDF File (.pdf max 25MB)' : 'Select PDF File (.pdf max 25MB) *'}
              </label>
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                className="w-full px-3.5 py-2 text-xs bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#EFF5FF] dark:file:bg-[#111729] file:text-[#4F8FEF] cursor-pointer"
              />
              {fileError && <p className="text-[11px] font-bold text-[#E05252] mt-1">{fileError}</p>}
              {file && (
                <p className="text-[11px] font-bold text-[#36B37E] mt-1">
                  ✓ Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">External PDF Link (Fallback)</label>
              <input
                type="url"
                value={form.externalUrl}
                onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
                placeholder="https://example.com/lecture-notes.pdf"
                className="w-full px-3.5 py-2.5 text-xs bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#9AA6BC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl focus:outline-none focus:border-[#4F8FEF] font-semibold"
              />
            </div>
          </div>

          {/* PYQ Fields if PYQ selected */}
          {form.type === 'pyq' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-amber-500/10 dark:bg-[#161D31] rounded-2xl border border-[#F2A93B]/30 dark:border-[#252D42]">
              <div>
                <label className="block text-xs font-bold text-[#F2A93B] mb-1">Exam Year</label>
                <input
                  type="number"
                  value={form.examYear}
                  onChange={(e) => setForm({ ...form, examYear: e.target.value })}
                  placeholder="e.g. 2024"
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#F2A93B] mb-1">Exam Type</label>
                <select
                  value={form.examType}
                  onChange={(e) => setForm({ ...form, examType: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl font-semibold"
                >
                  <option value="" className="bg-white dark:bg-[#111729]">Select Exam Type</option>
                  <option value="Mid Semester" className="bg-white dark:bg-[#111729]">Mid Semester</option>
                  <option value="End Semester" className="bg-white dark:bg-[#111729]">End Semester</option>
                  <option value="University Exam" className="bg-white dark:bg-[#111729]">University Exam</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Description & Tags</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief summary of resource content..."
                className="w-full px-3.5 py-2.5 text-xs bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#9AA6BC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl focus:outline-none focus:border-[#4F8FEF] font-semibold"
              />
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="Comma separated tags e.g. Data Structures, Notes, AKTU"
                className="w-full px-3.5 py-2.5 text-xs bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#9AA6BC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl focus:outline-none focus:border-[#4F8FEF] font-semibold"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#F2A93B] hover:bg-[#d9942b] text-white font-extrabold text-xs rounded-xl shadow-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting
                ? 'Processing...'
                : editingId
                ? 'Update Resource & Replace PDF'
                : 'Upload Academic Resource'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 bg-slate-100 dark:bg-[#161D31] text-slate-700 dark:text-[#F8FAFC] font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-[#1C253E] border border-transparent dark:border-[#252D42] transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* RESOURCE LISTING TABLE WITH SEARCH & FILTERS */}
      <div className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC] rounded-3xl border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle overflow-hidden space-y-4 p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#DCE2EC] dark:border-[#252D42] pb-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#172033] dark:text-[#F8FAFC] flex items-center">
              <FileText className="w-4 h-4 mr-2 text-[#4F8FEF]" /> Uploaded Academic Resources ({displayedResources.length})
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#9AA6BC] mt-0.5">Filter resources by branch, semester, subject, type, or search term</p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#64748B] dark:text-[#9AA6BC] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={listFilters.q}
                onChange={(e) => setListFilters({ ...listFilters, q: e.target.value })}
                placeholder="Search..."
                className="pl-8 pr-3 py-1.5 text-xs bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#9AA6BC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl focus:outline-none focus:border-[#4F8FEF] font-medium"
              />
            </div>

            {/* Branch Filter */}
            <select
              value={listFilters.branchId}
              onChange={(e) => setListFilters({ ...listFilters, branchId: e.target.value })}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] border border-slate-200 dark:border-[#252D42] rounded-xl font-medium"
            >
              <option value="" className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">All Branches</option>
              <option value="common" className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">🌐 Common Resources Only</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id} className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">
                  {b.name}
                </option>
              ))}
            </select>

            {/* Semester Filter */}
            <select
              value={listFilters.semesterNumber}
              onChange={(e) => setListFilters({ ...listFilters, semesterNumber: e.target.value })}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] border border-slate-200 dark:border-[#252D42] rounded-xl font-medium"
            >
              <option value="" className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s} className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">
                  Sem {s}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={listFilters.type}
              onChange={(e) => setListFilters({ ...listFilters, type: e.target.value })}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] border border-slate-200 dark:border-[#252D42] rounded-xl font-medium"
            >
              <option value="" className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">All Types</option>
              <option value="notes" className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">Notes</option>
              <option value="pdf" className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">PDF</option>
              <option value="pyq" className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">PYQ</option>
              <option value="syllabus" className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">Syllabus</option>
              <option value="exam-resource" className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC]">Exam Resource</option>
            </select>
          </div>
        </div>

        {/* Resource Items */}
        {displayedResources.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">
            No academic resources found matching your selected filters.
          </div>
        ) : (
          <div className="divide-y divide-[#DCE2EC] dark:divide-[#252D42]">
            {displayedResources.map((r) => (
              <div key={r._id} className="py-3.5 flex items-center justify-between hover:bg-[#F5F7FB] dark:hover:bg-[#161D31] text-xs transition-colors rounded-xl px-3">
                <div className="space-y-1.5 min-w-0 pr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-[#172033] dark:text-[#F8FAFC] text-sm">{r.title}</span>
                    <span className="px-2.5 py-0.5 rounded bg-[#EFF5FF] dark:bg-[#161D31] text-[#4F8FEF] font-bold uppercase text-[10px] border border-[#DCE2EC] dark:border-[#252D42]">
                      {r.type}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC] font-semibold border border-[#DCE2EC] dark:border-[#252D42] text-[10px]">
                      {r.subjectId?.name || 'Subject'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-[#F2A93B] font-bold border border-[#F2A93B]/30 text-[10px]">
                      {r.branchId ? r.branchId.name : '🌐 Common Resource'}
                    </span>
                    {r.semesterId?.number && (
                      <span className="px-2.5 py-0.5 rounded bg-white dark:bg-[#111729] text-[#64748B] dark:text-[#9AA6BC] font-medium border border-[#DCE2EC] dark:border-[#252D42] text-[10px]">
                        Sem {r.semesterId.number}
                      </span>
                    )}
                    {r.unitId?.unitNumber && (
                      <span className="px-2.5 py-0.5 rounded bg-[#4F8FEF]/10 text-[#4F8FEF] font-bold border border-[#4F8FEF]/30 text-[10px]">
                        Unit {r.unitId.unitNumber}
                      </span>
                    )}
                  </div>
                  {r.description && <p className="text-[#64748B] dark:text-[#9AA6BC] text-xs truncate max-w-2xl">{r.description}</p>}
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => startEdit(r)}
                    className="p-2 text-[#64748B] dark:text-[#9AA6BC] hover:text-[#4F8FEF] hover:bg-[#EFF5FF] dark:hover:bg-[#161D31] rounded-lg transition-colors cursor-pointer"
                    title="Edit & Replace PDF"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(r._id)}
                    className="p-2 text-[#64748B] dark:text-[#9AA6BC] hover:text-[#E05252] hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
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
