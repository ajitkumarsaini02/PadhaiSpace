import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import { Search, Users, BookOpen, FileText, CreditCard, KeyRound, Layers } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE2EC] dark:border-[#252D42] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] dark:text-[#F8FAFC] flex items-center">
            <Search className="w-8 h-8 mr-3 text-[#4F8FEF]" /> Global Admin Search
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9AA6BC] mt-1">
            Search across registered students, subjects, units, resources, payment transactions, and access entitlement records.
          </p>
        </div>
        <Link to="/admin" className="text-xs font-bold text-[#4F8FEF] hover:text-[#3D7FE5] bg-[#EFF5FF] dark:bg-[#161D31] px-3.5 py-2 rounded-lg border border-[#DCE2EC] dark:border-[#252D42]">
          ← Back to Admin
        </Link>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative max-w-2xl">
        <Search className="w-5 h-5 text-[#64748B] dark:text-[#9AA6BC] absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search student, subject, order ID, PDF title..."
          className="w-full pl-11 pr-28 py-3 text-sm bg-white dark:bg-[#111729] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl text-[#172033] dark:text-[#F8FAFC] focus:outline-none focus:border-[#4F8FEF] shadow-subtle"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#4F8FEF] hover:bg-[#3D7FE5] text-white font-bold text-xs rounded-lg shadow-subtle transition-colors cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Results Container */}
      {loading ? (
        <div className="p-8 text-center text-xs text-[#64748B] dark:text-[#9AA6BC]">Searching platform records...</div>
      ) : results ? (
        <div className="space-y-8">
          {/* 1. Students */}
          {results.users?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#172033] dark:text-[#F8FAFC] flex items-center">
                <Users className="w-4 h-4 mr-2 text-[#4F8FEF]" /> Matching Students ({results.users.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {results.users.map((u) => (
                  <div key={u._id} className="p-3.5 bg-white dark:bg-[#111729] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl shadow-subtle">
                    <p className="font-bold text-xs text-[#172033] dark:text-[#F8FAFC]">{u.name}</p>
                    <p className="text-xs text-[#64748B] dark:text-[#9AA6BC]">{u.email}</p>
                    <p className="text-[11px] text-[#64748B] dark:text-[#9AA6BC] mt-1">{u.branch} Sem {u.semester} • {u.college || 'No college'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Subjects */}
          {results.subjects?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#172033] dark:text-[#F8FAFC] flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-[#4F8FEF]" /> Matching Subjects ({results.subjects.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {results.subjects.map((s) => (
                  <Link key={s._id} to={`/subjects/${s._id}`} className="p-3.5 bg-white dark:bg-[#111729] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl shadow-subtle hover:border-[#4F8FEF] transition-colors">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0B1020] text-white uppercase">{s.code || 'CODE'}</span>
                    <p className="font-bold text-xs text-[#172033] dark:text-[#F8FAFC] mt-1.5">{s.name}</p>
                    <p className="text-[11px] text-[#F2A93B] font-bold mt-1">₹{s.price || 9}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 3. Resources */}
          {results.resources?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#172033] dark:text-[#F8FAFC] flex items-center">
                <FileText className="w-4 h-4 mr-2 text-[#4F8FEF]" /> Matching Resources ({results.resources.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {results.resources.map((r) => (
                  <Link key={r._id} to={`/resources/${r._id}`} className="p-3.5 bg-white dark:bg-[#111729] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl shadow-subtle hover:border-[#4F8FEF] transition-colors">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EFF5FF] dark:bg-[#161D31] text-[#4F8FEF] border border-[#DCE2EC] dark:border-[#252D42] uppercase">{r.type}</span>
                    <p className="font-bold text-xs text-[#172033] dark:text-[#F8FAFC] mt-1.5">{r.title}</p>
                    <p className="text-[11px] text-[#64748B] dark:text-[#9AA6BC] mt-1">{r.subjectId?.name || 'Subject'}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 4. Payments */}
          {results.payments?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#172033] dark:text-[#F8FAFC] flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-[#F2A93B]" /> Matching Payment Transactions ({results.payments.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {results.payments.map((p) => (
                  <div key={p._id} className="p-3.5 bg-white dark:bg-[#111729] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl shadow-subtle">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-[#172033] dark:text-[#F8FAFC]">₹{p.amount ? p.amount / 100 : 9}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${p.status === 'captured' ? 'bg-[#36B37E]/10 text-[#36B37E]' : 'bg-amber-500/10 text-[#F2A93B]'}`}>{p.status}</span>
                    </div>
                    <p className="text-xs font-semibold text-[#4F8FEF] mt-1.5">{p.subjectId?.name}</p>
                    <p className="text-[11px] text-[#64748B] dark:text-[#9AA6BC] font-mono mt-1">{p.razorpayOrderId || '-'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
