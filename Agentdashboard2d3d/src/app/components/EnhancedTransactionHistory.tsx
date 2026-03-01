import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Clock, 
  CheckCircle,
  XCircle,
  Filter,
  Calendar,
  User,
  Download,
  Search,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import type { Transaction } from '../types/units';

interface EnhancedTransactionHistoryProps {
  transactions: Transaction[];
  currentUserId: string;
  currentUserName: string;
}

export function EnhancedTransactionHistory({ 
  transactions, 
  currentUserId,
  currentUserName 
}: EnhancedTransactionHistoryProps) {
  const [filterType, setFilterType] = useState<'all' | 'inflow' | 'outflow'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');

  // Filter transactions
  const filteredTransactions = transactions.filter(txn => {
    // Type filter
    const isInflowType = ['transfer_in', 'deposit_approve', 'unit_deposit_approve', 'withdrawal_request', 'admin_create'].includes(txn.type);
    const isOutflowType = ['transfer_out', 'deposit_request', 'unit_deposit_request', 'withdrawal_approve'].includes(txn.type);
    
    const matchesType = 
      filterType === 'all' ||
      (filterType === 'inflow' && isInflowType) ||
      (filterType === 'outflow' && isOutflowType);

    // Search filter
    const matchesSearch = 
      !searchQuery ||
      txn.relatedUserName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.type.toLowerCase().includes(searchQuery.toLowerCase());

    // Date filter
    const txnDate = new Date(txn.timestamp);
    const now = new Date();
    const matchesDate = 
      dateRange === 'all' ||
      (dateRange === 'today' && txnDate.toDateString() === now.toDateString()) ||
      (dateRange === 'week' && (now.getTime() - txnDate.getTime()) <= 7 * 24 * 60 * 60 * 1000) ||
      (dateRange === 'month' && (now.getTime() - txnDate.getTime()) <= 30 * 24 * 60 * 60 * 1000);

    return matchesType && matchesSearch && matchesDate;
  });

  // Get transaction type info
  const getTransactionInfo = (txn: Transaction) => {
    const isInflow = ['transfer_in', 'deposit_approve', 'unit_deposit_approve', 'withdrawal_request', 'admin_create'].includes(txn.type);
    const isOutflow = ['transfer_out', 'deposit_request', 'unit_deposit_request', 'withdrawal_approve'].includes(txn.type);

    let label = '';
    let description = '';
    let icon = null;
    let colorClass = '';
    let bgClass = '';
    let borderClass = '';

    if (isInflow) {
      icon = <ArrowDownCircle className="w-5 h-5" />;
      colorClass = 'text-green-700';
      bgClass = 'bg-green-50';
      borderClass = 'border-green-200';
      
      switch (txn.type) {
        case 'transfer_in':
          label = 'Transfer Received';
          description = `Received from ${txn.relatedUserName || 'Unknown'}`;
          break;
        case 'deposit_approve':
          label = 'Deposit Approved';
          description = `Deposit approved by ${txn.relatedUserName || 'Unknown'}`;
          break;
        case 'unit_deposit_approve':
          label = 'Unit Deposit';
          description = `Units received from ${txn.relatedUserName || 'Unknown'}`;
          break;
        case 'withdrawal_request':
          label = 'Withdrawal Requested';
          description = `Withdrawal request to ${txn.relatedUserName || 'Unknown'}`;
          break;
        case 'admin_create':
          label = 'Units Created';
          description = 'Units added by Admin';
          break;
      }
    } else if (isOutflow) {
      icon = <ArrowUpCircle className="w-5 h-5" />;
      colorClass = 'text-red-700';
      bgClass = 'bg-red-50';
      borderClass = 'border-red-200';
      
      switch (txn.type) {
        case 'transfer_out':
          label = 'Transfer Sent';
          description = `Sent to ${txn.relatedUserName || 'Unknown'}`;
          break;
        case 'deposit_request':
          label = 'Deposit Requested';
          description = `Deposit request from ${txn.relatedUserName || 'Unknown'}`;
          break;
        case 'unit_deposit_request':
          label = 'Unit Request';
          description = `Unit request to ${txn.relatedUserName || 'Unknown'}`;
          break;
        case 'withdrawal_approve':
          label = 'Withdrawal Approved';
          description = `Withdrawal to ${txn.relatedUserName || 'Unknown'}`;
          break;
      }
    }

    return { label, description, icon, colorClass, bgClass, borderClass, isInflow, isOutflow };
  };

  // Calculate summary
  const totalInflow = filteredTransactions
    .filter(txn => ['transfer_in', 'deposit_approve', 'unit_deposit_approve', 'withdrawal_request', 'admin_create'].includes(txn.type))
    .reduce((sum, txn) => sum + txn.amount, 0);

  const totalOutflow = filteredTransactions
    .filter(txn => ['transfer_out', 'deposit_request', 'unit_deposit_request', 'withdrawal_approve'].includes(txn.type))
    .reduce((sum, txn) => sum + txn.amount, 0);

  const netChange = totalInflow - totalOutflow;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
          <p className="text-gray-600 mt-1" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
            ငွေလွှဲမှတ်တမ်း
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Inflow */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-600 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-green-700 font-medium">Total Inflow</span>
            <span className="text-xs text-green-600" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              (ဝင်ငွေ)
            </span>
          </div>
          <p className="text-2xl font-bold text-green-900">
            +{totalInflow.toLocaleString()}
            <span className="text-sm ml-1">Units</span>
          </p>
        </div>

        {/* Total Outflow */}
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border-2 border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-red-600 rounded-lg">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-red-700 font-medium">Total Outflow</span>
            <span className="text-xs text-red-600" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              (ထွက်ငွေ)
            </span>
          </div>
          <p className="text-2xl font-bold text-red-900">
            -{totalOutflow.toLocaleString()}
            <span className="text-sm ml-1">Units</span>
          </p>
        </div>

        {/* Net Change */}
        <div className={`bg-gradient-to-br rounded-xl p-4 border-2 ${
          netChange >= 0 
            ? 'from-blue-50 to-indigo-50 border-blue-200' 
            : 'from-orange-50 to-amber-50 border-orange-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg ${
              netChange >= 0 ? 'bg-blue-600' : 'bg-orange-600'
            }`}>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className={`text-sm font-medium ${
              netChange >= 0 ? 'text-blue-700' : 'text-orange-700'
            }`}>
              Net Change
            </span>
          </div>
          <p className={`text-2xl font-bold ${
            netChange >= 0 ? 'text-blue-900' : 'text-orange-900'
          }`}>
            {netChange >= 0 ? '+' : ''}{netChange.toLocaleString()}
            <span className="text-sm ml-1">Units</span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          >
            <option value="all">All Transactions</option>
            <option value="inflow">Inflow (Deposits)</option>
            <option value="outflow">Outflow (Withdrawals)</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-semibold">No transactions found</p>
          <p className="text-gray-400 text-sm mt-2">
            {searchQuery || filterType !== 'all' || dateRange !== 'all'
              ? 'Try adjusting your filters'
              : 'Start making transactions to see your history'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((txn, index) => {
            const info = getTransactionInfo(txn);
            
            return (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-xl border-2 ${info.borderClass} hover:shadow-md transition-all overflow-hidden`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Icon and Info */}
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-3 ${info.bgClass} rounded-xl ${info.colorClass}`}>
                        {info.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-bold ${info.colorClass}`}>{info.label}</h4>
                        <p className="text-sm text-gray-600 mt-0.5">{info.description}</p>
                        {txn.note && (
                          <p className="text-xs text-gray-500 mt-1 italic">Note: {txn.note}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {new Date(txn.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount and Balance */}
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${info.colorClass}`}>
                        {info.isInflow ? '+' : '-'}{txn.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Balance: {txn.balanceBefore.toLocaleString()} → {txn.balanceAfter.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom stripe for visual status */}
                <div className={`h-1 ${info.isInflow ? 'bg-green-500' : 'bg-red-500'}`} />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Results Count */}
      {filteredTransactions.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </p>
        </div>
      )}
    </div>
  );
}
