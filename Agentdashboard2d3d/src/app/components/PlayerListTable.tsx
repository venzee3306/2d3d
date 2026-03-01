import { Search, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface Player {
  id: string;
  name: string;
  handle: string;
  totalBets: number;
  totalWinnings: number;
  status: 'ACTIVE' | 'INACTIVE';
  joinedDate: string;
}

export function PlayerListTable() {
  const [searchQuery, setSearchQuery] = useState('');

  const players: Player[] = [
    {
      id: 'P001',
      name: 'Mg Mg',
      handle: '@mgmg01',
      totalBets: 156,
      totalWinnings: 4500000,
      status: 'ACTIVE',
      joinedDate: 'Jan 15, 2026',
    },
    {
      id: 'P002',
      name: 'Aye Aye',
      handle: '@ayeaye22',
      totalBets: 203,
      totalWinnings: 6200000,
      status: 'ACTIVE',
      joinedDate: 'Jan 22, 2026',
    },
    {
      id: 'P003',
      name: 'Kyaw Kyaw',
      handle: '@kyaw99',
      totalBets: 98,
      totalWinnings: 2800000,
      status: 'ACTIVE',
      joinedDate: 'Feb 05, 2026',
    },
  ];

  const filteredPlayers = players.filter(
    (player) =>
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Search & Filter Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-white p-5 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search players..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl text-white font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export Data
          </motion.button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Player Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Total Bets
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Total Winnings
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Joined Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredPlayers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <p className="text-gray-500 font-medium">No players found</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
                </td>
              </tr>
            ) : (
              filteredPlayers.map((player, index) => (
                <motion.tr
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-blue-50 transition-colors"
                >
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {player.name.split(' ').map((n) => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-lg">{player.name}</p>
                        <p className="text-sm text-gray-500">{player.handle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="text-xl font-bold text-gray-800">{player.totalBets}</span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="text-xl font-bold text-green-600">
                      {player.totalWinnings.toLocaleString()} MMK
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border ${
                        player.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700 border-green-300'
                          : 'bg-red-100 text-red-700 border-red-300'
                      }`}
                    >
                      {player.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="text-sm text-gray-600 font-medium">{player.joinedDate}</span>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-bold">{filteredPlayers.length}</span> of{' '}
            <span className="font-bold">{players.length}</span> players
          </p>
        </div>
      </div>
    </div>
  );
}
