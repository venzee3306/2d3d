import { Plus, Minus, DollarSign, TrendingUp, Users, Wallet, History } from 'lucide-react';
import { motion } from 'motion/react';

interface User {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'master' | 'agent';
  parentId?: string;
}

interface WalletDashboardProps {
  currentUser: User;
  users: User[];
  userBalances: { [userId: string]: number };
  onQuickDeposit: (userId: string) => void;
  onQuickWithdraw: (userId: string) => void;
  onViewHistory: () => void;
}

export function WalletDashboard({ currentUser, users, userBalances, onQuickDeposit, onQuickWithdraw, onViewHistory }: WalletDashboardProps) {
  // Get eligible users based on current user role
  const getEligibleUsers = () => {
    if (currentUser.role === 'admin') {
      return users.filter(u => u.role === 'master');
    } else if (currentUser.role === 'master') {
      return users.filter(u => u.role === 'agent' && u.parentId === currentUser.id);
    }
    return [];
  };

  const eligibleUsers = getEligibleUsers();
  const currentBalance = userBalances[currentUser.id] || 0;

  // Calculate total allocated balance
  const totalAllocated = eligibleUsers.reduce((sum, user) => sum + (userBalances[user.id] || 0), 0);

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: 'Admin',
      master: 'Master',
      agent: 'Agent'
    };
    return labels[role as keyof typeof labels];
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      master: 'bg-blue-100 text-blue-700',
      agent: 'bg-purple-100 text-purple-700'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Global Balance Header */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Your Wallet Balance</h2>
              <p className="text-sm text-blue-100">သင့်ပိုက်ဆံအိတ် လက်ကျန်ငွေ</p>
            </div>
          </div>
          <button
            onClick={onViewHistory}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all flex items-center gap-2 text-white font-medium"
          >
            <History className="w-4 h-4" />
            History
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Available Balance */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-300" />
              <span className="text-sm text-blue-100">Available Balance</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{currentBalance.toLocaleString()}</p>
            <p className="text-xs text-blue-200">MMK Units</p>
          </div>

          {/* Total Allocated */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-yellow-300" />
              <span className="text-sm text-blue-100">Total Allocated</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{totalAllocated.toLocaleString()}</p>
            <p className="text-xs text-blue-200">To {eligibleUsers.length} {currentUser.role === 'admin' ? 'Masters' : 'Agents'}</p>
          </div>
        </div>
      </div>

      {/* User List with Balances */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {currentUser.role === 'admin' ? 'Masters' : 'Agents'} Wallet Management
              </h3>
              <p className="text-sm text-gray-500">Manage balances and transfers</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {eligibleUsers.length > 0 ? (
            eligibleUsers.map((user, index) => {
              const balance = userBalances[user.id] || 0;
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    {/* User Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-base font-bold text-gray-900">{user.name}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getRoleBadgeColor(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                      </div>
                    </div>

                    {/* Balance Display */}
                    <div className="flex items-center gap-4">
                      <div className="text-right mr-4">
                        <p className="text-xs text-gray-500 mb-0.5">Balance</p>
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-blue-600" />
                          <p className="text-xl font-bold text-blue-600">{balance.toLocaleString()}</p>
                        </div>
                        <p className="text-xs text-gray-400">MMK</p>
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => onQuickDeposit(user.id)}
                          className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg flex items-center justify-center transition-all shadow-md hover:shadow-lg active:scale-95"
                          title="Deposit Units"
                        >
                          <Plus className="w-5 h-5 text-white" />
                        </button>
                        <button
                          onClick={() => onQuickWithdraw(user.id)}
                          className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg flex items-center justify-center transition-all shadow-md hover:shadow-lg active:scale-95"
                          title="Withdraw Units"
                        >
                          <Minus className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="px-6 py-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-bold text-gray-900 mb-1">
                No {currentUser.role === 'admin' ? 'Masters' : 'Agents'} Found
              </p>
              <p className="text-sm text-gray-500">
                {currentUser.role === 'admin' 
                  ? 'Create masters to start managing their wallets'
                  : 'Create agents under your account to manage their wallets'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
