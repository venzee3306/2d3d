import { useState } from 'react';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Users, Search, Plus, ArrowUpCircle, ArrowDownCircle, History } from 'lucide-react';
import { motion } from 'motion/react';

interface User {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'master' | 'agent';
  parentId?: string;
}

interface MobileAdminUnitsProps {
  onBack: () => void;
  currentUser: User;
  allUsers: User[];
  userBalances: { [userId: string]: number };
  onCreateUnits?: (amount: number) => void;
}

export function MobileAdminUnits({
  onBack,
  currentUser,
  allUsers,
  userBalances,
  onCreateUnits = () => {}
}: MobileAdminUnitsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createAmount, setCreateAmount] = useState('');

  const masters = allUsers.filter(u => u.role === 'master');
  const agents = allUsers.filter(u => u.role === 'agent');

  const filteredMasters = masters.filter(master =>
    master.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    master.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminBalance = userBalances[currentUser.id] || 0;
  const totalDistributed = Object.entries(userBalances)
    .filter(([userId]) => userId !== currentUser.id)
    .reduce((sum, [, balance]) => sum + balance, 0);
  const totalSupply = adminBalance + totalDistributed;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US');
  };

  const handleCreateUnits = () => {
    const amount = parseInt(createAmount);
    if (amount > 0) {
      onCreateUnits(amount);
      setShowCreateModal(false);
      setCreateAmount('');
    }
  };

  return (
    <div className="w-full max-w-[375px] h-screen bg-[#F5F7FA] flex flex-col mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-4 shadow-lg flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Units Management</h1>
            <p className="text-xs text-purple-100">Monitor & distribute units</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-200" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 text-sm focus:outline-none focus:bg-white/30"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 hide-scrollbar">
        {/* Create Units Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create New Units
        </button>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-3">
          {/* Total Supply */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-white" />
                <span className="text-purple-100 text-sm font-medium">Total Supply</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {formatCurrency(totalSupply)}
            </div>
            <p className="text-purple-100 text-xs">MMK Units in Circulation</p>
          </motion.div>

          {/* Available Balance */}
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-gray-600 text-sm font-medium">Available Balance</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatCurrency(adminBalance)}
            </div>
            <p className="text-gray-500 text-xs">Your Units</p>
          </div>

          {/* Distributed */}
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-blue-600" />
                <span className="text-gray-600 text-sm font-medium">Distributed</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {formatCurrency(totalDistributed)}
            </div>
            <p className="text-gray-500 text-xs">Units with Masters & Agents</p>
          </div>
        </div>

        {/* Masters List with Balances */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">Masters Balance</h3>
            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
              {masters.length} Masters
            </span>
          </div>

          {filteredMasters.length === 0 ? (
            <div className="text-center py-6">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No masters found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMasters.map(master => {
                const balance = userBalances[master.id] || 0;
                const masterAgents = agents.filter(a => a.parentId === master.id);
                const agentBalances = masterAgents.reduce((sum, agent) => sum + (userBalances[agent.id] || 0), 0);

                return (
                  <div
                    key={master.id}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {master.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{master.name}</p>
                          <p className="text-xs text-gray-600">@{master.username}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{formatCurrency(balance)}</p>
                        <p className="text-xs text-gray-500">Available</p>
                      </div>
                    </div>

                    {/* Agent Distribution */}
                    {masterAgents.length > 0 && (
                      <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Users className="w-3.5 h-3.5" />
                          <span>{masterAgents.length} Agents</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">Distributed: </span>
                          <span className="font-semibold text-gray-700">{formatCurrency(agentBalances)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-md">
            <ArrowUpCircle className="w-5 h-5 text-green-600 mb-2" />
            <p className="text-xs text-gray-600 mb-1">Total Created</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalSupply)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <History className="w-5 h-5 text-purple-600 mb-2" />
            <p className="text-xs text-gray-600 mb-1">Active Users</p>
            <p className="text-xl font-bold text-gray-900">{masters.length + agents.length}</p>
          </div>
        </div>
      </div>

      {/* Create Units Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="bg-white rounded-t-3xl w-full max-w-[375px] shadow-2xl"
          >
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Create New Units</h3>
              <p className="text-xs text-gray-600 mt-1">Add units to your available balance</p>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Amount (MMK)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={createAmount}
                    onChange={(e) => setCreateAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-lg font-semibold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    Units
                  </span>
                </div>
                {createAmount && (
                  <p className="text-sm text-gray-600 mt-1.5 ml-1">
                    ≈ {parseInt(createAmount).toLocaleString()} MMK
                  </p>
                )}
              </div>

              {/* Current Balance Info */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-3">
                <p className="text-xs text-purple-700 mb-1">Current Available Balance</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(adminBalance)}</p>
                {createAmount && parseInt(createAmount) > 0 && (
                  <>
                    <div className="h-px bg-purple-300 my-2" />
                    <p className="text-xs text-purple-700 mb-1">New Balance After Creation</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(adminBalance + parseInt(createAmount))}
                    </p>
                  </>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateAmount('');
                  }}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUnits}
                  disabled={!createAmount || parseInt(createAmount) <= 0}
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Units
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
