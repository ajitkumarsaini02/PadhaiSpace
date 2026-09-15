import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Lock,
  AlertTriangle,
  Loader2,
  EyeOff,
  ShieldAlert,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
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

  // Current formatted date/time for watermark
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

        // Convert ArrayBuffer to Uint8Array for PDF.js compatibility
        const typedArray = new Uint8Array(pdfArrayBuffer);
        const loadingTask = pdfjsLib.getDocument({ data: typedArray });
        const doc = await loadingTask.promise;

        if (isMounted) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setPageNumber(1);
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

  // Render active page onto Canvas
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

        const viewport = page.getViewport({ scale });
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
  }, [pdfDoc, pageNumber, scale]);

  // Deterrent keyboard shortcuts & print/save prevention
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 1. Detect PrintScreen Key
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        triggerScreenshotProtection();
        return false;
      }

      // 2. Block Win + Shift + S or Cmd + Shift + 3/4/5
      if ((e.metaKey || e.winKey || e.ctrlKey) && e.shiftKey && (e.key === 'S' || e.key === 's' || e.key === '3' || e.key === '4' || e.key === '5')) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotProtection();
        return false;
      }

      // 3. Block Ctrl+P / Cmd+P (Print) & log PRINT_ATTEMPT
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        e.stopPropagation();
        sendActivityLog('PRINT_ATTEMPT');
        alert('Printing is disabled for protected academic materials.');
        return false;
      }

      // 4. Block Ctrl+S / Cmd+S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        e.stopPropagation();
        alert('Saving/downloading is disabled for protected academic materials.');
        return false;
      }

      // 5. Block Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // 6. Block F12 / DevTools
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
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
  }, [resourceId]);

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

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.6));
  const fitWidth = () => setScale(1.1);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-slate-900 rounded-3xl text-white p-8 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-400" />
        <p className="text-sm font-semibold text-slate-300">Decrypting & Streaming Protected Academic PDF...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] bg-rose-950/20 border border-rose-800/30 rounded-3xl text-rose-300 p-8 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-rose-400" />
        <p className="text-sm font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      className="bg-slate-950 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col select-none relative print:hidden"
    >
      {/* Hide print styles */}
      <style>{`
        @media print {
          body { display: none !important; }
        }
      `}</style>

      {/* Viewer Header Toolbar */}
      <div className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-3 text-white flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
        <div className="flex items-center space-x-2 truncate">
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center">
            <Lock className="w-3 h-3 mr-1 text-emerald-400" /> Read Only
          </span>
          <h2 className="text-xs sm:text-sm font-bold truncate text-slate-200 max-w-xs sm:max-w-md" title={title}>
            {title}
          </h2>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-1 sm:space-x-2 text-xs">
          {/* Page Navigation */}
          <div className="flex items-center bg-slate-800 rounded-xl px-2 py-1 space-x-1">
            <button
              onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
              disabled={pageNumber <= 1}
              className="p-1 hover:bg-slate-700 disabled:opacity-40 rounded transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-1">
              {pageNumber} / {numPages}
            </span>
            <button
              onClick={() => setPageNumber((p) => Math.min(p + 1, numPages))}
              disabled={pageNumber >= numPages}
              className="p-1 hover:bg-slate-700 disabled:opacity-40 rounded transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800 rounded-xl px-2 py-1 space-x-1">
            <button onClick={zoomOut} className="p-1 hover:bg-slate-700 rounded transition-colors" title="Zoom Out">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono w-10 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={zoomIn} className="p-1 hover:bg-slate-700 rounded transition-colors" title="Zoom In">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={fitWidth} className="px-1.5 py-0.5 hover:bg-slate-700 rounded text-[10px] font-bold">
              Reset
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Render Canvas Area */}
      <div className="relative min-h-[500px] flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950">
        {/* Anti-Blur Overlay if Window Focus is Lost */}
        {isFocusLost && (
          <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6 space-y-3">
            <EyeOff className="w-12 h-12 text-amber-500 animate-pulse" />
            <h3 className="text-base font-extrabold text-white">Document Viewing Protection</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Document display is obscured while window focus is shifted or tab is hidden. Return focus to resume reading.
            </p>
          </div>
        )}

        {/* Screenshot Attempt Warning Banner */}
        {screenshotAttempt && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-4 py-2 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold animate-bounce border border-rose-400">
            <ShieldAlert className="w-4 h-4 text-white" />
            <span>Screen Capture Signal Blocked & Activity Logged</span>
          </div>
        )}

        {/* Canvas & Dynamic Diagonal User Watermark */}
        <div className="relative inline-block border border-slate-800 shadow-2xl bg-white rounded-lg overflow-hidden">
          <canvas ref={canvasRef} className="block max-w-full h-auto" />

          {/* Diagonal Security Watermark Overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-around overflow-hidden opacity-25 rotate-[-25deg] scale-125 select-none">
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="flex justify-around whitespace-nowrap text-slate-800 font-extrabold text-sm sm:text-base tracking-widest uppercase">
                <span>{user?.name || 'PadhaiSpace Student'} • {user?.email || 'authenticated'}</span>
                <span>{currentTimeString}</span>
                <span>PROTECTED READ-ONLY</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
