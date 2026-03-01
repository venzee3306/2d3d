import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wallet, AlertCircle, CheckCircle, TrendingDown } from 'lucide-react';

interface CashoutRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: {
    amount: number;
    paymentMethod: string;
    accountInfo: string;
    note?: string;
  }) => void;
  userRole: 'master' | 'agent';
  userName: string;
  availableBalance: number;
}

export function CashoutRequestModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  userRole, 
  userName,
  availableBalance 
}: CashoutRequestModalProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [accountInfo, setAccountInfo] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentMethods = [
    { value: 'kpay', label: 'KBZ Pay (KPay)', icon: '💳', placeholder: '09XXXXXXXXX' },
    { value: 'wavepay', label: 'Wave Pay', icon: '🌊', placeholder: '09XXXXXXXXX' },
    { value: 'cbpay', label: 'CB Pay', icon: '🏦', placeholder: '09XXXXXXXXX' },
    { value: 'ayapay', label: 'AYA Pay', icon: '💰', placeholder: '09XXXXXXXXX' },
    { value: 'onepay', label: 'OnePay', icon: '1️⃣', placeholder: '09XXXXXXXXX' },
    { value: 'bank', label: 'Bank Transfer', icon: '🏛️', placeholder: 'Account Number' },
  ];

  const selectedMethod = paymentMethods.find(m => m.value === paymentMethod);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    const amountNum = parseFloat(amount);
    if (!amount || amountNum <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (amountNum > availableBalance) {
      newErrors.amount = `Amount exceeds available balance (${availableBalance.toLocaleString()} Units)`;
    }
    
    if (!paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }
    
    if (!accountInfo || accountInfo.length < 5) {
      newErrors.accountInfo = 'Please enter valid account information';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSubmit({
      amount: parseFloat(amount),
      paymentMethod,
      accountInfo,
      note: note || undefined,
    });
    
    setIsSubmitting(false);
    handleReset();
  };

  const handleReset = () => {
    setAmount('');
    setPaymentMethod('');
    setAccountInfo('');
    setNote('');
    setErrors({});
    setIsSubmitting(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <TrendingDown className="w-7 h-7" />
                Cash-out Request
              </h2>
              <p className="text-orange-100 text-sm mt-1" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                ယူနစ်ထုတ်ယူရန်
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-all"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Balance Info */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-700">Available Balance</span>
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-blue-900">
                  {availableBalance.toLocaleString()}
                </span>
                <span className="text-xl font-semibold text-blue-600">Units</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                ≈ {availableBalance.toLocaleString()} MMK
              </p>
            </div>

            {/* Info Banner */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-900">Cash-out Instructions</p>
                <p className="text-xs text-orange-700 mt-1">
                  {userRole === 'agent' 
                    ? 'Submit your cash-out request. Your Master will review and transfer funds to your account.'
                    : 'Submit your cash-out request. Admin will review and transfer funds to your account.'}
                </p>
                <p className="text-xs text-orange-600 mt-1" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                  ငွေထုတ်ယူရန် တောင်းဆိုပါ။
                </p>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Amount to Cash-out <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className={`w-full px-4 py-3.5 border-2 rounded-xl text-lg font-semibold transition-all ${
                    errors.amount 
                      ? 'border-red-300 bg-red-50 focus:border-red-500' 
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                  Units
                </div>
              </div>
              {amount && parseFloat(amount) > 0 && (
                <p className="text-sm text-gray-600 mt-1.5 ml-1">
                  You will receive: ≈ {parseFloat(amount).toLocaleString()} MMK
                </p>
              )}
              {errors.amount && (
                <p className="text-sm text-red-600 mt-1.5 ml-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.amount}
                </p>
              )}
              
              {/* Quick Amount Buttons */}
              <div className="flex gap-2 mt-3">
                {[25, 50, 75, 100].map((percentage) => {
                  const quickAmount = Math.floor(availableBalance * (percentage / 100));
                  return (
                    <button
                      key={percentage}
                      type="button"
                      onClick={() => setAmount(quickAmount.toString())}
                      className="flex-1 px-3 py-2 bg-gray-100 hover:bg-blue-100 border border-gray-300 hover:border-blue-400 rounded-lg text-sm font-semibold text-gray-700 hover:text-blue-700 transition-all"
                    >
                      {percentage}%
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Receive Via <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setPaymentMethod(method.value)}
                    className={`p-4 border-2 rounded-xl transition-all text-left ${
                      paymentMethod === method.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-300 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{method.icon}</span>
                      <span className="font-semibold text-gray-900 text-sm">{method.label}</span>
                    </div>
                  </button>
                ))}
              </div>
              {errors.paymentMethod && (
                <p className="text-sm text-red-600 mt-1.5 ml-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.paymentMethod}
                </p>
              )}
            </div>

            {/* Account Info */}
            {paymentMethod && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  {selectedMethod?.value === 'bank' ? 'Bank Account Number' : 'Phone Number'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={accountInfo}
                  onChange={(e) => setAccountInfo(e.target.value)}
                  placeholder={selectedMethod?.placeholder}
                  className={`w-full px-4 py-3.5 border-2 rounded-xl font-mono text-sm transition-all ${
                    errors.accountInfo 
                      ? 'border-red-300 bg-red-50 focus:border-red-500' 
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
                <p className="text-xs text-gray-500 mt-1.5 ml-1">
                  Funds will be transferred to this {selectedMethod?.value === 'bank' ? 'account' : 'number'}
                </p>
                {errors.accountInfo && (
                  <p className="text-sm text-red-600 mt-1.5 ml-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.accountInfo}
                  </p>
                )}
              </div>
            )}

            {/* Optional Note */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Note (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add any additional information..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-3">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3.5 border-2 border-gray-300 bg-white hover:bg-gray-100 text-gray-700 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
