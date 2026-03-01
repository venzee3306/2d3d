import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowDownCircle, 
  Wallet, 
  Upload, 
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { TransactionCard } from './TransactionCard';
import type { UnitDepositRequest } from '../types/units';

interface AgentDepositRequestFormProps {
  agentBalance: number;
  depositHistory: UnitDepositRequest[];
  onSubmitRequest: (request: {
    amount: number;
    paymentMethod: string;
    transactionId: string;
    paymentScreenshot: string;
    note?: string;
  }) => void;
}

export function AgentDepositRequestForm({
  agentBalance,
  depositHistory,
  onSubmitRequest
}: AgentDepositRequestFormProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('KBZ Pay');
  const [transactionId, setTransactionId] = useState('');
  const [note, setNote] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const paymentMethods = ['KBZ Pay', 'Wave Money', 'CB Pay', 'AYA Pay', 'Other'];

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle submit
  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    
    // Validation
    if (!amount || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!transactionId.trim()) {
      setError('Please enter the transaction ID');
      return;
    }
    if (!receiptImage) {
      setError('Please upload a payment receipt');
      return;
    }

    // Confirm submission
    if (window.confirm(
      `Submit unit top-up request?\n\n` +
      `Amount: ${numAmount.toLocaleString()} Units\n` +
      `Payment: ${paymentMethod}\n` +
      `Transaction ID: ${transactionId}\n\n` +
      `Your Master will review and approve this request.`
    )) {
      onSubmitRequest({
        amount: numAmount,
        paymentMethod,
        transactionId: transactionId.trim(),
        paymentScreenshot: receiptImage,
        note: note.trim()
      });
      
      // Reset form
      setAmount('');
      setTransactionId('');
      setNote('');
      setReceiptImage(null);
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl shadow-lg">
              <ArrowDownCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Unit Top-up Request</h1>
              <p className="text-gray-600 mt-1" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                ယူနစ် ဖြည့်ရန် တောင်းဆိုမှု
              </p>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-2 text-emerald-100">
              <Wallet className="w-5 h-5" />
              <span className="text-sm font-medium">Your Current Balance</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-5xl font-bold text-white">{agentBalance.toLocaleString()}</p>
              <p className="text-xl text-emerald-100">Units</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Form */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-emerald-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">New Request</h2>
              <p className="text-emerald-100 text-sm">Fill in the details below</p>
            </div>

            <div className="p-6 space-y-5">
              {/* Amount */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Amount (Units) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter amount"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xl font-bold"
                  />
                </div>
                {amount && parseFloat(amount) > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    = {parseFloat(amount).toLocaleString()} MMK (approx)
                  </p>
                )}
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Quick Select</label>
                <div className="grid grid-cols-4 gap-2">
                  {[10000, 50000, 100000, 500000].map((quickAmount) => (
                    <button
                      key={quickAmount}
                      onClick={() => setAmount(quickAmount.toString())}
                      className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg text-sm font-bold transition-colors"
                    >
                      {(quickAmount / 1000).toFixed(0)}K
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-semibold"
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              {/* Transaction ID */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Transaction ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => {
                    setTransactionId(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter transaction/reference ID"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Find this in your payment app confirmation screen
                </p>
              </div>

              {/* Upload Receipt */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Payment Receipt <span className="text-red-500">*</span>
                </label>
                {!receiptImage ? (
                  <label className="block w-full cursor-pointer">
                    <div className="border-2 border-dashed border-emerald-300 rounded-xl p-8 text-center hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                      <Upload className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-emerald-700 mb-1">
                        Click to upload receipt
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={receiptImage}
                      alt="Receipt"
                      className="w-full h-48 object-cover rounded-xl border-2 border-emerald-300"
                    />
                    <button
                      onClick={() => setReceiptImage(null)}
                      className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-full text-white shadow-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowPreview(true)}
                      className="absolute bottom-2 right-2 px-3 py-1 bg-white/90 hover:bg-white rounded-lg text-sm font-semibold text-emerald-700 shadow-md transition-colors"
                    >
                      Preview
                    </button>
                  </div>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Note (Optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add any additional information..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 h-24 resize-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!amount || !transactionId || !receiptImage}
                className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-6 h-6" />
                Submit Request
              </button>
            </div>
          </div>

          {/* Request History */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Request History</h2>
                <p className="text-gray-300 text-sm">Track your previous requests</p>
              </div>

              <div className="p-6">
                {depositHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-semibold">No requests yet</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Your deposit requests will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {depositHistory.map((request) => (
                      <TransactionCard
                        key={request.id}
                        id={request.id}
                        type="deposit"
                        amount={request.amount}
                        paymentMethod={request.paymentMethod}
                        transactionId={request.transactionId}
                        status={request.status}
                        requestedAt={request.requestedAt}
                        processedAt={request.processedAt}
                        note={request.note}
                        rejectionReason={request.rejectionReason}
                        approverName={request.approverName}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Preview Modal */}
      {showPreview && receiptImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <img
              src={receiptImage}
              alt="Receipt Preview"
              className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
