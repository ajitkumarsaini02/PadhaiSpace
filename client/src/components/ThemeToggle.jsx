import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Monitor, Check, ChevronDown } from 'lucide-react';

export default function ThemeToggle({ showLabel = false }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themeOptions = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  const currentOption = themeOptions.find((opt) => opt.id === theme) || themeOptions[2];
  const CurrentIcon = currentOption.icon;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#0B0F19] dark:hover:bg-[#1E293B] text-slate-700 dark:text-[#CBD5E1] border border-slate-200 dark:border-[#1E293B] rounded-xl transition-all flex items-center space-x-1.5 text-xs font-mono font-bold cursor-pointer"
        title={`Theme Mode: ${currentOption.label} (Current: ${resolvedTheme})`}
        aria-label="Select theme mode"
      >
        <CurrentIcon className="w-4 h-4 text-[#4F46E5] dark:text-[#6366F1]" />
        <span className="capitalize">{currentOption.label}</span>
        <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#0F172A] rounded-xl shadow-xl border border-slate-200 dark:border-[#1E293B] py-1.5 text-xs z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-3 py-1 font-mono font-bold text-[10px] text-slate-400 dark:text-[#94A3B8] uppercase tracking-wider">
            Theme Mode
          </div>
          {themeOptions.map((opt) => {
            const IconComponent = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  setTheme(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left font-mono font-bold transition-colors cursor-pointer ${
                  isSelected
                    ? 'text-[#4F46E5] dark:text-[#6366F1] bg-indigo-50 dark:bg-[#111827]'
                    : 'text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1E293B]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <IconComponent className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#4F46E5] dark:text-[#6366F1]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
