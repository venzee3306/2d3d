import { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Receipt, Shield, TrendingUp, Plus, Calendar, DollarSign } from 'lucide-react';
import { SettlementReportView } from '../components/SettlementReportView';
import { TransactionReceiptView } from '../components/TransactionReceiptView';
import { CreditLimitManagement } from '../components/CreditLimitManagement';
import { SettlementReport, TransactionReceipt, UserWallet } from '../types/ledger';

interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'master' | 'agent';
  parentId?: string;
}

interface LedgerSystemViewProps {
  currentUser: User;
  allUsers: User[];
}

export function LedgerSystemView({ currentUser, allUsers }: LedgerSystemViewProps) {
  const [activeView, setActiveView] = useState<'settlement' | 'receipt' | 'credit' | null>(null);
  
  // Mock data for demo
  const mockSettlementReport: SettlementReport = {
    id: 'SR-20240225-001',
    userId: 'master-1',
    userName: 'Ko Aung Aung',
    userRole: 'master',
    periodType: 'daily',
    startDate: '2024-02-25T00:00:00Z',
    endDate: '2024-02-25T23:59:59Z',
    totalIn: 5800000,
    totalOut: 2300000,
    commissionEarned: 580000,
    netSettlement: 4080000,
    depositCount: 45,
    withdrawalCount: 12,
    transferInCount: 28,
    transferOutCount: 8,
    openingBalance: 3250000,
    closingBalance: 7330000,
    balanceChange: 4080000,
    generatedAt: new Date().toISOString(),
    generatedBy: currentUser.id
  };

  const mockReceipt: TransactionReceipt = {
    id: 'TXN-20240225-456',
    receiptNumber: 'RCP-20240225-001',
    transactionType: 'deposit',
    amount: 500000,
    fromUserId: 'agent-1',
    fromUserName: 'Ko Zaw Zaw',
    fromUserRole: 'agent',
    toUserId: 'player-1',
    toUserName: 'Ma Su Su',
    toUserRole: 'player',
    previousBalance: 250000,
    newBalance: 750000,
    paymentMethod: 'KBZ Pay',
    transactionId: 'KBZ2024022512345',
    status: 'completed',
    timestamp: new Date().toISOString(),
    note: 'Player top-up for 2D betting'
  };

  const mockWallets: UserWallet[] = allUsers
    .filter(u => u.role === 'master')
    .map((master, index) => ({
      userId: master.id,
      userName: master.name,
      role: master.role,
      availableBalance: [3250000, 1890000, 4560000, 2100000][index % 4],
      creditLimit: [500000, 1000000, 750000, 0][index % 4],
      totalCredit: [3750000, 2890000, 5310000, 2100000][index % 4],
      totalDeposits: [15000000, 8900000, 22000000, 10500000][index % 4],
      totalWithdrawals: [11750000, 7010000, 17440000, 8400000][index % 4],
      totalCommission: [580000, 340000, 920000, 450000][index % 4],
      lockedBalance: 0,
      lastUpdated: new Date().toISOString()
    }));

  const handleSetCreditLimit = (userId: string, newLimit: number, reason?: string) => {
    console.log('Setting credit limit:', { userId, newLimit, reason });
    alert(`Credit limit updated to ${newLimit.toLocaleString()} MMK for user ${userId}`);
  };

  const handleShareReceipt = (method: 'viber' | 'messenger' | 'telegram' | 'whatsapp') => {
    console.log('Sharing receipt via:', method);
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) {
      return '0';
    }
    return amount.toLocaleString('en-US');
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hierarchical Ledger System</h1>
            <p className="text-gray-600 mt-1">Complete financial management for 2D/3D platform</p>
          </div>
          <div className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl font-semibold text-sm">
            <Shield className="w-4 h-4 inline mr-2" />
            {currentUser.role.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Feature Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            onClick={() => setActiveView('settlement')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 rounded-xl">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                View Report
              </span>
            </div>
            <h3 className="text-gray-900 font-bold mb-2">Settlement Report</h3>
            <p className="text-sm text-gray-600">Daily summary with Total In, Total Out, and Net Settlement</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            onClick={() => setActiveView('receipt')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <Receipt className="w-6 h-6 text-green-600" />
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                View Receipt
              </span>
            </div>
            <h3 className="text-gray-900 font-bold mb-2">Transaction Receipt</h3>
            <p className="text-sm text-gray-600">Auto-generated receipts shareable via social media</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            onClick={() => setActiveView('credit')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                Manage
              </span>
            </div>
            <h3 className="text-gray-900 font-bold mb-2">Credit Limits</h3>
            <p className="text-sm text-gray-600">Trust-based credit allowing negative balances</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-xl">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                Active
              </span>
            </div>
            <h3 className="text-gray-900 font-bold mb-2">Balance Shield</h3>
            <p className="text-sm text-gray-600">Auto-deduction when depositing to agents</p>
          </motion.div>
        </div>

        {/* Master Wallets Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
        >
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Master Wallets Overview</h2>
              <p className="text-sm text-gray-600 mt-1">Real-time balance and credit status</p>
            </div>
            <DollarSign className="w-6 h-6 text-indigo-600" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Master</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Available Balance</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Credit Limit</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Credit</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Deposits</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockWallets.map((wallet, index) => (
                  <motion.tr
                    key={wallet.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {wallet.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{wallet.userName}</p>
                          <p className="text-xs text-gray-500 capitalize">{wallet.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900 font-bold">{formatCurrency(wallet.availableBalance)} MMK</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        wallet.creditLimit > 0 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {wallet.creditLimit > 0 ? `+${formatCurrency(wallet.creditLimit)}` : 'None'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-blue-700 font-bold">{formatCurrency(wallet.totalCredit)} MMK</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-green-700 font-semibold">{formatCurrency(wallet.totalDeposits)} MMK</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* System Features Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Balance Shield Active</h3>
            </div>
            <p className="text-gray-600 mb-4">Master balances automatically decrease when depositing units to agents, ensuring accurate tracking.</p>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">How it works:</p>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Master deposits 500K to Agent A</li>
                <li>• Master's balance: 3M → 2.5M</li>
                <li>• Agent A's balance: 1M → 1.5M</li>
                <li>• Transaction logged and verified</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Settlement Calculation</h3>
            </div>
            <p className="text-gray-600 mb-4">Automatic daily summaries showing complete financial picture.</p>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-purple-900 mb-2">Formula:</p>
              <div className="space-y-1 text-sm text-purple-700 font-mono">
                <div className="flex justify-between">
                  <span>Total In (Deposits)</span>
                  <span>+5,800,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Out (Withdrawals)</span>
                  <span>-2,300,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Commission</span>
                  <span>+580,000</span>
                </div>
                <div className="h-px bg-purple-300 my-2"></div>
                <div className="flex justify-between font-bold text-purple-900">
                  <span>Net Settlement</span>
                  <span>=  4,080,000 MMK</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      {activeView === 'settlement' && (
        <SettlementReportView
          report={mockSettlementReport}
          onClose={() => setActiveView(null)}
        />
      )}

      {activeView === 'receipt' && (
        <TransactionReceiptView
          receipt={mockReceipt}
          onClose={() => setActiveView(null)}
          onShare={handleShareReceipt}
        />
      )}

      {activeView === 'credit' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto hide-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <CreditLimitManagement
              users={mockWallets}
              currentUserId={currentUser.id}
              currentUserName={currentUser.name}
              onSetCreditLimit={handleSetCreditLimit}
              onClose={() => setActiveView(null)}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
