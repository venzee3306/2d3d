import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Calendar, Clock, User, Filter } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';

interface Transaction {
  id: string;
  userId: string;
  type: 'transfer_in' | 'transfer_out' | 'deposit_approve' | 'deposit_request' | 'admin_create' | 'unit_deposit_approve' | 'withdrawal_approve';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  relatedUserId?: string;
  relatedUserName?: string;
  timestamp: string;
  note?: string;
}

interface MobileTransactionsProps {
  onBack: () => void;
  transactions: Transaction[];
  currentUserId: string;
  userRole: 'admin' | 'master' | 'agent';
}

export function MobileTransactions({ onBack, transactions, currentUserId, userRole }: MobileTransactionsProps) {
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');

  // Filter transactions for current user
  const userTransactions = transactions
    .filter(t => t.userId === currentUserId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Apply type filter
  const filteredTransactions = filterType === 'all' 
    ? userTransactions 
    : filterType === 'in'
    ? userTransactions.filter(t => t.type === 'transfer_in' || t.type === 'admin_create')
    : userTransactions.filter(t => t.type === 'transfer_out' || t.type === 'deposit_approve' || t.type === 'unit_deposit_approve' || t.type === 'withdrawal_approve');

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US');
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'transfer_in': return 'Received';
      case 'transfer_out': return 'Sent';
      case 'deposit_approve': return 'Deposit Approved';
      case 'deposit_request': return 'Deposit Request';
      case 'admin_create': return 'Created';
      case 'unit_deposit_approve': return 'Unit Approved';
      case 'withdrawal_approve': return 'Withdrawal';
      default: return type;
    }
  };

  const getTransactionColor = (type: string) => {
    if (type === 'transfer_in' || type === 'admin_create') {
      return 'text-green-600 bg-green-50';
    }
    return 'text-red-600 bg-red-50';
  };

  const getTransactionIcon = (type: string) => {
    if (type === 'transfer_in' || type === 'admin_create') {
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    }
    return <TrendingDown className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="w-full max-w-[375px] h-screen bg-[#F5F7FA] flex flex-col mx-auto relative overflow-hidden">
      {/* Header */}
      <div className={`${
        userRole === 'admin' ? 'bg-gradient-to-r from-purple-600 to-purple-700' :
        userRole === 'master' ? 'bg-gradient-to-r from-blue-600 to-blue-700' :
        'bg-gradient-to-r from-blue-600 to-blue-700'
      } px-4 py-4 shadow-lg flex-shrink-0`}>
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white flex-1 text-center mr-10">Transactions</h1>
        </div>

        {/* Filter Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-white text-blue-700'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('in')}
            className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'in'
                ? 'bg-white text-green-700'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Received
          </button>
          <button
            onClick={() => setFilterType('out')}
            className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'out'
                ? 'bg-white text-red-700'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Sent
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 hide-scrollbar">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">No transactions found</p>
            <p className="text-xs text-gray-400 mt-1">Your transactions will appear here</p>
          </div>
        ) : (
          filteredTransactions.map(transaction => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getTransactionColor(transaction.type)}`}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{getTransactionTypeLabel(transaction.type)}</p>
                    {transaction.relatedUserName && (
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {transaction.relatedUserName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    transaction.type === 'transfer_in' || transaction.type === 'admin_create'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {transaction.type === 'transfer_in' || transaction.type === 'admin_create' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500">MMK</p>
                </div>
              </div>

              {/* Balance Info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="text-gray-600">Before</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(transaction.balanceBefore)}</p>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div>
                    <p className="text-gray-600">After</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(transaction.balanceAfter)}</p>
                  </div>
                </div>
              </div>

              {/* Note */}
              {transaction.note && (
                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-1">Note</p>
                  <p className="text-xs text-gray-700 bg-blue-50 px-3 py-2 rounded-lg">{transaction.note}</p>
                </div>
              )}

              {/* Timestamp */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(transaction.timestamp)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(transaction.timestamp)}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
