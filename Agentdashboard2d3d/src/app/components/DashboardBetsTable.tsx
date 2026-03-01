import { motion } from 'motion/react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface DashboardBet {
  id: string;
  playerName: string;
  gameType: '2D' | '3D';
  betNumber: string;
  amount: number;
  round: string;
  time: string;
  status: 'Won' | 'Lost' | 'Pending';
}

interface DashboardBetsTableProps {
  bets: DashboardBet[];
}

export function DashboardBetsTable({ bets }: DashboardBetsTableProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Won':
        return {
          icon: CheckCircle,
          className: 'bg-green-100 text-green-700 border-green-300',
        };
      case 'Lost':
        return {
          icon: XCircle,
          className: 'bg-red-100 text-red-700 border-red-300',
        };
      case 'Pending':
        return {
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        };
      default:
        return {
          icon: Clock,
          className: 'bg-gray-100 text-gray-700 border-gray-300',
        };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2563EB] to-[#1E40AF] p-5">
        <h2 className="text-2xl font-bold text-white">Recent Bets</h2>
        <p className="text-sm text-white/80 mt-1">Latest betting activity across all players</p>
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
                Game Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Bet Number
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Round
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bets.map((bet, index) => {
              const statusConfig = getStatusConfig(bet.status);
              const StatusIcon = statusConfig.icon;

              return (
                <motion.tr
                  key={bet.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-blue-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {bet.playerName.split(' ').map((n) => n[0]).join('')}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-800">{bet.playerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                        bet.gameType === '2D'
                          ? 'bg-blue-100 text-blue-700 border-blue-300'
                          : 'bg-purple-100 text-purple-700 border-purple-300'
                      }`}
                    >
                      {bet.gameType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-2xl font-bold text-blue-600">{bet.betNumber}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-bold text-gray-800">{bet.amount.toLocaleString()} MMK</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600 font-medium">{bet.round}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{bet.time}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.className}`}>
                      <StatusIcon className="w-4 h-4" />
                      {bet.status}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
