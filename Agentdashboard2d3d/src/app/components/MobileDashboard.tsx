import { Users, TrendingUp, DollarSign, Activity, UserCheck, Calendar, Clock, Menu, ChevronRight, Eye, Wallet, X, LogOut, User as UserIcon, LayoutDashboard, Shield, AlertTriangle, Plus, Bell, CheckCircle, ArrowUpCircle, ArrowDownLeft, Award, Upload, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'master' | 'agent';
}

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
  note?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  respondedAt?: string;
  rejectionReason?: string;
}

interface MobileDashboardProps {
  onNavigate: (page: string) => void;
  bets: any[];
  currentUser: User;
  currentBalance?: number;
  unitDepositRequests?: UnitDepositRequest[];
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

export function MobileDashboard({ 
  onNavigate, 
  bets, 
  currentUser, 
  currentBalance = 0,
  unitDepositRequests = [],
  onRequestUnitDeposit,
  onLogout 
}: MobileDashboardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('daily');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showBuyUnitsModal, setShowBuyUnitsModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
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

  const totalStakes = bets.reduce((sum, bet) => sum + bet.amount, 0);
  const totalPayouts = bets.filter((b) => b.status === 'Won').reduce((sum, b) => sum + b.amount * 80, 0);
  const commission = totalStakes * 0.15;

  // Get agent's pending requests only
  const myPendingRequests = unitDepositRequests.filter(r => r.requesterId === currentUser.id && r.status === 'pending');

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
    if (timePeriod === 'daily') {
      return {
        stakes: 1312000,
        players: 48,
        bets: 285,
        commission: 196800,
        growth: '+12%',
        comparison: 'vs yesterday'
      };
    } else if (timePeriod === 'weekly') {
      return {
        stakes: 8376000,
        players: 67,
        bets: 1890,
        commission: 1256400,
        growth: '+18%',
        comparison: 'vs last week'
      };
    } else {
      return {
        stakes: 32560000,
        players: 89,
        bets: 7560,
        commission: 4884000,
        growth: '+15%',
        comparison: 'vs last month'
      };
    }
  };

  const stats = getStatsForPeriod();

