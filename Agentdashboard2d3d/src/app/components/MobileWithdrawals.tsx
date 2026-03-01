import { useState } from 'react';
import { ArrowLeft, ArrowDownLeft, Clock, Check, X, AlertCircle, Wallet, Building2, User, Filter, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { WithdrawalRequest } from '../types/units';
import { ConfirmationModal } from './ConfirmationModal';

interface MobileWithdrawalsProps {
  onBack: () => void;
  currentBalance: number;
  withdrawalRequests: WithdrawalRequest[];
  onRequestWithdrawal?: (request: Omit<WithdrawalRequest, 'id' | 'requestedAt' | 'status' | 'userId' | 'userName' | 'userRole' | 'toUserId' | 'toUserName'>) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  userRole: 'admin' | 'master' | 'agent';
  currentUserId?: string; // Add this to filter out own requests
}

const paymentMethods = ['KBZ Pay', 'Wave Money', 'CB Pay', 'AYA Pay', 'Mobile Banking', 'Bank Transfer'];

export function MobileWithdrawals({
  onBack,
  currentBalance,
  withdrawalRequests,
  onRequestWithdrawal,
  onApprove,
  onReject,
  userRole,
  currentUserId
}: MobileWithdrawalsProps) {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [confirmingRequest, setConfirmingRequest] = useState<WithdrawalRequest | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'KBZ Pay',
    accountNumber: '',
    accountName: '',
    note: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredRequests = 
    filter === 'all' ? withdrawalRequests :
    filter === 'pending' ? withdrawalRequests.filter(r => r.status === 'pending') :
    filter === 'approved' ? withdrawalRequests.filter(r => r.status === 'approved') :
    withdrawalRequests.filter(r => r.status === 'rejected');

  const pendingCount = withdrawalRequests.filter(r => r.status === 'pending').length;
  const approvedCount = withdrawalRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = withdrawalRequests.filter(r => r.status === 'rejected').length;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'အခုလေး';
    if (diffMins < 60) return `${diffMins}မိနစ်က`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}နာရီက`;
    return date.toLocaleDateString('my-MM', { month: 'short', day: 'numeric' });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      errors.amount = 'ငွေပမာဏ ထည့်သွင်းပါ';
    } else if (amount > currentBalance) {
      errors.amount = 'လက်ကျန်ငွေ မလုံလောက်ပါ';
    } else if (amount < 10000) {
      errors.amount = 'အနည်းဆုံး ၁၀,၀၀၀ ယူနစ်';
    }

    if (!formData.accountNumber.trim()) {
      errors.accountNumber = 'အကောင့်နံပါတ် ထည့်သွင်းပါ';
    }

    if (!formData.accountName.trim()) {
      errors.accountName = 'အကောင့်အမည် ထည့်သွင်းပါ';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitRequest = () => {
    if (!validateForm()) return;

    if (onRequestWithdrawal) {
      onRequestWithdrawal({
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        accountNumber: formData.accountNumber,
        accountName: formData.accountName,
        note: formData.note
      });

      setFormData({
        amount: '',
        paymentMethod: 'KBZ Pay',
        accountNumber: '',
        accountName: '',
        note: ''
      });
      setFormErrors({});
      setShowRequestForm(false);
    }
  };

  const handleApprove = (request: WithdrawalRequest) => {
    if (!onApprove) return;
    
    if (request.amount > currentBalance) {
      alert('ယူနစ်လက်ကျန် မလုံလောက်ပါ');
      return;
    }
    
    setConfirmingRequest(request);
  };

  const handleConfirmApproval = () => {
    if (confirmingRequest && onApprove) {
      onApprove(confirmingRequest.id);
      setConfirmingRequest(null);
    }
  };

  const handleReject = () => {
    if (!rejectingId || !onReject) return;
    
    if (!rejectionReason.trim()) {
      alert('အကြောင်းပြချက် ရေးပါ');
      return;
    }

    onReject(rejectingId, rejectionReason);
    setRejectingId(null);
    setRejectionReason('');
  };

  return (
    <div className="w-full max-w-[375px] h-[812px] bg-[#F5F7FA] flex flex-col mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-[#1A2742] px-4 py-4 shadow-lg flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-lg font-bold leading-tight mb-1">ငွေထုတ်ယူမှု စီမံခန့်ခွဲမှု</h1>
            <p className="text-blue-300 text-xs">Withdrawal Management</p>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 shadow-lg mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs mb-1">သင့်လက်ကျန်ယူနစ်</p>
              <p className="text-white text-2xl font-bold">{currentBalance.toLocaleString()}</p>
            </div>
            <Wallet className="w-10 h-10 text-white/30" />
          </div>
        </div>

        {/* Request Button */}
        {userRole !== 'admin' && onRequestWithdrawal && (
          <button
            onClick={() => setShowRequestForm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium shadow-lg"
          >
            <ArrowDownLeft className="w-5 h-5" />
            ငွေထုတ်ယူမည်
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-xs text-gray-600">စောင့်ဆိုင်းဆဲ</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{approvedCount}</div>
            <div className="text-xs text-gray-600">အတည်ပြုပြီး</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-600">{rejectedCount}</div>
            <div className="text-xs text-gray-600">ငြင်းပယ်ပြီး</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            အားလုံး ({withdrawalRequests.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === 'pending' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            စောင့်ဆိုင်းဆဲ ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === 'approved' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            အတည်ပြုပြီး ({approvedCount})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === 'rejected' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ငြင်းပယ်ပြီး ({rejectedCount})
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 hide-scrollbar">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
            <ArrowDownLeft className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">ငွေထုတ်ယူမှု မရှိသေးပါ</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      request.status === 'pending' 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                        : request.status === 'approved'
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                        : 'bg-gradient-to-br from-red-400 to-rose-500'
                    }`}>
                      {request.status === 'pending' ? (
                        <Clock className="w-5 h-5 text-white" />
                      ) : request.status === 'approved' ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <X className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">{request.userName}</h4>
                      <p className="text-xs text-gray-500 mb-1.5">{formatTime(request.requestedAt)}</p>
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] rounded-full border border-blue-200">
                        <Building2 className="w-3 h-3" />
                        {request.paymentMethod}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">
                      {request.amount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">ယူနစ်</div>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="px-4 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100">
                <div className="space-y-2">
                  <div>
                    <div className="text-xs font-medium text-blue-900 mb-0.5">Account Number</div>
                    <div className="text-sm font-mono font-bold text-gray-900">{request.accountNumber}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-blue-900 mb-0.5">Account Name</div>
                    <div className="text-sm font-semibold text-gray-900">{request.accountName}</div>
                  </div>
                </div>
              </div>

              {/* Note */}
              {request.note && (
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs text-gray-600 leading-relaxed">{request.note}</p>
                </div>
              )}

              {/* Rejection Reason */}
              {request.status === 'rejected' && request.rejectionReason && (
                <div className="px-4 py-3 bg-red-50 border-b border-red-100">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-red-900 font-medium mb-1">ငြင်းပယ်ရခြင်း:</div>
                      <div className="text-xs text-red-700">{request.rejectionReason}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions - Only for pending requests that are NOT yours */}
              {request.status === 'pending' && 
               onApprove && 
               onReject && 
               currentUserId && 
               request.userId !== currentUserId && (
                <div className="p-4">
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => setRejectingId(request.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      ငြင်းပယ်မည်
                    </button>
                    <button
                      onClick={() => handleApprove(request)}
                      disabled={request.amount > currentBalance}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4" />
                      အတည်ပြုမည်
                    </button>
                  </div>

                  {request.amount > currentBalance && (
                    <div className="mt-3 flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700 leading-relaxed">ယူနစ်လက်ကျန် မလုံလောက်ပါ</p>
                    </div>
                  )}
                </div>
              )}

              {/* Status Badge - For approved/rejected */}
              {request.status !== 'pending' && (
                <div className="px-4 py-3">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                    request.status === 'approved'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {request.status === 'approved' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        အတည်ပြုပြီး ငွေလွှဲပြီးပါပြီ
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" />
                        ငြင်းပယ်ပြီးပါပြီ
                      </>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Request Withdrawal Modal */}
      <AnimatePresence>
        {showRequestForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
            onClick={() => setShowRequestForm(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl w-full max-w-[375px] max-h-[90vh] overflow-y-auto shadow-2xl hide-scrollbar"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">ငွေထုတ်ယူမည်</h3>
                    <p className="text-xs text-gray-600">Request Withdrawal</p>
                  </div>
                  <button
                    onClick={() => setShowRequestForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Available Balance */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-green-900 font-medium mb-1">လက်ကျန်ယူနစ်</div>
                      <div className="text-2xl font-bold text-green-700">{currentBalance.toLocaleString()}</div>
                    </div>
                    <Wallet className="w-10 h-10 text-green-600/30" />
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ထုတ်ယူမည့် ပမာဏ *
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="ဥပမာ - 100000"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      formErrors.amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.amount && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.amount}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">အနည်းဆုံး: 10,000 ယူနစ်</p>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ငွေလက်ခံမည့် နည်းလမ်း *
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    အကောင့်နံပါတ် *
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="09xxxxxxxxx"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      formErrors.accountNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.accountNumber && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.accountNumber}</p>
                  )}
                </div>

                {/* Account Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    အကောင့်အမည် *
                  </label>
                  <input
                    type="text"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    placeholder="သင့်အမည်"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      formErrors.accountName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.accountName && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.accountName}</p>
                  )}
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    မှတ်ချက် (Optional)
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="အပို့အဆောင်အချက်အလက်များ..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Warning */}
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-800">
                      <p className="font-medium mb-1">သတိပြုရန်:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>အကောင့်အချက်အလက် မှန်ကန်ကြောင်း သေချာပါစေ</li>
                        <li>၂-၂၄နာရီအတွင်း လုပ်ဆောင်ပေးမည်</li>
                        <li>အတည်ပြုပြီးပါက ပယ်ဖျက်၍မရပါ</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pb-4">
                  <button
                    onClick={() => setShowRequestForm(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium"
                  >
                    မလုပ်တော့
                  </button>
                  <button
                    onClick={handleSubmitRequest}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium"
                  >
                    တောင်းဆိုမည်
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setRejectingId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <X className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">ငွေထုတ်ယူမှု ငြင်းပယ်မည်</h3>
                <p className="text-xs text-gray-600">အကြောင်းပြချက် ရေးပေးပါ</p>
              </div>

              <div className="space-y-3">
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="အကြောင်းပြချက်..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  autoFocus
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => setRejectingId(null)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm"
                  >
                    မလုပ်တော့
                  </button>
                  <button
                    onClick={handleReject}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-medium text-sm"
                  >
                    ငြင်းပယ်မည်
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmingRequest !== null}
        onClose={() => setConfirmingRequest(null)}
        onConfirm={handleConfirmApproval}
        title="အတည်ပြုခြင်း"
        message={`${confirmingRequest?.userName} ၏ ${confirmingRequest?.amount.toLocaleString()} ယူနစ် ထုတ်ယူမှု`}
        messageMyanmar="ဤငွေထုတ်ယူမှုကို အတည်ပြုမှာ သေချာပါသလား?"
        confirmText="အတည်ပြုမည်"
        cancelText="မလုပ်တော့"
        type="warning"
        details={confirmingRequest ? [
          { label: 'ငွေပမာဏ', value: `${confirmingRequest.amount.toLocaleString()} Units` },
          { label: 'ငွေပေးချေမှု', value: confirmingRequest.paymentMethod },
          { label: 'အကောင့်နံပါတ်', value: confirmingRequest.accountNumber },
          { label: 'အကောင့်အမည်', value: confirmingRequest.accountName }
        ] : []}
      />
    </div>
  );
}