import { motion } from 'motion/react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  ArrowDownCircle,
  ArrowUpCircle,
  User,
  Wallet
} from 'lucide-react';

export type TransactionStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type TransactionType = 'deposit' | 'withdrawal';

interface TransactionCardProps {
  id: string;
  type: TransactionType;
  amount: number;
  paymentMethod?: string;
  transactionId?: string;
  status: TransactionStatus;
  requestedAt: string;
  processedAt?: string;
  note?: string;
  rejectionReason?: string;
  requesterName?: string;
  approverName?: string;
  onClick?: () => void;
  showActions?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onMarkPaid?: () => void;
}

export function TransactionCard({
  id,
  type,
  amount,
  paymentMethod,
  transactionId,
  status,
  requestedAt,
  processedAt,
  note,
  rejectionReason,
  requesterName,
  approverName,
  onClick,
  showActions,
  onApprove,
  onReject,
  onMarkPaid
}: TransactionCardProps) {
  
  // Consistent color schemes
  const isDeposit = type === 'deposit';
  const colorScheme = isDeposit ? {
    primary: 'emerald',
    bgGradient: 'from-emerald-50 to-green-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    textDark: 'text-emerald-900',
    icon: 'text-emerald-600',
    button: 'from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700'
  } : {
    primary: 'amber',
    bgGradient: 'from-amber-50 to-orange-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    textDark: 'text-amber-900',
    icon: 'text-amber-600',
    button: 'from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'
  };

  // Status badge
  const getStatusBadge = () => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase tracking-wide border-2 border-yellow-200">
            <Clock className="w-3.5 h-3.5" />
            Pending
            <span style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              (စောင့်ဆိုင်းဆဲ)
            </span>
          </span>
        );
      case 'approved':
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase tracking-wide border-2 border-green-200">
            <CheckCircle className="w-3.5 h-3.5" />
            Success
            <span style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              (အောင်မြင်)
            </span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-xs font-bold uppercase tracking-wide border-2 border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
            <span style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              (ငြင်းပယ်)
            </span>
          </span>
        );
    }
  };

  // Format date consistently
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${colorScheme.bgGradient} rounded-2xl border-2 ${colorScheme.border} overflow-hidden hover:shadow-lg transition-all cursor-pointer`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 bg-white rounded-xl shadow-sm ${colorScheme.icon}`}>
              {isDeposit ? (
                <ArrowDownCircle className="w-6 h-6" />
              ) : (
                <ArrowUpCircle className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className={`text-lg font-bold ${colorScheme.textDark}`}>
                {isDeposit ? 'Unit Top-up' : 'Winning Cash-out'}
              </h3>
              <p className={`text-sm ${colorScheme.text}`} style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                {isDeposit ? 'ယူနစ်ဖြည့်ခြင်း' : 'ငွေထုတ်ခြင်း'}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Amount - Large and consistent */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1 font-medium">Amount</p>
          <div className="flex items-baseline gap-2">
            <p className={`text-4xl font-bold ${colorScheme.textDark}`}>
              {amount.toLocaleString()}
            </p>
            <p className="text-xl font-semibold text-gray-600">Units</p>
          </div>
          <p className="text-sm text-gray-500 mt-1">≈ {amount.toLocaleString()} MMK</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {paymentMethod && (
            <div className="bg-white/50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1 font-medium">Payment Method</p>
              <p className={`text-sm font-bold ${colorScheme.textDark}`}>{paymentMethod}</p>
            </div>
          )}
          {transactionId && (
            <div className="bg-white/50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1 font-medium">Transaction ID</p>
              <p className={`text-sm font-bold ${colorScheme.textDark} truncate`}>{transactionId}</p>
            </div>
          )}
          {requesterName && (
            <div className="bg-white/50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1 font-medium">
                {isDeposit ? 'Requested By' : 'Agent'}
              </p>
              <p className={`text-sm font-bold ${colorScheme.textDark}`}>{requesterName}</p>
            </div>
          )}
          {approverName && status !== 'pending' && (
            <div className="bg-white/50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1 font-medium">Processed By</p>
              <p className={`text-sm font-bold ${colorScheme.textDark}`}>{approverName}</p>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <Calendar className="w-4 h-4" />
          <span className="font-medium">Requested:</span>
          <span className="font-bold text-gray-900">{formatDate(requestedAt)}</span>
        </div>
        {processedAt && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">Processed:</span>
            <span className="font-bold text-gray-900">{formatDate(processedAt)}</span>
          </div>
        )}

        {/* Note */}
        {note && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-3 mb-3">
            <p className="text-xs text-blue-700 font-semibold mb-1">Note:</p>
            <p className="text-sm text-blue-900">{note}</p>
          </div>
        )}

        {/* Rejection Reason */}
        {rejectionReason && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-3 mb-3">
            <p className="text-xs text-red-700 font-semibold mb-1">Rejection Reason:</p>
            <p className="text-sm text-red-900">{rejectionReason}</p>
          </div>
        )}

        {/* Actions */}
        {showActions && status === 'pending' && (
          <div className="flex gap-2 mt-4">
            {onApprove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove();
                }}
                className={`flex-1 px-4 py-3 bg-gradient-to-r ${colorScheme.button} text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2`}
              >
                <CheckCircle className="w-5 h-5" />
                {isDeposit ? 'Approve & Release' : 'Mark as Paid'}
              </button>
            )}
            {onReject && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReject();
                }}
                className="px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Reject
              </button>
            )}
            {onMarkPaid && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkPaid();
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Mark as Paid
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Color Stripe */}
      <div className={`h-2 ${isDeposit ? 'bg-emerald-500' : 'bg-amber-500'}`} />
    </motion.div>
  );
}
