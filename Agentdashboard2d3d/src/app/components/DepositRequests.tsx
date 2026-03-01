import { useState } from 'react';
import { Clock, Check, X, AlertCircle, Wallet, CreditCard, Copy, CheckCircle2 } from 'lucide-react';

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

interface DepositRequestsProps {
  requests: DepositRequest[];
  currentBalance: number;
  onApprove: (requestId: string, amount: number) => void;
  onReject: (requestId: string) => void;
}

export function DepositRequests({
  requests,
  currentBalance,
  onApprove,
  onReject
}: DepositRequestsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'အခုလေးတင်';
    if (diffMins < 60) return `${diffMins} မိနစ်က`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} နာရီက`;
    return date.toLocaleDateString('my-MM', { month: 'short', day: 'numeric' });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'အတည်ပြုပြီး';
      case 'rejected': return 'ငြင်းပယ်ပြီး';
      default: return 'စောင့်ဆိုင်းဆဲ';
    }
  };

  const handleApprove = (request: DepositRequest) => {
    if (request.amount > currentBalance) {
      alert('ယူနစ်လက်ကျန် မလုံလောက်ပါ');
      return;
    }
    onApprove(request.id, request.amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ငွေသွင်းတောင်းဆိုမှုများ</h2>
          <p className="text-sm text-gray-600 mt-1">
            စောင့်ဆိုင်းဆဲ {pendingRequests.length} ခု
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl px-4 py-2 border border-purple-100">
          <div className="text-xs text-gray-600">လက်ရှိယူနစ်</div>
          <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
            {currentBalance.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            စောင့်ဆိုင်းဆဲ တောင်းဆိုမှုများ
          </h3>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{request.playerName}</h4>
                        <p className="text-sm text-gray-500">{formatTime(request.requestedAt)}</p>
                        {request.paymentMethod && (
                          <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-200">
                            <CreditCard className="w-3 h-3" />
                            {request.paymentMethod}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {request.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">ယူနစ်</div>
                    </div>
                  </div>

                  {/* Transaction ID */}
                  <div className="mb-3 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-blue-900">Transaction ID</span>
                      <button
                        onClick={() => copyToClipboard(request.transactionId, request.id)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        {copiedId === request.id ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            ကူးယူပြီး
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            ကူးယူမည်
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-sm font-mono font-bold text-gray-900 break-all">{request.transactionId}</p>
                  </div>

                  {request.note && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{request.note}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onReject(request.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      ငြင်းပယ်မည်
                    </button>
                    <button
                      onClick={() => handleApprove(request)}
                      disabled={request.amount > currentBalance}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4" />
                      အတည်ပြုမည်
                    </button>
                  </div>

                  {request.amount > currentBalance && (
                    <div className="mt-2 flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700">ယူနစ်လက်ကျန် မလုံလောက်ပါ</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center border border-gray-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Wallet className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            စောင့်ဆိုင်းဆဲ တောင်းဆိုမှု မရှိပါ
          </h3>
          <p className="text-sm text-gray-500">
            ကစားသမားများ၏ ငွေသွင်းတောင်းဆိုမှုများ ဤနေရာတွင် ပေါ်လာပါမည်
          </p>
        </div>
      )}

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            လုပ်ဆောင်ပြီး တောင်းဆိုမှုများ
          </h3>
          <div className="space-y-2">
            {processedRequests.slice(0, 5).map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      {request.status === 'approved' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{request.playerName}</h4>
                      <p className="text-xs text-gray-500">{formatTime(request.requestedAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{request.amount.toLocaleString()}</div>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${getStatusColor(request.status)}`}>
                      {getStatusLabel(request.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
