import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ProtectedPDFViewer from '../components/ProtectedPDFViewer';
import { resourceService, getApiBaseUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  BookOpen,
  Layers,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  HelpCircle,
  GraduationCap,
  Info,
} from 'lucide-react';
import { CardSkeleton } from '../components/SkeletonLoader';

export default function PDFReader() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [resource, setResource] = useState(null);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchResourceAndPDF = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch Resource Metadata
        const resData = await resourceService.getById(id);
        if (!resData.success || !resData.data) {
          if (isMounted) setError('Study resource not found.');
          setLoading(false);
          return;
        }

        if (isMounted) setResource(resData.data);

        // 2. Fetch Protected PDF Binary Stream with JWT Header
        const jwtToken = token || localStorage.getItem('token');
        if (!jwtToken) {
          navigate('/login', { state: { from: { pathname: `/resources/${id}/read` } } });
          return;
        }

        const apiBase = getApiBaseUrl();
        const pdfResponse = await fetch(`${apiBase}/resources/${id}/view`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        if (pdfResponse.status === 401) {
          navigate('/login', { state: { from: { pathname: `/resources/${id}/read` } } });
          return;
        }

        if (pdfResponse.status === 403) {
          if (isMounted) setError('Access Denied: You do not have permission to read this protected document.');
          setLoading(false);
          return;
        }

        const contentType = pdfResponse.headers.get('content-type') || '';
        if (!pdfResponse.ok || contentType.includes('application/json')) {
          let errorMsg = 'Failed to retrieve protected PDF from server.';
          try {
            const errData = await pdfResponse.json();
            if (errData && errData.message) errorMsg = errData.message;
          } catch (e) {}
          if (isMounted) setError(errorMsg);
          setLoading(false);
          return;
        }

        const buffer = await pdfResponse.arrayBuffer();
        if (isMounted) {
          setPdfArrayBuffer(buffer);
        }
      } catch (err) {
        console.error('Error in PDFReader:', err);
        if (isMounted) setError(err.message || 'An error occurred loading the protected reader.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchResourceAndPDF();

    return () => {
      isMounted = false;
    };
  }, [id, token, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <CardSkeleton count={2} />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-14 h-14 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20 shadow-md">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold text-[#172033] dark:text-[#F8FAFC]">
            {error || 'Resource Not Found'}
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#9AA6BC]">
            The requested document could not be loaded into the reader. Please try returning to library resources.
          </p>
        </div>
        <Link
          to="/resources"
          className="inline-flex items-center px-5 py-2.5 bg-[#4F8FEF] hover:bg-[#3D7FE5] text-white font-bold text-xs rounded-xl shadow-md transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Return to Resources Library
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to={`/resources/${resource._id}`}
          className="inline-flex items-center text-xs font-bold text-[#64748B] dark:text-[#9AA6BC] hover:text-[#4F8FEF] dark:hover:text-[#4F8FEF] transition-colors bg-white dark:bg-[#111729] px-3.5 py-2 rounded-xl border border-[#DCE2EC] dark:border-[#252D42] shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 text-[#4F8FEF]" /> Back to Resource Details
        </Link>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowShortcuts((prev) => !prev)}
            className="inline-flex items-center text-xs font-bold text-[#64748B] dark:text-[#9AA6BC] hover:text-[#172033] dark:hover:text-white bg-white dark:bg-[#111729] px-3 py-1.5 rounded-xl border border-[#DCE2EC] dark:border-[#252D42] transition-colors cursor-pointer"
            title="Viewer Keyboard Shortcuts & Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-amber-500" /> Reader Guide
          </button>

          <div className="flex items-center space-x-2 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>Protected Read-Only Session</span>
          </div>
        </div>
      </div>

      {/* Reader Keyboard Shortcuts Helper Banner */}
      {showShortcuts && (
        <div className="bg-[#111729] text-white rounded-2xl p-4 border border-[#252D42] shadow-xl text-xs space-y-2 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between font-extrabold text-amber-400 border-b border-[#252D42] pb-2">
            <span className="flex items-center">
              <Sparkles className="w-4 h-4 mr-1.5 text-amber-400" /> Reader Keyboard Shortcuts & Features
            </span>
            <button
              onClick={() => setShowShortcuts(false)}
              className="text-[10px] text-slate-400 hover:text-white font-mono"
            >
              [ESC / Close]
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px] text-slate-300 pt-1">
            <div className="bg-[#161D31] p-2.5 rounded-xl border border-slate-800">
              <span className="font-mono text-amber-400 font-bold block mb-0.5">← / → Arrow Keys</span>
              <span>Flip pages forward and backward</span>
            </div>
            <div className="bg-[#161D31] p-2.5 rounded-xl border border-slate-800">
              <span className="font-mono text-amber-400 font-bold block mb-0.5">Rotate (90°)</span>
              <span>Rotate scanned notes & diagrams</span>
            </div>
            <div className="bg-[#161D31] p-2.5 rounded-xl border border-slate-800">
              <span className="font-mono text-amber-400 font-bold block mb-0.5">Moon / Night Mode</span>
              <span>Inverts canvas contrast for night reading</span>
            </div>
            <div className="bg-[#161D31] p-2.5 rounded-xl border border-slate-800">
              <span className="font-mono text-amber-400 font-bold block mb-0.5">Thumbnails Drawer</span>
              <span>Jump directly to any page number</span>
            </div>
          </div>
        </div>
      )}

      {/* Resource Title & Academic Metadata Banner */}
      <div className="bg-white dark:bg-[#111729] rounded-3xl p-6 border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-[#EFF5FF] dark:bg-[#161D31] text-[#4F8FEF] text-[10px] font-extrabold uppercase tracking-wider border border-[#DCE2EC] dark:border-[#252D42]">
              {resource.type}
            </span>
            {resource.subjectId && (
              <span className="text-xs font-bold text-[#172033] dark:text-[#F8FAFC] flex items-center bg-[#F5F7FB] dark:bg-[#161D31] px-2.5 py-0.5 rounded-lg border border-[#DCE2EC] dark:border-[#252D42]">
                <BookOpen className="w-3.5 h-3.5 mr-1.5 text-[#4F8FEF]" /> {resource.subjectId.name} {resource.subjectId.code ? `(${resource.subjectId.code})` : ''}
              </span>
            )}
            {resource.unitId && (
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                <Layers className="w-3.5 h-3.5 mr-1.5 text-amber-500" /> Unit {resource.unitId.unitNumber}
              </span>
            )}
            {resource.branchId && (
              <span className="text-xs font-semibold text-[#64748B] dark:text-[#9AA6BC] flex items-center">
                <GraduationCap className="w-3.5 h-3.5 mr-1 text-[#64748B] dark:text-[#9AA6BC]" /> {resource.branchId.name} Branch
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172033] dark:text-[#F8FAFC] leading-snug">
            {resource.title}
          </h1>
        </div>

        {resource.description && (
          <div className="text-xs text-[#64748B] dark:text-[#9AA6BC] font-medium max-w-md bg-[#F5F7FB] dark:bg-[#161D31] p-3 rounded-2xl border border-[#DCE2EC] dark:border-[#252D42] truncate">
            <Info className="w-3.5 h-3.5 text-[#4F8FEF] inline mr-1.5" />
            {resource.description}
          </div>
        )}
      </div>

      {/* Main Protected Viewer Component */}
      <ProtectedPDFViewer pdfArrayBuffer={pdfArrayBuffer} title={resource.title} resourceId={resource._id} />
    </div>
  );
}
