import { useState, useEffect } from 'react';
import { Menu, Bell, UserCheck, Calendar, Clock, Users, TrendingUp, DollarSign, Wallet, XCircle, CheckCircle, Eye, X, Building2, ChevronRight, ArrowDownLeft, UserPlus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { User, Player, UnitDepositRequest } from '../types/units';

interface MobileAdminDashboardProps {
  onNavigate: (page: string) => void;
  currentUser: User;
  allUsers: User[];
  allPlayers: Player[];
  unitDepositRequests: UnitDepositRequest[];
  onApproveDepositRequest: (requestId: string) => void;
  onRejectDepositRequest: (requestId: string) => void;
  adminTotalSupply: number;
  onAddUser?: (userData: Omit<User, 'id'>) => void;
  onLogout?: () => void;
}

type TimePeriod = 'daily' | 'weekly' | 'monthly';

export function MobileAdminDashboard({
  onNavigate,
  currentUser,
  allUsers,
  allPlayers,
  unitDepositRequests,
  onApproveDepositRequest,
  onRejectDepositRequest,
  adminTotalSupply,
  onAddUser = () => {},
  onLogout = () => {}
}: MobileAdminDashboardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('daily');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [selectedRequest, setSelectedRequest] = useState<UnitDepositRequest | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAddMasterModal, setShowAddMasterModal] = useState(false);
  const [newMasterData, setNewMasterData] = useState({
    name: '',
    username: '',
    password: ''
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US');
  };

  const masters = allUsers.filter(u => u.role === 'master');
  const agents = allUsers.filter(u => u.role === 'agent');

  // Get pending requests from Masters to Admin
  const pendingMasterRequests = unitDepositRequests.filter(
    r => r.status === 'pending' && r.requesterRole === 'master' && r.approverId === currentUser.id
  );

  const getStatsForPeriod = () => {
    const baseStats = {
      masters: masters.length,
      agents: agents.length,
      players: allPlayers.length
    };

    if (timePeriod === 'daily') {
      return {
        ...baseStats,
        revenue: 4850000,
        bets: 1250,
        growth: '+15%'
      };
    } else if (timePeriod === 'weekly') {
      return {
        ...baseStats,
        revenue: 29700000,
        bets: 5323,
        growth: '+22%'
      };
    } else {
      return {
        ...baseStats,
        revenue: 115200000,
        bets: 21800,
        growth: '+28%'
      };
    }
  };

  const stats = getStatsForPeriod();

  const handleApprove = (request: UnitDepositRequest) => {
    onApproveDepositRequest(request.id);
    setShowRequestModal(false);
    setSelectedRequest(null);
  };

  const handleReject = (request: UnitDepositRequest) => {
    onRejectDepositRequest(request.id);
    setShowRequestModal(false);
    setSelectedRequest(null);
  };

  const handleAddMaster = () => {
    if (newMasterData.name && newMasterData.username && newMasterData.password) {
      onAddUser({
        name: newMasterData.name,
        username: newMasterData.username,
        password: newMasterData.password,
        role: 'master',
        parentId: currentUser.id
      });
      setShowAddMasterModal(false);
      setNewMasterData({
        name: '',
        username: '',
        password: ''
      });
    }
  };

  return (
    <div className="w-full max-w-[375px] h-screen bg-[#F5F7FA] flex flex-col mx-auto relative overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-4 py-4 shadow-lg flex-shrink-0 relative z-50">
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-white" />
              {pendingMasterRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingMasterRequests.length}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <UserCheck className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white">Admin</span>
            </div>
          </div>
        </div>
        
        <div className="mb-3">
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-xs text-blue-200 mt-0.5">Welcome, {currentUser.name}</p>
        </div>

        <div className="flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(currentDateTime)}</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(currentDateTime)}</span>
          </div>
        </div>
      </div>

      {/* Burger Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60]"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 h-full w-[280px] bg-white shadow-2xl z-[70] flex flex-col"
            >
              {/* Menu Header */}
              <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-4 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-blue-800" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base">{currentUser.name}</h3>
                    <p className="text-blue-200 text-xs">Admin</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="flex-1 py-4 overflow-y-auto hide-scrollbar">
                <nav className="space-y-1 px-3">
                  <button
                    onClick={() => {
                      onNavigate('dashboard');
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-blue-50 transition-colors group"
                  >
                    <TrendingUp className="w-5 h-5 text-blue-800 group-hover:text-blue-900" />
                    <span className="text-gray-700 font-medium group-hover:text-blue-900">Analytics</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('masters');
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-green-50 transition-colors group"
                  >
                    <Users className="w-5 h-5 text-green-600 group-hover:text-green-700" />
                    <span className="text-gray-700 font-medium group-hover:text-green-700">Masters</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('units');
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-blue-50 transition-colors group"
                  >
                    <Wallet className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
                    <span className="text-gray-700 font-medium group-hover:text-blue-700">Units</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('withdrawals');
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-orange-50 transition-colors group"
                  >
                    <ArrowDownLeft className="w-5 h-5 text-orange-600 group-hover:text-orange-700" />
                    <span className="text-gray-700 font-medium group-hover:text-orange-700">Withdrawals</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('transactions');
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-indigo-50 transition-colors group"
                  >
                    <DollarSign className="w-5 h-5 text-indigo-600 group-hover:text-indigo-700" />
                    <span className="text-gray-700 font-medium group-hover:text-indigo-700">Transactions</span>
                  </button>
                </nav>
              </div>

              {/* Logout Button */}
              <div className="border-t border-gray-200 p-4">
                <button 
                  onClick={onLogout}
                  className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notification Panel - matching Master's blue notification style */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[320px] bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
                {pendingMasterRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium">No pending requests</p>
                    <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  pendingMasterRequests.map(request => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowRequestModal(true);
                        setShowNotifications(false);
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-bold text-gray-900">{request.requesterName}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(request.requestedAt).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        Requesting <span className="font-bold text-blue-600">{formatCurrency(request.amount)}</span> units
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="bg-yellow-200 px-2 py-1 rounded">Pending Review</span>
                        <span>•</span>
                        <span>{request.paymentMethod}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Body Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 hide-scrollbar">
        
        {/* Total Supply Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-4 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-white" />
              <span className="text-blue-200 text-sm font-medium">Total Supply</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {formatCurrency(adminTotalSupply)}
          </div>
          <p className="text-blue-200 text-xs">MMK Units Available</p>
        </motion.div>

        {/* Time Period Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-900">Time Period</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['daily', 'weekly', 'monthly'] as TimePeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                  timePeriod === period
                    ? 'bg-blue-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="bg-white rounded-xl p-4 shadow-md">
            <Building2 className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-xs text-gray-600 mb-1">Masters</p>
            <p className="text-2xl font-bold text-gray-900">{stats.masters}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <Users className="w-5 h-5 text-green-600 mb-2" />
            <p className="text-xs text-gray-600 mb-1">Agents</p>
            <p className="text-2xl font-bold text-gray-900">{stats.agents}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <Users className="w-5 h-5 text-indigo-600 mb-2" />
            <p className="text-xs text-gray-600 mb-1">Players</p>
            <p className="text-2xl font-bold text-gray-900">{stats.players}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <TrendingUp className="w-5 h-5 text-orange-600 mb-2" />
            <p className="text-xs text-gray-600 mb-1">Total Bets</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.bets)}</p>
          </div>
        </motion.div>

        {/* Revenue Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="text-sm font-bold text-gray-900">Revenue</h3>
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">{stats.growth}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(stats.revenue)}</p>
          <p className="text-xs text-gray-600">MMK</p>
        </motion.div>

        {/* Pending Requests Card */}
        {pendingMasterRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">Pending Requests</h3>
              <span className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                {pendingMasterRequests.length}
              </span>
            </div>
            <div className="space-y-2">
              {pendingMasterRequests.slice(0, 3).map(request => (
                <div
                  key={request.id}
                  onClick={() => {
                    setSelectedRequest(request);
                    setShowRequestModal(true);
                  }}
                  className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{request.requesterName}</p>
                    <p className="text-xs text-gray-600">{formatCurrency(request.amount)} units</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Masters List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">Masters Overview</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddMasterModal(true)}
                className="p-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg transition-colors"
              >
                <UserPlus className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('masters')}
                className="text-xs text-blue-800 font-semibold"
              >
                View All
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {masters.slice(0, 3).map(master => (
              <div
                key={master.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {master.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{master.name}</p>
                    <p className="text-xs text-gray-600">@{master.username}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Request Detail Modal - matching Master's blue-themed Deposit Request modal */}
      <AnimatePresence>
        {showRequestModal && selectedRequest && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Deposit Request</h3>
                  <button
                    onClick={() => {
                      setShowRequestModal(false);
                      setSelectedRequest(null);
                    }}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                {/* Requester Info */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{selectedRequest.requesterName}</p>
                      <p className="text-xs text-gray-600">Master</p>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600 mb-1">Requested Amount</p>
                  <p className="text-3xl font-bold text-blue-600">{formatCurrency(selectedRequest.amount)}</p>
                  <p className="text-xs text-gray-500 mt-1">MMK Units</p>
                </div>

                {/* Payment Details */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Payment Method</p>
                    <p className="text-sm font-medium text-gray-900">{selectedRequest.paymentMethod}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Transaction ID</p>
                    <p className="text-sm font-mono bg-gray-100 px-3 py-2 rounded-lg text-gray-900">
                      {selectedRequest.transactionId || 'N/A'}
                    </p>
                  </div>

                  {selectedRequest.note && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Note</p>
                      <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedRequest.note}
                      </p>
                    </div>
                  )}

                  {selectedRequest.paymentScreenshot && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">Payment Proof</p>
                      <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={selectedRequest.paymentScreenshot}
                          alt="Payment Proof"
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Requested At</p>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedRequest.requestedAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleReject(selectedRequest)}
                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedRequest)}
                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Master Modal */}
      <AnimatePresence>
        {showAddMasterModal && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Add Master</h3>
                  <button
                    onClick={() => {
                      setShowAddMasterModal(false);
                      setNewMasterData({
                        name: '',
                        username: '',
                        password: ''
                      });
                    }}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                {/* Name */}
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <input
                    type="text"
                    value={newMasterData.name}
                    onChange={(e) => setNewMasterData({ ...newMasterData, name: e.target.value })}
                    className="text-sm font-medium text-gray-900 w-full focus:outline-none"
                  />
                </div>

                {/* Username */}
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600 mb-1">Username</p>
                  <input
                    type="text"
                    value={newMasterData.username}
                    onChange={(e) => setNewMasterData({ ...newMasterData, username: e.target.value })}
                    className="text-sm font-medium text-gray-900 w-full focus:outline-none"
                  />
                </div>

                {/* Password */}
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600 mb-1">Password</p>
                  <input
                    type="password"
                    value={newMasterData.password}
                    onChange={(e) => setNewMasterData({ ...newMasterData, password: e.target.value })}
                    className="text-sm font-medium text-gray-900 w-full focus:outline-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleAddMaster()}
                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Add Master
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