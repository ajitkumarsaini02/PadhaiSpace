import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ProtectedPDFViewer from '../components/ProtectedPDFViewer';
import { resourceService, getApiBaseUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, BookOpen, Layers, ShieldCheck, AlertCircle } from 'lucide-react';
import { CardSkeleton } from '../components/SkeletonLoader';

export default function PDFReader() {
  const { id } = useParams();
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [resource, setResource] = useState(null);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        if (!pdfResponse.ok) {
          if (isMounted) setError('Failed to retrieve PDF stream from server.');
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
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <CardSkeleton count={2} />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">{error || 'Resource Not Found'}</h2>
        <Link
          to="/resources"
          className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Return to Resources
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to={`/resources/${resource._id}`}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Resource Details
        </Link>

        <div className="flex items-center space-x-2 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Protected Read-Only Session</span>
        </div>
      </div>

      {/* Title & Metadata Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 text-[10px] font-bold uppercase border border-brand-200">
              {resource.type}
            </span>
            {resource.subjectId && (
              <span className="text-xs font-semibold text-slate-600 flex items-center">
                <BookOpen className="w-3.5 h-3.5 mr-1 text-slate-400" /> {resource.subjectId.name} ({resource.subjectId.code})
              </span>
            )}
            {resource.unitId && (
              <span className="text-xs font-semibold text-slate-600 flex items-center">
                <Layers className="w-3.5 h-3.5 mr-1 text-slate-400" /> Unit {resource.unitId.unitNumber}
              </span>
            )}
          </div>
          <h1 className="text-lg sm:text-2xl font-extrabold text-[#172033] dark:text-[#F8FAFC] leading-tight">
            {resource.title}
          </h1>
        </div>
      </div>

      {/* Main Protected Viewer Container */}
      <ProtectedPDFViewer pdfArrayBuffer={pdfArrayBuffer} title={resource.title} resourceId={resource._id} />
    </div>
  );
}
