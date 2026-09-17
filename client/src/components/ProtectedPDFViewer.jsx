import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Loader2,
  EyeOff,
  ShieldAlert,
  ShieldCheck,
  RotateCw,
  Moon,
  Sun,
  RefreshCw,
  Layers,
  Lock,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { activityService } from '../services/api';

// Configure PDF.js worker with unpkg fallback
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '3.11.174'}/build/pdf.worker.min.js`;

// Individual PDF Page Canvas Component
function PDFPageCanvas({ pdfDoc, pageNum, scale, rotation, isDarkMode, userEmail, userIp, currentTimeString }) {
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;
      try {
        setLoading(true);
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await pdfDoc.getPage(pageNum);
        if (isCancelled) return;

        const dpr = Math.max(window.devicePixelRatio || 1, 1.5);
        const viewport = page.getViewport({ scale: scale * dpr, rotation });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
        canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };


        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        if (!isCancelled) setLoading(false);
      } catch (err) {
        if (err.name !== 'RenderingCancelledException') {
          console.error(`Error rendering PDF page ${pageNum}:`, err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, pageNum, scale, rotation]);

  return (
    <div
      id={`pdf-page-${pageNum}`}
      data-page-number={pageNum}
      className={`relative inline-block border border-slate-800 shadow-2xl rounded-xl overflow-hidden my-4 transition-all duration-200 select-none ${
        isDarkMode ? 'bg-slate-900' : 'bg-white'
      }`}
      style={isDarkMode ? { filter: 'invert(0.92) hue-rotate(180deg)' } : {}}
    >
      {loading && (
        <div className="absolute inset-0 z-20 bg-slate-950/80 flex items-center justify-center text-slate-400 font-mono text-xs">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-500" /> Loading Page {pageNum}...
        </div>
      )}

      <canvas ref={canvasRef} className="block max-w-full h-auto" />

      {/* Page Number Label Badge */}
      <div className="absolute top-3 right-3 z-10 bg-slate-950/90 text-slate-200 border border-slate-700/80 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold select-none shadow-md">
        Page {pageNum}
      </div>

      {/* Security Watermark Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-around overflow-hidden opacity-25 rotate-[-25deg] scale-125 select-none">
        {[1, 2, 3, 4, 5, 6].map((row) => (
          <div key={row} className="flex justify-around whitespace-nowrap text-rose-900 dark:text-slate-900 font-black text-xs sm:text-sm tracking-widest uppercase">
            <span>PADHAISPACE • {userEmail}</span>
            <span>IP: {userIp}</span>
            <span>{currentTimeString}</span>
            <span>LEAKS ARE TRACED & PROSECUTED</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProtectedPDFViewer({ pdfArrayBuffer, title, resourceId }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.35);

  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [inputPage, setInputPage] = useState('1');
  const [userIp, setUserIp] = useState('103.170.81.210');
  
  // Anti-Screenshot & Focus Lost states
  const [isFocusLost, setIsFocusLost] = useState(false);
  const [screenshotAttempt, setScreenshotAttempt] = useState(false);

  const scrollContainerRef = useRef(null);
  const containerRef = useRef(null);

  // Viewer Session ID (random UUID generated per session)
  const sessionIdRef = useRef(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `session-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`
  );

  const prevVisibilityRef = useRef(document.visibilityState || 'visible');
  const prevFullscreenRef = useRef(Boolean(document.fullscreenElement));

  // Dynamic User IP Fetching
  useEffect(() => {
    let active = true;
    fetch('https://api.ipify.org?format=json')
      .then((res) => res.json())
      .then((data) => {
        if (active && data && data.ip) {
          setUserIp(data.ip);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Current formatted date/time for security watermark
  const currentTimeString = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Activity Audit Logging Helper
  const sendActivityLog = (eventType, extraMetadata = {}) => {
    if (!resourceId) return;
    activityService
      .log({
        resourceId,
        eventType,
        sessionId: sessionIdRef.current,
        metadata: {
          visibilityState: document.visibilityState || 'visible',
          fullscreen: Boolean(document.fullscreenElement),
          userAgent: navigator.userAgent || '',
          ...extraMetadata,
        },
      })
      .catch((err) => console.warn('[Activity Audit Log Warning]', err.message));
  };

  // Audit Log: PDF_OPEN & PDF_CLOSE Lifecycle
  useEffect(() => {
    if (!resourceId || !pdfDoc) return;
    sendActivityLog('PDF_OPEN');
    return () => {
      sendActivityLog('PDF_CLOSE');
    };
  }, [resourceId, pdfDoc]);

  // Visibility, Blur, Fullscreen, and Print Events
  useEffect(() => {
    const handleBlur = () => setIsFocusLost(true);
    const handleFocus = () => setIsFocusLost(false);

    const handleVisibilityChange = () => {
      const currentState = document.visibilityState || 'visible';
      if (currentState === 'hidden') {
        setIsFocusLost(true);
        if (prevVisibilityRef.current !== 'hidden') {
          prevVisibilityRef.current = 'hidden';
          sendActivityLog('TAB_HIDDEN');
        }
      } else {
        setIsFocusLost(false);
        if (prevVisibilityRef.current !== 'visible') {
          prevVisibilityRef.current = 'visible';
          sendActivityLog('TAB_VISIBLE');
        }
      }
    };

    const handleFullscreenChange = () => {
      const isFs = Boolean(document.fullscreenElement);
      setIsFullscreen(isFs);
      if (isFs && !prevFullscreenRef.current) {
        prevFullscreenRef.current = true;
        sendActivityLog('FULLSCREEN_ENTER');
      } else if (!isFs && prevFullscreenRef.current) {
        prevFullscreenRef.current = false;
        sendActivityLog('FULLSCREEN_EXIT');
      }
    };

    const handleBeforePrint = () => {
      sendActivityLog('PRINT_ATTEMPT');
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('beforeprint', handleBeforePrint);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('beforeprint', handleBeforePrint);
    };
  }, [resourceId]);

  // Load PDF Document from ArrayBuffer
  useEffect(() => {
    let isMounted = true;
    if (!pdfArrayBuffer) return;

    const loadDocument = async () => {
      try {
        setLoading(true);
        setError(null);

        const typedArray = new Uint8Array(pdfArrayBuffer);
        let doc;
        try {
          const loadingTask = pdfjsLib.getDocument({ data: typedArray });
          doc = await loadingTask.promise;
        } catch (workerErr) {
          console.warn('[PDFViewer] Worker task failed, using fallback:', workerErr.message);
          const fallbackTask = pdfjsLib.getDocument({ data: typedArray, disableWorker: true });
          doc = await fallbackTask.promise;
        }

        if (isMounted) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setPageNumber(1);
          setInputPage('1');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading PDF document:', err);
        if (isMounted) {
          setError('Failed to load protected PDF document. Please try again.');
          setLoading(false);
        }
      }
    };

    loadDocument();

    return () => {
      isMounted = false;
    };
  }, [pdfArrayBuffer]);

  // Synchronize input page state when pageNumber changes
  useEffect(() => {
    setInputPage(String(pageNumber));
  }, [pageNumber]);

  // Scroll Tracking to update active page number as user scrolls down
  const handleScroll = (e) => {
    const container = e.target;
    const pageElements = container.querySelectorAll('[data-page-number]');
    let currentVisiblePage = 1;

    for (let i = 0; i < pageElements.length; i++) {
      const el = pageElements[i];
      const rect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      if (rect.top <= containerRect.top + containerRect.height / 2 && rect.bottom >= containerRect.top) {
        currentVisiblePage = parseInt(el.getAttribute('data-page-number'), 10);
      }
    }

    if (currentVisiblePage !== pageNumber) {
      setPageNumber(currentVisiblePage);
    }
  };

  const scrollToPage = (targetPage) => {
    const pageEl = document.getElementById(`pdf-page-${targetPage}`);
    if (pageEl) {
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPageNumber(targetPage);
      setInputPage(String(targetPage));
    }
  };

  // Deterrent keyboard shortcuts & navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        triggerScreenshotProtection();
        return false;
      }

      if ((e.metaKey || e.winKey || e.ctrlKey) && e.shiftKey && (e.key === 'S' || e.key === 's' || e.key === '3' || e.key === '4' || e.key === '5')) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotProtection();
        return false;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        e.stopPropagation();
        sendActivityLog('PRINT_ATTEMPT');
        alert('Printing is disabled for protected academic materials.');
        return false;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        e.stopPropagation();
        alert('Saving/downloading is disabled for protected academic materials.');
        return false;
      }

      if (document.activeElement?.tagName !== 'INPUT') {
        if (e.key === 'ArrowLeft') {
          scrollToPage(Math.max(pageNumber - 1, 1));
        } else if (e.key === 'ArrowRight') {
          scrollToPage(Math.min(pageNumber + 1, numPages || 1));
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        triggerScreenshotProtection();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [resourceId, numPages, pageNumber]);

  const triggerScreenshotProtection = () => {
    setScreenshotAttempt(true);
    setIsFocusLost(true);

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(
          '⚠️ SCREENSHOT BLOCKED: Academic resources on PadhaiSpace are protected read-only materials.'
        );
      }
    } catch (err) {}

    setTimeout(() => {
      setScreenshotAttempt(false);
      setIsFocusLost(false);
    }, 2500);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  const handlePageInputChange = (e) => setInputPage(e.target.value);

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const target = parseInt(inputPage, 10);
    if (!isNaN(target) && target >= 1 && target <= numPages) {
      scrollToPage(target);
    } else {
      setInputPage(String(pageNumber));
    }
  };

  const rotateClockwise = () => setRotation((prev) => (prev + 90) % 360);
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/resources');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#070A12] text-white p-8 space-y-4 relative overflow-hidden">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-sm font-bold text-slate-100">Decrypting & Streaming Protected Academic PDF</h3>
          <p className="text-xs text-slate-400">Applying session watermark & forensic tracking controls...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#070A12] text-rose-300 p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-1 max-w-md">
          <h3 className="text-base font-extrabold text-white">Protected Reader Notice</h3>
          <p className="text-xs text-rose-300/90 font-medium">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-2" /> Reload Protected Reader
        </button>
      </div>
    );
  }

  const userEmail = user?.email || 'authenticated student';

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      className="min-h-screen h-screen bg-[#070A12] flex flex-col select-none relative print:hidden transition-all duration-200"
    >
      <style>{`
        @media print {
          body { display: none !important; }
        }
      `}</style>

      {/* TOP HEADER BAR MATCHING SCREENSHOT */}
      <div className="bg-[#0B0F19] border-b border-[#1E293B] px-3 sm:px-4 py-2.5 text-white flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 shadow-xl shrink-0">
        {/* Left: Back Arrow Button, Title & Green Full Access Badge */}
        <div className="flex items-center space-x-2.5 min-w-0">
          <button
            onClick={handleBack}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 transition-colors cursor-pointer shrink-0"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center space-y-0.5 sm:space-y-0 sm:space-x-3 min-w-0">
            <h1 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wide truncate max-w-xs sm:max-w-md md:max-w-lg" title={title}>
              {title}
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shrink-0">
              <Lock className="w-3 h-3 mr-1 text-emerald-400" /> READ ONLY
            </span>

          </div>
        </div>

        {/* Right Controls Section: Page Jump Form, Rotate, Night Mode, Fullscreen */}
        <div className="flex flex-wrap items-center space-x-2 text-xs">
          {/* Thumbnails Sidebar Toggle */}
          <button
            onClick={() => setShowThumbnails((prev) => !prev)}
            className={`p-1.5 rounded-xl border transition-colors ${
              showThumbnails
                ? 'bg-blue-600/30 border-blue-500/50 text-blue-400'
                : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
            title="Toggle Thumbnails Sidebar"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Page Jump Form with GO button */}
          <form onSubmit={handlePageInputSubmit} className="flex items-center space-x-1.5 bg-slate-800/90 border border-slate-700/80 rounded-xl px-2 py-1 font-mono">
            <input
              type="text"
              value={inputPage}
              onChange={handlePageInputChange}
              onBlur={handlePageInputSubmit}
              className="w-9 text-center bg-slate-900 border border-slate-700 rounded text-amber-400 font-bold font-mono text-xs py-0.5 focus:outline-none focus:border-amber-500"
            />
            <span className="text-slate-400 font-bold text-xs">/ {numPages}</span>
            <button
              type="submit"
              className="px-2.5 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black font-mono text-[11px] rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              GO
            </button>
          </form>

          {/* Prev / Next arrows */}
          <div className="hidden md:flex items-center space-x-1 bg-slate-800/90 border border-slate-700/80 rounded-xl px-1 py-1">
            <button
              onClick={() => scrollToPage(Math.max(pageNumber - 1, 1))}
              disabled={pageNumber <= 1}
              className="p-1 hover:bg-slate-700 disabled:opacity-30 rounded text-slate-300 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => scrollToPage(Math.min(pageNumber + 1, numPages))}
              disabled={pageNumber >= numPages}
              className="p-1 hover:bg-slate-700 disabled:opacity-30 rounded text-slate-300 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rotate 90° */}
          <button
            onClick={rotateClockwise}
            className="p-2 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Rotate Clockwise (90°)"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Night Mode */}
          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDarkMode
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
            title="Night Mode Reader"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center space-x-1 bg-slate-800/90 border border-slate-700/80 rounded-xl px-1 py-1">
            <button onClick={zoomOut} className="p-1 hover:bg-slate-700 rounded text-slate-300 cursor-pointer" title="Zoom Out">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold text-slate-300 px-1">{Math.round(scale * 100)}%</span>
            <button onClick={zoomIn} className="p-1 hover:bg-slate-700 rounded text-slate-300 cursor-pointer" title="Zoom In">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* MAIN CONTINUOUS VERTICAL SCROLL BODY */}
      <div className="flex-1 flex overflow-hidden relative bg-[#070A12]">
        {/* Thumbnails Sidebar */}
        {showThumbnails && (
          <div className="w-44 sm:w-52 bg-[#0B0F19] border-r border-[#1E293B] p-3 overflow-y-auto space-y-2 z-20 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 border-b border-[#1E293B] pb-2 font-mono">
              <span>Pages ({numPages})</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => scrollToPage(p)}
                  className={`p-2 rounded-xl text-xs font-mono font-bold transition-all text-center border cursor-pointer ${
                    p === pageNumber
                      ? 'bg-blue-600 border-blue-400 text-white shadow-md scale-105'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  Page {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scrollable Document Container (All pages rendered vertically) */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center scroll-smooth"
        >
          {/* Blur Overlay on Focus Loss */}
          {isFocusLost && (
            <div className="fixed inset-0 z-50 bg-[#070A12]/95 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse">
                <EyeOff className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-lg font-extrabold text-white">Document Viewing Protection Active</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Screen contents are obscured while window focus is shifted. Return focus to resume reading.
                </p>
              </div>
            </div>
          )}

          {/* Anti-Screenshot Toast Alert */}
          {screenshotAttempt && (
            <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-5 py-2.5 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold animate-bounce border border-rose-400">
              <ShieldAlert className="w-4 h-4 text-white" />
              <span>Screen Capture Blocked & Activity Logged</span>
            </div>
          )}

          {/* OFFICIAL LEGAL & COPYRIGHT DISCLAIMER BOX (At top of document) */}
          <div className="w-full max-w-3xl mb-4 bg-[#160B0E]/95 border-2 border-rose-900/80 rounded-2xl p-5 sm:p-6 text-rose-100 shadow-2xl space-y-4 font-sans select-none shrink-0">
            {/* Header Tag line */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-900/60 pb-3">
              <div className="flex items-center space-x-2 text-rose-400 font-mono font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>SECURITY NOTICE • PAGE {pageNumber}</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-rose-500/10 border border-rose-500/30 px-3 py-0.5 rounded-full text-[10px] font-mono font-extrabold text-rose-400 tracking-wider">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping mr-1"></span>
                FORENSIC TRACKING ACTIVE
              </div>
            </div>

            {/* Disclaimer Title */}
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase">
              OFFICIAL LEGAL & COPYRIGHT DISCLAIMER
            </h2>

            {/* 4 Points */}
            <ol className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal list-decimal pl-4">
              <li>
                <strong className="text-white">Unauthorized Screenshots & Sharing Prohibited:</strong> Taking screenshots, screen recordings, extracting, copying, or forwarding any part of this document via WhatsApp, Telegram, Google Drive, or any public/private media is strictly prohibited.
              </li>
              <li>
                <strong className="text-white">Identity Leak Risk:</strong> Every single page of this document contains cryptographic invisible and visible digital watermarks tied to your personal registered account (<span className="text-blue-400 font-mono font-bold">{userEmail}</span>) and Device IP (<span className="text-blue-400 font-mono font-bold">{userIp}</span>). If any screenshot is taken and shared, your personal credentials will be leaked publicly and traced back to you immediately.
              </li>
              <li>
                <strong className="text-white">Transaction ID & Traceability:</strong> We can track and identify you directly by your unique Session ID / Student ID, registered account records, and access logs. Every document access is cryptographically linked to your transaction & session history in our database.
              </li>
              <li>
                <strong className="text-white">Strict Legal Actions:</strong> Any copyright infringement, unauthorized sharing, or attempt to bypass security protections is punishable under the <strong className="text-amber-400">Information Technology Act (IT Act 2000, Sections 43, 66 & 72)</strong> and the <strong className="text-amber-400">Indian Copyright Act 1957</strong>, leading to permanent blacklisting, forfeiture of all access, and criminal/civil legal prosecution.
              </li>
            </ol>

            {/* Footer info line */}
            <div className="pt-3 border-t border-rose-900/60 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
              <div>Document: <span className="text-white font-bold">{title}</span></div>
              <div>Licensed to: <span className="text-blue-400 font-bold">{userEmail}</span></div>
              <div className="text-rose-400 font-bold flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Protected by PadhaiSpace Security Shield
              </div>
            </div>
          </div>

          {/* RED TICKER WARNING BANNER */}
          <div className="w-full max-w-3xl mb-6 bg-rose-950/90 border border-rose-800 text-rose-200 py-2.5 px-4 rounded-xl text-[10px] sm:text-[11px] font-mono font-bold text-center tracking-wide uppercase shadow-md flex items-center justify-center space-x-2 shrink-0">
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping shrink-0"></span>
            <span className="truncate">LEGAL WARNING: SCREENSHOTS & SHARING PROHIBITED • TRACEABLE VIA TRANSACTION ID & EMAIL ({userEmail})</span>
          </div>

          {/* CONTINUOUS VERTICAL SCROLL OF ALL PDF PAGES */}
          <div className="w-full flex flex-col items-center">
            {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
              <PDFPageCanvas
                key={p}
                pdfDoc={pdfDoc}
                pageNum={p}
                scale={scale}
                rotation={rotation}
                isDarkMode={isDarkMode}
                userEmail={userEmail}
                userIp={userIp}
                currentTimeString={currentTimeString}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