  const statCards = [
    {
      title: 'My Players',
      value: stats.players.toString(),
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      change: '+5'
    },
    {
      title: 'Total Bets',
      value: stats.bets.toString(),
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      change: stats.growth
    },
    {
      title: 'Stakes (MMK)',
      value: `${(stats.stakes / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      change: stats.growth
    },
    {
      title: 'Commission',
      value: `${(stats.commission / 1000000).toFixed(1)}M`,
      icon: Award,
      color: 'from-orange-500 to-orange-600',
      change: stats.growth
    }
  ];

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return '0';
    return amount.toLocaleString('en-US');
  };

  return (
    <div className="w-full max-w-[375px] h-screen bg-[#F5F7FA] flex flex-col mx-auto relative overflow-hidden">
      {/* Header - Green gradient for Agent */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-4 shadow-lg flex-shrink-0 relative z-50">
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            {myPendingRequests.length > 0 && (
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {myPendingRequests.length}
                </span>
              </button>
            )}
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <UserCheck className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white">Agent</span>
            </div>
          </div>
        </div>
        
        <div className="mb-3">
          <h1 className="text-xl font-bold text-white">Agent Dashboard</h1>
          <p className="text-xs text-green-100 mt-0.5">Welcome, {currentUser.name}</p>
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="bg-gradient-to-br from-green-600 to-green-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white text-lg font-bold">Menu</h2>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center border-2 border-white/30">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{currentUser.name}</p>
                    <p className="text-green-100 text-xs capitalize">Agent</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 py-4 overflow-y-auto hide-scrollbar">
                <nav className="space-y-1 px-3">
                  <button
                    onClick={() => { onNavigate('dashboard'); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-green-50 transition-colors text-left group"
                  >
                    <LayoutDashboard className="w-5 h-5 text-green-600 group-hover:text-green-700" />
                    <span className="text-gray-700 font-medium group-hover:text-green-700">Dashboard</span>
                  </button>

                  <button
                    onClick={() => { onNavigate('players'); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors text-left group"
                  >
                    <Users className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
                    <span className="text-gray-700 font-medium group-hover:text-blue-700">Players</span>
                  </button>

                  <button
                    onClick={() => { onNavigate('deposits'); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-yellow-50 transition-colors text-left group"
                  >
                    <ArrowUpCircle className="w-5 h-5 text-yellow-600 group-hover:text-yellow-700" />
                    <span className="text-gray-700 font-medium group-hover:text-yellow-700">Deposits</span>
                  </button>

                  <button
                    onClick={() => { onNavigate('withdrawals'); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-orange-50 transition-colors text-left group"
                  >
                    <ArrowDownLeft className="w-5 h-5 text-orange-600 group-hover:text-orange-700" />
                    <span className="text-gray-700 font-medium group-hover:text-orange-700">Withdrawals</span>
                  </button>

                  <button
                    onClick={() => { onNavigate('transactions'); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-50 transition-colors text-left group"
                  >
                    <DollarSign className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
                    <span className="text-gray-700 font-medium group-hover:text-purple-700">Transactions</span>
                  </button>
                </nav>
              </div>

              <div className="border-t border-gray-200 p-4">
                <button
                  onClick={() => { setMenuOpen(false); onLogout(); }}
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
              className="fixed top-0 right-0 bottom-0 w-[320px] bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">Pending Requests</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
                {myPendingRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium">No pending requests</p>
                    <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  myPendingRequests.map(request => (
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
                  သင့်တောင်းခံမှုများကို Master မှ အတည်ပြုလိမ့်မည်
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
              <Calendar className="w-4 h-4 text-green-600" />
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
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                    : 'text-gray-600'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Unit Balance & Buy Units */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Available Balance Card */}
          <button
            onClick={() => setShowBalanceModal(true)}
            className={`w-full text-left rounded-xl shadow-md p-4 hover:shadow-lg transition-all active:scale-98 border-2 ${
              currentBalance < 100000
                ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-300'
                : 'bg-gradient-to-br from-green-50 to-green-100 border-green-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${currentBalance < 100000 ? 'bg-red-200' : 'bg-green-200'}`}>
                  <Wallet className={`w-4 h-4 ${currentBalance < 100000 ? 'text-red-700' : 'text-green-700'}`} />
                </div>
                <div>
                  <h3 className={`text-xs font-bold ${currentBalance < 100000 ? 'text-red-700' : 'text-green-700'}`}>My Units</h3>
                  <p className={`text-[9px] ${currentBalance < 100000 ? 'text-red-600' : 'text-green-600'}`} style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
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
                <ChevronRight className={`w-4 h-4 ${currentBalance < 100000 ? 'text-red-600' : 'text-green-600'}`} />
              </div>
            </div>
            <div className="mb-3">
              <p className={`text-2xl font-bold ${currentBalance < 100000 ? 'text-red-800' : 'text-green-800'}`}>{formatCurrency(currentBalance)}</p>
              <p className={`text-[9px] ${currentBalance < 100000 ? 'text-red-600' : 'text-green-600'}`}>Available Units (MMK)</p>
            </div>
            <div className={`flex items-center gap-2 text-xs ${currentBalance < 100000 ? 'text-red-700' : 'text-green-700'}`}>
              <Eye className="w-3.5 h-3.5" />
              <span>Tap to view details</span>
            </div>
          </button>

          {/* Buy More Units Button */}
          <button
            onClick={() => setShowBuyUnitsModal(true)}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Buy More Units
          </button>

          {/* Pending Requests Notification */}
          {myPendingRequests.length > 0 && (
            <button
              onClick={() => setShowNotifications(true)}
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
                      {myPendingRequests.length} Pending Request{myPendingRequests.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-[9px] text-orange-100">Awaiting Master approval</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
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
          <h3 className="text-sm font-bold text-gray-900 mb-3">Player Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Active Players</span>
              <span className="text-lg font-bold text-green-600">{stats.players}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Pending Bets</span>
              <span className="text-lg font-bold text-orange-600">
                {bets.filter(b => b.status === 'Pending').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Completed Today</span>
              <span className="text-lg font-bold text-blue-600">{stats.bets}</span>
            </div>
          </div>
        </motion.div>

        {/* Revenue Insights */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-md p-4 text-white"
        >
          <h3 className="text-sm font-bold mb-3">Revenue Insights</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-green-200">Current Period Stakes</p>
              <p className="text-2xl font-bold">{(stats.stakes / 1000000).toFixed(1)}M MMK</p>
              <p className="text-[10px] text-green-200 mt-0.5">{stats.growth} {stats.comparison}</p>
            </div>
            <div className="pt-3 border-t border-green-400">
              <p className="text-xs text-green-200 mb-2">Commission Rate: 15%</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-green-400 rounded-full h-2">
                  <div className="bg-white rounded-full h-2" style={{ width: '68%' }}></div>
                </div>
                <span className="text-xs font-semibold">68%</span>
              </div>
              <p className="text-[10px] text-green-200 mt-1">Monthly target progress</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Recent Bets</h3>
            <button 
              onClick={() => onNavigate('players')}
              className="text-xs text-green-600 font-semibold flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {bets.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {bets.slice(0, 5).map((bet, index) => (
                <motion.div
                  key={bet.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + index * 0.05 }}
                  className="px-4 py-3 flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {bet.playerName.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{bet.playerName}</p>
                    <p className="text-[10px] text-gray-500">
                      {bet.betNumber} • {bet.amount.toLocaleString()} MMK
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      bet.gameType === '2D' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {bet.gameType}
                    </span>
                    <span className={`text-[9px] font-semibold ${
                      bet.status === 'Won' ? 'text-green-600' :
                      bet.status === 'Lost' ? 'text-red-600' :
                      'text-orange-600'
                    }`}>
                      {bet.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No recent bets</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 shadow-2xl flex-shrink-0">
        <div className="grid grid-cols-4 h-16">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('dashboard')}
            className="flex flex-col items-center justify-center gap-0.5 text-green-600"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-bold">Dashboard</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('players')}
            className="flex flex-col items-center justify-center gap-0.5 text-gray-500"
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-medium">Players</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('deposits')}
            className="flex flex-col items-center justify-center gap-0.5 text-gray-500"
          >
            <ArrowUpCircle className="w-5 h-5" />
            <span className="text-[10px] font-medium">Deposits</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('withdrawals')}
            className="flex flex-col items-center justify-center gap-0.5 text-gray-500"
          >
            <ArrowDownLeft className="w-5 h-5" />
            <span className="text-[10px] font-medium">Withdraw</span>
          </motion.button>
        </div>
      </div>

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
                    <span style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>လက်ကျန်ယူနစ်</span>
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
                <div className={`rounded-2xl p-6 shadow-lg ${
                  currentBalance < 100000
                    ? 'bg-gradient-to-br from-red-500 to-red-600'
                    : 'bg-gradient-to-br from-green-500 to-green-600'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-6 h-6 text-white" />
                      <span className="text-green-100 text-sm font-medium">Available Balance</span>
                    </div>
                    {currentBalance < 100000 && (
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
                        <AlertTriangle className="w-4 h-4 text-yellow-300" />
                      </div>
                    )}
                  </div>
                  <div className="mb-2">
                    <p className="text-4xl font-bold text-white mb-1">
                      {currentBalance.toLocaleString('en-US')}
                    </p>
                    <p className="text-green-100 text-sm">MMK Units</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 mt-4">
                    <p className="text-xs text-green-100">
                      ≈ {(currentBalance / 1000000).toFixed(2)} Million MMK
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                    <p className="text-xs text-blue-600 mb-1">Stakes</p>
                    <p className="text-lg font-bold text-blue-900">{(totalStakes / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3 border border-red-200">
                    <p className="text-xs text-red-600 mb-1">Payouts</p>
                    <p className="text-lg font-bold text-red-900">{(totalPayouts / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                    <p className="text-xs text-green-600 mb-1">Commission</p>
                    <p className="text-lg font-bold text-green-900">{(commission / 1000).toFixed(0)}K</p>
                  </div>
                </div>

                {/* Balance Breakdown */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Balance Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Available</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{currentBalance.toLocaleString('en-US')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">In Play</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{totalStakes.toLocaleString('en-US')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Pending</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">0</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowBalanceModal(false);
                      setShowBuyUnitsModal(true);
                    }}
                    className="py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    Buy Units
                  </button>
                  <button
                    onClick={() => {
                      setShowBalanceModal(false);
                      onNavigate('transactions');
                    }}
                    className="py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    History
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Buy Units Modal */}
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
                  <h3 className="text-lg font-bold text-gray-900">Request Units from Master</h3>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={buyUnitsForm.paymentMethod}
                    onChange={(e) => setBuyUnitsForm({ ...buyUnitsForm, paymentMethod: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Screenshot{' '}
                    <span className="text-xs font-normal text-gray-500" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                      (ငွေလွဲပြေစာ)
                    </span>
                  </label>
                  <label className="block border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-green-500 transition-all cursor-pointer active:bg-gray-50">
                    {!buyUnitsForm.paymentScreenshot ? (
                      <>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Camera className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-sm text-gray-600 font-medium">Tap to upload receipt</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                      </>
                    ) : (
                      <div className="relative">
                        <img
                          src={buyUnitsForm.paymentScreenshot}
                          alt="Payment Receipt"
                          className="max-h-40 mx-auto rounded-lg border-2 border-green-300"
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
                    <div className="mt-2 p-2.5 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-xs text-green-800 font-medium">Receipt uploaded successfully</span>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-xs text-green-700" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    Master ၏ ငွေလက်ခံအကောင့်သို့ တိကျသောပမာဏ လွှဲပြောင်းပြီး Transaction ID ကို ပေးပါ။
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
                        ? 'bg-gradient-to-r from-green-600 to-green-700 shadow-lg'
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