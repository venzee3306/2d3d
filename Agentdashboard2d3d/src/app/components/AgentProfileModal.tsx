import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Wallet,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  AlertCircle,
  CheckCircle,
  Package
} from 'lucide-react';
import { ManualTransactionModal } from './ManualTransactionModal';
import type { Transaction } from '../types/units';

interface AgentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: {
    id: string;
    name: string;
    username: string;
    role: string;
    parentId?: string;
    balance: number;
    totalDeposits?: number;
    totalWithdrawals?: number;
    createdAt?: string;
    lastActive?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  currentUserBalance: number;
  transactions?: Transaction[];
  onManualTransaction: (transaction: {
    type: 'deposit' | 'withdrawal';
    amount: number;
    note: string;
  }) => void;
}

export function AgentProfileModal({
  isOpen,
  onClose,
  agent,
  currentUserBalance,
  transactions = [],
  onManualTransaction
}: AgentProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');
  const [showManualTransaction, setShowManualTransaction] = useState(false);

  // Calculate statistics
  const agentTransactions = transactions.filter(
    txn => txn.userId === agent.id || txn.relatedUserId === agent.id
  );
  
  const totalInflow = agentTransactions
    .filter(txn => txn.userId === agent.id && txn.amount > 0)
    .reduce((sum, txn) => sum + txn.amount, 0);
  
  const totalOutflow = agentTransactions
    .filter(txn => txn.userId === agent.id && txn.amount < 0)
    .reduce((sum, txn) => Math.abs(txn.amount), 0);

  const recentTransactions = agentTransactions.slice(0, 5);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-2xl border-2 border-white/30">
                {agent.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{agent.name}</h2>
                <p className="text-blue-100 text-sm">@{agent.username}</p>
                <span className="inline-block mt-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium capitalize">
                  {agent.role}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50 px-6">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 font-semibold transition-all relative ${
                  activeTab === 'overview'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
                {activeTab === 'overview' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-6 py-3 font-semibold transition-all relative ${
                  activeTab === 'transactions'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Transactions
                {activeTab === 'transactions' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  />
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Balance Card */}
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-6 h-6" />
                      <span className="text-sm font-medium">Current Balance</span>
                      <span className="text-xs" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                        (လက်ကျန်ယူနစ်)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Active</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <p className="text-5xl font-bold">{agent.balance.toLocaleString()}</p>
                    <p className="text-xl">Units</p>
                  </div>
                  <p className="text-blue-100 text-sm">≈ {agent.balance.toLocaleString()} MMK</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">Total Deposits</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">
                      {totalInflow.toLocaleString()}
                      <span className="text-sm ml-1">Units</span>
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border-2 border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-5 h-5 text-red-600" />
                      <span className="text-sm text-red-700 font-medium">Total Withdrawals</span>
                    </div>
                    <p className="text-2xl font-bold text-red-900">
                      {totalOutflow.toLocaleString()}
                      <span className="text-sm ml-1">Units</span>
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Contact Information
                  </h3>
                  {agent.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{agent.email}</span>
                    </div>
                  )}
                  {agent.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{agent.phone}</span>
                    </div>
                  )}
                  {agent.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{agent.address}</span>
                    </div>
                  )}
                  {agent.createdAt && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">
                        Joined {new Date(agent.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Recent Activity */}
                {recentTransactions.length > 0 && (
                  <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <History className="w-5 h-5 text-blue-600" />
                      Recent Activity
                    </h3>
                    <div className="space-y-2">
                      {recentTransactions.map(txn => {
                        const isInflow = txn.amount > 0;
                        return (
                          <div
                            key={txn.id}
                            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {isInflow ? (
                                <ArrowDownCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <ArrowUpCircle className="w-5 h-5 text-red-600" />
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {txn.type.replace(/_/g, ' ').toUpperCase()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(txn.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`font-bold ${
                                isInflow ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {isInflow ? '+' : '-'}{Math.abs(txn.amount).toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Manual Transaction Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowManualTransaction(true)}
                    className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowDownCircle className="w-5 h-5" />
                    <span>Deposit Units</span>
                  </button>
                  <button
                    onClick={() => setShowManualTransaction(true)}
                    className="px-6 py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowUpCircle className="w-5 h-5" />
                    <span>Withdraw Units</span>
                  </button>
                </div>

                {/* Info Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-900 font-semibold mb-1">
                      Manual Transaction Note
                    </p>
                    <p className="text-xs text-blue-700">
                      Manual transactions are instant and bypass the request-approval flow. 
                      Use for offline settlements or emergency adjustments. All transactions are recorded and auditable.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="space-y-4">
                {agentTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-semibold">No transactions yet</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Transaction history will appear here
                    </p>
                  </div>
                ) : (
                  agentTransactions.map(txn => {
                    const isInflow = txn.amount > 0;
                    return (
                      <div
                        key={txn.id}
                        className={`rounded-xl border-2 p-4 ${
                          isInflow
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div
                              className={`p-3 rounded-xl ${
                                isInflow ? 'bg-green-600' : 'bg-red-600'
                              }`}
                            >
                              {isInflow ? (
                                <ArrowDownCircle className="w-5 h-5 text-white" />
                              ) : (
                                <ArrowUpCircle className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4
                                className={`font-bold ${
                                  isInflow ? 'text-green-900' : 'text-red-900'
                                }`}
                              >
                                {txn.type.replace(/_/g, ' ').toUpperCase()}
                              </h4>
                              {txn.relatedUserName && (
                                <p className="text-sm text-gray-600 mt-0.5">
                                  {isInflow ? 'From' : 'To'}: {txn.relatedUserName}
                                </p>
                              )}
                              {txn.note && (
                                <p className="text-xs text-gray-500 mt-1 italic">
                                  {txn.note}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {new Date(txn.timestamp).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-2xl font-bold ${
                                isInflow ? 'text-green-700' : 'text-red-700'
                              }`}
                            >
                              {isInflow ? '+' : '-'}
                              {Math.abs(txn.amount).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Balance: {txn.balanceAfter.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Manual Transaction Modal */}
      <ManualTransactionModal
        isOpen={showManualTransaction}
        onClose={() => setShowManualTransaction(false)}
        targetUser={{
          id: agent.id,
          name: agent.name,
          role: agent.role,
          currentBalance: agent.balance
        }}
        currentUserBalance={currentUserBalance}
        onConfirm={onManualTransaction}
      />
    </AnimatePresence>
  );
}
