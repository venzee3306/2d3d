import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Wallet, 
  AlertCircle,
  CheckCircle,
  User,
  DollarSign
} from 'lucide-react';

interface ManualTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    id: string;
    name: string;
    role: string;
    currentBalance: number;
  };
  currentUserBalance: number;
  onConfirm: (transaction: {
    type: 'deposit' | 'withdrawal';
    amount: number;
    note: string;
  }) => void;
}

export function ManualTransactionModal({
  isOpen,
  onClose,
  targetUser,
  currentUserBalance,
  onConfirm
}: ManualTransactionModalProps) {
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    
    // Validation
    if (!amount || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (transactionType === 'deposit' && numAmount > currentUserBalance) {
      setError('Insufficient balance for this deposit');
      return;
    }

    if (transactionType === 'withdrawal' && numAmount > targetUser.currentBalance) {
      setError(`${targetUser.name} has insufficient balance for this withdrawal`);
      return;
    }

    // Confirm action
    const action = transactionType === 'deposit' ? 'deposit to' : 'withdraw from';
    const balanceChange = transactionType === 'deposit' 
      ? `Your balance: ${currentUserBalance.toLocaleString()} → ${(currentUserBalance - numAmount).toLocaleString()}\n${targetUser.name}'s balance: ${targetUser.currentBalance.toLocaleString()} → ${(targetUser.currentBalance + numAmount).toLocaleString()}`
      : `Your balance: ${currentUserBalance.toLocaleString()} → ${(currentUserBalance + numAmount).toLocaleString()}\n${targetUser.name}'s balance: ${targetUser.currentBalance.toLocaleString()} → ${(targetUser.currentBalance - numAmount).toLocaleString()}`;

    if (window.confirm(
      `Confirm ${transactionType}?\n\n` +
      `Action: ${action.toUpperCase()} ${targetUser.name}\n` +
      `Amount: ${numAmount.toLocaleString()} Units\n\n` +
      `Balance Changes:\n${balanceChange}\n\n` +
      (note ? `Note: ${note}\n\n` : '') +
      `This is a manual transaction and will be recorded immediately.`
    )) {
      onConfirm({
        type: transactionType,
        amount: numAmount,
        note: note.trim()
      });
      
      // Reset form
      setAmount('');
      setNote('');
      setError('');
      onClose();
    }
  };

  const handleClose = () => {
    setAmount('');
    setNote('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="w-6 h-6 text-white" />
              <div>
                <h3 className="text-xl font-bold text-white">Manual Transaction</h3>
                <p className="text-blue-100 text-sm" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                  ကိုယ်တိုင် လွဲပြောင်းခြင်း
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Target User Info */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {targetUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{targetUser.name}</h4>
                  <p className="text-sm text-gray-600 capitalize">{targetUser.role}</p>
                </div>
              </div>
              <div className="flex items-center justify-between bg-white rounded-lg p-3">
                <span className="text-sm text-gray-600">Current Balance:</span>
                <span className="font-bold text-lg text-gray-900">
                  {targetUser.currentBalance.toLocaleString()} <span className="text-sm">Units</span>
                </span>
              </div>
            </div>

            {/* Your Balance */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700 font-medium">Your Available Balance:</span>
                <span className="font-bold text-xl text-blue-900">
                  {currentUserBalance.toLocaleString()} <span className="text-sm">Units</span>
                </span>
              </div>
            </div>

            {/* Transaction Type Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Transaction Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTransactionType('deposit')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    transactionType === 'deposit'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ArrowDownCircle
                    className={`w-8 h-8 mx-auto mb-2 ${
                      transactionType === 'deposit' ? 'text-green-600' : 'text-gray-400'
                    }`}
                  />
                  <p className={`font-bold ${
                    transactionType === 'deposit' ? 'text-green-900' : 'text-gray-600'
                  }`}>
                    Deposit / Top-up
                  </p>
                  <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    ငွေဖြည့်ပေးမည်
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    Give units to {targetUser.name}
                  </p>
                </button>

                <button
                  onClick={() => setTransactionType('withdrawal')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    transactionType === 'withdrawal'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ArrowUpCircle
                    className={`w-8 h-8 mx-auto mb-2 ${
                      transactionType === 'withdrawal' ? 'text-red-600' : 'text-gray-400'
                    }`}
                  />
                  <p className={`font-bold ${
                    transactionType === 'withdrawal' ? 'text-red-900' : 'text-gray-600'
                  }`}>
                    Withdraw / Collect
                  </p>
                  <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    ငွေထုတ်မည်
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    Take units from {targetUser.name}
                  </p>
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount (Units) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter amount"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quick Select
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[10000, 50000, 100000, 500000].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    className="px-3 py-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    {(quickAmount / 1000).toFixed(0)}K
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Note (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note for this transaction..."
                className="w-full border border-gray-300 rounded-xl p-3 h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Preview */}
            {amount && parseFloat(amount) > 0 && !error && (
              <div className={`rounded-xl p-4 border-2 ${
                transactionType === 'deposit' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className={`w-5 h-5 ${
                    transactionType === 'deposit' ? 'text-green-600' : 'text-red-600'
                  }`} />
                  <span className={`font-semibold ${
                    transactionType === 'deposit' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    Transaction Preview
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Your balance will {transactionType === 'deposit' ? 'decrease' : 'increase'} to:</span>
                    <span className="font-bold text-gray-900">
                      {transactionType === 'deposit' 
                        ? (currentUserBalance - parseFloat(amount)).toLocaleString()
                        : (currentUserBalance + parseFloat(amount)).toLocaleString()} Units
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">{targetUser.name}'s balance will {transactionType === 'deposit' ? 'increase' : 'decrease'} to:</span>
                    <span className="font-bold text-gray-900">
                      {transactionType === 'deposit'
                        ? (targetUser.currentBalance + parseFloat(amount)).toLocaleString()
                        : (targetUser.currentBalance - parseFloat(amount)).toLocaleString()} Units
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 hover:bg-gray-50 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!amount || parseFloat(amount) <= 0}
                className={`flex-1 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
                  transactionType === 'deposit'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white disabled:from-gray-300 disabled:to-gray-400'
                    : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white disabled:from-gray-300 disabled:to-gray-400'
                }`}
              >
                {transactionType === 'deposit' ? (
                  <ArrowDownCircle className="w-5 h-5" />
                ) : (
                  <ArrowUpCircle className="w-5 h-5" />
                )}
                <span>Confirm {transactionType === 'deposit' ? 'Deposit' : 'Withdrawal'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
