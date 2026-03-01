import { motion } from 'motion/react';
import { CheckCircle, Download, Share2, X, Receipt as ReceiptIcon, User, Calendar, CreditCard, Hash, ArrowRight } from 'lucide-react';
import { TransactionReceipt } from '../types/ledger';

interface TransactionReceiptViewProps {
  receipt: TransactionReceipt;
  onClose: () => void;
  onShare?: (method: 'viber' | 'messenger' | 'telegram' | 'whatsapp') => void;
}

export function TransactionReceiptView({ receipt, onClose, onShare }: TransactionReceiptViewProps) {
  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) {
      return '0';
    }
    return amount.toLocaleString('en-US');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getTypeColor = () => {
    switch (receipt.transactionType) {
      case 'deposit':
        return 'from-green-500 to-green-600';
      case 'withdrawal':
        return 'from-orange-500 to-orange-600';
      case 'transfer':
        return 'from-blue-500 to-blue-600';
      case 'topup':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeText = () => {
    switch (receipt.transactionType) {
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'transfer':
        return 'Transfer';
      case 'topup':
        return 'Top Up';
      default:
        return 'Transaction';
    }
  };

  const handleDownload = () => {
    // In a real app, this would generate a PDF or image
    alert('Receipt download functionality would be implemented here');
  };

  const handleShare = (method: 'viber' | 'messenger' | 'telegram' | 'whatsapp') => {
    if (onShare) {
      onShare(method);
    }
    // In a real app, this would use the Web Share API or deep links
    const shareText = `Transaction Receipt\n\nReceipt #: ${receipt.receiptNumber}\nType: ${getTypeText()}\nAmount: ${formatCurrency(receipt.amount)} MMK\nFrom: ${receipt.fromUserName}\nTo: ${receipt.toUserName}\nDate: ${formatDate(receipt.timestamp)}\n\nStatus: ${receipt.status.toUpperCase()}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Transaction Receipt',
        text: shareText,
      }).catch((err) => console.log('Error sharing:', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Receipt copied to clipboard! You can now paste it in your messaging app.');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${getTypeColor()} px-6 py-5 text-white`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <ReceiptIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Transaction Receipt</h2>
                <p className="text-sm opacity-90">{getTypeText()}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {receipt.status === 'completed' && (
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-semibold">Transaction Completed</span>
            </div>
          )}
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-5">
          {/* Receipt Number */}
          <div className="text-center pb-4 border-b-2 border-dashed border-gray-300">
            <p className="text-xs text-gray-500 mb-1">Receipt Number</p>
            <p className="text-2xl font-bold text-gray-900 font-mono">{receipt.receiptNumber}</p>
          </div>

          {/* Amount */}
          <div className="text-center py-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200">
            <p className="text-sm text-gray-600 mb-2">Amount</p>
            <p className="text-4xl font-bold text-gray-900">{formatCurrency(receipt.amount)}</p>
            <p className="text-sm text-gray-600 mt-1">MMK</p>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3">
            {/* From/To */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">From</p>
                  <p className="font-bold text-gray-900">{receipt.fromUserName}</p>
                  <p className="text-xs text-gray-500 capitalize">{receipt.fromUserRole}</p>
                </div>
              </div>
              
              <div className="flex justify-center my-2">
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">To</p>
                  <p className="font-bold text-gray-900">{receipt.toUserName}</p>
                  <p className="text-xs text-gray-500 capitalize">{receipt.toUserRole}</p>
                </div>
              </div>
            </div>

            {/* Balance Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-orange-50 rounded-xl p-3 border-2 border-orange-200">
                <p className="text-xs text-orange-600 mb-1">Previous Balance</p>
                <p className="text-lg font-bold text-orange-900">{formatCurrency(receipt.previousBalance)}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 border-2 border-green-200">
                <p className="text-xs text-green-600 mb-1">New Balance</p>
                <p className="text-lg font-bold text-green-900">{formatCurrency(receipt.newBalance)}</p>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date & Time
                </span>
                <span className="font-semibold text-gray-900 text-right text-xs">
                  {formatDate(receipt.timestamp)}
                </span>
              </div>
              
              {receipt.paymentMethod && (
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment Method
                  </span>
                  <span className="font-semibold text-gray-900">{receipt.paymentMethod}</span>
                </div>
              )}
              
              {receipt.transactionId && (
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Transaction ID
                  </span>
                  <span className="font-semibold text-gray-900 font-mono text-xs">{receipt.transactionId}</span>
                </div>
              )}
              
              {receipt.note && (
                <div className="bg-blue-50 rounded-lg p-3 mt-3">
                  <p className="text-xs text-blue-600 mb-1">Note</p>
                  <p className="text-sm text-blue-900">{receipt.note}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleDownload}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Receipt
            </button>
            
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleShare('viber')}
                className="px-3 py-2.5 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-all font-semibold text-xs flex flex-col items-center gap-1"
              >
                <Share2 className="w-4 h-4" />
                Viber
              </button>
              <button
                onClick={() => handleShare('messenger')}
                className="px-3 py-2.5 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all font-semibold text-xs flex flex-col items-center gap-1"
              >
                <Share2 className="w-4 h-4" />
                Messenger
              </button>
              <button
                onClick={() => handleShare('telegram')}
                className="px-3 py-2.5 bg-cyan-100 text-cyan-700 rounded-xl hover:bg-cyan-200 transition-all font-semibold text-xs flex flex-col items-center gap-1"
              >
                <Share2 className="w-4 h-4" />
                Telegram
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="px-3 py-2.5 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-all font-semibold text-xs flex flex-col items-center gap-1"
              >
                <Share2 className="w-4 h-4" />
                WhatsApp
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 pt-3 border-t border-gray-200">
            <p>This is an official transaction receipt</p>
            <p className="mt-1">Keep this for your records</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
