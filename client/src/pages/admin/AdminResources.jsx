import React, { useEffect, useState, useRef, useCallback } from 'react';
import { resourceService, subjectService, unitService } from '../../services/api';
import AdminNav from '../../components/AdminNav';
import {
  Trash2,
  Upload,
  Check,
  AlertCircle,
  Edit3,
  Search,
  FileText,
  X,
  Eye,
  FileUp,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Layers,
  Calendar,
  Building2,
  Sparkles,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const RESOURCE_TYPES = [
  {
    id: 'notes',
    label: 'Notes',
    helper: 'Upload study notes for a subject or unit.',
    badgeClass: 'tech-badge-cyan',
  },
  {
    id: 'unit-pdf',
    label: 'Unit PDF',
    helper: 'Upload a PDF specifically for one subject unit.',
    badgeClass: 'tech-badge-blue',
  },
  {
    id: 'pyq',
    label: 'Previous Year Question Paper',
    helper: 'Upload a previous year university or examination question paper.',
    badgeClass: 'tech-badge-purple',
  },
  {
    id: 'syllabus',
    label: 'Syllabus',
    helper: 'Upload the syllabus for a subject or academic year.',
    badgeClass: 'tech-badge-green',
  },
  {
    id: 'exam-resource',
    label: 'Exam Resource',
    helper: 'Upload exam preparation material, revision notes, or model papers.',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 tech-badge',
  },
  {
    id: 'pdf',
    label: 'PDF Document',
    helper: 'Upload a general reference PDF document.',
    badgeClass: 'bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-[#94A3B8] border border-slate-200 dark:border-[#334155] tech-badge',
  },
  {
    id: 'other',
    label: 'Other',
    helper: 'Upload miscellaneous study or reference material.',
    badgeClass: 'bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-[#94A3B8] border border-slate-200 dark:border-[#334155] tech-badge',
  },
];

const SOURCE_PRESETS = [
  'Gateway Classes',
  'EduShine Classes',
  'Multi Atom',
  'Other Notes',
];

const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function AdminResources() {
  const [searchParams] = useSearchParams();
  const initialSubjectId = searchParams.get('subjectId') || '';

  // Data states
  const [resources, setResources] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Pagination & Count State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters State
  const [filters, setFilters] = useState({
    subjectId: initialSubjectId,
    type: '',
    academicYear: '',
    paperYear: '',
    source: '',
    q: '',
  });

  // Debounced search query for API calls
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filters.q);
    }, 400);
    return () => clearTimeout(handler);
  }, [filters.q]);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'notes',
    subjectId: initialSubjectId,
    unitId: '',
    tags: '',
    source: '',
    academicYear: '',
    paperYear: '',
  });

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // UI States
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deletingResource, setDeletingResource] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form section scroll ref
  const formCardRef = useRef(null);

  // Load Subjects from MongoDB API
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const sRes = await subjectService.getAll();
        if (sRes.success) {
          setAllSubjects(sRes.data || []);
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      }
    };
    loadSubjects();
  }, []);

  // Fetch Resources from MongoDB API with Pagination & Filtering
  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(false);

      const params = {
        page,
        limit,
      };

      if (filters.subjectId) params.subjectId = filters.subjectId;
      if (filters.type) params.type = filters.type;
      if (filters.academicYear) params.academicYear = filters.academicYear;
      if (filters.paperYear) params.paperYear = filters.paperYear;
      if (filters.source) params.source = filters.source;
      if (debouncedSearch.trim()) params.q = debouncedSearch.trim();

      const rRes = await resourceService.getAll(params);

      if (rRes.success) {
        setResources(rRes.data || []);
        setTotalCount(rRes.count ?? rRes.pagination?.total ?? (rRes.data || []).length);
        setTotalPages(rRes.totalPages ?? (Math.ceil((rRes.count || (rRes.data || []).length) / limit) || 1));
      } else {
        setFetchError(true);
      }
    } catch (err) {
      console.error('Fetch admin resources error:', err);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters.subjectId, filters.type, filters.academicYear, filters.paperYear, filters.source, debouncedSearch]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // DEPENDENT DROPDOWN: Load Units when Form Subject changes
  useEffect(() => {
    if (form.subjectId) {
      unitService.getAll(form.subjectId).then((res) => {
        if (res.success) {
          setUnits(res.data || []);
        } else {
          setUnits([]);
        }
      }).catch((err) => {
        console.error('Error loading units:', err);
        setUnits([]);
      });
    } else {
      setUnits([]);
      setForm((prev) => ({ ...prev, unitId: '' }));
    }
  }, [form.subjectId]);

  // Helper for File Validation
  const validateAndSetFile = (selectedFile) => {
    setFileError('');
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const filename = selectedFile.name.toLowerCase();
    if (!filename.endsWith('.pdf')) {
      setFileError('Invalid file format. Only .pdf files are allowed.');
      setFile(null);
      return;
    }

    if (selectedFile.size > 25 * 1024 * 1024) {
      setFileError('File size exceeds the 25 MB limit.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: '',
      description: '',
      type: 'notes',
      subjectId: '',
      unitId: '',
      tags: '',
      source: '',
      academicYear: '',
      paperYear: '',
      externalUrl: '',
    });
    setFile(null);
    setFileError('');
    setMsg({ type: '', text: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startEdit = (r) => {
    setEditingId(r._id);
    setForm({
      title: r.title || '',
      description: r.description || '',
      type: r.type || 'notes',
      subjectId: r.subjectId?._id || r.subjectId || '',
      unitId: r.unitId?._id || r.unitId || '',
      tags: Array.isArray(r.tags) ? r.tags.join(', ') : r.tags || '',
      source: r.source || '',
      academicYear: r.academicYear || '',
      paperYear: r.paperYear ? String(r.paperYear) : '',
      externalUrl: r.externalUrl || r.fileUrl || '',
    });
    setFile(null);
    setFileError('');
    setMsg({ type: '', text: '' });

    if (formCardRef.current) {
      formCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    const currentType = form.type;
    const isNotesOrUnitPdf = currentType === 'notes' || currentType === 'unit-pdf';
    const isPyq = currentType === 'pyq';

    // Frontend validation rules based on type
    if (!form.title.trim()) {
      setMsg({ type: 'error', text: 'Resource Title is required.' });
      return;
    }

    if (isNotesOrUnitPdf) {
      if (!form.source.trim()) {
        setMsg({ type: 'error', text: `Source / Provider is required for ${currentType === 'notes' ? 'Notes' : 'Unit PDF'}.` });
        return;
      }
      if (!form.academicYear) {
        setMsg({ type: 'error', text: 'Academic Year is required.' });
        return;
      }
      if (!form.subjectId) {
        setMsg({ type: 'error', text: 'Subject is required.' });
        return;
      }
      if (!form.unitId) {
        setMsg({ type: 'error', text: 'Unit is required.' });
        return;
      }
    } else if (isPyq) {
      if (!form.academicYear) {
        setMsg({ type: 'error', text: 'Academic Year is required for Previous Year Question Paper.' });
        return;
      }
      if (!form.paperYear || isNaN(Number(form.paperYear))) {
        setMsg({ type: 'error', text: 'Paper Year (e.g. 2025) is required for Previous Year Question Paper.' });
        return;
      }
      if (!form.subjectId) {
        setMsg({ type: 'error', text: 'Subject is required for Previous Year Question Paper.' });
        return;
      }
    }

    if (!editingId && !file && !form.externalUrl.trim()) {
      setMsg({ type: 'error', text: 'PDF File upload OR External PDF URL (Google Drive / Cloudinary Link) is required.' });
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('description', form.description.trim());
      formData.append('type', currentType);

      if (form.subjectId) formData.append('subjectId', form.subjectId);
      if (form.unitId && !isPyq && currentType !== 'syllabus') {
        formData.append('unitId', form.unitId);
      }
      if (form.tags) formData.append('tags', form.tags.trim());
      if (form.source && (isNotesOrUnitPdf || isPyq)) {
        formData.append('source', form.source.trim());
      }
      if (form.academicYear) formData.append('academicYear', form.academicYear);
      if (isPyq && form.paperYear) formData.append('paperYear', form.paperYear);
      if (form.externalUrl) formData.append('externalUrl', form.externalUrl.trim());
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
          text: editingId ? 'Resource updated successfully.' : 'Resource uploaded successfully.',
        });
        resetForm();
        fetchResources();
      }
    } catch (err) {
      console.error('Submit resource error:', err);
      setMsg({ type: 'error', text: err.message || 'Failed to save resource' });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingResource) return;
    try {
      setDeleteLoading(true);
      await resourceService.delete(deletingResource._id);
      setMsg({ type: 'success', text: `Resource "${deletingResource.title}" deleted successfully.` });
      setDeletingResource(null);
      fetchResources();
    } catch (err) {
      console.error('Delete error:', err);
      setMsg({ type: 'error', text: 'Failed to delete resource: ' + err.message });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      subjectId: '',
      type: '',
      academicYear: '',
      paperYear: '',
      source: '',
      q: '',
    });
    setPage(1);
  };

  const currentTypeConfig = RESOURCE_TYPES.find((t) => t.id === form.type) || RESOURCE_TYPES[0];

  const showingStart = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const showingEnd = Math.min(page * limit, totalCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900 dark:text-[#F8FAFC]">
      {/* PAGE HEADER */}
      <AdminNav
        title="Resource Management"
        subtitle="Upload and manage free engineering notes, PYQs, syllabi, and study resources."
      />

      {/* ALERT NOTIFICATION */}
      {msg.text && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30'
          }`}
        >
          <div className="flex items-center space-x-2">
            {msg.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
          <button
            onClick={() => setMsg({ type: '', text: '' })}
            className="p-1 hover:bg-slate-200 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* UPLOAD RESOURCE CARD */}
      <div ref={formCardRef} className="tech-card p-6 space-y-6 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#1E293B]">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E293B] pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center">
              {editingId ? (
                <Edit3 className="w-4 h-4 mr-2 text-blue-600 dark:text-[#38BDF8]" />
              ) : (
                <Upload className="w-4 h-4 mr-2 text-blue-600 dark:text-[#38BDF8]" />
              )}
              {editingId ? 'Edit Resource' : 'Upload Resource'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
              Add notes, PYQs, syllabus and other study material for engineering students.
            </p>
          </div>

          {editingId && (
            <button
              onClick={resetForm}
              className="text-xs font-mono font-bold text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#0B0F19] px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#1E293B] transition-colors cursor-pointer flex items-center"
            >
              <X className="w-3.5 h-3.5 mr-1" /> Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION: Resource Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-blue-600 dark:text-[#38BDF8] uppercase tracking-wider flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1.5" /> Resource Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Resource Title */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-800 dark:text-[#F8FAFC] mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder={
                    form.type === 'notes' || form.type === 'unit-pdf'
                      ? 'e.g. Operating System Unit 1 Notes'
                      : form.type === 'pyq'
                      ? 'e.g. DBMS End-Semester PYQ 2025'
                      : form.type === 'syllabus'
                      ? 'e.g. Computer Networks Official Syllabus'
                      : 'e.g. Quick Revision Notes'
                  }
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-[#38BDF8] font-semibold"
                />
              </div>

              {/* Resource Type Dropdown */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-800 dark:text-[#F8FAFC] mb-1">
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
                      unitId: newType === 'pyq' || newType === 'syllabus' ? '' : prev.unitId,
                      source: newType === 'syllabus' || newType === 'exam-resource' || newType === 'pdf' || newType === 'other' ? '' : prev.source,
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-[#38BDF8] font-mono font-semibold cursor-pointer"
                >
                  {RESOURCE_TYPES.map((t) => (
                    <option key={t.id} value={t.id} className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">
                      {t.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] font-mono text-blue-600 dark:text-[#38BDF8] mt-1.5 font-medium">
                  {currentTypeConfig.helper}
                </p>
              </div>
            </div>
          </div>

          {/* DYNAMIC FIELDS SECTION */}
          <div className="p-4 bg-slate-50 dark:bg-[#0B0F19] rounded-xl border border-slate-200 dark:border-[#1E293B] space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-600 dark:text-[#94A3B8] uppercase tracking-wider flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-[#38BDF8]" /> Categorization & Metadata
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* SOURCE / PROVIDER (Notes, Unit PDF, PYQ) */}
              {(form.type === 'notes' || form.type === 'unit-pdf' || form.type === 'pyq') && (
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-800 dark:text-[#F8FAFC] mb-1">
                    Source / Provider {form.type === 'notes' || form.type === 'unit-pdf' ? '*' : '(Optional)'}
                  </label>
                  <input
                    type="text"
                    list="source-presets"
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                    placeholder="e.g. Gateway Classes, EduShine Classes"
                    required={form.type === 'notes' || form.type === 'unit-pdf'}
                    className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-[#070A12] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-[#38BDF8] font-semibold"
                  />
                  <datalist id="source-presets">
                    {SOURCE_PRESETS.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
              )}

              {/* ACADEMIC YEAR (Required for Notes, Unit PDF, PYQ; Optional for others) */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-800 dark:text-[#F8FAFC] mb-1">
                  Academic Year {form.type === 'notes' || form.type === 'unit-pdf' || form.type === 'pyq' ? '*' : '(Optional)'}
                </label>
                <select
                  value={form.academicYear}
                  onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                  required={form.type === 'notes' || form.type === 'unit-pdf' || form.type === 'pyq'}
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-[#070A12] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-[#38BDF8] font-mono font-semibold cursor-pointer"
                >
                  <option value="" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">
                    Select Academic Year
                  </option>
                  {ACADEMIC_YEARS.map((yr) => (
                    <option key={yr} value={yr} className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* PAPER YEAR (ONLY FOR PYQ!) */}
              {form.type === 'pyq' && (
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-800 dark:text-[#F8FAFC] mb-1">
                    Paper Year (e.g. 2026, 2025) *
                  </label>
                  <input
                    type="number"
                    value={form.paperYear}
                    onChange={(e) => setForm({ ...form, paperYear: e.target.value })}
                    placeholder="e.g. 2025"
                    required
                    min="1990"
                    max="2100"
                    className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-[#070A12] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-[#38BDF8] font-semibold"
                  />
                  <span className="text-[10px] font-mono text-slate-500 dark:text-[#94A3B8] mt-0.5 block">
                    Exam paper year
                  </span>
                </div>
              )}

              {/* SUBJECT (Loaded from MongoDB) */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-800 dark:text-[#F8FAFC] mb-1">
                  Subject {form.type === 'notes' || form.type === 'unit-pdf' || form.type === 'pyq' ? '*' : '(Optional)'}
                </label>
                <select
                  value={form.subjectId}
                  onChange={(e) => setForm({ ...form, subjectId: e.target.value, unitId: '' })}
                  required={form.type === 'notes' || form.type === 'unit-pdf' || form.type === 'pyq'}
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-[#070A12] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#1E293B] rounded-xl font-mono font-bold focus:outline-none focus:border-blue-500 dark:focus:border-[#38BDF8] cursor-pointer"
                >
                  <option value="" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">
                    {allSubjects.length === 0 ? 'Loading Subjects...' : `Select Subject (${allSubjects.length} Available)`}
                  </option>
                  {allSubjects.map((s) => (
                    <option key={s._id} value={s._id} className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">
                      {s.name} {s.code ? `(${s.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* UNIT (Loaded from MongoDB; Hidden for PYQ & Syllabus) */}
              {form.type !== 'pyq' && form.type !== 'syllabus' && (
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-800 dark:text-[#F8FAFC] mb-1">
                    Unit {form.type === 'notes' || form.type === 'unit-pdf' ? '*' : '(Optional)'}
                  </label>
                  <select
                    value={form.unitId}
                    onChange={(e) => setForm({ ...form, unitId: e.target.value })}
                    required={form.type === 'notes' || form.type === 'unit-pdf'}
                    disabled={!form.subjectId || units.length === 0}
                    className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-[#070A12] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#1E293B] rounded-xl font-mono font-semibold focus:outline-none focus:border-blue-500 dark:focus:border-[#38BDF8] disabled:opacity-40 cursor-pointer"
                  >
                    <option value="" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">
                      {!form.subjectId
                        ? 'Select Subject First'
                        : units.length === 0
                        ? 'No Units Available'
                        : form.type === 'notes' || form.type === 'unit-pdf'
                        ? 'Select Specific Unit'
                        : 'Entire Subject / All Units'}
                    </option>
                    {units.map((u) => (
                      <option key={u._id} value={u._id} className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">
                        Unit {u.unitNumber}: {u.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* DRAG-AND-DROP FILE UPLOAD BOX & DESCRIPTION / TAGS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Custom Drag and Drop PDF Upload Box */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-800 dark:text-[#F8FAFC] mb-1">
                Upload PDF {editingId ? '(Optional if keeping existing PDF)' : '*'}
              </label>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[140px] ${
                  isDragging
                    ? 'border-blue-500 bg-blue-500/10'
                    : file
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-slate-300 dark:border-[#1E293B] hover:border-blue-500/50 bg-slate-50 dark:bg-[#070A12]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {file ? (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] truncate max-w-xs">{file.name}</p>
                      <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ✓ {(file.size / (1024 * 1024)).toFixed(2)} MB PDF Selected
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-[11px] font-mono text-rose-600 dark:text-rose-400 hover:underline inline-block mt-1"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#1E293B] text-blue-600 dark:text-[#38BDF8] flex items-center justify-center mx-auto">
                      <FileUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">Click to upload or drag and drop</p>
                      <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-mono mt-0.5">PDF only • Max 25MB</p>
                    </div>
                  </div>
                )}
              </div>

              {fileError && (
                <p className="text-[11px] font-mono font-bold text-rose-600 dark:text-rose-400 mt-1.5 flex items-center">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" /> {fileError}
                </p>
              )}

              {/* OR External PDF URL (Google Drive, Cloudinary, AWS S3) */}
              <div className="mt-3">
                <label className="block text-xs font-mono font-bold text-slate-800 dark:text-[#F8FAFC] mb-1">
                  OR External PDF Link (Google Drive / Cloudinary)
                </label>
                <input
                  type="url"
                  value={form.externalUrl}
                  onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
                  placeholder="e.g. https://drive.google.com/file/d/1.../view or https://res.cloudinary.com/..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none focus:border-blue-500 font-mono"
                />
                <p className="text-[10px] font-mono text-blue-600 dark:text-[#38BDF8] mt-1 font-medium">
                  💡 Recommended for Vercel/Render hosting. Google Drive & Cloudinary links automatically stream with full watermarking protection!
                </p>
              </div>
            </div>

            {/* Description & Tags */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-800 dark:text-[#F8FAFC] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of this resource..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-[#38BDF8] font-semibold resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-800 dark:text-[#F8FAFC] mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="e.g. Operating System, Notes, Unit 1"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-[#38BDF8] font-semibold"
                />
                <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] mt-1">
                  Add relevant tags to help with search.
                </p>
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all flex items-center border border-blue-500/30 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RotateCcw className="w-4 h-4 mr-2 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {editingId ? 'Update Resource' : 'Upload Resource'}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2.5 bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#334155] text-slate-700 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white font-mono text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-transparent"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* UPLOADED RESOURCES SECTION */}
      <div className="tech-card p-6 space-y-6 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#1E293B]">
        {/* SECTION HEADER & FILTERS */}
        <div className="space-y-4 border-b border-slate-200 dark:border-[#1E293B] pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center">
                <FileText className="w-4 h-4 mr-2 text-blue-600 dark:text-[#38BDF8]" /> Uploaded Resources
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
                Manage and edit your uploaded resources.
              </p>
            </div>

            {(filters.subjectId || filters.type || filters.academicYear || filters.paperYear || filters.source || filters.q) && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-mono text-blue-600 dark:text-[#38BDF8] hover:underline flex items-center self-start sm:self-auto cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Filters
              </button>
            )}
          </div>

          {/* FILTER CONTROLS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filters.q}
                onChange={(e) => {
                  setFilters({ ...filters, q: e.target.value });
                  setPage(1);
                }}
                placeholder="Search resources..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-[#38BDF8] font-mono"
              />
            </div>

            {/* Filter by Subject */}
            <select
              value={filters.subjectId}
              onChange={(e) => {
                setFilters({ ...filters, subjectId: e.target.value });
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#1E293B] rounded-xl font-mono font-semibold focus:outline-none focus:border-blue-500 dark:focus:border-[#38BDF8] cursor-pointer"
            >
              <option value="" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">All Subjects</option>
              {allSubjects.map((s) => (
                <option key={s._id} value={s._id} className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">
                  {s.name}
                </option>
              ))}
            </select>

            {/* Filter by Resource Type */}
            <select
              value={filters.type}
              onChange={(e) => {
                setFilters({ ...filters, type: e.target.value });
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#1E293B] rounded-xl font-mono font-semibold focus:outline-none focus:border-blue-500 dark:focus:border-[#38BDF8] cursor-pointer"
            >
              <option value="" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">All Resource Types</option>
              {RESOURCE_TYPES.map((t) => (
                <option key={t.id} value={t.id} className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">
                  {t.label}
                </option>
              ))}
            </select>

            {/* Filter by Academic Year */}
            <select
              value={filters.academicYear}
              onChange={(e) => {
                setFilters({ ...filters, academicYear: e.target.value });
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#1E293B] rounded-xl font-mono font-semibold focus:outline-none focus:border-blue-500 dark:focus:border-[#38BDF8] cursor-pointer"
            >
              <option value="" className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">All Academic Years</option>
              {ACADEMIC_YEARS.map((yr) => (
                <option key={yr} value={yr} className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#F8FAFC]">
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TABLE OR STATES */}
        {loading ? (
          <div className="space-y-3 py-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-[#0B0F19] rounded-xl animate-pulse border border-slate-200 dark:border-[#1E293B]"></div>
            ))}
          </div>
        ) : fetchError ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Unable to load resources.</h3>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">An error occurred while communicating with MongoDB.</p>
            </div>
            <button
              onClick={fetchResources}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-xs rounded-xl transition-all inline-flex items-center cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Retry
            </button>
          </div>
        ) : resources.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#1E293B] text-slate-400 dark:text-[#94A3B8] flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">No resources available yet.</h3>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
                Upload your first engineering resource to get started.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#1E293B] text-[11px] font-mono font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">
                  <th className="py-3 px-3">Title</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Subject</th>
                  <th className="py-3 px-3">Academic Year</th>
                  <th className="py-3 px-3">Paper Year</th>
                  <th className="py-3 px-3">Source</th>
                  <th className="py-3 px-3 text-center">Downloads</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1E293B]">
                {resources.map((r) => {
                  const typeObj = RESOURCE_TYPES.find((t) => t.id === r.type);
                  const badgeClass = typeObj?.badgeClass || 'tech-badge-blue';

                  return (
                    <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-[#0F172A] text-xs transition-colors">
                      {/* Title */}
                      <td className="py-3.5 px-3 max-w-xs">
                        <div className="font-bold text-slate-900 dark:text-[#F8FAFC] truncate" title={r.title}>
                          {r.title}
                        </div>
                        {r.description && (
                          <div className="text-slate-500 dark:text-[#94A3B8] text-[11px] truncate max-w-xs mt-0.5">
                            {r.description}
                          </div>
                        )}
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={badgeClass}>
                          {typeObj?.label || r.type}
                        </span>
                      </td>

                      {/* Subject */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-semibold text-slate-700 dark:text-[#CBD5E1]">
                        {r.subjectId?.name ? (
                          <span>{r.subjectId.name}</span>
                        ) : (
                          <span className="text-slate-400 dark:text-[#64748B]">—</span>
                        )}
                      </td>

                      {/* Academic Year */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-mono text-slate-700 dark:text-[#CBD5E1]">
                        {r.academicYear || <span className="text-slate-400 dark:text-[#64748B]">—</span>}
                      </td>

                      {/* Paper Year */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-mono text-slate-700 dark:text-[#CBD5E1]">
                        {r.paperYear ? String(r.paperYear) : <span className="text-slate-400 dark:text-[#64748B]">—</span>}
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 dark:text-[#CBD5E1]">
                        {r.source || <span className="text-slate-400 dark:text-[#64748B]">—</span>}
                      </td>

                      {/* Downloads */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-center font-mono font-bold text-blue-600 dark:text-[#38BDF8]">
                        {r.downloads || 0}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Link
                            to={`/resources/${r._id}/read`}
                            className="p-1.5 text-blue-600 dark:text-[#38BDF8] hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-lg transition-colors flex items-center font-mono text-[11px]"
                            title="View / Open Resource"
                          >


                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                          </Link>

                          <button
                            onClick={() => startEdit(r)}
                            className="p-1.5 text-slate-500 dark:text-[#94A3B8] hover:text-blue-600 dark:hover:text-[#38BDF8] hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-lg transition-colors cursor-pointer"
                            title="Edit Resource"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeletingResource(r)}
                            className="p-1.5 text-slate-500 dark:text-[#94A3B8] hover:text-rose-600 dark:hover:text-[#EF4444] hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Delete Resource"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION FOOTER */}
        {!loading && !fetchError && totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-[#1E293B] pt-4 text-xs font-mono">
            <div className="text-slate-500 dark:text-[#94A3B8]">
              Showing <span className="text-slate-900 dark:text-[#F8FAFC] font-bold">{showingStart}–{showingEnd}</span> of{' '}
              <span className="text-slate-900 dark:text-[#F8FAFC] font-bold">{totalCount}</span> resources
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-slate-50 dark:bg-[#070A12] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white rounded-xl disabled:opacity-40 transition-colors flex items-center cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
              </button>

              <span className="px-3 py-1.5 bg-slate-200 dark:bg-[#1E293B] text-slate-900 dark:text-[#F8FAFC] rounded-xl font-bold">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 bg-slate-50 dark:bg-[#070A12] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white rounded-xl disabled:opacity-40 transition-colors flex items-center cursor-pointer"
              >
                Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deletingResource && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="tech-card bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] p-6 max-w-md w-full rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">Delete Resource</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-[#CBD5E1]">
              Are you sure you want to delete this resource? This action cannot be undone and will delete the associated file from storage.
            </p>

            <div className="p-3 bg-slate-50 dark:bg-[#070A12] rounded-xl border border-slate-200 dark:border-[#1E293B] font-mono text-xs">
              <span className="text-slate-500 dark:text-[#94A3B8] block text-[10px]">TARGET RESOURCE</span>
              <span className="font-bold text-slate-900 dark:text-[#F8FAFC] truncate block mt-0.5">{deletingResource.title}</span>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeletingResource(null)}
                disabled={deleteLoading}
                className="px-4 py-2 bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#334155] text-slate-700 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-white text-xs font-mono font-bold rounded-xl transition-colors cursor-pointer border border-slate-200 dark:border-transparent"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-bold rounded-xl shadow-md transition-colors flex items-center cursor-pointer disabled:opacity-50"
              >
                {deleteLoading ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete Resource
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

