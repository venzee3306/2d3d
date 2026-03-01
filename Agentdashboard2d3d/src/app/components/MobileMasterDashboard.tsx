import { Users, TrendingUp, DollarSign, Activity, UserCheck, Calendar, Clock, Menu, ChevronRight, Eye, XCircle, Phone, Mail, MapPin, Wallet, X, LogOut, User as UserIcon, LayoutDashboard, Shield, AlertTriangle, Plus, Bell, CheckCircle, ArrowUpCircle, ArrowDownLeft, Upload, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import type { UnitDepositRequest } from '../types/units';

interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'master' | 'agent';
  parentId?: string;
}

interface Player {
  id: string;
  name: string;
  agentId?: string;
}

interface MobileMasterDashboardProps {
  onNavigate: (page: string) => void;
  bets: any[];
  currentUser: User;
  allUsers: User[];
  allPlayers: Player[];
  currentBalance?: number;
  userBalances?: { [userId: string]: number };
  pendingDepositRequests?: UnitDepositRequest[];
  myUnitDepositRequests?: UnitDepositRequest[];
  onApproveDeposit?: (requestId: string) => void;
  onRejectDeposit?: (requestId: string, reason: string) => void;
  onRequestUnitDeposit?: (request: {
    amount: number;
    paymentMethod: string;
    transactionId: string;
    paymentScreenshot?: string;
    note?: string;
  }) => void;
  onLogout: () => void;
}

type TimePeriod = 'daily' | 'weekly' | 'monthly';

