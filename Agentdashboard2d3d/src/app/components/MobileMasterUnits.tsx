import { useState } from 'react';
import { ArrowLeft, Wallet, Users, Plus, Minus, ArrowUpCircle, ArrowDownCircle, History, Search, X, DollarSign, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'master' | 'agent';
  parentId?: string;
}

interface Transaction {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
  type: 'deposit' | 'withdraw';
  timestamp: string;
  note?: string;
  newBalance: number;
}

interface MobileMasterUnitsProps {
  onBack: () => void;
  currentUser: User;
  allUsers: User[];
  userBalances: { [userId: string]: number };
  transactions: Transaction[];
  onTransfer: (toUserId: string, amount: number, type: 'deposit' | 'withdraw', note?: string) => void;
}

export function MobileMasterUnits({
  onBack,
  currentUser,
  allUsers,
  userBalances,
  transactions,
  onTransfer
}: MobileMasterUnitsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferType, setTransferType] = useState<'deposit' | 'withdraw'>('deposit');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const myAgents = allUsers.filter(u => u.role === 'agent' && u.parentId === currentUser.id);
  const currentBalance = userBalances[currentUser.id] || 0;
  const totalAllocated = myAgents.reduce((sum, agent) => sum + (userBalances[agent.id] || 0), 0);

  const filteredAgents = myAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const myTransactions = transactions.filter(
    t => t.fromUserId === currentUser.id || t.toUserId === currentUser.id
  );

  const formatCurrency = (amount: number) => amount.toLocaleString('en-US');

  const handleOpenTransfer = (agentId: string, type: 'deposit' | 'withdraw') => {
    setSelectedAgentId(agentId);
    setTransferType(type);
    setTransferAmount('');
    setTransferNote('');
    setShowTransferModal(true);
  };

  const handleSubmitTransfer = () => {
    const amount = parseInt(transferAmount);
    if (!amount || amount <= 0 || !selectedAgentId) return;
    onTransfer(selectedAgentId, amount, transferType, transferNote || undefined);
    setShowTransferModal(false);
    setTransferAmount('');
    setTransferNote('');
  };

  const selectedAgent = allUsers.find(u => u.id === selectedAgentId);

  if (showHistory) {
    return (
      <div className="w-full max-w-[375px] h-screen bg-[#F5F7FA] flex flex-col mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-20">
          <button onClick={() => setShowHistory(false)} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold">Transaction History</h1>
            <p className="text-xs text-blue-200" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              ငွေလွှဲမှတ်တမ်း
            </p>
          </div>
        </div>

        {/* Transaction List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {myTransactions.length > 0 ? (
            myTransactions.map((tx) => {
              const isOutgoing = tx.fromUserId === currentUser.id;
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-3 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isOutgoing ? 'bg-red-100' : 'bg-green-100'}`}>
                        {isOutgoing ? (
                          <ArrowUpCircle className="w-4 h-4 text-red-600" />
                        ) : (
                          <ArrowDownCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {isOutgoing ? `To: ${tx.toUserName}` : `From: ${tx.fromUserName}`}
                        </p>
                        <p className="text-xs text-gray-500">{tx.type === 'deposit' ? 'Deposit' : 'Withdraw'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${isOutgoing ? 'text-red-600' : 'text-green-600'}`}>
                        {isOutgoing ? '-' : '+'}{formatCurrency(tx.amount)} MMK
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {tx.note && (
                    <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-2 py-1">{tx.note}</p>
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-500">No transactions yet</p>
              <p className="text-xs text-gray-400" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                ငွေလွှဲမှတ်တမ်းမရှိသေးပါ
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[375px] h-screen bg-[#F5F7FA] flex flex-col mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={onBack} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold">Units Management</h1>
          <p className="text-xs text-blue-200" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
            ယူနစ်စီမံခန့်ခွဲမှု
          </p>
        </div>
        <button
          onClick={() => setShowHistory(true)}
          className="p-2 bg-white/20 rounded-lg"
        >
          <History className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Wallet Balance Card */}
        <div className="mx-4 mt-4 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">My Wallet</h2>
              <p className="text-[10px] text-blue-200" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                ပိုက်ဆံအိတ်လက်ကျန်
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
              <div className="flex items-center gap-1 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-green-300" />
                <span className="text-[10px] text-blue-100">Available</span>
              </div>
              <p className="text-xl font-bold text-white">{formatCurrency(currentBalance)}</p>
              <p className="text-[10px] text-blue-200">MMK</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-yellow-300" />
                <span className="text-[10px] text-blue-100">Allocated</span>
              </div>
              <p className="text-xl font-bold text-white">{formatCurrency(totalAllocated)}</p>
              <p className="text-[10px] text-blue-200">To {myAgents.length} Agents</p>
            </div>
          </div>
        </div>

        {/* Agents Section */}
        <div className="mx-4 mt-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900">Agent Wallets</h3>
              <span className="text-xs text-gray-500" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                (အေးဂျင့်ပိုက်ဆံအိတ်များ)
              </span>
            </div>
          </div>

          {/* Search */}
          {myAgents.length > 3 && (
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agents..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Agent List */}
          <div className="space-y-2">
            {filteredAgents.length > 0 ? (
              filteredAgents.map((agent, index) => {
                const balance = userBalances[agent.id] || 0;
                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl p-3 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                          {agent.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-bold text-gray-900 truncate">{agent.name}</p>
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                              Agent
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">@{agent.username}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right mr-1">
                          <p className="text-xs text-gray-500">Balance</p>
                          <p className="text-sm font-bold text-blue-600">{formatCurrency(balance)}</p>
                          <p className="text-[10px] text-gray-400">MMK</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleOpenTransfer(agent.id, 'deposit')}
                            className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg flex items-center justify-center transition-all shadow-sm active:scale-95"
                            title="Deposit"
                          >
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={() => handleOpenTransfer(agent.id, 'withdraw')}
                            className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg flex items-center justify-center transition-all shadow-sm active:scale-95"
                            title="Withdraw"
                          >
                            <Minus className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-500">
                  {searchQuery ? 'No agents found' : 'No Agents Yet'}
                </p>
                <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                  {searchQuery ? 'ရှာဖွေမှုနှင့်ကိုက်ညီမှုမရှိပါ' : 'အေးဂျင့်များမရှိသေးပါ'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      <AnimatePresence>
        {showTransferModal && (
          <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-[375px] bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    {transferType === 'deposit' ? 'Deposit Units' : 'Withdraw Units'}
                  </h3>
                  <button
                    onClick={() => setShowTransferModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                {selectedAgent && (
                  <p className="text-sm text-gray-500 mt-1">
                    {transferType === 'deposit' ? 'To' : 'From'}: <span className="font-bold text-gray-700">{selectedAgent.name}</span>
                  </p>
                )}
              </div>

              <div className="p-4 space-y-4">
                {/* Current Balances Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xs text-blue-600 mb-1">Your Balance</p>
                    <p className="text-lg font-bold text-blue-700">{formatCurrency(currentBalance)}</p>
                    <p className="text-[10px] text-blue-500">MMK</p>
                  </div>
                  {selectedAgent && (
                    <div className="bg-purple-50 rounded-xl p-3">
                      <p className="text-xs text-purple-600 mb-1">{selectedAgent.name}'s Balance</p>
                      <p className="text-lg font-bold text-purple-700">{formatCurrency(userBalances[selectedAgent.id] || 0)}</p>
                      <p className="text-[10px] text-purple-500">MMK</p>
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Amount (MMK) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {/* Quick amount buttons */}
                  <div className="flex gap-2 mt-2">
                    {[50000, 100000, 500000].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setTransferAmount(String(amt))}
                        className="flex-1 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        {formatCurrency(amt)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Note (Optional)</label>
                  <textarea
                    value={transferNote}
                    onChange={(e) => setTransferNote(e.target.value)}
                    placeholder="Add a note..."
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmitTransfer}
                  disabled={!transferAmount || parseInt(transferAmount) <= 0}
                  className={`w-full py-3 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 ${
                    transferType === 'deposit'
                      ? 'bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white'
                      : 'bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white'
                  } disabled:cursor-not-allowed`}
                >
                  {transferType === 'deposit' ? (
                    <ArrowDownCircle className="w-4 h-4" />
                  ) : (
                    <ArrowUpCircle className="w-4 h-4" />
                  )}
                  {transferType === 'deposit' ? 'Deposit Units' : 'Withdraw Units'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
