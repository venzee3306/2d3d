import { motion } from 'motion/react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useState } from 'react';

interface WithdrawalRequest {
  id: string;
  playerName: string;
  amount: number;
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

interface WithdrawalRequestsTableProps {
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function WithdrawalRequestsTable({ onApprove, onReject }: WithdrawalRequestsTableProps) {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  const requests: WithdrawalRequest[] = [
    {
      id: 'W001',
      playerName: 'Mg Mg',
      amount: 2500000,
      requestDate: 'Feb 13, 2026 10:30 AM',
      status: 'Pending',
    },
    {
      id: 'W002',
      playerName: 'Kyaw Kyaw',
      amount: 1800000,
      requestDate: 'Feb 12, 2026 03:45 PM',
      status: 'Approved',
    },
    {
      id: 'W003',
      playerName: 'Aye Aye',
      amount: 3200000,
      requestDate: 'Feb 11, 2026 09:15 AM',
      status: 'Approved',
    },
  ];

  const filteredRequests =
    activeFilter === 'All' ? requests : requests.filter((r) => r.status === activeFilter);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Pending':
        return {
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        };
      case 'Approved':
        return {
          icon: CheckCircle,
          className: 'bg-green-100 text-green-700 border-green-300',
        };
      case 'Rejected':
        return {
          icon: XCircle,
          className: 'bg-red-100 text-red-700 border-red-300',
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
      {/* Filter Tabs */}
      <div className="bg-gradient-to-r from-gray-50 to-white p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((filter) => (
            <motion.button
              key={filter}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeFilter === filter
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter}
            </motion.button>
          ))}
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
                Amount (MMK)
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Request Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <p className="text-gray-500 font-medium">No withdrawal requests found</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your filter</p>
                </td>
              </tr>
            ) : (
              filteredRequests.map((request, index) => {
                const statusConfig = getStatusConfig(request.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <motion.tr
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {request.playerName.split(' ').map((n) => n[0]).join('')}
                          </span>
                        </div>
                        <span className="font-bold text-gray-800 text-lg">{request.playerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="text-xl font-bold text-blue-600">
                        {request.amount.toLocaleString()} MMK
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="text-sm text-gray-600 font-medium">{request.requestDate}</span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${statusConfig.className}`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {request.status === 'Pending' ? (
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onApprove(request.id)}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl text-white font-bold shadow-md transition-all flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onReject(request.id)}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl text-white font-bold shadow-md transition-all flex items-center gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </motion.button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 italic">No actions</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-bold">{filteredRequests.length}</span> requests
          </p>
        </div>
      </div>
    </div>
  );
}
