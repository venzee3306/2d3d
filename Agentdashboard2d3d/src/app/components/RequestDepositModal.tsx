import { useState } from 'react';
import { X, Wallet, CreditCard, Check, AlertCircle } from 'lucide-react';

interface RequestDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  onSubmit: (amount: number, transactionId: string, paymentMethod: string, note: string) => void;
}

export function RequestDepositModal({
  isOpen,
  onClose,
  playerName,
  onSubmit
}: RequestDepositModalProps) {
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('KBZ Pay');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const paymentMethods = [
    'KBZ Pay',
    'Wave Money',
    'CB Pay',
    'AYA Pay',
    'M-Pitesan',
    'OK Dollar',
    'Others'
  ];

  const quickAmounts = [5000, 10000, 20000, 50000, 100000];

  const handleSubmit = () => {
    setError('');
    
    const depositAmount = parseInt(amount);
    if (!amount || depositAmount <= 0) {
      setError('ကျေးဇူးပြု၍ ငွေပမာဏ ထည့်ပါ');
      return;
    }

    if (!transactionId.trim()) {
      setError('ကျေးဇူးပြု၍ Transaction ID ထည့်ပါ');
      return;
    }

    if (transactionId.trim().length < 6) {
      setError('Transaction ID သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်');
      return;
    }

    onSubmit(depositAmount, transactionId.trim(), paymentMethod, note.trim());
    setSuccess(true);
    
    setTimeout(() => {
      setSuccess(false);
      setAmount('');
      setTransactionId('');
      setPaymentMethod('KBZ Pay');
      setNote('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">ငွေသွင်းတောင်းဆိုရန်</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Player Info */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="text-sm text-gray-600 mb-1">ကစားသမား</div>
            <div className="text-xl font-bold text-gray-900">{playerName}</div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ငွေပမာဏ (MMK)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-semibold"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              အမြန်ရွေးချယ်ရန်
            </label>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount.toString())}
                  className="px-3 py-2 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-green-50 hover:to-emerald-50 border border-gray-200 hover:border-green-300 rounded-lg text-sm font-medium text-gray-700 hover:text-green-700 transition-all"
                >
                  {quickAmount.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ငွေပေးချေမှု နည်းလမ်း
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transaction ID - REQUIRED */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction ID <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="KBZ2024021612345678"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
            />
            <p className="mt-1 text-xs text-gray-500">
              သင်၏ ငွေလွှဲမှု Transaction ID ကို ထည့်ပါ (အနည်းဆုံး ၆ လုံး)
            </p>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              မှတ်ချက် (ရွေးချယ်ခွင့်)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="အခြား မှတ်ချက်များထည့်ပါ..."
              rows={3}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">သတိပြုရန်</p>
                <ul className="space-y-1 text-xs">
                  <li>• သင့် Agent သည် Transaction ID ကို စစ်ဆေးပါမည်</li>
                  <li>• မှားယွင်းသော ID ထည့်ပါက ငြင်းပယ်ခံရနိုင်ပါသည်</li>
                  <li>• အတည်ပြုပြီးပါက သင့်အကောင့်သို့ ယူနစ်များ ထည့်ပေးပါမည်</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">တောင်းဆိုမှု အောင်မြင်ပါသည်</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            မလုပ်တော့
          </button>
          <button
            onClick={handleSubmit}
            disabled={success}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            တောင်းဆိုမည်
          </button>
        </div>
      </div>
    </div>
  );
}
