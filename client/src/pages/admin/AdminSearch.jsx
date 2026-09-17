import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import AdminNav from '../../components/AdminNav';
import { Search, Users, BookOpen, FileText, Layers } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export default function AdminSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const performSearch = async (q) => {
    if (!q || !q.trim()) return;
    try {
      setLoading(true);
      const res = await adminService.globalSearch(q.trim());
      if (res.success) {
        setResults(res);
      }
    } catch (err) {
      console.error('Global admin search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      performSearch(query.trim());
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F8FAFC]">
      <AdminNav
        title="Global Admin Search"
        subtitle="Search across registered students, engineering subjects, units, and resources"
      />

      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative max-w-2xl">
        <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search student, subject code, unit title, PDF title..."
          className="w-full pl-10 pr-28 py-2.5 text-xs bg-[#070A12] text-[#F8FAFC] border border-[#1E293B] rounded-xl focus:outline-none focus:border-[#38BDF8] font-mono shadow-md"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-mono font-bold text-xs rounded-lg transition-colors cursor-pointer border border-[#38BDF8]/30"
        >
          Search
        </button>
      </form>

      {/* Results Container */}
      {loading ? (
        <div className="p-8 text-center text-xs font-mono text-[#94A3B8]">Searching platform records...</div>
      ) : results ? (
        <div className="space-y-8">
          {/* 1. Students */}
          {results.users?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold text-[#F8FAFC] flex items-center">
                <Users className="w-4 h-4 mr-2 text-[#38BDF8]" /> Matching Students ({results.users.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {results.users.map((u) => (
                  <div key={u._id} className="tech-card p-3.5 space-y-1">
                    <p className="font-bold text-xs text-[#F8FAFC]">{u.name}</p>
                    <p className="text-[11px] text-[#94A3B8] font-mono">{u.email}</p>
                    <p className="text-[10px] text-[#64748B]">{u.college || 'No college listed'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Subjects */}
          {results.subjects?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold text-[#F8FAFC] flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-[#38BDF8]" /> Matching Subjects ({results.subjects.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {results.subjects.map((s) => (
                  <Link key={s._id} to={`/subjects/${s._id}`} className="tech-card p-3.5 hover:border-[#38BDF8] transition-colors block">
                    <span className="tech-badge tech-badge-blue">{s.code || 'CODE'}</span>
                    <p className="font-bold text-xs text-[#F8FAFC] mt-1.5">{s.name}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 3. Resources */}
          {results.resources?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold text-[#F8FAFC] flex items-center">
                <FileText className="w-4 h-4 mr-2 text-[#38BDF8]" /> Matching Resources ({results.resources.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {results.resources.map((r) => (
                  <Link key={r._id} to={`/resources/${r._id}`} className="tech-card p-3.5 hover:border-[#38BDF8] transition-colors block space-y-1">
                    <span className="tech-badge tech-badge-purple uppercase">{r.type}</span>
                    <p className="font-bold text-xs text-[#F8FAFC] mt-1.5">{r.title}</p>
                    <p className="text-[10px] text-[#94A3B8]">{r.subjectId?.name || 'Subject'}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
