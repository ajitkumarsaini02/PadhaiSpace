import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import AdminNav from '../../components/AdminNav';
import { Users, Search, UserCheck, ShieldCheck, UserX } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.q = search;

      const res = await adminService.getUsers(params);
      if (res.success) setUsers(res.data);
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (userId, currentBlocked, userName) => {
    const targetAction = currentBlocked ? 'enable' : 'disable';
    if (!window.confirm(`Are you sure you want to ${targetAction} the account for ${userName}?`)) return;

    try {
      setActionMsg('');
      const res = await adminService.toggleUserStatus(userId, !currentBlocked);
      if (res.success) {
        setActionMsg(`Account for ${userName} status updated.`);
        fetchUsers();
      }
    } catch (err) {
      alert(err.message || 'Status update failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F8FAFC]">
      <AdminNav
        title="User Management"
        subtitle="View registered student accounts, college details, registration timestamps, and account status"
      />

      {actionMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold rounded-xl flex items-center">
          <UserCheck className="w-4 h-4 mr-2" /> {actionMsg}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="tech-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student name, email, college..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#070A12] text-[#F8FAFC] border border-[#1E293B] rounded-xl focus:outline-none focus:border-[#38BDF8] font-mono"
          />
        </form>
        
        <div className="text-xs font-mono text-[#94A3B8] flex items-center">
          <ShieldCheck className="w-4 h-4 mr-1.5 text-[#10B981]" />
          <span>Passwords & JWT Secrets Strictly Protected</span>
        </div>
      </div>

      {/* User Table */}
      <div className="tech-card overflow-hidden">
        <div className="p-4 bg-[#0F172A] border-b border-[#1E293B] font-mono font-bold text-xs text-[#F8FAFC] flex justify-between items-center">
          <span className="flex items-center"><Users className="w-4 h-4 mr-2 text-[#38BDF8]" /> Registered Student Accounts ({users.length})</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-[#94A3B8]">Loading student accounts...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-[#94A3B8]">No student accounts found matching search criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0F172A] border-b border-[#1E293B] text-[#94A3B8] font-mono font-bold uppercase tracking-wider">
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">College</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Created Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B] font-medium">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-[#0F172A] transition-colors">
                    <td className="p-3.5 font-bold text-[#F8FAFC]">
                      {u.name}
                    </td>
                    <td className="p-3.5 text-[#94A3B8] font-mono">
                      {u.email}
                    </td>
                    <td className="p-3.5 text-[#94A3B8]">
                      {u.college || '—'}
                    </td>
                    <td className="p-3.5">
                      <span className="tech-badge tech-badge-blue">
                        {u.role || 'student'}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#94A3B8] font-mono">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`tech-badge ${
                          u.isBlocked ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'tech-badge-green'
                        }`}
                      >
                        {u.isBlocked ? 'Disabled' : 'Active'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleToggleStatus(u._id, u.isBlocked, u.name)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                          u.isBlocked
                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
                        }`}
                      >
                        {u.isBlocked ? 'Enable Account' : 'Disable Account'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
