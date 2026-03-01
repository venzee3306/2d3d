import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle, 
  Search, 
  Filter,
  ArrowUpCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { TransactionCard } from './TransactionCard';
import { ProofViewerDrawer } from './ProofViewerDrawer';
import type { WithdrawalRequest } from '../types/units';

interface MasterWithdrawalSettlementViewProps {
  pendingWithdrawals: WithdrawalRequest[];
  completedWithdrawals: WithdrawalRequest[];
  onMarkPaid: (requestId: string) => void;
  onReject: (requestId: string, reason: string) => void;
}

export function MasterWithdrawalSettlementView({
  pendingWithdrawals,
  completedWithdrawals,
  onMarkPaid,
  onReject
}: MasterWithdrawalSettlementViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'all'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);

  // Filter withdrawals
  const allWithdrawals = [...pendingWithdrawals, ...completedWithdrawals];
  const filteredWithdrawals = allWithdrawals.filter(withdrawal => {
    const matchesSearch = 
      withdrawal.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      withdrawal.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      withdrawal.accountName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'pending' && withdrawal.status === 'pending');
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    pending: pendingWithdrawals.length,
    totalPendingAmount: pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0),
    approved: completedWithdrawals.filter(w => w.status === 'approved').length,
    rejected: completedWithdrawals.filter(w => w.status === 'rejected').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl shadow-lg">
              <ArrowUpCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settlement List</h1>
              <p className="text-gray-600 mt-1" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                အေးဂျင့်များ၏ ငွေထုတ် တောင်းဆိုမှုများ
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border-2 border-yellow-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-yellow-700 font-medium">Awaiting Payment</span>
              </div>
              <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
              <p className="text-sm text-yellow-700 mt-1">
                {stats.totalPendingAmount.toLocaleString()} Units
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700 font-medium">Paid</span>
              </div>
              <p className="text-3xl font-bold text-green-900">{stats.approved}</p>
              <p className="text-sm text-green-700 mt-1">Successfully paid</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border-2 border-red-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-700 font-medium">Rejected</span>
              </div>
              <p className="text-3xl font-bold text-red-900">{stats.rejected}</p>
              <p className="text-sm text-red-700 mt-1">Total rejected</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpCircle className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">All Requests</span>
              </div>
              <p className="text-3xl font-bold text-blue-900">{allWithdrawals.length}</p>
              <p className="text-sm text-blue-700 mt-1">Total history</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by agent name or account..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 appearance-none font-semibold"
              >
                <option value="pending">Pending Only</option>
                <option value="all">All Statuses</option>
              </select>
            </div>
          </div>
        </div>

        {/* Important Notice for Pending */}
        {pendingWithdrawals.length > 0 && statusFilter === 'pending' && (
          <div className="bg-amber-100 border-2 border-amber-300 rounded-2xl p-6 mb-6 flex items-start gap-4">
            <Clock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-amber-900 font-bold text-lg mb-2">
                Action Required: {pendingWithdrawals.length} Cash-out Requests
              </p>
              <p className="text-amber-800 text-sm">
                These agents are waiting for you to send their winnings. After sending the payment via KPay or bank transfer, 
                click "Mark as Paid" to complete the transaction.
              </p>
            </div>
          </div>
        )}

        {/* Withdrawals List */}
        {filteredWithdrawals.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-12 text-center">
            <ArrowUpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-semibold">No withdrawal requests</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchQuery || statusFilter !== 'pending'
                ? 'Try adjusting your filters'
                : 'No pending cash-out requests at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredWithdrawals.map((withdrawal) => (
              <TransactionCard
                key={withdrawal.id}
                id={withdrawal.id}
                type="withdrawal"
                amount={withdrawal.amount}
                paymentMethod={withdrawal.paymentMethod}
                status={withdrawal.status}
                requestedAt={withdrawal.requestedAt}
                processedAt={withdrawal.processedAt}
                note={withdrawal.note}
                rejectionReason={withdrawal.rejectionReason}
                requesterName={withdrawal.userName}
                onClick={() => setSelectedRequest(withdrawal)}
                showActions={withdrawal.status === 'pending'}
                onMarkPaid={() => onMarkPaid(withdrawal.id)}
                onReject={() => setSelectedRequest(withdrawal)}
              />
            ))}
          </div>
        )}

        {/* Results Count */}
        {filteredWithdrawals.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Showing {filteredWithdrawals.length} of {allWithdrawals.length} requests
            </p>
          </div>
        )}
      </div>

      {/* Proof Viewer Drawer */}
      {selectedRequest && (
        <ProofViewerDrawer
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          request={selectedRequest}
          type="withdrawal"
          onApprove={() => {
            onMarkPaid(selectedRequest.id);
            setSelectedRequest(null);
          }}
          onReject={(reason) => {
            onReject(selectedRequest.id, reason);
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
}
