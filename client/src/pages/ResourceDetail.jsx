import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import BookmarkButton from '../components/BookmarkButton';
import PDFViewerModal from '../components/PDFViewerModal';
import { resourceService } from '../services/api';
import {
  Eye,
  BookOpen,
  ArrowLeft,
  Calendar,
  Tag,
  ShieldCheck,
  Layers,
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white dark:bg-[#111729] rounded-3xl p-8 border border-[#DCE2EC] dark:border-[#252D42] animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 dark:bg-[#161D31] rounded-xl w-2/3"></div>
          <div className="h-4 bg-slate-200 dark:bg-[#161D31] rounded-xl w-1/3"></div>
          <div className="h-48 bg-slate-100 dark:bg-[#161D31] rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#172033] dark:text-[#F8FAFC]">Resource Not Found</h2>
        <Link to="/resources" className="text-[#4F8FEF] hover:underline font-bold text-xs inline-block">
          Return to Resources Library
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/resources"
        className="inline-flex items-center text-xs font-bold text-[#64748B] dark:text-[#9AA6BC] hover:text-[#4F8FEF] dark:hover:text-[#4F8FEF] transition-colors bg-white dark:bg-[#111729] px-3.5 py-2 rounded-xl border border-[#DCE2EC] dark:border-[#252D42] shadow-xs"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5 text-[#4F8FEF]" /> Back to Resources Library
      </Link>

      {/* Main Header Card */}
      <div className="bg-white dark:bg-[#111729] text-[#172033] dark:text-[#F8FAFC] rounded-3xl p-6 sm:p-8 border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-[#EFF5FF] dark:bg-[#161D31] text-[#4F8FEF] border border-[#DCE2EC] dark:border-[#252D42]">
                {resource.type}
              </span>
              {resource.unitId && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center">
                  <Layers className="w-3 h-3 mr-1 text-amber-500" /> Unit {resource.unitId.unitNumber}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold text-[#172033] dark:text-[#F8FAFC] leading-snug">
              {resource.title}
            </h1>

            {resource.subjectId && (
              <p className="text-xs text-[#64748B] dark:text-[#9AA6BC] font-semibold mt-1 flex items-center">
                <BookOpen className="w-4 h-4 mr-1.5 text-[#4F8FEF]" />
                {resource.subjectId.name} {resource.subjectId.code ? `(${resource.subjectId.code})` : ''}
              </p>
            )}
          </div>

          <BookmarkButton resource={resource} className="p-2" />
        </div>

        {resource.description && (
          <div className="bg-[#F5F7FB] dark:bg-[#161D31] rounded-2xl p-4 border border-[#DCE2EC] dark:border-[#252D42] text-xs sm:text-sm text-[#172033] dark:text-[#F8FAFC] leading-relaxed">
            {resource.description}
          </div>
        )}

        {/* Banner callout */}
        <div className="bg-[#111729] text-white rounded-2xl p-5 border border-[#252D42] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-extrabold text-emerald-400">Protected Academic Document</span>
            </div>
            <p className="text-xs text-slate-300">
              Access the secure PDF reader with personalized watermark, night mode, page jump, and zoom controls.
            </p>
          </div>

          <Link
            to={`/resources/${resource._id}/read`}
            className="px-6 py-3 bg-[#4F8FEF] hover:bg-[#3D7FE5] text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center shrink-0 hover:scale-105"
          >


            <BookOpen className="w-4 h-4 mr-2" /> Open Protected PDF Reader
          </Link>
        </div>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex items-center flex-wrap gap-1.5 pt-2">
            <Tag className="w-3.5 h-3.5 text-[#64748B] dark:text-[#9AA6BC] mr-1" />
            {resource.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] font-bold bg-[#F5F7FB] dark:bg-[#161D31] text-[#64748B] dark:text-[#9AA6BC] border border-[#DCE2EC] dark:border-[#252D42] px-2.5 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-[#DCE2EC] dark:border-[#252D42] text-xs text-[#64748B] dark:text-[#9AA6BC] font-medium">
          <span className="flex items-center">
            <Eye className="w-4 h-4 mr-1.5 text-[#4F8FEF]" /> {resource.views || 0} Total Views
          </span>
          <span className="flex items-center">
            <Calendar className="w-4 h-4 mr-1.5 text-[#64748B] dark:text-[#9AA6BC]" />{' '}
            {new Date(resource.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {showPDFViewer && (
        <PDFViewerModal resource={resource} onClose={() => setShowPDFViewer(false)} />
      )}
    </div>
  );
}
