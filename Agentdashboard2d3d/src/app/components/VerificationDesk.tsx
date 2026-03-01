import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, CheckCircle, XCircle, Clock, Wallet, Calendar, User, Image as ImageIcon, AlertTriangle, ArrowDownCircle } from 'lucide-react';

interface Request {
  id: string;
  requesterId: string;
  requesterName: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  paymentScreenshot?: string;
  note?: string;
  requestedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  type: 'unit-request' | 'cashout';
}

interface VerificationDeskProps {
  requests: Request[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string, reason: string) => void;
  userRole: 'admin' | 'master';
  currentBalance: number;
}

export function VerificationDesk({ 
  requests, 
  onApprove, 
  onReject, 
  userRole,
  currentBalance 
}: VerificationDeskProps) {
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processingRequests = requests.filter(r => r.status === 'processing');
  const completedRequests = requests.filter(r => r.status === 'completed');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  const handleApprove = async (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    if (request.type === 'unit-request' && request.amount > currentBalance) {
      alert('Insufficient balance to approve this request!');
      return;
    }

    if (confirm(
      `✅ Approve ${request.type === 'unit-request' ? 'Unit Request' : 'Cash-out Request'}?\n\n` +
      `Amount: ${request.amount.toLocaleString()} Units\n` +
      `From: ${request.requesterName}\n` +
      `Payment: ${request.paymentMethod}\n` +
      `Transaction ID: ${request.transactionId}\n\n` +
      (request.type === 'unit-request' 
        ? `This will transfer ${request.amount.toLocaleString()} units to ${request.requesterName}'s account.`
        : `This will deduct ${request.amount.toLocaleString()} units from ${request.requesterName}'s account.`)
    )) {
      setProcessingId(requestId);
      onApprove(requestId);
      setTimeout(() => {
        setProcessingId(null);
        setSelectedRequest(null);
      }, 2000);
    }
  };

  const handleReject = () => {
    if (!selectedRequest || !rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    onReject(selectedRequest.id, rejectReason);
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedRequest(null);
  };

  const getStatusBadge = (status: Request['status']) => {
    const badges = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-300',
        icon: Clock,
        label: 'Pending',
        mm: 'စောင့်ဆိုင်းဆဲ'
      },
      processing: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-300',
        icon: Clock,
        label: 'Processing',
        mm: 'လုပ်ဆောင်နေသည်'
      },
      completed: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-300',
        icon: CheckCircle,
        label: 'Completed',
        mm: 'အောင်မြင်သည်'
      },
      rejected: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
        icon: XCircle,
        label: 'Rejected',
        mm: 'ပယ်ချသည်'
      }
    };
    
    const badge = badges[status];
    const Icon = badge.icon;
    
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 ${badge.bg} ${badge.text} ${badge.border} font-bold text-sm`}>
        <Icon className="w-4 h-4" />
        <span>{badge.label}</span>
        <span className="text-xs" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
          ({badge.mm})
        </span>
      </div>
    );
  };

  const RequestCard = ({ request }: { request: Request }) => {
    const isProcessing = processingId === request.id;
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`bg-white border-2 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all ${
          request.type === 'unit-request' 
            ? 'border-blue-200 hover:border-blue-400' 
            : 'border-orange-200 hover:border-orange-400'
        }`}
      >
        {/* Header */}
        <div className={`px-5 py-4 flex items-center justify-between ${
          request.type === 'unit-request' 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
            : 'bg-gradient-to-r from-orange-500 to-red-600'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-lg shadow-lg">
              {request.requesterName.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{request.requesterName}</h3>
              <p className="text-xs text-white/80">@{request.requesterId} • {request.type === 'unit-request' ? 'Unit Request' : 'Cash-out'}</p>
            </div>
          </div>
          {getStatusBadge(request.status)}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Amount */}
            <div className={`rounded-xl p-4 border-2 ${
              request.type === 'unit-request' 
                ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200' 
                : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
            }`}>
              <p className="text-xs font-semibold text-gray-600 mb-1">Amount</p>
              <p className="text-3xl font-bold text-gray-900">{request.amount.toLocaleString()}</p>
              <p className="text-sm text-gray-600 font-semibold">Units (≈ {request.amount.toLocaleString()} MMK)</p>
            </div>

            {/* Payment Screenshot Thumbnail */}
            {request.paymentScreenshot ? (
              <button
                onClick={() => {
                  setSelectedRequest(request);
                  setShowImageModal(true);
                }}
                className="rounded-xl border-2 border-purple-300 overflow-hidden relative group hover:border-purple-500 transition-all"
              >
                <img 
                  src={request.paymentScreenshot} 
                  alt="Payment proof" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-purple-600 rounded-lg px-2 py-1 flex items-center gap-1 justify-center">
                    <ImageIcon className="w-3 h-3 text-white" />
                    <span className="text-xs font-bold text-white">View Proof</span>
                  </div>
                </div>
              </button>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center p-4">
                <AlertTriangle className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-xs text-gray-500 font-semibold text-center">No proof uploaded</p>
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Wallet className="w-3 h-3" />
                Payment Method
              </p>
              <p className="text-sm font-bold text-gray-900">{request.paymentMethod}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Requested At
              </p>
              <p className="text-sm font-bold text-gray-900">
                {new Date(request.requestedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Transaction ID */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-600 font-semibold mb-1.5">Transaction ID</p>
            <p className="text-sm font-mono font-bold text-blue-900 bg-white px-3 py-2 rounded border border-blue-200">
              {request.transactionId}
            </p>
          </div>

          {/* Note */}
          {request.note && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-700 font-semibold mb-1">Note:</p>
              <p className="text-sm text-yellow-900">{request.note}</p>
            </div>
          )}

          {/* Actions - Only for pending requests */}
          {request.status === 'pending' && (
            <div className="flex gap-3 pt-3 border-t-2 border-gray-200">
              <button
                onClick={() => {
                  setSelectedRequest(request);
                  setShowRejectModal(true);
                }}
                disabled={isProcessing}
                className="flex-1 px-4 py-3.5 border-2 border-red-300 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <XCircle className="w-5 h-5" />
                <span>Reject</span>
                <span className="text-xs" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                  (ပယ်ဖျက်)
                </span>
              </button>
              
              <button
                onClick={() => handleApprove(request.id)}
                disabled={isProcessing}
                className={`flex-1 px-4 py-3.5 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                  isProcessing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : request.type === 'unit-request'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                    : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>{request.type === 'unit-request' ? 'Confirm & Release' : 'Confirm & Settle'}</span>
                    <span className="text-xs" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                      (အတည်ပြု)
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-6 h-6 text-yellow-600" />
            <span className="text-2xl font-bold text-yellow-900">{pendingRequests.length}</span>
          </div>
          <p className="text-sm font-bold text-yellow-800">Pending</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-6 h-6 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{processingRequests.length}</span>
          </div>
          <p className="text-sm font-bold text-blue-800">Processing</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{completedRequests.length}</span>
          </div>
          <p className="text-sm font-bold text-green-800">Completed</p>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-6 h-6 text-red-600" />
            <span className="text-2xl font-bold text-red-900">{rejectedRequests.length}</span>
          </div>
          <p className="text-sm font-bold text-red-800">Rejected</p>
        </div>
      </div>

      {/* Pending Requests - Priority */}
      {pendingRequests.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-yellow-500 rounded-full animate-pulse" />
            <h3 className="text-xl font-bold text-gray-900">
              Pending Requests - Needs Attention
            </h3>
            <div className="px-3 py-1 bg-yellow-100 border-2 border-yellow-400 rounded-lg">
              <span className="text-sm font-bold text-yellow-800">{pendingRequests.length} Waiting</span>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingRequests.map(request => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      )}

      {/* Processing Requests */}
      {processingRequests.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-blue-500 rounded-full" />
            <h3 className="text-xl font-bold text-gray-900">Processing</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {processingRequests.map(request => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Completed */}
      {completedRequests.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-green-500 rounded-full" />
            <h3 className="text-xl font-bold text-gray-900">Recently Completed</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {completedRequests.slice(0, 4).map(request => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {requests.length === 0 && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
          <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Requests</h3>
          <p className="text-gray-500">All requests have been processed</p>
        </div>
      )}

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && selectedRequest?.paymentScreenshot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute -top-12 right-0 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
              >
                <XCircle className="w-6 h-6 text-white" />
              </button>
              <img 
                src={selectedRequest.paymentScreenshot} 
                alt="Payment proof full size" 
                className="w-full rounded-2xl shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Request</h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejecting this request from <span className="font-bold">{selectedRequest.requesterName}</span>
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 resize-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
