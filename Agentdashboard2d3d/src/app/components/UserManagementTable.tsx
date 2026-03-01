import { Plus, Minus, MoreVertical, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface User {
  id: string;
  username: string;
  lastLogin: string;
  totalDeposit: number;
  currentBalance: number;
  status: 'active' | 'inactive';
  trend: 'up' | 'down';
}

export function UserManagementTable() {
  const [users] = useState<User[]>([
    {
      id: 'USR-001',
      username: 'player_dragon88',
      lastLogin: '2 mins ago',
      totalDeposit: 45000,
      currentBalance: 12450,
      status: 'active',
      trend: 'up',
    },
    {
      id: 'USR-002',
      username: 'lucky_seven',
      lastLogin: '15 mins ago',
      totalDeposit: 32000,
      currentBalance: 8900,
      status: 'active',
      trend: 'down',
    },
    {
      id: 'USR-003',
      username: 'golden_tiger',
      lastLogin: '1 hour ago',
      totalDeposit: 78500,
      currentBalance: 34200,
      status: 'active',
      trend: 'up',
    },
    {
      id: 'USR-004',
      username: 'ace_king',
      lastLogin: '3 hours ago',
      totalDeposit: 21000,
      currentBalance: 5600,
      status: 'inactive',
      trend: 'down',
    },
    {
      id: 'USR-005',
      username: 'royal_flush',
      lastLogin: '5 hours ago',
      totalDeposit: 96000,
      currentBalance: 45800,
      status: 'active',
      trend: 'up',
    },
    {
      id: 'USR-006',
      username: 'diamond_jack',
      lastLogin: '1 day ago',
      totalDeposit: 15000,
      currentBalance: 2300,
      status: 'inactive',
      trend: 'down',
    },
  ]);

  const handleAction = (userId: string, action: 'add' | 'remove') => {
    console.log(`${action} credits for user ${userId}`);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-[#1F1F1F] bg-[#0A0A0A]/50 backdrop-blur-xl">
      {/* Table Header */}
      <div className="bg-gradient-to-r from-[#1A1A1A] to-[#0F0F0F] p-4 border-b border-[#1F1F1F]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">User Management Ledger</h2>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search users..."
              className="px-4 py-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00D1FF] transition-colors"
            />
            <button className="px-4 py-2 bg-gradient-to-r from-[#00D1FF] to-[#0088CC] rounded-lg text-sm font-medium text-white hover:shadow-lg hover:shadow-[#00D1FF]/30 transition-all">
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1F1F1F]">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                User ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Total Deposit
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Current Balance
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-[#1F1F1F] hover:bg-[#1A1A1A]/50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-mono text-[#00D1FF]">{user.id}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white">{user.username}</span>
                    {user.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 text-[#00FF87]" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-[#FF4757]" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-400">{user.lastLogin}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-[#FFD700]">
                    ${user.totalDeposit.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-white">
                    ${user.currentBalance.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'active'
                        ? 'bg-[#00FF87]/20 text-[#00FF87] border border-[#00FF87]/30'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAction(user.id, 'add')}
                      className="p-2 bg-[#00D1FF]/20 border border-[#00D1FF]/30 rounded-lg hover:bg-[#00D1FF]/30 transition-colors group"
                      title="Add Credits"
                    >
                      <Plus className="w-4 h-4 text-[#00D1FF]" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAction(user.id, 'remove')}
                      className="p-2 bg-[#FF4757]/20 border border-[#FF4757]/30 rounded-lg hover:bg-[#FF4757]/30 transition-colors group"
                      title="Remove Credits"
                    >
                      <Minus className="w-4 h-4 text-[#FF4757]" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg hover:bg-[#3A3A3A] transition-colors"
                      title="More Options"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-gradient-to-r from-[#1A1A1A] to-[#0F0F0F] p-4 border-t border-[#1F1F1F]">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">Showing 1-6 of 142 users</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-sm text-gray-400 hover:bg-[#3A3A3A] transition-colors">
              Previous
            </button>
            <button className="px-3 py-1 bg-[#00D1FF] border border-[#00D1FF] rounded-lg text-sm text-white">
              1
            </button>
            <button className="px-3 py-1 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-sm text-gray-400 hover:bg-[#3A3A3A] transition-colors">
              2
            </button>
            <button className="px-3 py-1 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-sm text-gray-400 hover:bg-[#3A3A3A] transition-colors">
              3
            </button>
            <button className="px-3 py-1 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-sm text-gray-400 hover:bg-[#3A3A3A] transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
