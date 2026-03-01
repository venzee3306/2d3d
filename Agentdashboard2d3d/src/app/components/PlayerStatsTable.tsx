import { motion } from 'motion/react';
import { Trophy, TrendingUp } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  totalBets: number;
  totalWinnings: number;
  status: 'Active' | 'Inactive';
}

export function PlayerStatsTable() {
  const players: Player[] = [
    { id: 'P001', name: 'Aung Ko Ko', totalBets: 45, totalWinnings: 3200000, status: 'Active' },
    { id: 'P002', name: 'Su Su Hlaing', totalBets: 32, totalWinnings: 1850000, status: 'Active' },
    { id: 'P003', name: 'Kyaw Zin', totalBets: 67, totalWinnings: 5400000, status: 'Active' },
    { id: 'P004', name: 'Thidar Win', totalBets: 28, totalWinnings: 970000, status: 'Active' },
    { id: 'P005', name: 'Min Aung', totalBets: 41, totalWinnings: 2100000, status: 'Inactive' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-white" />
          <h3 className="text-xl font-bold text-white">Player Statistics</h3>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {players.map((player, index) => (
              <motion.tr
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-blue-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {player.name.split(' ').map((n) => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{player.name}</p>
                      <p className="text-xs text-gray-500">{player.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-800">{player.totalBets}</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-lg font-bold text-green-600">
                    {player.totalWinnings.toLocaleString()} MMK
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      player.status === 'Active'
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-100 text-gray-600 border border-gray-300'
                    }`}
                  >
                    {player.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
