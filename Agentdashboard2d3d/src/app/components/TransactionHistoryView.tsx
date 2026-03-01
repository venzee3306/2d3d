import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Clock, User, DollarSign, FileText, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useMemo } from 'react';

export interface Transaction {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
  type: 'deposit' | 'withdraw';
  timestamp: string;
  note?: string;
  newBalance: number;
}

interface TransactionHistoryViewProps {
  transactions: Transaction[];
  currentUserId: string;
  onBack: () => void;
}

export function TransactionHistoryView({ transactions, currentUserId, onBack }: TransactionHistoryViewProps) {
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdraw'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(t => 
      t.fromUserId === currentUserId || t.toUserId === currentUserId
    );

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.fromUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.toUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.note?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [transactions, currentUserId, filterType, searchQuery]);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const isIncoming = (transaction: Transaction) => {
    return transaction.toUserId === currentUserId;
  };

  const totalIn = useMemo(() => {
    return filteredTransactions
      .filter(t => isIncoming(t))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalOut = useMemo(() => {
    return filteredTransactions
      .filter(t => !isIncoming(t))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Transaction History</h1>
            <p className="text-sm text-blue-100">ငွေလွှဲမှတ်တမ်း | မှတ်တမ်း</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-300" />
              <span className="text-sm text-blue-100">Total In | သွင်း</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalIn.toLocaleString()}</p>
            <p className="text-xs text-blue-200">MMK</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-red-300" />
              <span className="text-sm text-blue-100">Total Out | ထုတ်</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalOut.toLocaleString()}</p>
            <p className="text-xs text-blue-200">MMK</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-bold text-gray-700">Filter Transactions:</span>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              filterType === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('deposit')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              filterType === 'deposit'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Deposits
          </button>
          <button
            onClick={() => setFilterType('withdraw')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              filterType === 'withdraw'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            Withdrawals
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by user name or note..."
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900"
        />
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((transaction, index) => {
              const incoming = isIncoming(transaction);
              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-xl shadow-md border-2 overflow-hidden ${
                    incoming ? 'border-green-200' : 'border-red-200'
                  }`}
                >
                  {/* Transaction Header */}
                  <div className={`px-4 py-3 flex items-center justify-between ${
                    incoming 
                      ? 'bg-gradient-to-r from-green-50 to-green-100' 
                      : 'bg-gradient-to-r from-red-50 to-red-100'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        incoming ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {incoming ? (
                          <TrendingUp className="w-5 h-5 text-white" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${
                          incoming ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {incoming ? 'Received' : 'Sent'} | {incoming ? 'သွင်းငွေ' : 'ထုတ်ငွေ'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        incoming ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {incoming ? '+' : '-'}{transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">MMK</p>
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="px-4 py-3 space-y-2">
                    {/* From/To */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">From:</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{transaction.fromUserName}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">To:</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{transaction.toUserName}</span>
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-600">{formatDate(transaction.timestamp)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-600">{formatTime(transaction.timestamp)}</span>
                      </div>
                    </div>

                    {/* Note */}
                    {transaction.note && (
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="text-xs text-gray-600 block mb-1">Note:</span>
                            <p className="text-sm text-gray-900">{transaction.note}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* New Balance */}
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Balance After:</span>
                        <span className="text-sm font-bold text-blue-600">{transaction.newBalance.toLocaleString()} MMK</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <DollarSign className="w-20 h-20 text-gray-300 mb-4" />
            <p className="text-lg font-bold text-gray-900 mb-2">No Transactions Found</p>
            <p className="text-sm text-gray-500 text-center max-w-md">
              {searchQuery || filterType !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'No transaction history available yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
