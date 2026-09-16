import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Lock,
  AlertTriangle,
  Loader2,
  EyeOff,
  ShieldAlert,
  RotateCw,
  Moon,
  Sun,
  RefreshCw,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { activityService } from '../services/api';

// Configure PDF.js worker with unpkg fallback
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '3.11.174'}/build/pdf.worker.min.js`;

export default function ProtectedPDFViewer({ pdfArrayBuffer, title, resourceId }) {
  const { user } = useAuth();
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [isDarkMode, setIsDarkMode] = useState(false); // Invert canvas for night reading
  const [showThumbnails, setShowThumbnails] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [inputPage, setInputPage] = useState('1');
  
  // Anti-Screenshot & Focus Lost states
  const [isFocusLost, setIsFocusLost] = useState(false);
  const [screenshotAttempt, setScreenshotAttempt] = useState(false);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const renderTaskRef = useRef(null);

  // Viewer Session ID (random UUID generated per session)
  const sessionIdRef = useRef(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `session-${Math.random().toString(36).substring(2)}-${Date.now()}`
  );

  const prevVisibilityRef = useRef(document.visibilityState || 'visible');
  const prevFullscreenRef = useRef(Boolean(document.fullscreenElement));

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

  // 1. Audit Log: PDF_OPEN & PDF_CLOSE Lifecycle
  useEffect(() => {
    if (!resourceId || !pdfDoc) return;

    sendActivityLog('PDF_OPEN');

    return () => {
      sendActivityLog('PDF_CLOSE');
    };
  }, [resourceId, pdfDoc]);

  // 2. Audit Log & State: Visibility, Blur, Fullscreen, and Print Events
  useEffect(() => {
    const handleBlur = () => {
      setIsFocusLost(true);
    };

    const handleFocus = () => {
      setIsFocusLost(false);
    };

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
        const loadingTask = pdfjsLib.getDocument({ data: typedArray });
        const doc = await loadingTask.promise;

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

  // Render active page onto Canvas with scaling & rotation
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isCancelled = false;

    const renderPage = async () => {
      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale, rotation });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Error rendering PDF page:', err);
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
  }, [pdfDoc, pageNumber, scale, rotation]);

  // Deterrent keyboard shortcuts & navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // PrintScreen Detection
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        triggerScreenshotProtection();
        return false;
      }

      // Block Win + Shift + S or Cmd + Shift + 3/4/5
      if ((e.metaKey || e.winKey || e.ctrlKey) && e.shiftKey && (e.key === 'S' || e.key === 's' || e.key === '3' || e.key === '4' || e.key === '5')) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotProtection();
        return false;
      }

      // Block Ctrl+P / Cmd+P (Print)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        e.stopPropagation();
        sendActivityLog('PRINT_ATTEMPT');
        alert('Printing is disabled for protected academic materials.');
        return false;
      }

      // Block Ctrl+S / Cmd+S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        e.stopPropagation();
        alert('Saving/downloading is disabled for protected academic materials.');
        return false;
      }

      // Left / Right arrow navigation when not typing in input
      if (document.activeElement?.tagName !== 'INPUT') {
        if (e.key === 'ArrowLeft') {
          setPageNumber((p) => Math.max(p - 1, 1));
        } else if (e.key === 'ArrowRight') {
          setPageNumber((p) => Math.min(p + 1, numPages || 1));
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
  }, [resourceId, numPages]);

  // Overwrite OS Clipboard on Screenshot attempt & show alert blur
  const triggerScreenshotProtection = () => {
    setScreenshotAttempt(true);
    setIsFocusLost(true);

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(
          '⚠️ SCREENSHOT BLOCKED: Academic resources on PadhaiSpace are protected read-only materials. Screenshots and downloads are strictly prohibited.'
        );
      }
    } catch (err) {
      // Clipboard write permission fallback
    }

    setTimeout(() => {
      setScreenshotAttempt(false);
      setIsFocusLost(false);
    }, 2500);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Error enabling fullscreen:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Error exiting fullscreen:', err);
      });
      setIsFullscreen(false);
    }
  };

  const handlePageInputChange = (e) => {
    setInputPage(e.target.value);
  };

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const target = parseInt(inputPage, 10);
    if (!isNaN(target) && target >= 1 && target <= numPages) {
      setPageNumber(target);
    } else {
      setInputPage(String(pageNumber));
    }
  };

  const rotateClockwise = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const fitWidth = () => setScale(1.15);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] bg-slate-950 rounded-3xl text-white p-8 space-y-4 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/10 via-amber-500/10 to-brand-600/10 animate-pulse pointer-events-none" />
        <div className="w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-sm font-bold text-slate-100">Decrypting & Streaming Protected Academic PDF</h3>
          <p className="text-xs text-slate-400">Applying session watermark and anti-piracy security controls...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[380px] bg-rose-950/20 border border-rose-800/40 rounded-3xl text-rose-300 p-8 text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-1 max-w-md">
          <h3 className="text-base font-extrabold text-white">Protected Reader Notice</h3>
          <p className="text-xs text-rose-300/90 font-medium">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white border border-rose-400/40 rounded-xl text-xs font-bold shadow-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-2" /> Reload Protected Reader
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      className="bg-slate-950 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col select-none relative print:hidden transition-all duration-200"
    >
      {/* Hide print styles */}
      <style>{`
        @media print {
          body { display: none !important; }
        }
      `}</style>

      {/* Viewer Header Toolbar */}
      <div className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 text-white flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-md">
        {/* Left: Security Tag & Document Title */}
        <div className="flex items-center space-x-2.5 min-w-0">
          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center shrink-0">
            <Lock className="w-3 h-3 mr-1 text-emerald-400" /> Read Only
          </span>
          <h2 className="text-xs sm:text-sm font-extrabold truncate text-slate-100 max-w-xs sm:max-w-md" title={title}>
            {title}
          </h2>
        </div>

        {/* Center/Right: Interactive PDF Controls */}
        <div className="flex flex-wrap items-center space-x-1.5 sm:space-x-2 text-xs">
          {/* Sidebar Thumbnails Toggle */}
          <button
            onClick={() => setShowThumbnails((prev) => !prev)}
            className={`p-1.5 rounded-xl border transition-colors ${
              showThumbnails
                ? 'bg-brand-600/30 border-brand-500/50 text-brand-300'
                : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
            title="Toggle Page Navigation Drawer"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Page Navigation Controls */}
          <div className="flex items-center bg-slate-800/90 border border-slate-700/70 rounded-xl px-1.5 py-1 space-x-1">
            {/* First Page */}
            <button
              onClick={() => setPageNumber(1)}
              disabled={pageNumber <= 1}
              className="p-1 hover:bg-slate-700 disabled:opacity-30 rounded transition-colors"
              title="First Page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            {/* Previous Page */}
            <button
              onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
              disabled={pageNumber <= 1}
              className="p-1 hover:bg-slate-700 disabled:opacity-30 rounded transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Jump to Page Input Form */}
            <form onSubmit={handlePageInputSubmit} className="flex items-center">
              <input
                type="text"
                value={inputPage}
                onChange={handlePageInputChange}
                onBlur={handlePageInputSubmit}
                className="w-8 text-center bg-slate-900 border border-slate-700 rounded text-[11px] font-mono font-bold text-brand-300 focus:outline-none focus:border-brand-500 py-0.5"
              />
              <span className="text-[11px] font-mono text-slate-400 px-1">/ {numPages}</span>
            </form>

            {/* Next Page */}
            <button
              onClick={() => setPageNumber((p) => Math.min(p + 1, numPages))}
              disabled={pageNumber >= numPages}
              className="p-1 hover:bg-slate-700 disabled:opacity-30 rounded transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            {/* Last Page */}
            <button
              onClick={() => setPageNumber(numPages)}
              disabled={pageNumber >= numPages}
              className="p-1 hover:bg-slate-700 disabled:opacity-30 rounded transition-colors"
              title="Last Page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom Controls & Dropdown */}
          <div className="flex items-center bg-slate-800/90 border border-slate-700/70 rounded-xl px-1.5 py-1 space-x-1">
            <button onClick={zoomOut} className="p-1 hover:bg-slate-700 rounded transition-colors" title="Zoom Out">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <select
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded text-[10px] font-mono font-bold text-slate-200 px-1 py-0.5 focus:outline-none cursor-pointer"
            >
              <option value="0.75">75%</option>
              <option value="1.0">100%</option>
              <option value="1.15">115%</option>
              <option value="1.3">130%</option>
              <option value="1.5">150%</option>
              <option value="2.0">200%</option>
            </select>

            <button onClick={zoomIn} className="p-1 hover:bg-slate-700 rounded transition-colors" title="Zoom In">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={fitWidth}
              className="px-1.5 py-0.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[10px] font-bold transition-colors"
              title="Fit to Container Width"
            >
              Fit
            </button>
          </div>

          {/* Rotate Canvas */}
          <button
            onClick={rotateClockwise}
            className="p-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/70 rounded-xl transition-colors"
            title="Rotate Clockwise (90°)"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-300" />
          </button>

          {/* Night / Invert Reader Mode */}
          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            className={`p-1.5 rounded-xl border transition-colors ${
              isDarkMode
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
            title={isDarkMode ? 'Switch to Normal Canvas' : 'Switch to Dark Reader (Eye Saver)'}
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/70 rounded-xl transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Render Body Container */}
      <div className="relative min-h-[550px] flex-1 flex overflow-hidden bg-slate-950">
        {/* Page Thumbnail Sidebar Navigation */}
        {showThumbnails && (
          <div className="w-48 bg-slate-900 border-r border-slate-800 p-3 overflow-y-auto space-y-2 z-20 flex-shrink-0 animate-in slide-in-from-left duration-150">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">
              <span>Pages ({numPages})</span>
              <span className="text-[10px] text-brand-400 font-mono">Jump</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPageNumber(p)}
                  className={`p-2 rounded-xl text-xs font-mono font-bold transition-all text-center border ${
                    p === pageNumber
                      ? 'bg-brand-600 border-brand-400 text-white shadow-md scale-105'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  Page {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Canvas Render Container */}
        <div className="relative flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-slate-950">
          {/* Anti-Blur Overlay if Window Focus is Lost */}
          {isFocusLost && (
            <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-6 space-y-4 animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse">
                <EyeOff className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-lg font-extrabold text-white">Document Viewing Protection Active</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Screen contents are obscured while window focus is shifted or tab is backgrounded. Return focus to resume reading.
                </p>
              </div>
            </div>
          )}

          {/* Screenshot Attempt Warning Banner */}
          {screenshotAttempt && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-5 py-2.5 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold animate-bounce border border-rose-400">
              <ShieldAlert className="w-4 h-4 text-white" />
              <span>Screen Capture Signal Blocked & Activity Logged</span>
            </div>
          )}

          {/* Canvas Wrapper & Dynamic Diagonal Watermark */}
          <div
            className={`relative inline-block border border-slate-800 shadow-2xl rounded-xl overflow-hidden transition-all duration-200 ${
              isDarkMode ? 'invert-canvas bg-slate-900' : 'bg-white'
            }`}
            style={isDarkMode ? { filter: 'invert(0.92) hue-rotate(180deg)' } : {}}
          >
            <canvas ref={canvasRef} className="block max-w-full h-auto" />

            {/* Diagonal Security Watermark Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-around overflow-hidden opacity-20 rotate-[-25deg] scale-125 select-none">
              {[1, 2, 3, 4, 5].map((row) => (
                <div key={row} className="flex justify-around whitespace-nowrap text-slate-900 font-extrabold text-xs sm:text-sm tracking-widest uppercase">
                  <span>{user?.name || 'PadhaiSpace Student'} • {user?.email || 'authenticated'}</span>
                  <span>{currentTimeString}</span>
                  <span>PROTECTED READ-ONLY</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
