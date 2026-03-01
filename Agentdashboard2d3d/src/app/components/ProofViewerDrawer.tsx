import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle, 
  XCircle, 
  ZoomIn, 
  ZoomOut,
  Download,
  Calendar,
  Wallet,
  User,
  Phone,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import type { UnitDepositRequest, WithdrawalRequest } from '../types/units';

interface ProofViewerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  request: UnitDepositRequest | WithdrawalRequest;
  type: 'deposit' | 'withdrawal';
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export function ProofViewerDrawer({
  isOpen,
  onClose,
  request,
  type,
  onApprove,
  onReject
}: ProofViewerDrawerProps) {
  const [zoom, setZoom] = useState(100);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const isDeposit = type === 'deposit';
  const depositRequest = isDeposit ? request as UnitDepositRequest : null;
  const withdrawalRequest = !isDeposit ? request as WithdrawalRequest : null;

  const colorScheme = isDeposit ? {
    gradient: 'from-emerald-600 to-green-600',
    lightBg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    button: 'from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700'
  } : {
    gradient: 'from-amber-600 to-orange-600',
    lightBg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    button: 'from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'
  };

  const handleApprove = () => {
    if (window.confirm(
      `${isDeposit ? 'Approve deposit' : 'Mark as paid'} and ${isDeposit ? 'release units' : 'complete withdrawal'}?\n\n` +
      `Amount: ${request.amount.toLocaleString()} Units\n` +
      `${isDeposit ? 'Agent' : 'To'}: ${isDeposit ? depositRequest?.requesterName : withdrawalRequest?.userName}\n\n` +
      `This action cannot be undone.`
    )) {
      onApprove();
      onClose();
    }
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(rejectReason.trim());
      setShowRejectModal(false);
      setRejectReason('');
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="bg-white w-full h-full md:h-[90vh] md:max-w-7xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${colorScheme.gradient} px-6 py-5 flex items-center justify-between flex-shrink-0`}>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isDeposit ? 'Deposit Request Review' : 'Withdrawal Settlement'}
              </h2>
              <p className="text-white/80 text-sm mt-1">
                {isDeposit ? 'Review payment proof and approve' : 'Verify details and mark as paid'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Split Screen Content */}
          <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {/* Left Side - Request Data */}
            <div className="overflow-y-auto p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Request Details</h3>
                
                {/* Amount Card */}
                <div className={`${colorScheme.lightBg} ${colorScheme.border} border-2 rounded-2xl p-6 mb-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className={`w-5 h-5 ${colorScheme.text}`} />
                    <span className={`text-sm font-medium ${colorScheme.text}`}>
                      {isDeposit ? 'Top-up Amount' : 'Cash-out Amount'}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-bold text-gray-900">
                      {request.amount.toLocaleString()}
                    </p>
                    <p className="text-2xl font-semibold text-gray-600">Units</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    ≈ {request.amount.toLocaleString()} MMK
                  </p>
                </div>

                {/* Request Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <p className="text-xs text-gray-600 font-semibold">
                        {isDeposit ? 'Agent Name' : 'Requested By'}
                      </p>
                    </div>
                    <p className="text-base font-bold text-gray-900">
                      {isDeposit ? depositRequest?.requesterName : withdrawalRequest?.userName}
                    </p>
                  </div>

                  {isDeposit && depositRequest && (
                    <>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Wallet className="w-4 h-4 text-gray-500" />
                          <p className="text-xs text-gray-600 font-semibold">Payment Method</p>
                        </div>
                        <p className="text-base font-bold text-gray-900">
                          {depositRequest.paymentMethod}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <p className="text-xs text-gray-600 font-semibold">Transaction ID</p>
                        </div>
                        <p className="text-base font-bold text-gray-900 font-mono break-all">
                          {depositRequest.transactionId}
                        </p>
                      </div>
                    </>
                  )}

                  {!isDeposit && withdrawalRequest && (
                    <>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Wallet className="w-4 h-4 text-gray-500" />
                          <p className="text-xs text-gray-600 font-semibold">Payment Method</p>
                        </div>
                        <p className="text-base font-bold text-gray-900">
                          {withdrawalRequest.paymentMethod}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <p className="text-xs text-gray-600 font-semibold">Account Number</p>
                        </div>
                        <p className="text-base font-bold text-gray-900 font-mono">
                          {withdrawalRequest.accountNumber}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <p className="text-xs text-gray-600 font-semibold">Account Holder</p>
                        </div>
                        <p className="text-base font-bold text-gray-900">
                          {withdrawalRequest.accountName}
                        </p>
                      </div>
                    </>
                  )}

                  <div className="bg-gray-50 rounded-xl p-4 col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-xs text-gray-600 font-semibold">Requested At</p>
                    </div>
                    <p className="text-base font-bold text-gray-900">
                      {formatDate(request.requestedAt)}
                    </p>
                  </div>
                </div>

                {/* Note */}
                {request.note && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-4">
                    <p className="text-xs text-blue-700 font-semibold mb-2">Additional Note:</p>
                    <p className="text-sm text-blue-900">{request.note}</p>
                  </div>
                )}

                {/* Info Box */}
                <div className={`${colorScheme.lightBg} ${colorScheme.border} border-2 rounded-xl p-4 flex items-start gap-3`}>
                  <AlertCircle className={`w-5 h-5 ${colorScheme.text} flex-shrink-0 mt-0.5`} />
                  <div>
                    <p className={`text-sm font-semibold ${colorScheme.text} mb-1`}>
                      {isDeposit ? 'Verification Required' : 'Payment Confirmation'}
                    </p>
                    <p className="text-xs text-gray-700">
                      {isDeposit
                        ? 'Please verify the payment receipt on the right. Check that the transaction ID and amount match before approving.'
                        : 'After marking as paid, make sure you have sent the payment to the agent\'s account. This action will deduct units from the agent\'s balance.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Proof/Receipt Viewer */}
            <div className="overflow-y-auto p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {isDeposit ? 'Payment Receipt' : 'Account Information'}
                </h3>
                {isDeposit && depositRequest?.paymentScreenshot && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setZoom(Math.max(50, zoom - 10))}
                      className="p-2 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-sm"
                    >
                      <ZoomOut className="w-4 h-4 text-gray-700" />
                    </button>
                    <span className="text-sm font-bold text-gray-700 min-w-[60px] text-center">
                      {zoom}%
                    </span>
                    <button
                      onClick={() => setZoom(Math.min(200, zoom + 10))}
                      className="p-2 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-sm"
                    >
                      <ZoomIn className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                )}
              </div>

              {isDeposit && depositRequest?.paymentScreenshot ? (
                <div className="bg-white rounded-2xl shadow-lg p-4 overflow-auto">
                  <img
                    src={depositRequest.paymentScreenshot}
                    alt="Payment Receipt"
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
                    className="max-w-none rounded-xl border-2 border-gray-200 transition-transform"
                  />
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  {!isDeposit && withdrawalRequest ? (
                    <div className="space-y-4">
                      <div className="text-center mb-6">
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Wallet className="w-10 h-10 text-amber-600" />
                        </div>
                        <p className="text-gray-700 font-semibold">Send payment to:</p>
                      </div>

                      <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 space-y-4">
                        <div>
                          <p className="text-sm text-amber-700 mb-1">Account Number / Phone</p>
                          <p className="text-2xl font-bold text-amber-900 font-mono">
                            {withdrawalRequest.accountNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-amber-700 mb-1">Account Holder Name</p>
                          <p className="text-xl font-bold text-amber-900">
                            {withdrawalRequest.accountName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-amber-700 mb-1">Payment Method</p>
                          <p className="text-xl font-bold text-amber-900">
                            {withdrawalRequest.paymentMethod}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-amber-700 mb-1">Amount to Send</p>
                          <p className="text-3xl font-bold text-amber-900">
                            {withdrawalRequest.amount.toLocaleString()} MMK
                          </p>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800">
                          Only mark as paid after you have successfully sent the payment to the agent's account.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-semibold">No receipt available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {request.status === 'pending' && (
            <div className="flex-shrink-0 border-t border-gray-200 p-6 bg-white">
              <div className="flex gap-4">
                <button
                  onClick={handleApprove}
                  className={`flex-1 px-6 py-4 bg-gradient-to-r ${colorScheme.button} text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2`}
                >
                  <CheckCircle className="w-6 h-6" />
                  {isDeposit ? 'Approve & Release Units' : 'Mark as Paid'}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-6 py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-6 h-6" />
                  Reject
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white">Reject Request</h3>
                <p className="text-red-100 text-sm">Provide a reason</p>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-gray-700">
                  Please explain why you are rejecting this {isDeposit ? 'deposit' : 'withdrawal'} request:
                </p>

                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g., Invalid transaction ID, Payment not received..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 h-32 resize-none"
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 hover:bg-gray-50 rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!rejectReason.trim()}
                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-xl font-bold transition-colors"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
