import { useState } from 'react';
import { Wallet, Send, Plus, ArrowRight, Users as UsersIcon } from 'lucide-react';
import { motion } from 'motion/react'
;
import { TransferUnitModal } from '../components/TransferUnitModal';
import { CreateUnitsModal } from '../components/CreateUnitsModal';

interface User {
  id: string;
  name: string;
  role: 'admin' | 'master' | 'agent';
  parentId?: string;
}

interface Player {
  id: string;
  name: string;
  agentId?: string;
}

interface UnitsManagementProps {
  currentUser: User;
  currentBalance: number;
  allUsers: User[];
  allPlayers: Player[];
  onCreateUnits: (amount: number, note: string) => void;
  onTransferUnits: (recipientId: string, amount: number, note: string) => void;
  getUserBalance: (userId: string) => number;
}

export function UnitsManagement({
  currentUser,
  currentBalance,
  allUsers,
  allPlayers,
  onCreateUnits,
  onTransferUnits,
  getUserBalance
}: UnitsManagementProps) {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Get available recipients based on role
  const getAvailableRecipients = () => {
    if (currentUser.role === 'admin') {
      // Admin can transfer to Masters and Agents
      return allUsers.filter(u => u.role === 'master' || u.role === 'agent');
    } else if (currentUser.role === 'master') {
      // Master can transfer to Agents under them
      return allUsers.filter(u => u.role === 'agent' && u.parentId === currentUser.id);
    } else {
      // Agent can transfer to their Players
      return allPlayers.filter(p => p.agentId === currentUser.id).map(p => ({
        id: p.id,
        name: p.name,
        role: 'player' as const
      }));
    }
  };

  const availableRecipients = getAvailableRecipients();

  // Get subordinates with balances
  const getSubordinatesWithBalances = () => {
    if (currentUser.role === 'admin') {
      const masters = allUsers.filter(u => u.role === 'master');
      return masters.map(m => ({
        ...m,
        balance: getUserBalance(m.id),
        subordinates: allUsers.filter(u => u.role === 'agent' && u.parentId === m.id).length
      }));
    } else if (currentUser.role === 'master') {
      const agents = allUsers.filter(u => u.role === 'agent' && u.parentId === currentUser.id);
      return agents.map(a => ({
        ...a,
        balance: getUserBalance(a.id),
        subordinates: allPlayers.filter(p => p.agentId === a.id).length
      }));
    } else {
      const players = allPlayers.filter(p => p.agentId === currentUser.id);
      return players.map(p => ({
        id: p.id,
        name: p.name,
        role: 'player' as const,
        balance: getUserBalance(p.id),
        subordinates: 0
      }));
    }
  };

  const subordinates = getSubordinatesWithBalances();

  const handleTransfer = (recipientId: string, amount: number, note: string) => {
    onTransferUnits(recipientId, amount, note);
    setIsTransferModalOpen(false);
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'master':
        return 'from-blue-500 to-blue-700';
      case 'agent':
        return 'from-green-500 to-green-700';
      case 'player':
        return 'from-purple-500 to-purple-700';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ယူနစ် စီမံခန့်ခွဲမှု</h1>
          <p className="text-gray-600 mt-1">သင့်ယူနစ်လက်ကျန်နှင့် လွှဲပြောင်းမှုများ</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-purple-100 text-sm">လက်ရှိယူနစ်လက်ကျန်</p>
                <h2 className="text-4xl font-bold">{currentBalance.toLocaleString()}</h2>
              </div>
            </div>
            <div className="flex items-center gap-2 text-purple-100 text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span>အသက်ဝင်နေသည်</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            {currentUser.role === 'admin' && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur hover:bg-white/30 rounded-xl font-medium transition-all"
              >
                <Plus className="w-5 h-5" />
                ယူနစ်ဖန်တီး
              </button>
            )}
            <button
              onClick={() => setIsTransferModalOpen(true)}
              disabled={availableRecipients.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 hover:bg-purple-50 rounded-xl font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              လွှဲပြောင်းမည်
            </button>
          </div>
        </div>
      </div>

      {/* Subordinates List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <UsersIcon className="w-6 h-6 text-gray-600" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {currentUser.role === 'admin' ? 'မာစတာများ' : currentUser.role === 'master' ? 'အေးဂျင့်များ' : 'ကစားသမားများ'}
              </h3>
              <p className="text-sm text-gray-500">စုစုပေါင်း {subordinates.length} ခု</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {subordinates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subordinates.map((sub, index) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getRoleColor(sub.role)} flex items-center justify-center text-white font-bold text-sm`}>
                        {sub.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{sub.name}</h4>
                        <span className="text-xs text-gray-500">{getRoleLabel(sub.role)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">ယူနစ်လက်ကျန်</span>
                      <span className="text-lg font-bold text-gray-900">
                        {sub.balance.toLocaleString()}
                      </span>
                    </div>
                    
                    {sub.subordinates > 0 && (
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                          {currentUser.role === 'admin' ? 'အေးဂျင့်' : 'ကစားသမား'}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {sub.subordinates} ခု
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      // Pre-select this user in transfer modal
                      setIsTransferModalOpen(true);
                    }}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    လွှဲပြောင်းမည်
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {currentUser.role === 'admin' ? 'မာစတာ မရှိသေးပါ' : currentUser.role === 'master' ? 'အေးဂျင့် မရှိသေးပါ' : 'ကစားသမား မရှိသေးပါ'}
              </h4>
              <p className="text-sm text-gray-500">
                {currentUser.role === 'admin' ? 'Masters' : currentUser.role === 'master' ? 'Agents' : 'Players'} စာရင်းမှ ဖန်တီးနိုင်ပါသည်
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <TransferUnitModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        currentUser={currentUser}
        currentBalance={currentBalance}
        availableRecipients={availableRecipients}
        onTransfer={handleTransfer}
      />

      {currentUser.role === 'admin' && (
        <CreateUnitsModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          currentBalance={currentBalance}
          onCreateUnits={onCreateUnits}
        />
      )}
    </div>
  );
}
