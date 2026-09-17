import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ProtectedPDFViewer from '../components/ProtectedPDFViewer';
import { resourceService, getApiBaseUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';

export default function PDFReader() {
  const { id } = useParams();
  const { token } = useAuth();
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
      <div className="min-h-screen bg-[#070A12] text-white flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-sm font-bold text-slate-100">Decrypting & Streaming Protected Academic PDF</h3>
          <p className="text-xs text-slate-400">Applying session watermark and forensic tracking controls...</p>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-[#070A12] text-white flex flex-col items-center justify-center p-8 text-center space-y-5">
        <div className="w-14 h-14 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 shadow-md">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h2 className="text-xl font-extrabold text-white">
            {error || 'Resource Not Found'}
          </h2>
          <p className="text-xs text-slate-400">
            The requested document could not be loaded into the reader. Please try returning to library resources.
          </p>
        </div>
        <Link
          to="/resources"
          className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Return to Resources Library
        </Link>
      </div>
    );
  }

  return <ProtectedPDFViewer pdfArrayBuffer={pdfArrayBuffer} title={resource.title} resourceId={resource._id} />;
}
