import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import BookmarkButton from '../components/BookmarkButton';
import PDFViewerModal from '../components/PDFViewerModal';
import { resourceService } from '../services/api';
import {
  FileText,
  Eye,
  Download,
  BookOpen,
  ArrowLeft,
  Calendar,
  Tag,
  ExternalLink,
} from 'lucide-react';

export default function ResourceDetail() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPDFViewer, setShowPDFViewer] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        const res = await resourceService.getById(id);
        if (res.success) {
          setResource(res.data);
          // Auto increment view count
          resourceService.incrementViews(id).catch(() => {});
        }
      } catch (err) {
        console.error('Fetch resource detail error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchResource();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-2/3"></div>
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-48 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Resource Not Found</h2>
        <Link to="/resources" className="text-brand-600 underline mt-2 inline-block">
          Return to Library
        </Link>
      </div>
    );
  }

  const pdfUrl = resource.fileUrl || resource.externalUrl || 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf';

  const handleDownload = () => {
    resourceService.incrementDownloads(resource._id).catch(() => {});
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.target = '_blank';
    link.download = `${resource.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/resources"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Resources
      </Link>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                {resource.type}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
                {resource.branchId?.name} Branch
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
                Sem {resource.semesterId?.number}
              </span>
              {resource.unitId && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  Unit {resource.unitId.unitNumber}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold text-[#172033] dark:text-[#F8FAFC] leading-snug">
              {resource.title}
            </h1>

            <p className="text-xs text-slate-500 font-medium mt-2 flex items-center">
              <BookOpen className="w-4 h-4 mr-1 text-brand-600" />
              {resource.subjectId?.name} ({resource.subjectId?.code || 'CS'})
            </p>
          </div>

          <BookmarkButton resource={resource} className="p-2" />
        </div>

        {resource.description && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
            {resource.description}
          </div>
        )}

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex items-center flex-wrap gap-1.5 pt-2">
            <Tag className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {resource.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons & Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-4 text-xs text-slate-500">
            <span className="flex items-center">
              <Eye className="w-4 h-4 mr-1 text-slate-400" /> {resource.views || 0} Total Views
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1 text-slate-400 text-xs" />{' '}
              {new Date(resource.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Link
              to={`/resources/${resource._id}/read`}
              className="w-full sm:w-auto px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center"
            >
              <BookOpen className="w-4 h-4 mr-2" /> Open Protected PDF Reader
            </Link>
          </div>
        </div>
      </div>

      {showPDFViewer && (
        <PDFViewerModal resource={resource} onClose={() => setShowPDFViewer(false)} />
      )}
    </div>
  );
}
