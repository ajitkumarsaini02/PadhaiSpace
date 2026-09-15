import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import { Users, Search, UserCheck, UserX, AlertCircle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.q = search;
      if (branchFilter) params.branch = branchFilter;
      if (statusFilter) params.status = statusFilter;

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
  }, [branchFilter, statusFilter]);

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
        setActionMsg(`Account for ${userName} has been ${!currentBlocked ? 'disabled' : 'enabled'}.`);
        fetchUsers();
      }
    } catch (err) {
      alert(err.message || 'Status update failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE2EC] dark:border-[#252D42] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] dark:text-[#F8FAFC] flex items-center">
            <Users className="w-7 h-7 mr-3 text-[#4F8FEF]" /> Student Accounts Management
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9AA6BC] mt-1">
            View registered engineering students, inspect enrollment details, and manage account statuses.
          </p>
        </div>
        <Link to="/admin" className="text-xs font-bold text-[#4F8FEF] hover:text-[#3D7FE5] bg-[#EFF5FF] dark:bg-[#161D31] px-3.5 py-2 rounded-lg border border-[#DCE2EC] dark:border-[#252D42] self-start sm:self-auto">
          ← Back to Admin
        </Link>
      </div>

      {actionMsg && (
        <div className="p-3 bg-[#36B37E]/10 border border-[#36B37E]/30 text-[#36B37E] text-xs font-bold rounded-lg flex items-center">
          <UserCheck className="w-4 h-4 mr-2" /> {actionMsg}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-[#111729] rounded-xl p-4 border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#64748B] dark:text-[#9AA6BC] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student name, email, college..."
            className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg focus:outline-none focus:border-[#4F8FEF] text-[#172033] dark:text-[#F8FAFC]"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg focus:outline-none text-[#172033] dark:text-[#F8FAFC]"
          >
            <option value="">All Branches</option>
            <option value="CSE">CSE</option>
            <option value="CSE-AIML">CSE-AIML</option>
            <option value="CSE-DS">CSE-DS</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg focus:outline-none text-[#172033] dark:text-[#F8FAFC]"
          >
            <option value="">All Account Statuses</option>
            <option value="active">Active Accounts</option>
            <option value="blocked">Disabled Accounts</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white dark:bg-[#111729] rounded-xl border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle overflow-hidden">
        <div className="p-4 bg-[#F5F7FB] dark:bg-[#161D31] border-b border-[#DCE2EC] dark:border-[#252D42] font-bold text-xs text-[#172033] dark:text-[#F8FAFC] flex justify-between items-center">
          <span>Registered Student Accounts ({users.length})</span>
          <span className="text-[11px] text-[#64748B] dark:text-[#9AA6BC] font-normal">Passwords & tokens strictly hidden</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[#64748B] dark:text-[#9AA6BC]">Loading student accounts...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#64748B] dark:text-[#9AA6BC]">No student accounts found matching your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F5F7FB] dark:bg-[#161D31] border-b border-[#DCE2EC] dark:border-[#252D42] text-[#64748B] dark:text-[#9AA6BC] font-bold uppercase tracking-wider">
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">College</th>
                  <th className="p-3.5">Branch & Sem</th>
                  <th className="p-3.5">Joined Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE2EC] dark:divide-[#252D42] font-medium">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-[#F5F7FB] dark:hover:bg-[#161D31] transition-colors">
                    <td className="p-3.5 font-bold text-[#172033] dark:text-[#F8FAFC]">
                      {u.name}
                    </td>
                    <td className="p-3.5 text-[#64748B] dark:text-[#9AA6BC]">
                      {u.email}
                    </td>
                    <td className="p-3.5 text-[#64748B] dark:text-[#9AA6BC]">
                      {u.college || '—'}
                    </td>
                    <td className="p-3.5 text-[#172033] dark:text-[#F8FAFC] font-semibold">
                      {u.branch} Sem {u.semester}
                    </td>
                    <td className="p-3.5 text-[#64748B] dark:text-[#9AA6BC]">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.isBlocked
                            ? 'bg-red-500/10 text-[#E05252] border border-red-500/20'
                            : 'bg-[#36B37E]/10 text-[#36B37E] border border-[#36B37E]/30'
                        }`}
                      >
                        {u.isBlocked ? 'Disabled' : 'Active'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleToggleStatus(u._id, u.isBlocked, u.name)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          u.isBlocked
                            ? 'bg-[#36B37E]/10 text-[#36B37E] hover:bg-[#36B37E]/20 border border-[#36B37E]/30'
                            : 'bg-red-500/10 text-[#E05252] hover:bg-red-500/20 border border-red-500/20'
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
