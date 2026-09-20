import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 p-3.5 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#2563EB] dark:from-[#6366F1] dark:to-[#38BDF8] text-white shadow-xl hover:shadow-indigo-500/25 dark:hover:shadow-sky-500/25 transition-all duration-300 transform hover:scale-110 active:scale-95 border border-white/20 cursor-pointer flex items-center justify-center group"
      title="Scroll to Top"
      aria-label="Scroll to Top"
    >
      <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
}
