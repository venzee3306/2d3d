import { motion } from 'motion/react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Bet {
  id: string;
  playerName: string;
  type: '2D' | '3D';
  number: string;
  amount: number;
  roundTime: string;
  status: 'Won' | 'Lost' | 'Pending';
}

interface RecentBetsTableProps {
  bets: Bet[];
}

export function RecentBetsTable({ bets }: RecentBetsTableProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Won':
        return {
          icon: CheckCircle,
          className: 'bg-green-100 text-green-700 border-green-300',
          iconColor: 'text-green-600',
        };
      case 'Lost':
        return {
          icon: XCircle,
          className: 'bg-red-100 text-red-700 border-red-300',
          iconColor: 'text-red-600',
        };
      case 'Pending':
        return {
          icon: AlertCircle,
          className: 'bg-yellow-100 text-yellow-700 border-yellow-300',
          iconColor: 'text-yellow-600',
        };
      default:
        return {
          icon: AlertCircle,
          className: 'bg-gray-100 text-gray-700 border-gray-300',
          iconColor: 'text-gray-600',
        };
    }
  };

  return (
    <div className="bg-white rounded-[15px] shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2563EB] to-[#1E40AF] p-5">
        <h2 className="text-2xl font-bold text-white">Recent Bets</h2>
        <p className="text-sm text-white/80 mt-1">View all recent betting activity</p>
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
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Number
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Round Time
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Clock className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No bets placed yet</p>
                    <p className="text-sm text-gray-400 mt-1">Start adding bets to see them here</p>
                  </div>
                </td>
              </tr>
            ) : (
              bets.map((bet, index) => {
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
                        <div>
                          <p className="font-bold text-gray-800">{bet.playerName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                          bet.type === '2D'
                            ? 'bg-blue-100 text-blue-700 border-blue-300'
                            : 'bg-purple-100 text-purple-700 border-purple-300'
                        }`}
                      >
                        {bet.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-2xl font-bold text-blue-600">{bet.number}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-gray-800">
                        {bet.amount.toLocaleString()} MMK
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{bet.roundTime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold border ${statusConfig.className}`}
                      >
                        <StatusIcon className={`w-4 h-4 ${statusConfig.iconColor}`} />
                        {bet.status}
                      </span>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {bets.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-bold">{bets.length}</span> recent bets
            </p>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-[15px] text-sm font-bold text-white transition-all shadow-md">
              View All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
