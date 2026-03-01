import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, ArrowRight, CheckCircle, AlertCircle, User } from 'lucide-react';

interface QuickTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transfer: {
    recipientId: string;
    amount: number;
    note?: string;
  }) => void;
  availableAgents: Array<{ id: string; name: string; username: string }>;
  currentBalance: number;
  userRole: 'admin' | 'master';
}

export function QuickTransferModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  availableAgents,
  currentBalance,
  userRole
}: QuickTransferModalProps) {
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = availableAgents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedAgent = availableAgents.find(a => a.id === selectedRecipient);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedRecipient) {
      newErrors.recipient = 'Please select a recipient';
    }
    
    const amountNum = parseFloat(amount);
    if (!amount || amountNum <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (amountNum > currentBalance) {
      newErrors.amount = `Amount exceeds available balance (${currentBalance.toLocaleString()} Units)`;
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
      recipientId: selectedRecipient,
      amount: parseFloat(amount),
      note: note || undefined,
    });
    
    setIsSubmitting(false);
    handleReset();
  };

  const handleReset = () => {
    setSelectedRecipient('');
    setAmount('');
    setNote('');
    setSearchQuery('');
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
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Zap className="w-7 h-7" />
                Quick Transfer
              </h2>
              <p className="text-purple-100 text-sm mt-1" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                တိုက်ရိုက်လွှဲပါ
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
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 flex items-start gap-3">
              <Zap className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-purple-900">Direct Unit Transfer</p>
                <p className="text-xs text-purple-700 mt-1">
                  Instantly transfer units to your {userRole === 'admin' ? 'Masters' : 'Agents'} without a formal request. Units will be deducted immediately.
                </p>
              </div>
            </div>

            {/* Balance Display */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-blue-700">Your Available Balance</span>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-900">{currentBalance.toLocaleString()}</p>
                  <p className="text-sm text-blue-600">Units</p>
                </div>
              </div>
            </div>

            {/* Recipient Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Select Recipient <span className="text-red-500">*</span>
              </label>
              
              {/* Search */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${userRole === 'admin' ? 'Masters' : 'Agents'}...`}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl mb-3 focus:border-purple-500"
              />

              {/* Agent List */}
              <div className="max-h-64 overflow-y-auto space-y-2 border-2 border-gray-200 rounded-xl p-3">
                {filteredAgents.length > 0 ? (
                  filteredAgents.map(agent => (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => setSelectedRecipient(agent.id)}
                      className={`w-full p-4 border-2 rounded-xl transition-all text-left ${
                        selectedRecipient === agent.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-300 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {agent.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{agent.name}</p>
                          <p className="text-xs text-gray-500">@{agent.username}</p>
                        </div>
                        {selectedRecipient === agent.id && (
                          <CheckCircle className="w-5 h-5 text-purple-600 ml-auto" />
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No {userRole === 'admin' ? 'Masters' : 'Agents'} found</p>
                  </div>
                )}
              </div>
              
              {errors.recipient && (
                <p className="text-sm text-red-600 mt-1.5 ml-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.recipient}
                </p>
              )}
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Transfer Amount <span className="text-red-500">*</span>
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
                      : 'border-gray-300 focus:border-purple-500'
                  }`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                  Units
                </div>
              </div>
              {amount && parseFloat(amount) > 0 && (
                <p className="text-sm text-gray-600 mt-1.5 ml-1">
                  ≈ {parseFloat(amount).toLocaleString()} MMK will be transferred
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
                {[10000, 50000, 100000, 200000].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    type="button"
                    onClick={() => setAmount(quickAmount.toString())}
                    disabled={quickAmount > currentBalance}
                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-purple-100 border border-gray-300 hover:border-purple-400 rounded-lg text-sm font-semibold text-gray-700 hover:text-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {(quickAmount / 1000).toFixed(0)}K
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Note (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note for this transfer..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 resize-none"
              />
            </div>

            {/* Transfer Preview */}
            {selectedAgent && amount && parseFloat(amount) > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-5"
              >
                <p className="text-sm font-bold text-purple-900 mb-3">Transfer Summary</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      You
                    </div>
                    <div>
                      <p className="text-xs text-purple-600 font-semibold">From</p>
                      <p className="text-sm font-bold text-purple-900">{userRole === 'admin' ? 'Admin' : 'Master'}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <ArrowRight className="w-6 h-6 text-purple-600 mb-1" />
                    <div className="px-3 py-1 bg-purple-600 rounded-full">
                      <p className="text-xs font-bold text-white">{parseFloat(amount).toLocaleString()} Units</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-xs text-purple-600 font-semibold text-right">To</p>
                      <p className="text-sm font-bold text-purple-900 text-right">{selectedAgent.name}</p>
                    </div>
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {selectedAgent.name.charAt(0)}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
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
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Transferring...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Transfer Now</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
