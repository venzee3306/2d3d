import { CheckCircle, XCircle, Plus, ArrowLeft, LayoutDashboard, Calculator, Users, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface MobileManagementProps {
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onNavigate: (page: string) => void;
}

export function MobileManagement({ onApprove, onReject, onNavigate }: MobileManagementProps) {
  const [activeTab, setActiveTab] = useState<'players' | 'withdrawals'>('players');

  const players = [
    { id: 'P001', name: 'Mg Mg', status: 'Active', winnings: 4500000 },
    { id: 'P002', name: 'Aye Aye', status: 'Active', winnings: 6200000 },
    { id: 'P003', name: 'Kyaw Kyaw', status: 'Active', winnings: 2800000 },
  ];

  const withdrawals = [
    { id: 'W001', playerName: 'Mg Mg', amount: 2500000, status: 'Pending' },
    { id: 'W002', playerName: 'Kyaw Kyaw', amount: 1800000, status: 'Approved' },
    { id: 'W003', playerName: 'Aye Aye', amount: 3200000, status: 'Approved' },
  ];

  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'Pending');
  const otherWithdrawals = withdrawals.filter((w) => w.status !== 'Pending');

  return (
    <div className="w-full max-w-[375px] h-[812px] bg-[#F5F7FA] flex flex-col mx-auto overflow-hidden">
      {/* Header - 56px with Back Button */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 shadow-lg flex-shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">Management</h1>
        </div>
      </div>

      {/* Tab Switcher - 48px */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="grid grid-cols-2 h-12">
          <button
            onClick={() => setActiveTab('players')}
            className={`text-sm font-bold transition-colors relative ${
              activeTab === 'players' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            Players
            {activeTab === 'players' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`text-sm font-bold transition-colors relative ${
              activeTab === 'withdrawals' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            Withdrawals
            {activeTab === 'withdrawals' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t"
              />
            )}
          </button>
        </div>
      </div>

      {/* Content Area - Fills remaining space minus bottom nav */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-3 hide-scrollbar">
        {activeTab === 'players' ? (
          <div className="space-y-2">
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-3 shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {player.name.split(' ').map((n) => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-base font-bold text-gray-800">{player.name}</p>
                      <p className="text-xs text-gray-500">{player.id}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 border border-green-300 rounded-full text-xs font-bold">
                    {player.status}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600 font-medium">Total Winnings</p>
                  <p className="text-lg font-bold text-green-600">{(player.winnings / 1000000).toFixed(1)}M MMK</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Pending Withdrawals */}
            {pendingWithdrawals.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-700 mb-2">Pending Requests</h3>
                <div className="space-y-2">
                  {pendingWithdrawals.map((withdrawal, index) => (
                    <motion.div
                      key={withdrawal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl p-3 shadow-sm border-2 border-yellow-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-base font-bold text-gray-800">{withdrawal.playerName}</p>
                          <p className="text-xs text-gray-500">{withdrawal.id}</p>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-full text-xs font-bold">
                          Pending
                        </span>
                      </div>
                      <div className="mb-2">
                        <p className="text-xs text-gray-600 mb-0.5">Amount</p>
                        <p className="text-xl font-bold text-blue-600">{withdrawal.amount.toLocaleString()} MMK</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onApprove(withdrawal.id)}
                          className="h-[40px] bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white font-bold text-sm shadow-sm flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Approve
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onReject(withdrawal.id)}
                          className="h-[40px] bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white font-bold text-sm shadow-sm flex items-center justify-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          Reject
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Withdrawals */}
            {otherWithdrawals.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-700 mb-2">Recent History</h3>
                <div className="space-y-2">
                  {otherWithdrawals.map((withdrawal, index) => (
                    <motion.div
                      key={withdrawal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl p-3 shadow-sm border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-base font-bold text-gray-800">{withdrawal.playerName}</p>
                        <span className="px-2 py-1 bg-green-100 text-green-700 border border-green-300 rounded-full text-xs font-bold">
                          {withdrawal.status}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-gray-600">{withdrawal.amount.toLocaleString()} MMK</p>
                      <p className="text-xs text-gray-500 mt-1">No actions available</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Add Button (Only on Players Tab) */}
      {activeTab === 'players' && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-20 right-6 w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center z-10"
        >
          <Plus className="w-5 h-5 text-white" />
        </motion.button>
      )}

      {/* Bottom Navigation - 64px */}
      <div className="bg-white border-t border-gray-200 shadow-2xl flex-shrink-0">
        <div className="grid grid-cols-4 h-16">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('dashboard')}
            className="flex flex-col items-center justify-center gap-0.5 text-gray-500"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-medium">Dashboard</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('bet-entry')}
            className="flex flex-col items-center justify-center gap-0.5 text-gray-500"
          >
            <Calculator className="w-5 h-5" />
            <span className="text-[10px] font-medium">Bet Entry</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('players')}
            className="flex flex-col items-center justify-center gap-0.5 text-blue-600"
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-bold">Players</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('account')}
            className="flex flex-col items-center justify-center gap-0.5 text-gray-500"
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px] font-medium">Account</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
