import React, { useEffect, useState } from 'react';
import { paymentService } from '../../services/api';
import { CardSkeleton } from '../../components/SkeletonLoader';
import {
  CreditCard,
  IndianRupee,
  ShoppingBag,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [revenueStats, setRevenueStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPaymentsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [paymentsRes, statsRes] = await Promise.all([
        paymentService.getAdminPayments({ status: statusFilter }),
        paymentService.getRevenueStats(),
      ]);

      if (paymentsRes.success) setPayments(paymentsRes.data || []);
      if (statsRes.success) setRevenueStats(statsRes.stats);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin payment records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsData();
  }, [statusFilter]);

  const filteredPayments = payments.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.userId?.name?.toLowerCase().includes(term) ||
      p.userId?.email?.toLowerCase().includes(term) ||
      p.subjectId?.name?.toLowerCase().includes(term) ||
      p.razorpayOrderId?.toLowerCase().includes(term) ||
      p.razorpayPaymentId?.toLowerCase().includes(term)
    );
  });

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
            <CreditCard className="w-8 h-8 mr-3 text-[#4F8FEF]" /> Payment & Revenue Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9AA6BC] mt-1">
            Complete transaction records, revenue analytics, and Razorpay payment statuses.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchPaymentsData}
            className="inline-flex items-center px-4 py-2 bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] border border-[#DCE2EC] dark:border-[#252D42] text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-2" /> Refresh
          </button>
          <Link to="/admin" className="text-xs font-bold text-[#4F8FEF] hover:text-[#3D7FE5] bg-[#EFF5FF] dark:bg-[#161D31] px-3.5 py-2 rounded-lg border border-[#DCE2EC] dark:border-[#252D42]">
            ← Back to Admin
          </Link>
        </div>
      </div>

      {/* Revenue Metric Cards */}
      {revenueStats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-[#0B1020] border border-[#252D42] rounded-xl p-5 text-[#F8FAFC] shadow-subtle">
            <div className="flex items-center justify-between text-[#9AA6BC] text-xs font-semibold mb-2">
              <span>Total Revenue</span>
              <IndianRupee className="w-4 h-4 text-[#F2A93B]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              ₹{revenueStats.totalRevenueRupees}
            </div>
            <p className="text-[10px] text-[#9AA6BC] mt-1">Verified Captures</p>
          </div>

          <div className="bg-white dark:bg-[#111729] rounded-xl p-5 border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle">
            <div className="flex items-center justify-between text-[#64748B] dark:text-[#9AA6BC] text-xs font-semibold mb-2">
              <span>Successful</span>
              <CheckCircle className="w-4 h-4 text-[#36B37E]" />
            </div>
            <div className="text-2xl font-bold text-[#36B37E]">
              {revenueStats.totalPurchases}
            </div>
            <p className="text-[10px] text-[#64748B] dark:text-[#9AA6BC] mt-1">Paid & Active</p>
          </div>

          <div className="bg-white dark:bg-[#111729] rounded-xl p-5 border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle">
            <div className="flex items-center justify-between text-[#64748B] dark:text-[#9AA6BC] text-xs font-semibold mb-2">
              <span>Pending</span>
              <RefreshCw className="w-4 h-4 text-[#F2A93B]" />
            </div>
            <div className="text-2xl font-bold text-[#F2A93B]">
              {revenueStats.pendingCount}
            </div>
            <p className="text-[10px] text-[#64748B] dark:text-[#9AA6BC] mt-1">Order Created</p>
          </div>

          <div className="bg-white dark:bg-[#111729] rounded-xl p-5 border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle">
            <div className="flex items-center justify-between text-[#64748B] dark:text-[#9AA6BC] text-xs font-semibold mb-2">
              <span>Failed</span>
              <AlertCircle className="w-4 h-4 text-[#E05252]" />
            </div>
            <div className="text-2xl font-bold text-[#E05252]">
              {revenueStats.failedCount}
            </div>
            <p className="text-[10px] text-[#64748B] dark:text-[#9AA6BC] mt-1">Declined</p>
          </div>

          <div className="bg-white dark:bg-[#111729] rounded-xl p-5 border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle">
            <div className="flex items-center justify-between text-[#64748B] dark:text-[#9AA6BC] text-xs font-semibold mb-2">
              <span>Refunded</span>
              <ShoppingBag className="w-4 h-4 text-[#64748B]" />
            </div>
            <div className="text-2xl font-bold text-[#172033] dark:text-[#F8FAFC]">
              {revenueStats.refundedCount}
            </div>
            <p className="text-[10px] text-[#64748B] dark:text-[#9AA6BC] mt-1">Access Revoked</p>
          </div>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-[#111729] rounded-xl p-4 border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#64748B] dark:text-[#9AA6BC]" />
          <input
            type="text"
            placeholder="Search by student, email, order..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg text-xs font-medium text-[#172033] dark:text-[#F8FAFC] focus:outline-none focus:border-[#4F8FEF]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-[#64748B] dark:text-[#9AA6BC]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#F5F7FB] dark:bg-[#161D31] border border-[#DCE2EC] dark:border-[#252D42] rounded-lg text-xs font-medium text-[#172033] dark:text-[#F8FAFC] focus:outline-none focus:border-[#4F8FEF]"
          >
            <option value="">All Payment Statuses</option>
            <option value="captured">Captured (Successful)</option>
            <option value="created">Created (Pending)</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Payment Records Table */}
      <div className="bg-white dark:bg-[#111729] rounded-xl border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F5F7FB] dark:bg-[#161D31] border-b border-[#DCE2EC] dark:border-[#252D42] text-[#64748B] dark:text-[#9AA6BC] font-bold uppercase tracking-wider">
                <th className="p-3.5">Student</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Subject</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Payment ID</th>
                <th className="p-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE2EC] dark:divide-[#252D42] font-medium">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-[#64748B] dark:text-[#9AA6BC]">
                    No payment records match the current filter.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-[#F5F7FB] dark:hover:bg-[#161D31] transition-colors">
                    <td className="p-3.5 font-bold text-[#172033] dark:text-[#F8FAFC]">
                      {p.userId?.name || 'Unknown Student'}
                    </td>
                    <td className="p-3.5 text-[#64748B] dark:text-[#9AA6BC]">
                      {p.userId?.email || '-'}
                    </td>
                    <td className="p-3.5 font-semibold text-[#4F8FEF]">
                      {p.subjectId?.name || 'Subject'}
                    </td>
                    <td className="p-3.5 font-extrabold text-[#172033] dark:text-[#F8FAFC]">
                      ₹{p.amount ? p.amount / 100 : 9}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.status === 'captured'
                            ? 'bg-[#36B37E]/10 text-[#36B37E] border border-[#36B37E]/30'
                            : p.status === 'failed'
                            ? 'bg-red-500/10 text-[#E05252] border border-red-500/20'
                            : 'bg-[#F2A93B]/10 text-[#F2A93B] border border-[#F2A93B]/30'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-[#64748B] dark:text-[#9AA6BC]">
                      {p.razorpayOrderId || '-'}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-[#64748B] dark:text-[#9AA6BC]">
                      {p.razorpayPaymentId || '-'}
                    </td>
                    <td className="p-3.5 text-[#64748B] dark:text-[#9AA6BC]">
                      {new Date(p.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
