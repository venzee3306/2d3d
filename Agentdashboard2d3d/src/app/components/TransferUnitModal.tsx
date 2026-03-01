import { useState } from 'react';
import { X, Send, AlertCircle, Check } from 'lucide-react';

interface User {
  id: string;
  name: string;
  role: 'admin' | 'master' | 'agent' | 'player';
}

interface TransferUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  currentBalance: number;
  availableRecipients: User[];
  onTransfer: (recipientId: string, amount: number, note: string) => void;
}

export function TransferUnitModal({
  isOpen,
  onClose,
  currentUser,
  currentBalance,
  availableRecipients,
  onTransfer
}: TransferUnitModalProps) {
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    setError('');
    
    if (!selectedRecipient) {
      setError('ကျေးဇူးပြု၍ လက်ခံမည့်သူကို ရွေးချယ်ပါ');
      return;
    }

    const transferAmount = parseInt(amount);
    if (!amount || transferAmount <= 0) {
      setError('ကျေးဇူးပြု၍ မှန်ကန်သော ယူနစ်ပမာණ ထည့်ပါ');
      return;
    }

    if (transferAmount > currentBalance) {
      setError('ယူနစ်လက်ကျန် မလုံလောက်ပါ');
      return;
    }

    onTransfer(selectedRecipient, transferAmount, note);
    setSuccess(true);
    
    setTimeout(() => {
      setSuccess(false);
      setSelectedRecipient('');
      setAmount('');
      setNote('');
      onClose();
    }, 1500);
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'အက်ဒမင်',
      master: 'မာစတာ',
      agent: 'အေးဂျင့်',
      player: 'ကစားသမား'
    };
    return labels[role] || role;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">ယူနစ်လွှဲပြောင်းရန်</h2>
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
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
            <div className="text-sm text-gray-600 mb-1">လက်ရှိ ယူနစ်လက်ကျန်</div>
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              {currentBalance.toLocaleString()}
            </div>
          </div>

          {/* Recipient Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              လက်ခံမည့်သူ
            </label>
            <select
              value={selectedRecipient}
              onChange={(e) => setSelectedRecipient(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">ရွေးချယ်ပါ...</option>
              {availableRecipients.map((recipient) => (
                <option key={recipient.id} value={recipient.id}>
                  {recipient.name} ({getRoleLabel(recipient.role)})
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ယူနစ်ပမာណ
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
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
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
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
              <p className="text-sm text-green-700">လွှဲပြောင်းမှု အောင်မြင်ပါသည်</p>
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
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            လွှဲပြောင်းမည်
          </button>
        </div>
      </div>
    </div>
  );
}
