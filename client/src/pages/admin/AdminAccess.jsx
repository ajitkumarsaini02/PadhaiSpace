import React, { useEffect, useState } from 'react';
import { paymentService, adminService, subjectService } from '../../services/api';
import { CardSkeleton } from '../../components/SkeletonLoader';
import { Shield, KeyRound, CheckCircle, RefreshCw, UserCheck, XCircle, PlusCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminAccess() {
  const [accesses, setAccesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  // Modal State
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [grantReason, setGrantReason] = useState('Admin Override');
  const [grantLoading, setGrantLoading] = useState(false);
  const [grantError, setGrantError] = useState('');

  const fetchAccessList = async () => {
    try {
      setLoading(true);
      const [accessRes, userRes, subjRes] = await Promise.all([
        paymentService.getAdminAccess(),
        adminService.getUsers(),
        subjectService.getAll(),
      ]);

      if (accessRes.success) setAccesses(accessRes.data || []);
      if (userRes.success) setUsers(userRes.data || []);
      if (subjRes.success) setSubjects(subjRes.data || []);
    } catch (err) {
      console.error('Failed to load admin access list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessList();
  }, []);

  const handleGrantAccessSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedSubjectId) {
      setGrantError('Please select both a student and a subject.');
      return;
    }

    try {
      setGrantLoading(true);
      setGrantError('');
      const res = await adminService.grantAccess({
        userId: selectedStudentId,
        subjectId: selectedSubjectId,
        reason: grantReason,
      });

      if (res.success) {
        setActionMessage(`Access granted successfully.`);
        setShowGrantModal(false);
        setSelectedStudentId('');
        setSelectedSubjectId('');
        fetchAccessList();
      } else {
        setGrantError(res.message || 'Grant access failed');
      }
    } catch (err) {
      setGrantError(err.message || 'Failed to grant access');
    } finally {
      setGrantLoading(false);
    }
  };

  const handleRevokeAccess = async (accessId, studentName, subjectName) => {
    const reason = window.prompt(`Revoke access for "${studentName}" on subject "${subjectName}"?\nState the reason:`, 'Administrative revocation');
    if (reason === null) return;

    try {
      const res = await adminService.revokeAccess(accessId, reason);
      if (res.success) {
        setActionMessage(`Access revoked for ${studentName} on ${subjectName}.`);
        fetchAccessList();
      }
    } catch (err) {
      alert('Error revoking access: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <CardSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE2EC] dark:border-[#252D42] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] dark:text-[#F8FAFC] flex items-center">
            <KeyRound className="w-8 h-8 mr-3 text-[#F2A93B]" /> Subject Access Entitlements
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9AA6BC] mt-1">
            Monitor, grant, and revoke student subject access entitlements with full audit logging.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowGrantModal(true)}
            className="px-4 py-2 bg-[#F2A93B] hover:bg-[#E39A2E] text-[#0B1020] text-xs font-bold rounded-lg transition-colors flex items-center shadow-subtle cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" /> Grant Manual Access
          </button>
          <Link to="/admin" className="text-xs font-bold text-[#4F8FEF] hover:text-[#3D7FE5] bg-[#EFF5FF] dark:bg-[#161D31] px-3.5 py-2 rounded-lg border border-[#DCE2EC] dark:border-[#252D42]">
            ← Back to Admin
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-lg bg-[#36B37E]/10 border border-[#36B37E]/30 text-[#36B37E] text-xs font-bold flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="text-[#36B37E] font-bold text-sm">✕</button>
        </div>
      )}

      {/* Grant Manual Access Modal */}
      {showGrantModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#111729] rounded-xl border border-[#DCE2EC] dark:border-[#252D42] p-6 max-w-md w-full shadow-elevated space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE2EC] dark:border-[#252D42] pb-3">
              <h3 className="text-base font-bold text-[#172033] dark:text-[#F8FAFC]">Grant Manual Subject Access</h3>
              <button onClick={() => setShowGrantModal(false)} className="text-[#64748B] hover:text-[#172033] font-bold">✕</button>
            </div>

            {grantError && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-[#E05252] text-xs font-semibold rounded-lg">
                {grantError}
              </div>
            )}

            <form onSubmit={handleGrantAccessSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Select Student User</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg text-[#172033] dark:text-[#F8FAFC] focus:outline-none focus:border-[#4F8FEF]"
                >
                  <option value="">-- Choose Student --</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email}) - {u.branch} Sem {u.semester}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Select Subject to Unlock</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg text-[#172033] dark:text-[#F8FAFC] focus:outline-none focus:border-[#4F8FEF]"
                >
                  <option value="">-- Choose Subject --</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.code || 'SUBJECT'}) - ₹{s.price || 9}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Reason / Note for Audit Trail</label>
                <input
                  type="text"
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                  placeholder="e.g. Complimentary access / Scholarship"
                  className="w-full px-3 py-2 text-xs bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg text-[#172033] dark:text-[#F8FAFC] focus:outline-none focus:border-[#4F8FEF]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGrantModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#172033] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={grantLoading}
                  className="px-4 py-2 bg-[#F2A93B] hover:bg-[#E39A2E] text-[#0B1020] font-bold text-xs rounded-lg shadow-subtle cursor-pointer disabled:opacity-60"
                >
                  {grantLoading ? 'Granting...' : 'Confirm Grant Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Access Entitlement Table */}
      <div className="bg-white dark:bg-[#111729] rounded-xl border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F5F7FB] dark:bg-[#161D31] border-b border-[#DCE2EC] dark:border-[#252D42] text-[#64748B] dark:text-[#9AA6BC] font-bold uppercase tracking-wider">
                <th className="p-3.5">Student</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Subject</th>
                <th className="p-3.5">Price</th>
                <th className="p-3.5">Payment ID</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Granted Date</th>
                <th className="p-3.5">Revoked Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE2EC] dark:divide-[#252D42] font-medium">
              {accesses.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-[#64748B] dark:text-[#9AA6BC]">
                    No subject access records found.
                  </td>
                </tr>
              ) : (
                accesses.map((acc) => {
                  const student = acc.userId;
                  const subject = acc.subjectId;
                  const payment = acc.paymentId;

                  return (
                    <tr key={acc._id} className="hover:bg-[#F5F7FB] dark:hover:bg-[#161D31] transition-colors">
                      <td className="p-3.5 font-bold text-[#172033] dark:text-[#F8FAFC]">
                        {student?.name || 'Unknown User'}
                      </td>
                      <td className="p-3.5 text-[#64748B] dark:text-[#9AA6BC]">
                        {student?.email || '-'}
                      </td>
                      <td className="p-3.5 font-bold text-[#4F8FEF]">
                        {subject?.name || 'Subject'} ({subject?.code || ''})
                      </td>
                      <td className="p-3.5 font-extrabold text-[#172033] dark:text-[#F8FAFC]">
                        ₹{subject?.price || 9}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-[#64748B] dark:text-[#9AA6BC]">
                        {payment?.razorpayPaymentId || payment?.razorpayOrderId || 'Manual/Verified'}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            acc.status === 'active'
                              ? 'bg-[#36B37E]/10 text-[#36B37E] border border-[#36B37E]/30'
                              : 'bg-red-500/10 text-[#E05252] border border-red-500/20'
                          }`}
                        >
                          {acc.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#64748B] dark:text-[#9AA6BC]">
                        {new Date(acc.grantedAt || acc.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-3.5 text-[#64748B] dark:text-[#9AA6BC]">
                        {acc.revokedAt
                          ? new Date(acc.revokedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="p-3.5 text-right">
                        {acc.status === 'active' ? (
                          <button
                            onClick={() =>
                              handleRevokeAccess(
                                acc._id,
                                student?.name || 'Student',
                                subject?.name || 'Subject'
                              )
                            }
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-[#E05252] border border-red-500/20 font-bold rounded-lg transition-colors text-[11px] inline-flex items-center cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Revoke Access
                          </button>
                        ) : (
                          <span className="text-[#64748B] dark:text-[#9AA6BC] text-[11px] italic">Revoked</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
