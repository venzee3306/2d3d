import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Wallet, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';

interface UnitRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: {
    amount: number;
    paymentMethod: string;
    transactionId: string;
    paymentScreenshot: string;
    note?: string;
  }) => void;
  userRole: 'master' | 'agent';
  userName: string;
}

export function UnitRequestModal({ isOpen, onClose, onSubmit, userRole, userName }: UnitRequestModalProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [note, setNote] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const paymentMethods = [
    { value: 'kpay', label: 'KBZ Pay (KPay)', icon: '💳' },
    { value: 'wavepay', label: 'Wave Pay', icon: '🌊' },
    { value: 'cbpay', label: 'CB Pay', icon: '🏦' },
    { value: 'ayapay', label: 'AYA Pay', icon: '💰' },
    { value: 'onepay', label: 'OnePay', icon: '1️⃣' },
    { value: 'bank', label: 'Bank Transfer', icon: '🏛️' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, screenshot: 'File size must be less than 5MB' });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
        setErrors({ ...errors, screenshot: '' });
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }
    
    // If Transaction ID is provided, it must be at least 6 characters
    // If Transaction ID is NOT provided, Payment Proof is required
    if (transactionId && transactionId.length < 6) {
      newErrors.transactionId = 'Transaction ID must be at least 6 characters';
    }
    
    // Payment Proof is only required if Transaction ID is not provided
    if (!transactionId && !screenshot) {
      newErrors.screenshot = 'Please upload payment proof or enter Transaction ID';
    }
    
    // At least one of them must be provided
    if (!transactionId && !screenshot) {
      newErrors.transactionId = 'Please provide either Transaction ID or Payment Proof';
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
      transactionId,
      paymentScreenshot: screenshot || '', // Can be empty string if not provided
      note: note || undefined,
    });
    
    setIsSubmitting(false);
    handleReset();
  };

  const handleReset = () => {
    setAmount('');
    setPaymentMethod('');
    setTransactionId('');
    setNote('');
    setScreenshot(null);
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
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Wallet className="w-7 h-7" />
                Request Units
              </h2>
              <p className="text-blue-100 text-sm mt-1" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                ယူနစ်ဝယ်ယူရန်
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
            {/* Info Banner */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Payment Instructions</p>
                <p className="text-xs text-blue-700 mt-1">
                  {userRole === 'agent' 
                    ? 'Transfer funds to your Master, then provide either Transaction ID or Payment Proof (or both).'
                    : 'Transfer funds to Admin, then provide either Transaction ID or Payment Proof (or both).'}
                </p>
                <p className="text-xs text-blue-600 mt-1" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                  ငွေလွှဲပြီးမှ အထောက်အထားတင်ပါ။
                </p>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount (e.g., 100000)"
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
              {amount && (
                <p className="text-sm text-gray-600 mt-1.5 ml-1">
                  ≈ {parseFloat(amount).toLocaleString()} MMK (1 Unit = 1 MMK)
                </p>
              )}
              {errors.amount && (
                <p className="text-sm text-red-600 mt-1.5 ml-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.amount}
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setPaymentMethod(method.value)}
                    className={`p-4 border-2 rounded-xl transition-all text-left ${
                      paymentMethod === method.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
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

            {/* Transaction ID */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Transaction ID {!screenshot && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter 6+ digit transaction ID"
                className={`w-full px-4 py-3.5 border-2 rounded-xl font-mono text-sm transition-all ${
                  errors.transactionId 
                    ? 'border-red-300 bg-red-50 focus:border-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
              />
              <p className="text-xs text-gray-500 mt-1.5 ml-1">
                {screenshot 
                  ? 'Optional: Transaction ID from your payment app'
                  : 'Required if no payment proof is provided (minimum 6 characters)'}
              </p>
              {errors.transactionId && (
                <p className="text-sm text-red-600 mt-1.5 ml-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.transactionId}
                </p>
              )}
            </div>

            {/* Payment Screenshot */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Payment Proof {!transactionId && <span className="text-red-500">*</span>}
              </label>
              
              {!screenshot ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl p-8 transition-all ${
                    errors.screenshot 
                      ? 'border-red-300 bg-red-50 hover:border-red-400' 
                      : 'border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50'
                  }`}
                >
                  <Upload className={`w-12 h-12 mx-auto mb-3 ${errors.screenshot ? 'text-red-400' : 'text-gray-400'}`} />
                  <p className="text-sm font-semibold text-gray-900">
                    {transactionId ? 'Optional: Click to upload screenshot' : 'Click to upload screenshot'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {transactionId 
                      ? 'PNG, JPG up to 5MB (Optional with Transaction ID)'
                      : 'PNG, JPG up to 5MB (Required if no Transaction ID)'}
                  </p>
                </button>
              ) : (
                <div className="relative border-2 border-blue-300 rounded-xl overflow-hidden bg-gray-50">
                  <img 
                    src={screenshot} 
                    alt="Payment proof" 
                    className="w-full h-64 object-contain"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => setScreenshot(null)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 px-3 py-1.5 bg-green-500 rounded-lg flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span className="text-xs font-bold text-white">Uploaded</span>
                  </div>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {errors.screenshot && (
                <p className="text-sm text-red-600 mt-1.5 ml-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.screenshot}
                </p>
              )}
            </div>

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
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
