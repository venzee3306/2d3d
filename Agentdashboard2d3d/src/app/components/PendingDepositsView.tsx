import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  AlertCircle, 
  User, 
  Calendar,
  Wallet,
  ArrowDownCircle,
  Search,
  Filter,
  Download,
  Image as ImageIcon,
  X
} from 'lucide-react';
import type { UnitDepositRequest } from '../types/units';

interface PendingDepositsViewProps {
  requests: UnitDepositRequest[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string, reason: string) => void;
  currentUserRole: 'admin' | 'master';
}

export function PendingDepositsView({ 
  requests, 
  onApprove, 
  onReject, 
  currentUserRole 
}: PendingDepositsViewProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Pending
            <span style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              (စောင့်ဆိုင်းဆဲ)
            </span>
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Approved
            <span style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              (အတည်ပြုပြီး)
            </span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            <XCircle className="w-4 h-4" />
            Rejected
            <span style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              (ငြင်းပယ်ထားသည်)
            </span>
          </span>
        );
      default:
        return null;
    }
  };

  // Handle approval
  const handleApprove = (request: UnitDepositRequest) => {
    if (window.confirm(
      `Approve this deposit request?\n\n` +
      `From: ${request.requesterName}\n` +
      `Amount: ${request.amount.toLocaleString()} Units\n` +
      `Payment: ${request.paymentMethod}\n` +
      `Transaction ID: ${request.transactionId}\n\n` +
      `This will:\n` +
      `• Deduct ${request.amount.toLocaleString()} units from your balance\n` +
      `• Add ${request.amount.toLocaleString()} units to ${request.requesterName}'s balance`
    )) {
      onApprove(request.id);
    }
  };

  // Handle rejection
  const handleReject = (requestId: string) => {
    if (rejectReason.trim()) {
      onReject(requestId, rejectReason);
      setRejectingId(null);
      setRejectReason('');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Pending Unit Deposits
          </h2>
          <p className="text-gray-600 mt-1" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
            ယူနစ် ဖြည့်ရန် တောင်းဆိုမှုများ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl font-bold">
            {filteredRequests.filter(r => r.status === 'pending').length} Pending
          </span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Only</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-semibold">No requests found</p>
          <p className="text-gray-400 text-sm mt-2">
            {searchQuery || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'All deposit requests have been processed'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {/* User Avatar */}
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {request.requesterName.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* User Info */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{request.requesterName}</h3>
                      <p className="text-sm text-gray-600 capitalize">{request.requesterRole}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {new Date(request.requestedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {getStatusBadge(request.status)}
                </div>

                {/* Request Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Amount */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <ArrowDownCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">Deposit Amount</span>
                    </div>
                    <p className="text-2xl font-bold text-green-800">
                      {request.amount.toLocaleString()}
                      <span className="text-sm ml-1">Units</span>
                    </p>
                    <p className="text-xs text-green-600 mt-1" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                      ငွေဖြည့်မည့် ယူနစ်
                    </p>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Wallet className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-blue-700 font-medium">Payment Method</span>
                    </div>
                    <p className="text-lg font-bold text-blue-800">
                      {request.paymentMethod}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Txn: {request.transactionId}
                    </p>
                  </div>

                  {/* Payment Receipt */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="w-5 h-5 text-purple-600" />
                      <span className="text-sm text-purple-700 font-medium">Payment Receipt</span>
                    </div>
                    {request.paymentScreenshot ? (
                      <button
                        onClick={() => setSelectedReceipt(request.paymentScreenshot!)}
                        className="w-full h-20 rounded-lg overflow-hidden border-2 border-purple-300 hover:border-purple-500 transition-all relative group"
                      >
                        <img
                          src={request.paymentScreenshot}
                          alt="Payment Receipt"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      </button>
                    ) : (
                      <div className="w-full h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                        <p className="text-xs text-gray-500">No receipt</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Note */}
                {request.note && (
                  <div className="bg-gray-50 rounded-xl p-3 mb-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Note:</span> {request.note}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                {request.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(request)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Approve & Transfer</span>
                      <span className="text-sm" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                        (အတည်ပြု)
                      </span>
                    </button>
                    <button
                      onClick={() => setRejectingId(request.id)}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}

                {/* Rejection Reason */}
                {request.status === 'rejected' && request.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-900">Rejection Reason:</p>
                        <p className="text-sm text-red-700 mt-1">{request.rejectionReason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Processed Info */}
                {request.status !== 'pending' && request.processedAt && (
                  <div className="bg-gray-50 rounded-xl p-3 mt-3">
                    <p className="text-xs text-gray-600">
                      Processed on {new Date(request.processedAt).toLocaleString()}
                      {request.processedBy && ` by ${request.processedBy}`}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setRejectingId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Reject Request</h3>
                <button
                  onClick={() => setRejectingId(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <p className="text-gray-600 mb-4">
                Please provide a reason for rejecting this deposit request:
              </p>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Invalid transaction ID, Payment not received, etc."
                className="w-full border border-gray-300 rounded-xl p-3 h-32 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setRejectingId(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(rejectingId)}
                  disabled={!rejectReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-xl font-bold transition-colors"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receipt Preview Modal */}
      <AnimatePresence>
        {selectedReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedReceipt(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedReceipt(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors z-10"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <img
                src={selectedReceipt}
                alt="Payment Receipt"
                className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
