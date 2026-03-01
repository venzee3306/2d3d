import { useState } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, DollarSign, CreditCard, Copy, Eye, X, Camera, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { UnitDepositRequest } from '../types/units';

interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'master' | 'agent';
  parentId?: string;
}

interface MobileMasterDepositsProps {
  onBack: () => void;
  currentUser: User;
  allUsers: User[];
  unitDepositRequests: UnitDepositRequest[];
  onApproveDeposit: (requestId: string) => void;
  onRejectDeposit: (requestId: string, reason: string) => void;
}

export function MobileMasterDeposits({
  onBack,
  currentUser,
  allUsers,
  unitDepositRequests,
  onApproveDeposit,
  onRejectDeposit
}: MobileMasterDepositsProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [viewingRequest, setViewingRequest] = useState<UnitDepositRequest | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<UnitDepositRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);

  // Filter deposits where this master is the approver
  const myAgents = allUsers.filter(u => u.role === 'agent' && u.parentId === currentUser.id);
  const myAgentIds = myAgents.map(a => a.id);
  const myDeposits = unitDepositRequests.filter(req =>
    myAgentIds.includes(req.requesterId) && req.approverId === currentUser.id
  );

  const pendingCount = myDeposits.filter(r => r.status === 'pending').length;
  const approvedCount = myDeposits.filter(r => r.status === 'approved').length;
  const rejectedCount = myDeposits.filter(r => r.status === 'rejected').length;
  const totalApproved = myDeposits
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const filteredRequests =
    filter === 'all' ? myDeposits :
    myDeposits.filter(r => r.status === filter);

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return '0';
    return amount.toLocaleString('en-US');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApprove = (request: UnitDepositRequest) => {
    onApproveDeposit(request.id);
    setViewingRequest(null);
  };

  const handleRejectClick = (request: UnitDepositRequest) => {
    setRejectingRequest(request);
    setRejectReason('');
  };

  const handleRejectConfirm = () => {
    if (rejectingRequest && rejectReason.trim()) {
      onRejectDeposit(rejectingRequest.id, rejectReason);
      setRejectingRequest(null);
      setRejectReason('');
      setViewingRequest(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'approved': return 'bg-green-100 text-green-700 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3.5 h-3.5" />;
      case 'approved': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'rejected': return <XCircle className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="w-full max-w-[375px] h-screen bg-[#F5F7FA] flex flex-col mx-auto relative overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Deposit Requests</h1>
            <p className="text-xs text-blue-100" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              Agent များ၏ ယူနစ်တောင်းခံမှုများ
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-blue-200">Approved Total</p>
            <p className="text-sm font-bold text-white">{formatCurrency(totalApproved)} MMK</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {([
            { key: 'all', label: 'All', count: myDeposits.length },
            { key: 'pending', label: 'Pending', count: pendingCount },
            { key: 'approved', label: 'Approved', count: approvedCount },
            { key: 'rejected', label: 'Rejected', count: rejectedCount },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                filter === tab.key
                  ? 'bg-white text-blue-700 shadow-md'
                  : 'bg-white/20 text-white'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 hide-scrollbar">
        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3">
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium">No deposit requests</p>
            <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              Agent များ၏ တောင်းခံမှု မရှိသေးပါ
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {request.requesterName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{request.requesterName}</h3>
                      <p className="text-[10px] text-gray-500">{formatTime(request.requestedAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{formatCurrency(request.amount)}</p>
                    <p className="text-[9px] text-gray-400">MMK</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(request.status)}`}>
                    {getStatusIcon(request.status)}
                    {request.status.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    {request.paymentMethod}
                  </span>
                </div>

                {/* Transaction ID */}
                <div className="bg-gray-50 rounded-lg p-2.5 flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[9px] text-gray-500">Transaction ID</p>
                    <p className="text-xs font-mono font-bold text-gray-800">{request.transactionId}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(request.transactionId)}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {copiedId === request.transactionId ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>

                {/* Screenshot Preview */}
                {request.paymentScreenshot && (
                  <button
                    onClick={() => setViewingScreenshot(request.paymentScreenshot!)}
                    className="w-full flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg mb-3 text-left"
                  >
                    <Camera className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-xs text-blue-700 font-medium flex-1">Payment receipt attached</span>
                    <Eye className="w-4 h-4 text-blue-500" />
                  </button>
                )}

                {request.note && (
                  <p className="text-xs text-gray-600 mb-3 bg-gray-50 rounded-lg p-2.5 italic">
                    "{request.note}"
                  </p>
                )}

                {/* Action Buttons - Only for pending */}
                {request.status === 'pending' && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleApprove(request)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold text-xs shadow-md active:scale-95 transition-transform"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectClick(request)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-bold text-xs shadow-md active:scale-95 transition-transform"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}

                {request.status === 'rejected' && request.rejectionReason && (
                  <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-red-500 font-bold mb-0.5">Rejection Reason</p>
                      <p className="text-xs text-red-700">{request.rejectionReason}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectingRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-t-3xl w-full max-w-[375px] shadow-2xl"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Reject Deposit</h3>
                  <button
                    onClick={() => { setRejectingRequest(null); setRejectReason(''); }}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-sm text-red-700">
                    Rejecting <span className="font-bold">{formatCurrency(rejectingRequest.amount)} MMK</span> from{' '}
                    <span className="font-bold">{rejectingRequest.requesterName}</span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setRejectingRequest(null); setRejectReason(''); }}
                    className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectConfirm}
                    disabled={!rejectReason.trim()}
                    className={`flex-1 py-3 rounded-xl font-semibold text-white ${
                      rejectReason.trim()
                        ? 'bg-red-600 shadow-lg'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    Confirm Reject
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screenshot Viewer */}
      <AnimatePresence>
        {viewingScreenshot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setViewingScreenshot(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setViewingScreenshot(null)}
                className="absolute -top-3 -right-3 p-2 bg-white rounded-full shadow-lg z-10"
              >
                <X className="w-5 h-5 text-gray-800" />
              </button>
              <img
                src={viewingScreenshot}
                alt="Payment Screenshot"
                className="w-full rounded-2xl shadow-2xl border-4 border-white"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
