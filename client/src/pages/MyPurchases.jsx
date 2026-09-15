import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { paymentService } from '../services/api';
import { CardSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { ShoppingBag, CheckCircle, BookOpen, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';

export default function MyPurchases() {
  const [purchases, setPurchases] = useState([]);
  const [accesses, setAccesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        const res = await paymentService.getMyPurchases();
        if (res.success) {
          setPurchases(res.payments || []);
          setAccesses(res.accesses || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load purchase history');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <CardSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE2EC] dark:border-[#252D42] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] dark:text-[#F8FAFC] flex items-center">
            <ShoppingBag className="w-7 h-7 mr-3 text-[#4F8FEF]" /> My Purchases
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9AA6BC] mt-1">
            Manage your paid subject access entitlements and view payment transaction history.
          </p>
        </div>

        <div className="inline-flex items-center space-x-2 bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] border border-[#DCE2EC] dark:border-[#252D42] px-3 py-1.5 rounded-lg text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#36B37E]" />
          <span>Active Entitlements: {accesses.length} Subjects</span>
        </div>
      </div>

      {/* Access Grid / Cards */}
      {accesses.length === 0 && purchases.length === 0 ? (
        <EmptyState
          title="No purchases found"
          message="You have not purchased any paid subjects yet. Browse available subjects to unlock complete courses."
        />
      ) : (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-[#172033] dark:text-[#F8FAFC] flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-[#36B37E]" /> Unlocked Paid Subjects ({accesses.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {accesses.map((acc) => {
              const subj = acc.subjectId;
              if (!subj) return null;

              return (
                <div
                  key={acc._id}
                  className="bg-white dark:bg-[#111729] rounded-xl p-6 border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle hover:shadow-elevated transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-[#0B1020] text-white uppercase">
                        {subj.code || 'SUBJECT'}
                      </span>
                      <span className="text-xs font-bold text-[#36B37E] bg-[#36B37E]/10 border border-[#36B37E]/30 px-2.5 py-1 rounded-lg">
                        ✓ Paid & Active
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#172033] dark:text-[#F8FAFC] leading-snug">
                      {subj.name}
                    </h3>

                    <p className="text-xs text-[#64748B] dark:text-[#9AA6BC]">
                      Purchased on {new Date(acc.grantedAt || acc.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#DCE2EC] dark:border-[#252D42] mt-4 flex items-center justify-between">
                    <span className="text-sm font-black text-[#172033] dark:text-[#F8FAFC]">
                      ₹{subj.price || 9}
                    </span>

                    <Link
                      to={`/subjects/${subj._id}`}
                      className="px-4 py-2 bg-[#4F8FEF] hover:bg-[#3D7FE5] text-white font-bold text-xs rounded-lg shadow-subtle transition-colors flex items-center"
                    >
                      <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Open Subject <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Transactions Table */}
          {purchasedPaymentsTable(purchases)}
        </div>
      )}
    </div>
  );
}

function purchasedPaymentsTable(payments) {
  if (!payments || payments.length === 0) return null;

  return (
    <div className="pt-8 space-y-4">
      <h2 className="text-lg font-bold text-[#172033] dark:text-[#F8FAFC] flex items-center">
        <CreditCard className="w-5 h-5 mr-2 text-[#4F8FEF]" /> Transaction History
      </h2>

      <div className="bg-white dark:bg-[#111729] rounded-xl border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F5F7FB] dark:bg-[#161D31] border-b border-[#DCE2EC] dark:border-[#252D42] text-[#64748B] dark:text-[#9AA6BC] font-bold uppercase tracking-wider">
                <th className="p-3.5">Subject</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Payment ID</th>
                <th className="p-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE2EC] dark:divide-[#252D42] font-medium">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-[#F5F7FB] dark:hover:bg-[#161D31] transition-colors">
                  <td className="p-3.5 font-bold text-[#172033] dark:text-[#F8FAFC]">
                    {p.subjectId?.name || 'Subject'}
                  </td>
                  <td className="p-3.5 font-extrabold text-[#172033] dark:text-[#F8FAFC]">
                    ₹{p.amount ? p.amount / 100 : 9}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
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
                  <td className="p-3.5 text-[#64748B] dark:text-[#9AA6BC] font-mono text-[11px]">
                    {p.razorpayOrderId || '-'}
                  </td>
                  <td className="p-3.5 text-[#64748B] dark:text-[#9AA6BC] font-mono text-[11px]">
                    {p.razorpayPaymentId || '-'}
                  </td>
                  <td className="p-3.5 text-[#64748B] dark:text-[#9AA6BC]">
                    {new Date(p.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
