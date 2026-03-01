import { X, ArrowRight, User, DollarSign, AlertCircle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useMemo } from 'react';

interface User {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'master' | 'agent' | 'player';
  parentId?: string;
}

interface TransferUnitsModalProps {
  currentUser: User;
  allUsers: User[];
  userBalances: { [userId: string]: number };
  onClose: () => void;
  onTransfer: (toUserId: string, amount: number, type: 'deposit' | 'withdraw', note?: string) => void;
}

export function TransferUnitsModal({ currentUser, allUsers, userBalances, onClose, onTransfer }: TransferUnitsModalProps) {
  const [transferType, setTransferType] = useState<'deposit' | 'withdraw'>('deposit');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  // Get users that current user can transfer to/from
  const eligibleUsers = useMemo(() => {
    if (currentUser.role === 'admin') {
      return allUsers.filter(u => u.role === 'master');
    } else if (currentUser.role === 'master') {
      return allUsers.filter(u => u.role === 'agent' && u.parentId === currentUser.id);
    } else if (currentUser.role === 'agent') {
      // For agents, we'd need to get their players - for now returning empty
      return allUsers.filter(u => u.role === 'agent' && u.parentId === currentUser.id);
    }
    return [];
  }, [currentUser, allUsers]);

  const selectedUser = eligibleUsers.find(u => u.id === selectedUserId);
  const currentBalance = userBalances[currentUser.id] || 0;
  const selectedUserBalance = selectedUserId ? (userBalances[selectedUserId] || 0) : 0;
  const amountNum = parseFloat(amount) || 0;

  // Calculate balances after transaction
  const currentBalanceAfter = transferType === 'deposit' 
    ? currentBalance - amountNum 
    : currentBalance + amountNum;
  
  const selectedUserBalanceAfter = transferType === 'deposit'
    ? selectedUserBalance + amountNum
    : selectedUserBalance - amountNum;

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: 'Admin',
      master: 'Master',
      agent: 'Agent',
      player: 'Player'
    };
    return labels[role as keyof typeof labels];
  };

  const handleSubmit = () => {
    setError('');

    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }

    if (!amount || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Validation for deposit
    if (transferType === 'deposit') {
      if (amountNum > currentBalance) {
        setError('Insufficient balance');
        return;
      }
    }

    // Validation for withdrawal
    if (transferType === 'withdraw') {
      if (amountNum > selectedUserBalance) {
        setError('Target user has insufficient balance');
        return;
      }
    }

    onTransfer(selectedUserId, amountNum, transferType, note || undefined);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Transfer Units</h3>
              <p className="text-sm text-blue-100">လွှဲပြောင်းငွေ စီမံခန့်ခွဲမှု</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Current User Balance */}
          <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Your Current Balance</p>
                <p className="text-sm text-gray-500">သင့်လက်ကျန်ငွေ</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">{currentBalance.toLocaleString()}</p>
                <p className="text-xs text-gray-500">MMK Units</p>
              </div>
            </div>
          </div>

          {/* Transfer Type Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Transaction Type | ငွေလွှဲမှု အမျိုးအစား
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTransferType('deposit')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  transferType === 'deposit'
                    ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-500 shadow-lg'
                    : 'bg-white border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className={`w-5 h-5 ${transferType === 'deposit' ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={`font-bold ${transferType === 'deposit' ? 'text-green-700' : 'text-gray-500'}`}>
                    Deposit
                  </span>
                </div>
                <p className={`text-xs ${transferType === 'deposit' ? 'text-green-600' : 'text-gray-400'}`}>
                  သွင်းငွေ (Give Units)
                </p>
              </button>

              <button
                onClick={() => setTransferType('withdraw')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  transferType === 'withdraw'
                    ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-500 shadow-lg'
                    : 'bg-white border-gray-200 hover:border-red-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingDown className={`w-5 h-5 ${transferType === 'withdraw' ? 'text-red-600' : 'text-gray-400'}`} />
                  <span className={`font-bold ${transferType === 'withdraw' ? 'text-red-700' : 'text-gray-500'}`}>
                    Withdraw
                  </span>
                </div>
                <p className={`text-xs ${transferType === 'withdraw' ? 'text-red-600' : 'text-gray-400'}`}>
                  ထုတ်ငွေ (Take Back Units)
                </p>
              </button>
            </div>
          </div>

          {/* Select Target User */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Select {transferType === 'deposit' ? 'Recipient' : 'Source'} User | အသုံးပြုသူ ရွေးချယ်ရန်
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 font-medium"
            >
              <option value="">-- Select User --</option>
              {eligibleUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} (@{user.username}) - {getRoleLabel(user.role)} - Balance: {(userBalances[user.id] || 0).toLocaleString()} MMK
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Amount | ငွေပမာဏ (MMK)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 font-bold text-lg"
              />
            </div>
          </div>

          {/* Balance Preview */}
          {selectedUserId && amount && amountNum > 0 && (
            <div className="mb-6 space-y-3">
              <h4 className="text-sm font-bold text-gray-700">Balance Preview | ငွေလက်ကျန် အစီအစဉ်</h4>
              
              {/* Sender Balance */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Your Balance:</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">{currentBalance.toLocaleString()}</span>
                    <ArrowRight className="inline w-4 h-4 mx-2 text-gray-400" />
                    <span className={`text-lg font-bold ${currentBalanceAfter < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                      {currentBalanceAfter.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Receiver Balance */}
              <div className={`p-4 rounded-xl border ${
                transferType === 'deposit' 
                  ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200' 
                  : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{selectedUser?.name}'s Balance:</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">{selectedUserBalance.toLocaleString()}</span>
                    <ArrowRight className="inline w-4 h-4 mx-2 text-gray-400" />
                    <span className={`text-lg font-bold ${
                      transferType === 'deposit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedUserBalanceAfter.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Note/Remark */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Note / Remark (Optional) | မှတ်ချက်
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for this transaction..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedUserId || !amount || amountNum <= 0}
            className={`flex-1 px-6 py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              !selectedUserId || !amount || amountNum <= 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : transferType === 'deposit'
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg'
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            Confirm {transferType === 'deposit' ? 'Deposit' : 'Withdrawal'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
