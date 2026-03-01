import { useState } from 'react';
import { DollarSign, Clock, CheckCircle, XCircle, Search, Filter, Eye, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UnitDepositRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterRole: 'agent' | 'master';
  approverId: string;
  approverName: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  paymentScreenshot?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  note?: string;
  rejectionReason?: string;
}

interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'master' | 'agent';
  parentId?: string;
}

interface MasterDepositsViewProps {
  currentUser: User;
  allUsers: User[];
  depositRequests: UnitDepositRequest[];
  onApproveDeposit: (requestId: string) => void;
  onRejectDeposit: (requestId: string, reason: string) => void;
}

export function MasterDepositsView({ 
  currentUser, 
  allUsers,
  depositRequests, 
  onApproveDeposit, 
  onRejectDeposit 
}: MasterDepositsViewProps) {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingRequest, setViewingRequest] = useState<UnitDepositRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingRequest, setRejectingRequest] = useState<UnitDepositRequest | null>(null);

  // Get only deposits from agents under this master
  const myAgents = allUsers.filter(u => u.role === 'agent' && u.parentId === currentUser.id);
  const myAgentIds = myAgents.map(a => a.id);
  
  const myDeposits = depositRequests.filter(req => 
    myAgentIds.includes(req.requesterId) && req.approverId === currentUser.id
  );

  const filteredRequests = myDeposits.filter(req => {
    const matchesStatus = selectedStatus === 'all' || req.status === selectedStatus;
    const matchesSearch = req.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) {
      return '0';
    }
    return amount.toLocaleString('en-US');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const stats = {
    total: myDeposits.length,
    pending: myDeposits.filter(r => r.status === 'pending').length,
    approved: myDeposits.filter(r => r.status === 'approved').length,
    rejected: myDeposits.filter(r => r.status === 'rejected').length,
    totalAmount: myDeposits.reduce((sum, r) => sum + (r.status === 'approved' ? (r.amount || 0) : 0), 0)
  };

  const handleApprove = (request: UnitDepositRequest) => {
    if (confirm(`Approve deposit of ${formatCurrency(request.amount)} MMK from ${request.requesterName}?`)) {
      onApproveDeposit(request.id);
      setViewingRequest(null);
    }
  };

  const handleRejectClick = (request: UnitDepositRequest) => {
    setRejectingRequest(request);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = () => {
    if (rejectingRequest && rejectReason.trim()) {
      onRejectDeposit(rejectingRequest.id, rejectReason);
      setShowRejectModal(false);
      setRejectingRequest(null);
      setRejectReason('');
      setViewingRequest(null);
    }
  };

  return (
    <div className="flex-1 bg-[#F5F5F5] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white px-6 py-5 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deposit Management</h1>
          <p className="text-sm text-gray-500 mt-1">Review and approve agent deposit requests</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-500">Total Approved</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(stats.totalAmount)} MMK</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <div className="grid grid-cols-4 gap-4">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedStatus === 'all'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <DollarSign className="w-6 h-6 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-600">Total Requests</p>
          </button>

          <button
            onClick={() => setSelectedStatus('pending')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedStatus === 'pending'
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Clock className="w-6 h-6 text-yellow-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            <p className="text-xs text-gray-600">Pending Review</p>
          </button>

          <button
            onClick={() => setSelectedStatus('approved')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedStatus === 'approved'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            <p className="text-xs text-gray-600">Approved</p>
          </button>

          <button
            onClick={() => setSelectedStatus('rejected')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedStatus === 'rejected'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <XCircle className="w-6 h-6 text-red-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            <p className="text-xs text-gray-600">Rejected</p>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by agent name or transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
          />
        </div>
      </div>

      {/* Deposit Requests List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredRequests.length > 0 ? (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{request.requesterName}</h3>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          {request.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Requested {formatDate(request.requestedAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(request.amount)}</p>
                      <p className="text-xs text-gray-500">MMK</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Payment Method</p>
                      <p className="text-sm font-semibold text-gray-900">{request.paymentMethod}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Transaction ID</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{request.transactionId}</p>
                    </div>
                  </div>

                  {request.note && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg mb-4">
                      <p className="text-xs text-blue-600 font-semibold mb-1">Note:</p>
                      <p className="text-sm text-blue-900">{request.note}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewingRequest(request)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-semibold"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(request)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl transition-all font-semibold shadow-lg"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectClick(request)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all font-semibold shadow-lg"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <DollarSign className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-semibold">No deposit requests found</p>
            <p className="text-gray-400 text-sm mt-1">
              {selectedStatus === 'all' 
                ? 'No deposit requests at the moment' 
                : `No ${selectedStatus} requests`}
            </p>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      <AnimatePresence>
        {viewingRequest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Deposit Request Details</h2>
                <button
                  onClick={() => setViewingRequest(null)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Agent Name</p>
                    <p className="text-lg font-bold text-gray-900">{viewingRequest.requesterName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Amount</p>
                    <p className="text-lg font-bold text-blue-600">{formatCurrency(viewingRequest.amount)} MMK</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                    <p className="text-base font-semibold text-gray-900">{viewingRequest.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(viewingRequest.status)}`}>
                      {getStatusIcon(viewingRequest.status)}
                      {viewingRequest.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                    <p className="text-base font-mono bg-gray-100 p-2 rounded-lg">{viewingRequest.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Requested At</p>
                    <p className="text-base font-semibold text-gray-900">{formatDate(viewingRequest.requestedAt)}</p>
                  </div>
                  {viewingRequest.processedAt && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Processed At</p>
                      <p className="text-base font-semibold text-gray-900">{formatDate(viewingRequest.processedAt)}</p>
                    </div>
                  )}
                </div>

                {viewingRequest.note && (
                  <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl">
                    <p className="text-sm text-blue-600 font-semibold mb-2">Note:</p>
                    <p className="text-base text-blue-900">{viewingRequest.note}</p>
                  </div>
                )}

                {viewingRequest.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleApprove(viewingRequest)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl transition-all font-semibold shadow-lg"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve Deposit
                    </button>
                    <button
                      onClick={() => handleRejectClick(viewingRequest)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all font-semibold shadow-lg"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Deposit
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && rejectingRequest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5">
                <h2 className="text-xl font-bold text-white">Reject Deposit Request</h2>
                <p className="text-red-100 text-sm mt-1">from {rejectingRequest.requesterName}</p>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  Please provide a reason for rejecting this deposit request:
                </p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all resize-none"
                  rows={4}
                />

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectingRequest(null);
                      setRejectReason('');
                    }}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectConfirm}
                    disabled={!rejectReason.trim()}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Reject
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}