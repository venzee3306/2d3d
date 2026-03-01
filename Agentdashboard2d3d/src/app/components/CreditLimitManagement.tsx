import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Edit2, Save, X, AlertCircle, TrendingUp, DollarSign, User } from 'lucide-react';
import { UserWallet, CreditLimitSetting } from '../types/ledger';

interface CreditLimitManagementProps {
  users: UserWallet[];
  currentUserId: string;
  currentUserName: string;
  onSetCreditLimit: (userId: string, newLimit: number, reason?: string) => void;
  onClose?: () => void;
}

export function CreditLimitManagement({ 
  users, 
  currentUserId, 
  currentUserName,
  onSetCreditLimit,
  onClose 
}: CreditLimitManagementProps) {
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState<number>(0);
  const [reason, setReason] = useState<string>('');

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) {
      return '0';
    }
    return amount.toLocaleString('en-US');
  };

  const handleEdit = (user: UserWallet) => {
    setEditingUserId(user.userId);
    setNewLimit(user.creditLimit);
    setReason('');
  };

  const handleSave = (userId: string) => {
    if (newLimit < 0) {
      alert('Credit limit cannot be negative');
      return;
    }
    onSetCreditLimit(userId, newLimit, reason);
    setEditingUserId(null);
    setNewLimit(0);
    setReason('');
  };

  const handleCancel = () => {
    setEditingUserId(null);
    setNewLimit(0);
    setReason('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Credit Limit Management</h2>
            <p className="text-sm text-indigo-100">Set trust-based credit for Masters</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Info Banner */}
      <div className="mx-6 mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">About Credit Limits</p>
            <p className="text-blue-700">
              Credit limits allow Masters to go into negative balance up to a specified amount. 
              This enables trust-based transactions while maintaining financial control.
            </p>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="p-6 space-y-4">
        {users.map((user) => (
          <motion.div
            key={user.userId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-5 border-2 border-gray-200 hover:border-indigo-300 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{user.userName}</h3>
                  <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                </div>
              </div>
              
              {editingUserId !== user.userId && (
                <button
                  onClick={() => handleEdit(user)}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all font-semibold text-sm flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Limit
                </button>
              )}
            </div>

            {/* Balance Info */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-gray-600">Available</p>
                </div>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(user.availableBalance)}</p>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <p className="text-xs text-gray-600">Credit Limit</p>
                </div>
                <p className={`text-lg font-bold ${editingUserId === user.userId ? 'text-indigo-600' : 'text-gray-900'}`}>
                  {formatCurrency(editingUserId === user.userId ? newLimit : user.creditLimit)}
                </p>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <p className="text-xs text-gray-600">Total Credit</p>
                </div>
                <p className="text-lg font-bold text-blue-900">
                  {formatCurrency(editingUserId === user.userId 
                    ? user.availableBalance + newLimit 
                    : user.totalCredit)}
                </p>
              </div>
            </div>

            {/* Edit Form */}
            <AnimatePresence>
              {editingUserId === user.userId && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 pt-4 border-t-2 border-indigo-200"
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Credit Limit (MMK)
                    </label>
                    <input
                      type="number"
                      value={newLimit}
                      onChange={(e) => setNewLimit(Number(e.target.value))}
                      min="0"
                      step="10000"
                      className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-lg font-semibold"
                      placeholder="Enter credit limit"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Reason (Optional)
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                      placeholder="Why are you changing the credit limit?"
                    />
                  </div>

                  {/* Preview */}
                  <div className="bg-indigo-50 rounded-lg p-4 border-2 border-indigo-200">
                    <p className="text-xs text-indigo-600 font-semibold mb-2">PREVIEW</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Available Balance:</span>
                        <span className="font-bold text-gray-900">{formatCurrency(user.availableBalance)} MMK</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">New Credit Limit:</span>
                        <span className="font-bold text-indigo-700">+{formatCurrency(newLimit)} MMK</span>
                      </div>
                      <div className="h-px bg-indigo-300 my-2"></div>
                      <div className="flex justify-between">
                        <span className="font-bold text-indigo-900">Total Available Credit:</span>
                        <span className="font-bold text-indigo-900 text-lg">{formatCurrency(user.availableBalance + newLimit)} MMK</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSave(user.userId)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl hover:from-indigo-700 hover:to-purple-800 transition-all font-semibold shadow-lg flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Credit Limit
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Current Status (when not editing) */}
            {editingUserId !== user.userId && (
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Can spend up to: <span className="font-bold text-green-700">{formatCurrency(user.totalCredit)} MMK</span>
                  </span>
                  {user.creditLimit > 0 && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                      Credit Enabled
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {users.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No users found</p>
            <p className="text-gray-400 text-sm mt-1">Masters will appear here for credit limit management</p>
          </div>
        )}
      </div>
    </div>
  );
}
