import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';

export default function SearchBar({ placeholder = "Search notes, subjects, PYQs...", className = "" }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/resources?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative max-w-2xl w-full ${className}`}>
      <div className="relative flex items-center rounded-xl border border-[#DCE2EC] dark:border-[#252D42] bg-white dark:bg-[#111729] shadow-subtle focus-within:border-[#4F8FEF] transition-colors overflow-hidden">
        <Search className="w-5 h-5 text-[#64748B] dark:text-[#9AA6BC] ml-4 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full py-3.5 pl-3 pr-28 text-[#172033] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#9AA6BC] text-sm md:text-base bg-transparent focus:outline-none"
        />
        <button
          type="submit"
          className="absolute right-1.5 px-4 py-2 bg-[#4F8FEF] hover:bg-[#3D7FE5] text-white text-xs md:text-sm font-bold rounded-lg flex items-center space-x-1 transition-colors shadow-subtle cursor-pointer"
        >
          <span>Search</span>
          <ArrowRight className="w-4 h-4 hidden sm:inline" />
        </button>
      </div>
    </form>
  );
}