export function MobileMasterDashboard({ 
  onNavigate, 
  bets, 
  currentUser, 
  allUsers, 
  allPlayers, 
  currentBalance = 0,
  userBalances = {},
  pendingDepositRequests = [],
  myUnitDepositRequests = [],
  onApproveDeposit,
  onRejectDeposit,
  onRequestUnitDeposit,
  onLogout 
}: MobileMasterDashboardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMyRequests, setShowMyRequests] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('daily');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [selectedAgent, setSelectedAgent] = useState<User | null>(null);
  const [showBuyUnitsModal, setShowBuyUnitsModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<UnitDepositRequest | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [buyUnitsForm, setBuyUnitsForm] = useState({
    amount: '',
    paymentMethod: 'KBZ Pay',
    transactionId: '',
    paymentScreenshot: '',
    note: ''
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Master's own pending requests to Admin
  const myOwnPendingRequests = myUnitDepositRequests.filter(r => r.requesterId === currentUser.id && r.status === 'pending');

  // Agent deposit requests (filter out Master's own requests)
  const agentPendingRequests = pendingDepositRequests.filter(r => r.requesterId !== currentUser.id);

  // Get agents under this master
  const myAgents = allUsers.filter(u => u.role === 'agent' && u.parentId === currentUser.id);
  const myAgentIds = myAgents.map(a => a.id);
  
  // Get players under my agents
  const myPlayers = allPlayers.filter(p => p.agentId && myAgentIds.includes(p.agentId));

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
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

  const getStatsForPeriod = () => {
    const baseStats = {
      agents: myAgents.length,
      players: myPlayers.length
    };

    if (timePeriod === 'daily') {
      return {
        ...baseStats,
        revenue: 2300000,
        bets: 402,
        growth: '+12%',
        comparison: 'vs yesterday'
      };
    } else if (timePeriod === 'weekly') {
      return {
        ...baseStats,
        revenue: 14850000,
        bets: 2610,
        growth: '+18%',
        comparison: 'vs last week'
      };
    } else {
      return {
        ...baseStats,
        revenue: 57600000,
        bets: 10900,
        growth: '+15%',
        comparison: 'vs last month'
      };
    }
  };

  const stats = getStatsForPeriod();

  const statCards = [
    {
      title: 'My Agents',
      value: stats.agents.toString(),
      icon: UserCheck,
      color: 'from-blue-500 to-blue-600',
      change: '+2'
    },
    {
      title: 'Total Players',
      value: stats.players.toString(),
      icon: Users,
      color: 'from-green-500 to-green-600',
      change: '+15'
    },
    {
      title: 'Total Bets',
      value: stats.bets.toString(),
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      change: stats.growth
    },
    {
      title: 'Revenue (MMK)',
      value: `${(stats.revenue / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: 'from-orange-500 to-orange-600',
      change: stats.growth
    }
  ];

  const agentPerformance = myAgents.slice(0, 5).map((agent, index) => {
    const agentPlayers = myPlayers.filter(p => p.agentId === agent.id);
    
    const dummyData = [
      { revenue: 425000, betsCount: 156 },
      { revenue: 380000, betsCount: 132 },
      { revenue: 510000, betsCount: 189 },
      { revenue: 290000, betsCount: 98 },
      { revenue: 445000, betsCount: 167 }
    ];
    
    const data = dummyData[index % dummyData.length];
    
    return {
      id: agent.id,
      name: agent.name,
      playersCount: agentPlayers.length,
      revenue: data.revenue,
      betsCount: data.betsCount
    };
  });

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) {
      return '0';
    }
    return amount.toLocaleString('en-US');
  };

  return (
    <div className="w-full max-w-[375px] h-screen bg-[#F5F7FA] flex flex-col mx-auto relative overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-4 shadow-lg flex-shrink-0 relative z-50">
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-3">
            {/* My Own Requests Notification (green, like Agent's) */}
            {myOwnPendingRequests.length > 0 && (
              <button
                onClick={() => setShowMyRequests(!showMyRequests)}
                className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-green-300" />
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {myOwnPendingRequests.length}
                </span>
              </button>
            )}
            {/* Incoming Agent Requests Notification */}
            {agentPendingRequests.length > 0 && (
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {agentPendingRequests.length}
                </span>
              </button>
            )}
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <UserCheck className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white">Master</span>
            </div>
          </div>
        </div>
        
        <div className="mb-3">
          <h1 className="text-xl font-bold text-white">Master Dashboard</h1>
          <p className="text-xs text-blue-100 mt-0.5">Welcome, {currentUser.name}</p>
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

      {/* Sliding Burger Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Menu Header */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white text-lg font-bold">Menu</h2>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center border-2 border-white/30">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{currentUser.name}</p>
                    <p className="text-blue-100 text-xs capitalize">Master</p>
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
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors text-left group"
                  >
                    <LayoutDashboard className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
                    <span className="text-gray-700 font-medium group-hover:text-blue-700">Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('agents');
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-green-50 transition-colors text-left group"
                  >
                    <Users className="w-5 h-5 text-green-600 group-hover:text-green-700" />
                    <span className="text-gray-700 font-medium group-hover:text-green-700">Agents</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('deposits');
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-yellow-50 transition-colors text-left group"
                  >
                    <ArrowUpCircle className="w-5 h-5 text-yellow-600 group-hover:text-yellow-700" />
                    <span className="text-gray-700 font-medium group-hover:text-yellow-700">Deposits</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('units');
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-50 transition-colors text-left group"
                  >
                    <Wallet className="w-5 h-5 text-indigo-600 group-hover:text-indigo-700" />
                    <span className="text-gray-700 font-medium group-hover:text-indigo-700">Units</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('withdrawals');
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-orange-50 transition-colors text-left group"
                  >
                    <ArrowDownLeft className="w-5 h-5 text-orange-600 group-hover:text-orange-700" />
                    <span className="text-gray-700 font-medium group-hover:text-orange-700">Withdrawals</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('transactions');
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-50 transition-colors text-left group"
                  >
                    <DollarSign className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
                    <span className="text-gray-700 font-medium group-hover:text-purple-700">Transactions</span>
                  </button>
                </nav>
              </div>

              {/* Logout Button */}
              <div className="border-t border-gray-200 p-4">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notification Panel */}
      <AnimatePresence>
        {showNotifications && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            
            {/* Notification Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[320px] bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Panel Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
                {agentPendingRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium">No pending requests</p>
                    <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  agentPendingRequests.map(request => (
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

      {/* My Own Requests to Admin - Green Notification Panel (matching Agent's style) */}
      <AnimatePresence>
        {showMyRequests && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMyRequests(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[320px] bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">Pending Requests</h3>
                <button
                  onClick={() => setShowMyRequests(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
                {myOwnPendingRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium">No pending requests</p>
                    <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  myOwnPendingRequests.map(request => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-bold text-gray-900">Awaiting Approval</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(request.requestedAt).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        Requested <span className="font-bold text-green-600">{formatCurrency(request.amount)}</span> units
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="bg-orange-200 px-2 py-1 rounded">Pending</span>
                        <span>•</span>
                        <span>{request.paymentMethod}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <p className="text-center text-xs text-gray-600" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                  သင့်တောင်းခံမှုများကို Admin မှ အတည်ပြုလိမ့်မည်
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Body Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 hide-scrollbar">
        
        {/* Time Period Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-gray-900">Period</h2>
            </div>
          </div>
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
            {(['daily', 'weekly', 'monthly'] as TimePeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`flex-1 px-3 py-1.5 rounded-md font-semibold text-xs transition-all ${
                  timePeriod === period
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'text-gray-600'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Unit Balance & Pending Requests */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Available Balance Card */}
          <button
            onClick={() => setShowBalanceModal(true)}
            className="w-full text-left bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl shadow-md p-4 hover:from-blue-100 hover:to-blue-200 transition-all active:scale-98"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-200 rounded-lg">
                  <Wallet className="w-4 h-4 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-blue-700">My Units</h3>
                  <p className="text-[9px] text-blue-600" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    လက်ကျန်ယူနစ်
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentBalance < 100000 && (
                  <div className="p-1.5 bg-red-200 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-700" />
                  </div>
                )}
                <ChevronRight className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="mb-3">
              <p className="text-2xl font-bold text-blue-800">{formatCurrency(currentBalance)}</p>
              <p className="text-[9px] text-blue-600">Available Units (MMK)</p>
            </div>
            <div className="flex items-center gap-2 text-blue-700 text-xs">
              <Eye className="w-3.5 h-3.5" />
              <span>Tap to view details</span>
            </div>
          </button>

          {/* Buy More Units Button */}
          <button
            onClick={() => setShowBuyUnitsModal(true)}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Buy More Units
          </button>

          {/* Agent Pending Requests Notification (from agents) */}
          {agentPendingRequests.length > 0 && (
            <button
              onClick={() => {
                setShowNotifications(true);
              }}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-3 text-white shadow-md hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-lg relative">
                    <Bell className="w-4 h-4" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold">
                      {agentPendingRequests.length} Agent Request{agentPendingRequests.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-[9px] text-orange-100" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>Agent ယူနစ်တောင်းခံမှုများ</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          )}

          {/* My Own Pending Requests to Admin */}
          {myOwnPendingRequests.length > 0 && (
            <div className="w-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-3 text-white shadow-md">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-lg relative">
                  <ArrowUpCircle className="w-4 h-4" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-xs font-bold">
                    {myOwnPendingRequests.length} Request{myOwnPendingRequests.length > 1 ? 's' : ''} Pending
                  </p>
                  <p className="text-[9px] text-blue-100" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>Admin စစ်ဆေးဆဲ</p>
                </div>
                <Clock className="w-4 h-4 text-blue-200" />
              </div>
            </div>
          )}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-3 shadow-md"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 bg-gradient-to-r ${stat.color} rounded-lg`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className={`px-2 py-0.5 bg-gradient-to-r ${stat.color} text-white text-[9px] font-bold rounded-full`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-[10px] text-gray-600 mb-0.5">{stat.title}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Network Activity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-4"
        >
          <h3 className="text-sm font-bold text-gray-900 mb-3">Network Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Active Players</span>
              <span className="text-lg font-bold text-green-600">{myPlayers.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Pending Bets</span>
              <span className="text-lg font-bold text-orange-600">43</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Completed Today</span>
              <span className="text-lg font-bold text-blue-600">582</span>
            </div>
          </div>
        </motion.div>

        {/* Revenue Insights */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-md p-4 text-white"
        >
          <h3 className="text-sm font-bold mb-3">Revenue Insights</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-blue-200">Current Period Revenue</p>
              <p className="text-2xl font-bold">{(stats.revenue / 1000000).toFixed(1)}M MMK</p>
              <p className="text-[10px] text-blue-200 mt-0.5">↑ {stats.growth} {stats.comparison}</p>
            </div>
            <div className="pt-3 border-t border-blue-400">
              <p className="text-xs text-blue-200 mb-2">Monthly Target</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-blue-400 rounded-full h-2">
                  <div className="bg-white rounded-full h-2" style={{ width: '72%' }}></div>
                </div>
                <span className="text-xs font-semibold">72%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Agent Performance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Agent Performance</h3>
            <button className="text-xs text-blue-600 font-semibold flex items-center gap-1">
              View All
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {myAgents.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {agentPerformance.map((agent, index) => (
                <motion.button
                  key={agent.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + index * 0.05 }}
                  onClick={() => setSelectedAgent(myAgents.find(a => a.id === agent.id) || null)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {agent.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-gray-900 truncate">{agent.name}</p>
                    <p className="text-[10px] text-gray-500">
                      {agent.playersCount} Players • {agent.betsCount} Bets
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(agent.revenue)}</p>
                    <p className="text-[10px] text-gray-500">MMK</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No agents assigned</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 shadow-2xl flex-shrink-0">
        <div className="grid grid-cols-3 h-16">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('dashboard')}
            className="flex flex-col items-center justify-center gap-0.5 text-blue-600"
          >
            <Activity className="w-5 h-5" />
            <span className="text-[10px] font-bold">Dashboard</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('agents')}
            className="flex flex-col items-center justify-center gap-0.5 text-gray-500"
          >
            <UserCheck className="w-5 h-5" />
            <span className="text-[10px] font-medium">Agents</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('withdrawals')}
            className="flex flex-col items-center justify-center gap-0.5 text-gray-500"
          >
            <DollarSign className="w-5 h-5" />
            <span className="text-[10px] font-medium">Finance</span>
          </motion.button>
        </div>
      </div>

      {/* Agent Details Modal */}
      <AnimatePresence>
        {selectedAgent && (() => {
          const agentPlayers = myPlayers.filter(p => p.agentId === selectedAgent.id);
          const agentPerf = agentPerformance.find(a => a.id === selectedAgent.id);
          
          // Mock data for agent details
          const agentDetails = {
            phone: '+95 9 123 456 789',
            email: `${selectedAgent.username}@lottery.mm`,
            location: 'Yangon, Myanmar',
            balance: userBalances[selectedAgent.id] || 0,
            joinedDate: 'January 15, 2024',
            lastActive: 'Just now',
            totalDeposits: 2500000,
            totalWithdrawals: 1800000,
            pendingRequests: 2,
            completedTransactions: 45,
          };

          return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end z-50">
              <motion.div
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                className="bg-white rounded-t-3xl shadow-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-4 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-lg shadow-lg">
                      {selectedAgent.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">{selectedAgent.name}</h2>
                      <p className="text-blue-100 text-xs">@{selectedAgent.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="text-white p-2 rounded-lg"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border-2 border-blue-200">
                      <Wallet className="w-5 h-5 text-blue-600 mb-1" />
                      <p className="text-[10px] text-blue-600 font-semibold mb-0.5">Unit Balance</p>
                      <p className="text-base font-bold text-blue-900">{formatCurrency(agentDetails.balance)}</p>
                      <p className="text-[10px] text-blue-600">MMK</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border-2 border-green-200">
                      <Users className="w-5 h-5 text-green-600 mb-1" />
                      <p className="text-[10px] text-green-600 font-semibold mb-0.5">Total Players</p>
                      <p className="text-base font-bold text-green-900">{agentPlayers.length}</p>
                      <p className="text-[10px] text-green-600">Active</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border-2 border-purple-200">
                      <TrendingUp className="w-5 h-5 text-purple-600 mb-1" />
                      <p className="text-[10px] text-purple-600 font-semibold mb-0.5">Total Bets</p>
                      <p className="text-base font-bold text-purple-900">{agentPerf?.betsCount || 0}</p>
                      <p className="text-[10px] text-purple-600">This period</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border-2 border-orange-200">
                      <DollarSign className="w-5 h-5 text-orange-600 mb-1" />
                      <p className="text-[10px] text-orange-600 font-semibold mb-0.5">Revenue</p>
                      <p className="text-base font-bold text-orange-900">{formatCurrency(agentPerf?.revenue || 0)}</p>
                      <p className="text-[10px] text-orange-600">MMK</p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Phone className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-600">Phone</p>
                          <p className="text-sm font-semibold text-gray-900">{agentDetails.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Mail className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-600">Email</p>
                          <p className="text-xs font-semibold text-gray-900 truncate">{agentDetails.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-600">Location</p>
                          <p className="text-sm font-semibold text-gray-900">{agentDetails.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Overview */}
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Transaction Summary</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Total Deposits</span>
                        <span className="text-sm font-bold text-green-600">{formatCurrency(agentDetails.totalDeposits)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Total Withdrawals</span>
                        <span className="text-sm font-bold text-red-600">{formatCurrency(agentDetails.totalWithdrawals)}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <span className="text-sm text-gray-900 font-semibold">Net Flow</span>
                        <span className="text-sm font-bold text-blue-600">{formatCurrency(agentDetails.totalDeposits - agentDetails.totalWithdrawals)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Status */}
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Activity Status</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Last Active</span>
                        <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div>
                          {agentDetails.lastActive}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Pending Requests</span>
                        <span className="text-sm font-bold text-orange-600">{agentDetails.pendingRequests}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Completed Txns</span>
                        <span className="text-sm font-bold text-blue-600">{agentDetails.completedTransactions}</span>
                      </div>
                    </div>
                  </div>

                  {/* Players List */}
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        Players
                      </span>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        {agentPlayers.length}
                      </span>
                    </h3>
                    
                    {agentPlayers.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto hide-scrollbar">
                        {agentPlayers.map((player) => (
                          <div
                            key={player.id}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {player.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{player.name}</p>
                              <p className="text-[10px] text-gray-500">ID: {player.id.slice(-6)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">No players yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Activity className="w-3 h-3 text-green-600" />
                    <span className="font-semibold text-green-600">Active</span>
                  </div>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Balance Detail Modal */}
      <AnimatePresence>
        {showBalanceModal && (
          <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-t-3xl w-full max-w-[375px] shadow-2xl"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    <span className="font-pyidaungsu">လက်ကျန်ယူနစ်</span>
                    <span className="text-sm text-gray-500 ml-2">(Unit Balance)</span>
                  </h3>
                  <button
                    onClick={() => setShowBalanceModal(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto hide-scrollbar">
                {/* Main Balance Card */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-6 h-6 text-white" />
                      <span className="text-blue-100 text-sm font-medium">Available Balance</span>
                    </div>
                    {currentBalance < 100000 && (
                      <div className="bg-red-500/20 backdrop-blur-sm rounded-lg px-2 py-1">
                        <AlertTriangle className="w-4 h-4 text-yellow-300" />
                      </div>
                    )}
                  </div>
                  <div className="mb-2">
                    <p className="text-4xl font-bold text-white mb-1">
                      {formatCurrency(currentBalance)}
                    </p>
                    <p className="text-blue-100 text-sm">MMK Units</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 mt-4">
                    <p className="text-xs text-blue-100">
                      ≈ {((currentBalance || 0) / 1000000).toFixed(2)} Million MMK
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                    <Users className="w-5 h-5 text-green-600 mb-1" />
                    <p className="text-xs text-green-600 mb-1">My Agents</p>
                    <p className="text-xl font-bold text-green-900">{myAgents.length}</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
                    <UserIcon className="w-5 h-5 text-purple-600 mb-1" />
                    <p className="text-xs text-purple-600 mb-1">Total Players</p>
                    <p className="text-xl font-bold text-purple-900">{myPlayers.length}</p>
                  </div>
                </div>

                {/* Balance Breakdown */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Balance Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Available</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(currentBalance)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Distributed to Agents</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(myAgents.reduce((sum, agent) => sum + 0, 0))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Pending Requests</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {agentPendingRequests.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Agent Overview */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-gray-900">My Agents</h4>
                    <button 
                      onClick={() => {
                        setShowBalanceModal(false);
                        onNavigate('agents');
                      }}
                      className="text-xs text-blue-600 font-semibold"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-2">
                    {myAgents.slice(0, 3).map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {agent.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{agent.name}</p>
                            <p className="text-xs text-gray-500">@{agent.username}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowBalanceModal(false);
                      setShowBuyUnitsModal(true);
                    }}
                    className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Buy Units
                  </button>
                  <button
                    onClick={() => {
                      setShowBalanceModal(false);
                      onNavigate('agents');
                    }}
                    className="py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    My Agents
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Request Detail Modal */}
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
                      <p className="text-xs text-gray-600">Agent</p>
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
                    onClick={() => {
                      if (onRejectDeposit) {
                        onRejectDeposit(selectedRequest.id, 'Rejected by Master');
                        setShowRequestModal(false);
                        setSelectedRequest(null);
                      }
                    }}
                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      if (onApproveDeposit) {
                        onApproveDeposit(selectedRequest.id);
                        setShowRequestModal(false);
                        setSelectedRequest(null);
                      }
                    }}
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

      {/* Buy Units Modal - matching Agent MobileDashboard style */}
      <AnimatePresence>
        {showBuyUnitsModal && (
          <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-t-3xl w-full max-w-[375px] shadow-2xl"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Request Units from Admin</h3>
                  <button
                    onClick={() => {
                      setShowBuyUnitsModal(false);
                      setBuyUnitsForm({
                        amount: '',
                        paymentMethod: 'KBZ Pay',
                        transactionId: '',
                        paymentScreenshot: '',
                        note: ''
                      });
                    }}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto hide-scrollbar">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={buyUnitsForm.amount}
                    onChange={(e) => setBuyUnitsForm({ ...buyUnitsForm, amount: e.target.value })}
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={buyUnitsForm.paymentMethod}
                    onChange={(e) => setBuyUnitsForm({ ...buyUnitsForm, paymentMethod: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>KBZ Pay</option>
                    <option>Wave Money</option>
                    <option>CB Pay</option>
                    <option>AYA Pay</option>
                    <option>Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={buyUnitsForm.transactionId}
                    onChange={(e) => setBuyUnitsForm({ ...buyUnitsForm, transactionId: e.target.value })}
                    placeholder="Enter transaction ID"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Screenshot{' '}
                    <span className="text-xs font-normal text-gray-500" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                      (ငွေလွှဲပြေစာ)
                    </span>
                  </label>
                  <label className="block border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-blue-500 transition-all cursor-pointer active:bg-gray-50">
                    {!buyUnitsForm.paymentScreenshot ? (
                      <>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Camera className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-sm text-gray-600 font-medium">Tap to upload receipt</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                      </>
                    ) : (
                      <div className="relative">
                        <img
                          src={buyUnitsForm.paymentScreenshot}
                          alt="Payment Receipt"
                          className="max-h-40 mx-auto rounded-lg border-2 border-blue-300"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setBuyUnitsForm({ ...buyUnitsForm, paymentScreenshot: '' });
                          }}
                          className="absolute top-1 right-1 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all shadow-lg"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setBuyUnitsForm({ ...buyUnitsForm, paymentScreenshot: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {buyUnitsForm.paymentScreenshot && (
                    <div className="mt-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-xs text-blue-800 font-medium">Receipt uploaded successfully</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note (Optional)
                  </label>
                  <textarea
                    value={buyUnitsForm.note}
                    onChange={(e) => setBuyUnitsForm({ ...buyUnitsForm, note: e.target.value })}
                    placeholder="Add a note..."
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-xs text-blue-700" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    Admin ၏ ငွေလက်ခံအကောင့်သို့ တိကျသောပမာဏ လွှဲပြောင်းပြီး Transaction ID ကို ပေးပါ။
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowBuyUnitsModal(false);
                      setBuyUnitsForm({
                        amount: '',
                        paymentMethod: 'KBZ Pay',
                        transactionId: '',
                        paymentScreenshot: '',
                        note: ''
                      });
                    }}
                    className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (onRequestUnitDeposit && buyUnitsForm.amount && buyUnitsForm.transactionId) {
                        onRequestUnitDeposit({
                          amount: parseInt(buyUnitsForm.amount),
                          paymentMethod: buyUnitsForm.paymentMethod,
                          transactionId: buyUnitsForm.transactionId,
                          paymentScreenshot: buyUnitsForm.paymentScreenshot || undefined,
                          note: buyUnitsForm.note || undefined,
                        });
                        setShowBuyUnitsModal(false);
                        setBuyUnitsForm({
                          amount: '',
                          paymentMethod: 'KBZ Pay',
                          transactionId: '',
                          paymentScreenshot: '',
                          note: ''
                        });
                      }
                    }}
                    disabled={!buyUnitsForm.amount || !buyUnitsForm.transactionId}
                    className={`flex-1 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 ${
                      buyUnitsForm.amount && buyUnitsForm.transactionId
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    Submit
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
