import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle, 
  Search, 
  Filter,
  Eye,
  ArrowDownCircle,
  Clock
} from 'lucide-react';
import { TransactionCard } from './TransactionCard';
import { ProofViewerDrawer } from './ProofViewerDrawer';
import type { UnitDepositRequest } from '../types/units';

interface MasterDepositApprovalsViewProps {
  pendingDeposits: UnitDepositRequest[];
  completedDeposits: UnitDepositRequest[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string, reason: string) => void;
}

export function MasterDepositApprovalsView({
  pendingDeposits,
  completedDeposits,
  onApprove,
  onReject
}: MasterDepositApprovalsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'all'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<UnitDepositRequest | null>(null);

  // Filter deposits
  const allDeposits = [...pendingDeposits, ...completedDeposits];
  const filteredDeposits = allDeposits.filter(deposit => {
    const matchesSearch = 
      deposit.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deposit.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'pending' && deposit.status === 'pending');
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    pending: pendingDeposits.length,
    totalPendingAmount: pendingDeposits.reduce((sum, d) => sum + d.amount, 0),
    approved: completedDeposits.filter(d => d.status === 'approved').length,
    rejected: completedDeposits.filter(d => d.status === 'rejected').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
              <p className="text-gray-600 mt-1" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                အေးဂျင့်များ၏ ယူနစ် တောင်းဆိုမှုများ
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border-2 border-yellow-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-yellow-700 font-medium">Pending</span>
              </div>
              <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
              <p className="text-sm text-yellow-700 mt-1">
                {stats.totalPendingAmount.toLocaleString()} Units
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700 font-medium">Approved</span>
              </div>
              <p className="text-3xl font-bold text-green-900">{stats.approved}</p>
              <p className="text-sm text-green-700 mt-1">Total approved</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border-2 border-red-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-700 font-medium">Rejected</span>
              </div>
              <p className="text-3xl font-bold text-red-900">{stats.rejected}</p>
              <p className="text-sm text-red-700 mt-1">Total rejected</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownCircle className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">All Requests</span>
              </div>
              <p className="text-3xl font-bold text-blue-900">{allDeposits.length}</p>
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
                placeholder="Search by agent name or transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none font-semibold"
              >
                <option value="pending">Pending Only</option>
                <option value="all">All Statuses</option>
              </select>
            </div>
          </div>
        </div>

        {/* Deposits List */}
        {filteredDeposits.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-12 text-center">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-semibold">No requests found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchQuery || statusFilter !== 'pending'
                ? 'Try adjusting your filters'
                : 'All deposit requests have been processed'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDeposits.map((deposit) => (
              <TransactionCard
                key={deposit.id}
                id={deposit.id}
                type="deposit"
                amount={deposit.amount}
                paymentMethod={deposit.paymentMethod}
                transactionId={deposit.transactionId}
                status={deposit.status}
                requestedAt={deposit.requestedAt}
                processedAt={deposit.processedAt}
                note={deposit.note}
                rejectionReason={deposit.rejectionReason}
                requesterName={deposit.requesterName}
                onClick={() => setSelectedRequest(deposit)}
                showActions={deposit.status === 'pending'}
                onApprove={() => onApprove(deposit.id)}
                onReject={() => setSelectedRequest(deposit)}
              />
            ))}
          </div>
        )}

        {/* Results Count */}
        {filteredDeposits.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Showing {filteredDeposits.length} of {allDeposits.length} requests
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
          type="deposit"
          onApprove={() => {
            onApprove(selectedRequest.id);
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
