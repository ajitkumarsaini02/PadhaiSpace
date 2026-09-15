import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';
import PDFViewerModal from '../components/PDFViewerModal';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/SkeletonLoader';
import { subjectService, unitService, resourceService, paymentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  ArrowLeft,
  Award,
  Lock,
  CheckCircle,
  ShieldCheck,
  CreditCard,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export default function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [subject, setSubject] = useState(null);
  const [units, setUnits] = useState([]);
  const [resources, setResources] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'notes', 'pdf', 'pyq', 'syllabus-exam'
  const [selectedUnit, setSelectedUnit] = useState('');
  const [loading, setLoading] = useState(true);
  const [activePDF, setActivePDF] = useState(null);

  // Payment State (All Subjects Free for Now)
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');

  // Dynamically load Razorpay SDK Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    const fetchSubjectData = async () => {
      try {
        setLoading(true);
        const [subjRes, unitsRes, resRes] = await Promise.all([
          subjectService.getById(id),
          unitService.getAll(id),
          resourceService.getAll({ subjectId: id }),
        ]);

        if (subjRes.success) setSubject(subjRes.data);
        if (unitsRes.success) setUnits(unitsRes.data);
        if (resRes.success) setResources(resRes.data);

        // Check Access entitlement if logged in
        if (isAuthenticated) {
          try {
            const accessRes = await paymentService.checkAccess(id);
            if (accessRes.success) {
              setIsUnlocked(accessRes.unlocked);
            }
          } catch (accessErr) {
            console.warn('Check access failed:', accessErr.message);
          }
        }
      } catch (err) {
        console.error('Fetch subject detail error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSubjectData();
  }, [id, isAuthenticated]);

  // Unlock / Purchase Subject Flow
  const handleUnlockSubject = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/subjects/${id}` } } });
      return;
    }

    try {
      setPurchaseLoading(true);
      setPurchaseError('');

      // 1. Create order on backend
      const orderRes = await paymentService.createOrder(id);
      if (!orderRes.success) {
        setPurchaseError(orderRes.message || 'Failed to initialize payment order');
        setPurchaseLoading(false);
        return;
      }

      if (orderRes.alreadyUnlocked) {
        setIsUnlocked(true);
        setPurchaseLoading(false);
        return;
      }

      const { order, subject: orderSubject } = orderRes;

      // 2. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      
      // If Razorpay SDK loaded and valid key present
      if (scriptLoaded && window.Razorpay && order.keyId && !order.id.startsWith('order_test_')) {
        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'PadhaiSpace',
          description: `Unlock Complete Subject: ${orderSubject?.name || 'Subject'}`,
          order_id: order.id,
          handler: async function (response) {
            try {
              const verifyRes = await paymentService.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                subjectId: id,
              });

              if (verifyRes.success) {
                setIsUnlocked(true);
              } else {
                setPurchaseError('Payment verification failed: ' + verifyRes.message);
              }
            } catch (vErr) {
              setPurchaseError('Error verifying payment signature');
            } finally {
              setPurchaseLoading(false);
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
          },
          theme: { color: '#0f172a' },
          modal: {
            ondismiss: function () {
              setPurchaseLoading(false);
            },
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.on('payment.failed', function (response) {
          setPurchaseError('Payment failed: ' + (response.error?.description || 'Transaction declined'));
          setPurchaseLoading(false);
        });
        razorpayInstance.open();
      } else {
        // Test mode automatic checkout simulation for test environment
        const verifyRes = await paymentService.verifyPayment({
          razorpay_order_id: order.id,
          razorpay_payment_id: `pay_test_${Date.now()}`,
          razorpay_signature: 'test_signature_valid',
          subjectId: id,
        });

        if (verifyRes.success) {
          setIsUnlocked(true);
        } else {
          setPurchaseError(verifyRes.message || 'Payment failed in test mode');
        }
        setPurchaseLoading(false);
      }
    } catch (err) {
      console.error('Purchase error:', err);
      setPurchaseError(err.message || 'Payment processing failed');
      setPurchaseLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CardSkeleton count={4} />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Subject Not Found</h2>
        <Link to="/subjects" className="text-brand-600 underline mt-2 inline-block">
          Return to Subjects
        </Link>
      </div>
    );
  }

  // Filter resources based on tab & unit
  const filteredResources = resources.filter((res) => {
    if (selectedUnit && res.unitId?._id !== selectedUnit) return false;
    if (activeTab === 'notes') return res.type === 'notes';
    if (activeTab === 'pdf') return res.type === 'pdf';
    if (activeTab === 'pyq') return res.type === 'pyq';
    if (activeTab === 'syllabus-exam') return res.type === 'syllabus' || res.type === 'exam-resource';
    return true;
  });

  const offeredBranches = subject.offerings && subject.offerings.length > 0
    ? Array.from(new Set(subject.offerings.map(o => o.branchId?.code || o.branchId?.name).filter(Boolean)))
    : (subject.branchIds && subject.branchIds.length > 0
        ? subject.branchIds.map(b => b.code || b.name)
        : [subject.branchId?.code || subject.branchId?.name].filter(Boolean));

  const offeredSemesters = subject.offerings && subject.offerings.length > 0
    ? Array.from(new Set(subject.offerings.map(o => o.semesterId?.number || o.semesterNumber).filter(Boolean))).sort((a, b) => a - b)
    : [subject.semesterNumber || subject.semesterId?.number].filter(Boolean);

  const subjectTypeDisplay = subject.subjectType || subject.type || 'theory';
  const priceRupees = subject.price || 9;
  const isPaidSubject = subject.isPaid !== false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <Link
        to="/subjects"
        className="inline-flex items-center text-xs font-semibold text-[#64748B] dark:text-[#9AA6BC] hover:text-[#4F8FEF] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Subjects
      </Link>

      {/* Header Banner - Dark Navy #0B1020 */}
      <div className="bg-[#0B1020] text-[#F8FAFC] border border-[#252D42] rounded-xl p-6 sm:p-8 shadow-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              {subject.code && (
                <span className="px-2.5 py-1 rounded bg-[#161D31] text-[#F8FAFC] text-xs font-bold uppercase tracking-wider border border-[#252D42]">
                  {subject.code}
                </span>
              )}
              {offeredBranches.length > 0 && (
                <span className="px-2.5 py-1 rounded bg-[#161D31] text-[#9AA6BC] text-xs font-semibold border border-[#252D42]">
                  Branches: {offeredBranches.join(', ')}
                </span>
              )}
              {offeredSemesters.length > 0 && (
                <span className="px-2.5 py-1 rounded bg-[#161D31] text-[#9AA6BC] text-xs font-semibold border border-[#252D42]">
                  {offeredSemesters.length === 1 ? `Semester ${offeredSemesters[0]}` : `Semesters: ${offeredSemesters.join(', ')}`}
                </span>
              )}
              <span className="px-2.5 py-1 rounded bg-[#4F8FEF]/10 text-[#6EA8FF] border border-[#6EA8FF]/30 text-xs font-bold capitalize">
                {subjectTypeDisplay} Course
              </span>
              {subject.credits && (
                <span className="px-2.5 py-1 rounded bg-[#161D31] text-[#F2A93B] text-xs font-semibold flex items-center border border-[#252D42]">
                  <Award className="w-3 h-3 mr-1 text-[#F2A93B]" /> {subject.credits} Credits
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {subject.name}
            </h1>

            <p className="text-xs sm:text-sm text-[#9AA6BC] leading-relaxed">
              {subject.description || 'Access official B.Tech semester notes, unit PDFs, previous year question papers, syllabi, and revision materials.'}
            </p>

            {/* Access Badge for header */}
            {isPaidSubject && isUnlocked && (
              <div className="inline-flex items-center space-x-2 bg-[#36B37E]/10 text-[#36B37E] border border-[#36B37E]/30 px-3 py-1.5 rounded-lg text-xs font-bold">
                <CheckCircle className="w-4 h-4 text-[#36B37E]" />
                <span>✓ Unlocked — All {units.length || 5} Units Available</span>
              </div>
            )}
          </div>

          {/* Pricing & Unlock Box */}
          {isPaidSubject && !isUnlocked && (
            <div className="bg-[#111729] border border-[#252D42] rounded-xl p-5 md:w-80 shadow-subtle space-y-4 flex-shrink-0 text-center md:text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#9AA6BC] uppercase tracking-wider">Complete Subject</span>
                <span className="bg-[#F2A93B]/10 text-[#F2A93B] text-[10px] font-bold px-2 py-0.5 rounded border border-[#F2A93B]/30">One-Time Access</span>
              </div>

              <div>
                <div className="text-3xl font-black text-white flex items-baseline justify-center md:justify-start">
                  <span>₹{priceRupees}</span>
                  <span className="text-xs font-medium text-[#9AA6BC] ml-1.5">/ complete subject</span>
                </div>
                <p className="text-xs text-[#9AA6BC] mt-1">Unlock all {units.length || 5} units & all PDF study materials</p>
              </div>

              {purchaseError && (
                <div className="p-2.5 rounded-lg bg-red-500/10 text-[#E05252] text-xs font-medium border border-red-500/20">
                  {purchaseError}
                </div>
              )}

              <button
                onClick={handleUnlockSubject}
                disabled={purchaseLoading}
                className="w-full py-2.5 px-4 bg-[#F2A93B] hover:bg-[#E39A2E] text-[#0B1020] font-bold text-xs rounded-lg shadow-subtle transition-colors flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                {purchaseLoading ? (
                  <span className="inline-block animate-spin">⌛ Loading...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Unlock for ₹{priceRupees}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center space-x-3 text-[11px] text-[#9AA6BC]">
                <span className="flex items-center"><ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#36B37E]" /> Razorpay Secured</span>
                <span>•</span>
                <span>All Units Included</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unlocked Banner / Purchase Banner */}
      {isPaidSubject && !isUnlocked ? (
        <div className="bg-[#111729] border border-[#252D42] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#F2A93B]/10 text-[#F2A93B] border border-[#F2A93B]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F8FAFC]">Subject Content Locked</h3>
              <p className="text-xs text-[#9AA6BC] mt-0.5">
                Purchase this subject for ₹{priceRupees} to unlock Unit 1 through Unit 5 and read all protected PDFs.
              </p>
            </div>
          </div>
          <button
            onClick={handleUnlockSubject}
            disabled={purchaseLoading}
            className="px-5 py-2.5 bg-[#F2A93B] hover:bg-[#E39A2E] text-[#0B1020] font-bold text-xs rounded-lg shadow-subtle transition-colors whitespace-nowrap"
          >
            Unlock for ₹{priceRupees}
          </button>
        </div>
      ) : (
        <div className="bg-[#36B37E]/10 border border-[#36B37E]/30 rounded-xl p-4 flex items-center space-x-3 text-[#36B37E]">
          <CheckCircle className="w-5 h-5 text-[#36B37E] flex-shrink-0" />
          <p className="text-xs sm:text-sm font-semibold">
            ✓ Unlocked — Full access to all {units.length || 5} units and PDF study materials.
          </p>
        </div>
      )}

      {/* Units Section */}
      {units.length > 0 && (
        <div className="bg-white dark:bg-[#111729] rounded-xl p-5 border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#172033] dark:text-[#F8FAFC] flex items-center">
              <Layers className="w-4 h-4 mr-2 text-[#4F8FEF]" /> Syllabus Units ({units.length})
            </h3>
            {isPaidSubject && (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${isUnlocked ? 'bg-[#36B37E]/10 text-[#36B37E] border border-[#36B37E]/30' : 'bg-[#F2A93B]/10 text-[#F2A93B] border border-[#F2A93B]/30'}`}>
                {isUnlocked ? '✓ Unlocked' : `₹${priceRupees} Unlocks All ${units.length} Units`}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedUnit('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedUnit === ''
                  ? 'bg-[#4F8FEF] text-white shadow-subtle'
                  : 'bg-[#F5F7FB] dark:bg-[#161D31] text-[#64748B] dark:text-[#9AA6BC] hover:text-[#172033] dark:hover:text-white border border-[#DCE2EC] dark:border-[#252D42]'
              }`}
            >
              All Units
            </button>
            {units.map((u) => (
              <button
                key={u._id}
                onClick={() => setSelectedUnit(u._id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                  selectedUnit === u._id
                    ? 'bg-[#4F8FEF] text-white shadow-subtle'
                    : 'bg-[#F5F7FB] dark:bg-[#161D31] text-[#64748B] dark:text-[#9AA6BC] hover:text-[#172033] dark:hover:text-white border border-[#DCE2EC] dark:border-[#252D42]'
                }`}
              >
                {isPaidSubject && !isUnlocked ? (
                  <Lock className="w-3 h-3 text-[#F2A93B]" />
                ) : (
                  <CheckCircle className="w-3 h-3 text-[#36B37E]" />
                )}
                <span>Unit {u.unitNumber}: {u.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="border-b border-[#DCE2EC] dark:border-[#252D42] flex items-center space-x-2 sm:space-x-4 overflow-x-auto pb-1 text-xs sm:text-sm font-medium">
        {[
          { id: 'all', label: 'All Resources' },
          { id: 'notes', label: 'Semester Notes' },
          { id: 'pdf', label: 'Unit PDFs' },
          { id: 'pyq', label: 'PYQs (Past Papers)' },
          { id: 'syllabus-exam', label: 'Syllabus & Exam Resources' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-3 border-b-2 font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-[#4F8FEF] text-[#4F8FEF]'
                : 'border-transparent text-[#64748B] dark:text-[#9AA6BC] hover:text-[#172033] dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <EmptyState
          title="No resources available in this category"
          message="Select another category tab or unit to find academic materials."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => (
            <ResourceCard
              key={res._id}
              resource={res}
              isUnlocked={!isPaidSubject || isUnlocked}
              onUnlockRequest={handleUnlockSubject}
              onOpenPDF={(r) => setActivePDF(r)}
            />
          ))}
        </div>
      )}

      {/* PDF Modal */}
      {activePDF && (
        <PDFViewerModal resource={activePDF} onClose={() => setActivePDF(null)} />
      )}
    </div>
  );
}
