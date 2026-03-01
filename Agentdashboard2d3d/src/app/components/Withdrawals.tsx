import { useState } from 'react';
import { ArrowDownLeft, Clock, Check, X, AlertCircle, Wallet, Building2, User, Filter, Search, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { WithdrawalRequest } from '../types/units';
import { ConfirmationModal } from './ConfirmationModal';

// Withdrawal Management Component with Custom Confirmation Modal

interface WithdrawalsProps {
  currentBalance: number;
  withdrawalRequests: WithdrawalRequest[];
  onRequestWithdrawal?: (request: Omit<WithdrawalRequest, 'id' | 'requestedAt' | 'status' | 'userId' | 'userName' | 'userRole' | 'toUserId' | 'toUserName'>) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  userRole: 'admin' | 'master' | 'agent';
  currentUserId?: string; // Add this to filter out own requests
}

const paymentMethods = ['KBZ Pay', 'Wave Money', 'CB Pay', 'AYA Pay', 'Mobile Banking', 'Bank Transfer'];

export function Withdrawals({
  currentBalance,
  withdrawalRequests,
  onRequestWithdrawal,
  onApprove,
  onReject,
  userRole,
  currentUserId
}: WithdrawalsProps) {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
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

  // Filter requests
  const myRequests = withdrawalRequests.filter(r => r.userRole === userRole || (userRole === 'admin' && r.userRole === 'master'));
  const requestsToApprove = withdrawalRequests.filter(r => 
    (userRole === 'master' && r.userRole === 'agent') ||
    (userRole === 'admin' && r.userRole === 'master')
  );

  const filteredRequests = (
    filter === 'all' ? withdrawalRequests :
    filter === 'pending' ? withdrawalRequests.filter(r => r.status === 'pending') :
    filter === 'approved' ? withdrawalRequests.filter(r => r.status === 'approved') :
    withdrawalRequests.filter(r => r.status === 'rejected')
  ).filter(r => 
    r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.accountNumber.includes(searchTerm) ||
    r.amount.toString().includes(searchTerm)
  );

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
    return date.toLocaleDateString('my-MM', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      errors.amount = 'ငွေပမာဏ ထည့်သွင်းပါ';
    } else if (amount > currentBalance) {
      errors.amount = 'လက်ကျန်ငွေ မလုံလောက်ပါ';
    } else if (amount < 10000) {
      errors.amount = 'အနည်းဆုံး ၁၀,၀၀၀ ယူနစ် ထုတ်ယူရပါမည်';
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

      // Reset form
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
      alert('ငြင်းပယ်ရခြင်း အကြောင်းပြချက် ရေးပါ');
      return;
    }

    onReject(rejectingId, rejectionReason);
    setRejectingId(null);
    setRejectionReason('');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with Stats */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ငွေထုတ်ယူမှု စီမံခန့်ခွဲမှု</h2>
          <p className="text-gray-600">Withdrawal Management</p>
        </div>
        {userRole !== 'admin' && onRequestWithdrawal && (
          <button
            onClick={() => setShowRequestForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
          >
            <ArrowDownLeft className="w-5 h-5" />
            ငွေထုတ်ယူမည်
          </button>
        )}
      </div>

      {/* Balance and Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <Wallet className="w-8 h-8 text-white/80" />
            <span className="text-emerald-100 text-sm">လက်ကျန်ငွေ</span>
          </div>
          <div className="text-3xl font-bold mb-1">{currentBalance.toLocaleString()}</div>
          <div className="text-emerald-100 text-sm">ယူနစ်</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-500" />
            <span className="text-gray-600 text-sm">စောင့်ဆိုင်းဆဲ</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{pendingCount}</div>
          <div className="text-gray-600 text-sm">တောင်းဆိုမှု</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Check className="w-8 h-8 text-green-500" />
            <span className="text-gray-600 text-sm">အတည်ပြုပြီး</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{approvedCount}</div>
          <div className="text-gray-600 text-sm">တောင်းဆိုမှု</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <X className="w-8 h-8 text-red-500" />
            <span className="text-gray-600 text-sm">ငြင်းပယ်ပြီး</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{rejectedCount}</div>
          <div className="text-gray-600 text-sm">တောင်းဆိုမှု</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              အားလုံး ({withdrawalRequests.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'pending' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              စောင့်ဆိုင်းဆဲ ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'approved' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              အတည်ပြုပြီး ({approvedCount})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'rejected' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ငြင်းပယ်ပြီး ({rejectedCount})
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="အမည်၊ အကောင့်နံပါတ် သို့မဟုတ် ပမာဏဖြင့် ရှာဖွေပါ..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Withdrawal Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <ArrowDownLeft className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ငွေထုတ်ယူမှု မရှိသေးပါ</h3>
            <p className="text-gray-600">ငွေထုတ်ယူမှု တောင်းဆိုချက်များ ပေါ်လာပါမည်</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      request.status === 'pending' 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                        : request.status === 'approved'
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                        : 'bg-gradient-to-br from-red-400 to-rose-500'
                    }`}>
                      {request.status === 'pending' ? (
                        <Clock className="w-6 h-6 text-white" />
                      ) : request.status === 'approved' ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <X className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-semibold text-gray-900">{request.userName}</h4>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          request.userRole === 'agent' 
                            ? 'bg-blue-100 text-blue-700'
                            : request.userRole === 'master'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {request.userRole === 'agent' ? 'Agent' : request.userRole === 'master' ? 'Master' : 'Admin'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatTime(request.requestedAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{request.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {request.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">ယူနစ်</div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-blue-900 font-medium mb-1">Account Number</div>
                      <div className="text-sm font-mono font-bold text-gray-900">{request.accountNumber}</div>
                    </div>
                    <div>
                      <div className="text-xs text-blue-900 font-medium mb-1">Account Name</div>
                      <div className="text-sm font-semibold text-gray-900">{request.accountName}</div>
                    </div>
                  </div>
                </div>

                {/* Note */}
                {request.note && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
                    <div className="text-xs text-gray-600 font-medium mb-1">မှတ်ချက်:</div>
                    <div className="text-sm text-gray-900">{request.note}</div>
                  </div>
                )}

                {/* Rejection Reason */}
                {request.status === 'rejected' && request.rejectionReason && (
                  <div className="bg-red-50 rounded-xl p-4 mb-4 border border-red-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-red-900 font-medium mb-1">ငြင်းပယ်ရခြင်း အကြောင်းပြချက်:</div>
                        <div className="text-sm text-red-700">{request.rejectionReason}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions for pending requests that are NOT yours */}
                {request.status === 'pending' && 
                 onApprove && 
                 onReject && 
                 currentUserId && 
                 request.userId !== currentUserId && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setRejectingId(request.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-5 h-5" />
                      ငြင်းပယ်မည်
                    </button>
                    <button
                      onClick={() => handleApprove(request)}
                      disabled={request.amount > currentBalance}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-5 h-5" />
                      အတည်ပြုပြီး ငွေလွဲမည်
                    </button>
                  </div>
                )}

                {/* Status badge for processed requests */}
                {request.status !== 'pending' && (
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium ${
                    request.status === 'approved'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {request.status === 'approved' ? (
                      <>
                        <Check className="w-4 h-4" />
                        အတည်ပြုပြီး ငွေလွဲပြီးပါပြီ
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        ငြင်းပယ်ပြီးပါပြီ
                      </>
                    )}
                    {request.processedAt && (
                      <span className="text-xs opacity-75">• {formatTime(request.processedAt)}</span>
                    )}
                  </div>
                )}
              </div>
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRequestForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-xl w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">ငွေထုတ်ယူမည်</h3>
                  <p className="text-gray-600 text-sm mt-1">Request Withdrawal</p>
                </div>
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Available Balance */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-green-900 font-medium mb-1">လက်ကျန်ယူနစ်</div>
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
                    <p className="text-red-600 text-sm mt-1">{formErrors.amount}</p>
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
                    placeholder="09xxxxxxxxx သို့မဟုတ် ဘဏ်အကောင့်"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      formErrors.accountNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.accountNumber && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.accountNumber}</p>
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
                    placeholder="သင့်အမည် (အကောင့်နဲ့တူညီရမည်)"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      formErrors.accountName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.accountName && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.accountName}</p>
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
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">သတိပြုရန်:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>အကောင့်အမည်နှင့် အကောင့်နံပါတ် မှန်ကန်ကြောင်း သေချာပါစေ</li>
                        <li>ငွေလွှဲပြီး ၂နာရီမှ ၂၄နာရီအတွင်း လုပ်ဆောင်ပေးပါမည်</li>
                        <li>အတည်ပြုပြီးပါက ပယ်ဖျက်၍မရနိုင်ပါ</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowRequestForm(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    မလုပ်တော့
                  </button>
                  <button
                    onClick={handleSubmitRequest}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
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
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">ငွေထုတ်ယူမှု ငြင်းပယ်မည်</h3>
                <p className="text-gray-600 text-sm">အကြောင်းပြချက် ရေးပေးပါ</p>
              </div>

              <div className="space-y-4">
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="ဥပမာ - လက်ကျန်ငွေ မလုံလောက်ပါ / အကောင့်အချက်အလက် မမှန်ကန်ပါ"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  autoFocus
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => setRejectingId(null)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    မလုပ်တော့
                  </button>
                  <button
                    onClick={handleReject}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-medium hover:from-red-700 hover:to-rose-700 transition-all"
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
        messageMyanmar="ဤထုတ်ယူမှုကို အတည်ပြုမှာ သေချာပါသလား?"
        confirmText="အတည်ပြုမည်"
        cancelText="မလုပ်တော့"
        type="warning"
        details={confirmingRequest ? [
          { label: 'ငွေပမာဏ', value: `${confirmingRequest.amount.toLocaleString()} Units` },
          { label: 'ငွေလွှဲရမည့်အကောင့်', value: confirmingRequest.paymentMethod },
          { label: 'အကောင့်နံပါတ်', value: confirmingRequest.accountNumber },
          { label: 'အကောင့်အမည်', value: confirmingRequest.accountName }
        ] : []}
      />
    </div>
  );
}