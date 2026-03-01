import { useState } from 'react';
import { ArrowLeft, Clock, Check, X, AlertCircle, Wallet, CreditCard, Copy, CheckCircle2, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { ConfirmationModal } from './ConfirmationModal';

interface DepositRequest {
  id: string;
  playerId: string;
  playerName: string;
  amount: number;
  transactionId: string;
  paymentMethod?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  note?: string;
}

interface MobileDepositsProps {
  onBack: () => void;
  currentBalance: number;
  depositRequests: DepositRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function MobileDeposits({
  onBack,
  currentBalance,
  depositRequests,
  onApprove,
  onReject
}: MobileDepositsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [confirmingRequest, setConfirmingRequest] = useState<DepositRequest | null>(null);

  const pendingRequests = depositRequests.filter(r => r.status === 'pending');
  const approvedRequests = depositRequests.filter(r => r.status === 'approved');
  const rejectedRequests = depositRequests.filter(r => r.status === 'rejected');

  const filteredRequests = 
    filter === 'all' ? depositRequests :
    filter === 'pending' ? pendingRequests :
    filter === 'approved' ? approvedRequests :
    rejectedRequests;

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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApprove = (request: DepositRequest) => {
    if (request.amount > currentBalance) {
      alert('ယူနစ်လက်ကျန် မလုံလောက်ပါ');
      return;
    }
    setConfirmingRequest(request);
  };

  const handleConfirmApproval = () => {
    if (confirmingRequest) {
      onApprove(confirmingRequest.id);
      setConfirmingRequest(null);
    }
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
            <h1 className="text-white text-lg font-bold leading-tight mb-1">ငွေသွင်းတောင်းဆိုမှုများ</h1>
            <p className="text-blue-300 text-xs">Deposit Requests</p>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs mb-1">သင့်လက်ကျန်ယူနစ်</p>
              <p className="text-white text-2xl font-bold">{currentBalance.toLocaleString()}</p>
            </div>
            <Wallet className="w-10 h-10 text-white/30" />
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
            အားလုံး ({depositRequests.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === 'pending' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            စောင့်ဆိုင်းဆဲ ({pendingRequests.length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === 'approved' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            အတည်ပြုပြီး ({approvedRequests.length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === 'rejected' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ငြင်းပယ်ပြီး ({rejectedRequests.length})
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 hide-scrollbar">
        {filteredRequests.length > 0 ? (
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
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">{request.playerName}</h4>
                      <p className="text-xs text-gray-500 mb-1.5">{formatTime(request.requestedAt)}</p>
                      {request.paymentMethod && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] rounded-full border border-blue-200">
                          <CreditCard className="w-3 h-3" />
                          {request.paymentMethod}
                        </div>
                      )}
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

              {/* Transaction ID */}
              <div className="px-4 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-blue-900">Transaction ID</span>
                  <button
                    onClick={() => copyToClipboard(request.transactionId, request.id)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {copiedId === request.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        ကူးယူပြီး
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        ကူးယူမည်
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm font-mono font-bold text-gray-900 break-all">{request.transactionId}</p>
              </div>

              {/* Note */}
              {request.note && (
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs text-gray-600 leading-relaxed">{request.note}</p>
                </div>
              )}

              {/* Actions - Only for pending */}
              {request.status === 'pending' && (
                <div className="p-4">
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => onReject(request.id)}
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
                        အတည်ပြုပြီး
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" />
                        ငြင်းပယ်ပြီး
                      </>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-200 mt-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {filter === 'pending' && 'စောင့်ဆိုင်းဆဲ တောင်းဆိုမှု မရှိပါ'}
              {filter === 'approved' && 'အတည်ပြုပြီး တောင်းဆိုမှု မရှိပါ'}
              {filter === 'rejected' && 'ငြင်းပယ်ပြီး တောင်းဆိုမှု မရှိပါ'}
              {filter === 'all' && 'တောင်းဆိုမှု မရှိပါ'}
            </h3>
            <p className="text-xs text-gray-500">
              ကစားသမားများ၏ ငွေသွင်းတောင်းဆိုမှုများ ဤနေရာတွင် ပေါ်လာပါမည်
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmingRequest !== null}
        onClose={() => setConfirmingRequest(null)}
        onConfirm={handleConfirmApproval}
        title="အတည်ပြုခြင်း"
        message={`${confirmingRequest?.playerName} ၏ ${confirmingRequest?.amount.toLocaleString()} ယူနစ် တောင်းဆိုမှု`}
        messageMyanmar="ဤငွေသွင်းတောင်းဆိုမှုကို အတည်ပြုမှာ သေချာပါသလား?"
        confirmText="အတည်ပြုမည်"
        cancelText="မလုပ်တော့"
        type="success"
        details={confirmingRequest ? [
          { label: 'ငွေပမာဏ', value: `${confirmingRequest.amount.toLocaleString()} Units` },
          { label: 'Transaction ID', value: confirmingRequest.transactionId },
          ...(confirmingRequest.paymentMethod ? [{ label: 'ငွေပေးချေမှု', value: confirmingRequest.paymentMethod }] : [])
        ] : []}
      />
    </div>
  );
}
