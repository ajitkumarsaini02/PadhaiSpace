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

        const resData = await resourceService.getById(id);
        if (!resData.success || !resData.data) {
          if (isMounted) setError('Study resource not found.');
          setLoading(false);
          return;
        }

        if (isMounted) setResource(resData.data);

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
          if (isMounted) setError('Access Denied: You do not have permission to read this document.');
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
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#F8FAFC]">
            {error || 'Resource Not Found'}
          </h2>
          <p className="text-xs text-slate-600 dark:text-[#9AA6BC]">
            The requested document could not be loaded into the reader. Please try returning to library resources.
          </p>
        </div>
        <Link
          to="/resources"
          className="inline-flex items-center px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-[#2563EB] text-white font-bold text-xs rounded-xl shadow-md transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Return to Resources Library
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-900 dark:text-[#F8FAFC]">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to={`/resources/${resource._id}`}
          className="inline-flex items-center text-xs font-mono font-bold text-slate-600 dark:text-[#94A3B8] hover:text-[#4F46E5] dark:hover:text-[#38BDF8] transition-colors tech-card px-3.5 py-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 text-[#4F46E5] dark:text-[#38BDF8]" /> Back to Resource Details
        </Link>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowShortcuts((prev) => !prev)}
            className="inline-flex items-center text-xs font-mono font-bold text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white tech-card px-3 py-1.5 transition-colors cursor-pointer"
            title="Viewer Keyboard Shortcuts & Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-amber-500" /> Reader Guide
          </button>

          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>Free Open Reader Session</span>
          </div>
        </div>
      </div>

      {/* Reader Keyboard Shortcuts Helper Banner */}
      {showShortcuts && (
        <div className="tech-card p-4 text-xs space-y-2 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between font-mono font-bold text-amber-500 border-b border-slate-200 dark:border-[#1E293B] pb-2">
            <span className="flex items-center">
              <Sparkles className="w-4 h-4 mr-1.5 text-amber-500" /> Reader Keyboard Shortcuts & Features
            </span>
            <button
              onClick={() => setShowShortcuts(false)}
              className="text-[10px] text-slate-500 dark:text-slate-400 font-mono hover:underline cursor-pointer"
            >
              [ESC / Close]
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px] text-slate-600 dark:text-slate-300 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070A12] border border-slate-200 dark:border-[#1E293B]">
              <span className="font-mono text-amber-600 dark:text-amber-400 font-bold block mb-0.5">← / → Arrow Keys</span>
              <span>Flip pages forward and backward</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070A12] border border-slate-200 dark:border-[#1E293B]">
              <span className="font-mono text-amber-600 dark:text-amber-400 font-bold block mb-0.5">Rotate (90°)</span>
              <span>Rotate scanned notes & diagrams</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070A12] border border-slate-200 dark:border-[#1E293B]">
              <span className="font-mono text-amber-600 dark:text-amber-400 font-bold block mb-0.5">Moon / Night Mode</span>
              <span>Inverts canvas contrast for night reading</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070A12] border border-slate-200 dark:border-[#1E293B]">
              <span className="font-mono text-amber-600 dark:text-amber-400 font-bold block mb-0.5">Thumbnails Drawer</span>
              <span>Jump directly to any page number</span>
            </div>
          </div>
        </div>
      )}

      {/* Resource Title & Academic Metadata Banner */}
      <div className="tech-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="tech-badge tech-badge-blue">
              {resource.type}
            </span>
            {resource.subjectId && (
              <span className="tech-badge tech-badge-purple">
                <BookOpen className="w-3 h-3 mr-1 inline text-[#4F46E5] dark:text-[#38BDF8]" /> {resource.subjectId.name} {resource.subjectId.code ? `(${resource.subjectId.code})` : ''}
              </span>
            )}
            {resource.unitId && (
              <span className="tech-badge tech-badge-cyan">
                <Layers className="w-3 h-3 mr-1 inline text-[#2563EB] dark:text-[#38BDF8]" /> Unit {resource.unitId.unitNumber}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[#F8FAFC] leading-snug">
            {resource.title}
          </h1>
        </div>

        {resource.description && (
          <div className="text-xs text-slate-600 dark:text-[#94A3B8] font-medium max-w-md bg-slate-50 dark:bg-[#070A12] p-3 rounded-xl border border-slate-200 dark:border-[#1E293B] truncate">
            <Info className="w-3.5 h-3.5 text-[#4F46E5] dark:text-[#38BDF8] inline mr-1.5" />
            {resource.description}
          </div>
        )}
      </div>

      {/* Main Protected Viewer Component */}
      <ProtectedPDFViewer pdfArrayBuffer={pdfArrayBuffer} title={resource.title} resourceId={resource._id} />
    </div>
  );
}
