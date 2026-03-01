import { useState } from 'react';
import { X, Plus, Sparkles, Check, AlertCircle } from 'lucide-react';

interface CreateUnitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onCreateUnits: (amount: number, note: string) => void;
}

export function CreateUnitsModal({
  isOpen,
  onClose,
  currentBalance,
  onCreateUnits
}: CreateUnitsModalProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const quickAmounts = [10000, 50000, 100000, 500000, 1000000];

  const handleSubmit = () => {
    setError('');
    
    const createAmount = parseInt(amount);
    if (!amount || createAmount <= 0) {
      setError('ကျေးဇူးပြု၍ မှန်ကန်သော ယူနစ်ပမာဏ ထည့်ပါ');
      return;
    }

    onCreateUnits(createAmount, note);
    setSuccess(true);
    
    setTimeout(() => {
      setSuccess(false);
      setAmount('');
      setNote('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">ယူနစ်အသစ်ဖန်တီးရန်</h2>
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
          {/* Current Balance */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-100">
            <div className="text-sm text-gray-600 mb-1">လက်ရှိ ယူနစ်လက်ကျန်</div>
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">
              {currentBalance.toLocaleString()}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ဖန်တီးမည့် ယူနစ်ပမာဏ
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-lg font-semibold"
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
                  className="px-3 py-2 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-yellow-50 hover:to-orange-50 border border-gray-200 hover:border-yellow-300 rounded-lg text-sm font-medium text-gray-700 hover:text-yellow-700 transition-all"
                >
                  {quickAmount.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              မှတ်ချက် (ရွေးချယ်ခွင့်)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="မှတ်ချက်ထည့်ပါ..."
              rows={3}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Preview */}
          {amount && parseInt(amount) > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="text-xs text-gray-600 mb-1">ဖန်တီးပြီးနောက် လက်ကျန်</div>
              <div className="text-2xl font-bold text-blue-700">
                {(currentBalance + parseInt(amount)).toLocaleString()}
              </div>
            </div>
          )}

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
              <p className="text-sm text-green-700">ယူနစ်ဖန်တီးမှု အောင်မြင်ပါသည်</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            မလုပ်တော့
          </button>
          <button
            onClick={handleSubmit}
            disabled={success}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl font-medium hover:from-yellow-700 hover:to-orange-700 transition-all shadow-lg shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            ဖန်တီးမည်
          </button>
        </div>
      </div>
    </div>
  );
}
