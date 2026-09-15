import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

export default function ThemeToggle({ showLabel = false }) {
  const { themeMode, setThemeMode, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
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

  const currentOption = themeOptions.find((opt) => opt.id === themeMode) || themeOptions[2];
  const CurrentIcon = currentOption.icon;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-1.5 text-xs font-semibold cursor-pointer"
        title={`Theme: ${currentOption.label} (Current: ${resolvedTheme})`}
        aria-label="Toggle theme mode"
      >
        <CurrentIcon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
        {showLabel && <span className="capitalize">{currentOption.label}</span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 text-xs z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-3 py-1 font-bold text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Theme Mode
          </div>
          {themeOptions.map((opt) => {
            const IconComponent = opt.icon;
            const isSelected = themeMode === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  setThemeMode(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-50/70 dark:bg-brand-950/40 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <IconComponent className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
