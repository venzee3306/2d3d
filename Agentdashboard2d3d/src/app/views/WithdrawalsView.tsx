import { useState } from 'react';
import { ArrowDownLeft, ArrowUpCircle, Shield, CheckCircle, XCircle, Clock, Eye, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Withdrawals } from '../components/Withdrawals';
import { motion, AnimatePresence } from 'motion/react';
import type { WithdrawalRequest, UnitDepositRequest } from '../types/units';

interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'master' | 'agent';
  parentId?: string;
}

interface WithdrawalsViewProps {
  currentUser: User;
  currentBalance: number;
  withdrawalRequests: WithdrawalRequest[];
  unitDepositRequests: UnitDepositRequest[];
  onRequestWithdrawal?: (request: Omit<WithdrawalRequest, 'id' | 'requestedAt' | 'status' | 'userId' | 'userName' | 'userRole' | 'toUserId' | 'toUserName'>) => void;
  onApproveWithdrawal?: (id: string) => void;
  onRejectWithdrawal?: (id: string, reason: string) => void;
  onRequestDeposit?: (request: Omit<UnitDepositRequest, 'id' | 'requestedAt' | 'status' | 'requesterId' | 'requesterName' | 'requesterRole' | 'approverId' | 'approverName'>) => void;
  onApproveDeposit?: (id: string) => void;
  onRejectDeposit?: (id: string, reason: string) => void;
}

export function WithdrawalsView({
  currentUser,
  currentBalance,
  withdrawalRequests,
  unitDepositRequests,
  onRequestWithdrawal,
  onApproveWithdrawal,
  onRejectWithdrawal,
  onRequestDeposit,
  onApproveDeposit,
  onRejectDeposit
}: WithdrawalsViewProps) {
  const [viewingRequest, setViewingRequest] = useState<UnitDepositRequest | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<UnitDepositRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Filter Master unit deposit requests for Admin
  const pendingMasterRequests = currentUser.role === 'admin' 
    ? unitDepositRequests.filter(r => r.status === 'pending' && r.requesterRole === 'master' && r.approverId === currentUser.id)
    : [];

  const handleApprove = (requestId: string) => {
    if (onApproveDeposit) {
      onApproveDeposit(requestId);
      setViewingRequest(null);
    }
  };

  const handleReject = () => {
    if (rejectingRequest && onRejectDeposit && rejectionReason.trim()) {
      onRejectDeposit(rejectingRequest.id, rejectionReason);
      setRejectingRequest(null);
      setRejectionReason('');
      setViewingRequest(null);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2">
            <ArrowDownLeft className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Withdrawals</h1>
          </div>
          <span className="text-gray-600" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
            ငွေထုတ်ယူမှု
          </span>
        </div>

        {/* Master Unit Deposit Requests (Admin Only) */}
        {currentUser.role === 'admin' && pendingMasterRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-orange-200"
          >
            {/* Section Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <ArrowUpCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Master Unit Purchase Requests</h2>
                    <p className="text-orange-100 text-sm mt-1" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                      Master များမှ ယူနစ်ဝယ်ယူရန် တောင်းဆိုမှုများ
                    </p>
                  </div>
                </div>
                <div className="px-5 py-3 bg-white rounded-xl">
                  <p className="text-3xl font-bold text-orange-600">{pendingMasterRequests.length}</p>
                  <p className="text-xs text-gray-600 text-center">Pending</p>
                </div>
              </div>
            </div>

            {/* Requests List */}
            <div className="p-6 space-y-4">
              {pendingMasterRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border-2 border-orange-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Shield className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-gray-900">{request.requesterName}</p>
                        <p className="text-sm text-purple-600 font-semibold">Master Account</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Payment Method:</span> {request.paymentMethod}
                          </p>
                          {request.transactionId && (
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold">Transaction ID:</span> {request.transactionId}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            <Clock className="w-3 h-3 inline mr-1" />
                            Requested: {new Date(request.requestedAt).toLocaleString()}
                          </p>
                          {request.note && (
                            <p className="text-sm text-gray-600 italic mt-2">
                              <span className="font-semibold">Note:</span> {request.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-3xl font-bold text-orange-600">
                        {request.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Units (MMK)</p>
                      <div className="mt-3 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pending Review
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-4 border-t-2 border-orange-200">
                    <button
                      onClick={() => setViewingRequest(request)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectingRequest(request)}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Withdrawals Content */}
        <Withdrawals
          currentBalance={currentBalance}
          withdrawalRequests={withdrawalRequests}
          onRequestWithdrawal={onRequestWithdrawal}
          onApprove={onApproveWithdrawal}
          onReject={onRejectWithdrawal}
          userRole={currentUser.role}
        />
      </div>

      {/* View Details Modal */}
      <AnimatePresence>
        {viewingRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setViewingRequest(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Request Details</h3>
                  <p className="text-orange-100 text-sm" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    တောင်းဆိုမှု အသေးစိတ်
                  </p>
                </div>
                <button
                  onClick={() => setViewingRequest(null)}
                  className="text-white hover:bg-orange-700 p-2 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Requester Info */}
                <div className="bg-purple-50 rounded-xl p-5 border-2 border-purple-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{viewingRequest.requesterName}</p>
                      <p className="text-sm text-purple-600 font-semibold">Master Account</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Requested Amount</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {viewingRequest.amount.toLocaleString()} <span className="text-sm">MMK</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Request Time</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(viewingRequest.requestedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    Payment Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-semibold text-gray-900">{viewingRequest.paymentMethod}</span>
                    </div>
                    {viewingRequest.transactionId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="font-semibold text-gray-900">{viewingRequest.transactionId}</span>
                      </div>
                    )}
                    {viewingRequest.note && (
                      <div className="pt-2 border-t border-blue-200">
                        <p className="text-xs text-gray-500 mb-1">Additional Note:</p>
                        <p className="text-sm text-gray-700 italic">{viewingRequest.note}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Screenshot */}
                {viewingRequest.paymentScreenshot && (
                  <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-gray-600" />
                      Payment Proof
                    </h4>
                    <img 
                      src={viewingRequest.paymentScreenshot} 
                      alt="Payment Screenshot" 
                      className="w-full rounded-lg border-2 border-gray-300"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                  <button
                    onClick={() => handleApprove(viewingRequest.id)}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve Request
                  </button>
                  <button
                    onClick={() => {
                      setRejectingRequest(viewingRequest);
                      setViewingRequest(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject Request
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectingRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setRejectingRequest(null);
              setRejectionReason('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            >
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5">
                <h3 className="text-2xl font-bold text-white">Reject Request</h3>
                <p className="text-red-100 text-sm" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                  တောင်းဆိုမှုကို ပယ်ချရန်
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold">Master:</span> {rejectingRequest.requesterName}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-bold">Amount:</span> {rejectingRequest.amount.toLocaleString()} MMK
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setRejectingRequest(null);
                      setRejectionReason('');
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!rejectionReason.trim()}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
