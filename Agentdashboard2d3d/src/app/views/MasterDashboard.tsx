import { useState, useEffect } from 'react';
import { Users, TrendingUp, DollarSign, Activity, UserCheck, Calendar, Clock, Eye, XCircle, Phone, Mail, MapPin, Wallet, AlertTriangle, Plus, ArrowUpCircle, Bell, CheckCircle, TrendingDown, Award, Upload, AlertCircle, X, Banknote, Package, Network } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

interface ApiStats {
  total_masters: number;
  total_agents: number;
  total_players: number;
  total_bet_volume: number;
}

interface MasterDashboardProps {
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
  apiStats?: ApiStats | null;
}

type TimePeriod = 'daily' | 'weekly' | 'monthly';

export function MasterDashboard({ currentUser, allUsers, allPlayers, currentBalance = 0, userBalances = {}, pendingDepositRequests = [], myUnitDepositRequests = [], onApproveDeposit, onRejectDeposit, onRequestUnitDeposit, apiStats = null }: MasterDashboardProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('daily');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [selectedAgent, setSelectedAgent] = useState<User | null>(null);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showMyRequestsDropdown, setShowMyRequestsDropdown] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<UnitDepositRequest | null>(null);
  const [showBalanceAnimation, setShowBalanceAnimation] = useState(false);
  const [transferAmount, setTransferAmount] = useState(0);
  const [showBuyUnitsModal, setShowBuyUnitsModal] = useState(false);

  // Buy Units form state (matching Agent's DashboardView pattern)
  const [buyAmount, setBuyAmount] = useState('');
  const [buyPaymentMethod, setBuyPaymentMethod] = useState('KBZ Pay');
  const [buyTransactionId, setBuyTransactionId] = useState('');
  const [buyPaymentScreenshot, setBuyPaymentScreenshot] = useState<string>('');
  const [buyNote, setBuyNote] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Master's own pending requests to Admin
  const myPendingRequests = myUnitDepositRequests.filter(r => r.requesterId === currentUser.id && r.status === 'pending');

  // Unit Management State - using props from parent (single source of truth)
  const availableBalance = currentBalance;
  const myAgentsList = allUsers.filter(u => u.role === 'agent' && u.parentId === currentUser.id);
  const totalAllocated = myAgentsList.reduce((sum, agent) => sum + (userBalances[agent.id] || 0), 0);
  const totalBalance = (availableBalance || 0) + (totalAllocated || 0); // Total units owned
  const LOW_BALANCE_THRESHOLD = 100000; // Warning threshold
  const isLowBalance = (availableBalance || 0) < LOW_BALANCE_THRESHOLD;
  const allocationPercentage = totalBalance > 0 ? ((totalAllocated || 0) / totalBalance) * 100 : 0;
  
  // Daily Sales Summary (Mock Data)
  const todayTotalSales = 300000; // Total bets taken today
  const todayCommissions = 15000; // Master's earnings (5% of sales)
  const todayPayouts = 120000; // Winnings paid out
  const todayNetProfit = (todayTotalSales || 0) - (todayCommissions || 0) - (todayPayouts || 0); // Net profit
  
  // Agent deposit requests pending for this master (filter out Master's own requests)
  const agentPendingRequests = pendingDepositRequests.filter(r => r.requesterId !== currentUser.id);

  // Handle approve with animation
  const handleApproveWithAnimation = (requestId: string) => {
    const request = agentPendingRequests.find(r => r.id === requestId);
    if (request && onApproveDeposit) {
      setTransferAmount(request.amount);
      setShowBalanceAnimation(true);
      
      // Trigger the actual approval (balance updates via parent state)
      onApproveDeposit(requestId);
      
      // Hide animation after 3 seconds
      setTimeout(() => {
        setShowBalanceAnimation(false);
        setShowNotificationDropdown(false);
      }, 3000);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get agents under this master
  const myAgents = allUsers.filter(u => u.role === 'agent' && u.parentId === currentUser.id);
  const myAgentIds = myAgents.map(a => a.id);
  
  // Get players under my agents
  const myPlayers = allPlayers.filter(p => p.agentId && myAgentIds.includes(p.agentId));

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  // Generate data based on time period
  const getChartData = () => {
    if (timePeriod === 'daily') {
      return [
        { name: '00:00', revenue: 125000, bets: 22, players: 15 },
        { name: '04:00', revenue: 98000, bets: 18, players: 12 },
        { name: '08:00', revenue: 215000, bets: 38, players: 24 },
        { name: '12:00', revenue: 345000, bets: 62, players: 35 },
        { name: '16:00', revenue: 456000, bets: 78, players: 45 },
        { name: '20:00', revenue: 623000, bets: 112, players: 62 },
        { name: '23:59', revenue: 438000, bets: 72, players: 48 }
      ];
    } else if (timePeriod === 'weekly') {
      return [
        { name: 'Mon', revenue: 1620000, bets: 290, players: 122 },
        { name: 'Tue', revenue: 1840000, bets: 322, players: 134 },
        { name: 'Wed', revenue: 2060000, bets: 360, players: 144 },
        { name: 'Thu', revenue: 1945000, bets: 340, players: 137 },
        { name: 'Fri', revenue: 2280000, bets: 399, players: 156 },
        { name: 'Sat', revenue: 2615000, bets: 462, players: 178 },
        { name: 'Sun', revenue: 2490000, bets: 437, players: 167 }
      ];
    } else {
      return [
        { name: 'Jan', revenue: 42700000, bets: 7600, players: 925 },
        { name: 'Feb', revenue: 46150000, bets: 8400, players: 1010 },
        { name: 'Mar', revenue: 49350000, bets: 9100, players: 1090 },
        { name: 'Apr', revenue: 51250000, bets: 9700, players: 1170 },
        { name: 'May', revenue: 54450000, bets: 10300, players: 1260 },
        { name: 'Jun', revenue: 57600000, bets: 10900, players: 1340 }
      ];
    }
  };

  const getStatsForPeriod = () => {
    const baseStats = apiStats
      ? { agents: apiStats.total_agents, players: apiStats.total_players }
      : { agents: myAgents.length, players: myPlayers.length };
    const revenueFromApi = apiStats ? apiStats.total_bet_volume : 0;

    if (timePeriod === 'daily') {
      return {
        ...baseStats,
        revenue: revenueFromApi || 2300000,
        bets: 402,
        growth: '+12%',
        comparison: 'vs yesterday'
      };
    } else if (timePeriod === 'weekly') {
      return {
        ...baseStats,
        revenue: revenueFromApi || 14850000,
        bets: 2610,
        growth: '+18%',
        comparison: 'vs last week'
      };
    } else {
      return {
        ...baseStats,
        revenue: revenueFromApi || 57600000,
        bets: 10900,
        growth: '+15%',
        comparison: 'vs last month'
      };
    }
  };

  const stats = getStatsForPeriod();
  const chartData = getChartData();

  const statCards = [
    {
      title: 'My Agents',
      value: stats.agents.toString(),
      icon: UserCheck,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      change: '+2 this month'
    },
    {
      title: 'Total Players',
      value: stats.players.toString(),
      icon: Users,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      change: '+15 this month'
    },
    {
      title: 'Total Bets',
      value: stats.bets.toString(),
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      change: `${stats.growth} ${stats.comparison}`
    },
    {
      title: 'Revenue (MMK)',
      value: `${(stats.revenue / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      change: `${stats.growth} ${stats.comparison}`
    }
  ];

  const agentPerformance = myAgents.map((agent, index) => {
    const agentPlayers = myPlayers.filter(p => p.agentId === agent.id);
    
    // Static dummy data for each agent
    const dummyData = [
      { revenue: 425000, betsCount: 156 },
      { revenue: 380000, betsCount: 132 },
      { revenue: 510000, betsCount: 189 },
      { revenue: 290000, betsCount: 98 },
      { revenue: 445000, betsCount: 167 },
      { revenue: 360000, betsCount: 125 },
      { revenue: 475000, betsCount: 178 }
    ];
    
    const data = dummyData[index % dummyData.length] || { revenue: 0, betsCount: 0 };
    
    return {
      id: agent.id || '',
      name: agent.name || 'Unknown',
      username: agent.username || 'unknown',
      playersCount: agentPlayers.length || 0,
      revenue: data.revenue || 0,
      betsCount: data.betsCount || 0
    };
  });

  const formatCurrency = (amount: number = 0) => {
    return (amount || 0).toLocaleString('en-US');
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Master Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {currentUser.name}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-3">
              {/* Pending Requests Notification */}
              {agentPendingRequests.length > 0 && (
                <div className="relative">
                  <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 cursor-pointer hover:shadow-xl transition-all"
                  >
                    <div className="relative">
                      <Bell className="w-5 h-5" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">
                        {agentPendingRequests.length} Pending Request{agentPendingRequests.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-blue-100">Agent unit requests</p>
                    </div>
                  </motion.button>

                  {/* Notification Dropdown */}
                  <AnimatePresence>
                    {showNotificationDropdown && (
                      <>
                        {/* Backdrop */}
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setShowNotificationDropdown(false)}
                        />
                        
                        {/* Dropdown Panel */}
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-3 w-[480px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                        >
                          {/* Header */}
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Bell className="w-5 h-5 text-white" />
                              <div>
                                <h3 className="text-white font-bold text-lg">Pending Requests</h3>
                                <p className="text-blue-100 text-xs" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                                  ယူနစ်တောင်းခံမှုများ
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => setShowNotificationDropdown(false)}
                              className="text-white hover:bg-blue-700 p-1.5 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Requests List */}
                          <div className="max-h-[400px] overflow-y-auto">
                            {agentPendingRequests.slice(0, 5).map((request, index) => (
                              <motion.div
                                key={request.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="px-6 py-4 border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowNotificationDropdown(false);
                                }}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                      <UserCheck className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-bold text-gray-900">{request?.requesterName || 'Agent'}</p>
                                      <p className="text-sm text-gray-600">
                                        via {request?.paymentMethod || 'N/A'}
                                        {request?.transactionId && (
                                          <span className="text-xs text-gray-500"> • ID: {request.transactionId}</span>
                                        )}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {request?.requestedAt ? new Date(request.requestedAt).toLocaleString() : 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0 ml-4">
                                    <p className="text-xl font-bold text-blue-600">
                                      {(request?.amount || 0).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500">Units</p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          {/* Footer */}
                          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <p className="text-center text-sm text-gray-600 mb-3" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                              အသေးစိတ်ကြည့်ရန် Request တစ်ခုကို နှိပ်ပါ
                            </p>
                            {agentPendingRequests.length > 5 && (
                              <p className="text-center text-sm text-gray-600">
                                + {agentPendingRequests.length - 5} more request{agentPendingRequests.length - 5 > 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* My Own Pending Requests to Admin - matching Agent's green notification style */}
              {myPendingRequests.length > 0 && (
                <div className="relative">
                  <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowMyRequestsDropdown(!showMyRequestsDropdown)}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 cursor-pointer hover:shadow-xl transition-all"
                  >
                    <div className="relative">
                      <Bell className="w-5 h-5" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">
                        {myPendingRequests.length} Pending Request{myPendingRequests.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-green-100">Unit requests</p>
                    </div>
                  </motion.button>

                  {/* My Requests Dropdown */}
                  <AnimatePresence>
                    {showMyRequestsDropdown && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setShowMyRequestsDropdown(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-3 w-[480px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                        >
                          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Bell className="w-5 h-5 text-white" />
                              <div>
                                <h3 className="text-white font-bold text-lg">Pending Unit Requests</h3>
                                <p className="text-green-100 text-xs" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                                  ယူနစ်တောင်းခံမှုများ
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => setShowMyRequestsDropdown(false)}
                              className="text-white hover:bg-green-700 p-1.5 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="max-h-[400px] overflow-y-auto">
                            {myPendingRequests.map((request, index) => (
                              <motion.div
                                key={request.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="px-6 py-4 border-b border-gray-100 hover:bg-orange-50/50 transition-colors"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                                      <Clock className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-bold text-gray-900">Awaiting Approval</p>
                                      <p className="text-sm text-gray-600">
                                        via {request?.paymentMethod || 'N/A'}
                                        {request?.transactionId && (
                                          <span className="text-xs text-gray-500"> • ID: {request.transactionId}</span>
                                        )}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {request?.requestedAt ? new Date(request.requestedAt).toLocaleString() : 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0 ml-4">
                                    <p className="text-xl font-bold text-orange-600">
                                      {(request?.amount || 0).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500">Units</p>
                                    <div className="mt-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-bold inline-flex items-center gap-1">
                                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                                      Pending
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <p className="text-center text-sm text-gray-600" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                              သင့်တောင်းခံမှုများကို Admin မှ အတည်ပြုလိမ့်မည်
                            </p>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
              
              <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-semibold text-sm">
                <UserCheck className="w-4 h-4 inline mr-2" />
                Master Account
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(currentDateTime)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-900 font-semibold text-lg mt-1">
                <Clock className="w-4 h-4" />
                <span>{formatTime(currentDateTime)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* STEP 1: Balance Summary - The Master's Money (Unit Lifecycle) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Unit Balance Overview</h2>
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              ယူနစ် လက်ကျန်ရှင်း အခြေအနေ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 (Left): My Units - Master's Available Balance */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`rounded-2xl shadow-xl overflow-hidden border-2 transition-all ${
                isLowBalance 
                  ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-300' 
                  : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300'
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${isLowBalance ? 'bg-red-200' : 'bg-blue-200'}`}>
                      <Wallet className={`w-6 h-6 ${isLowBalance ? 'text-red-700' : 'text-blue-700'}`} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${isLowBalance ? 'text-red-700' : 'text-blue-700'}`}>
                        My Units
                      </h3>
                      <p className={`text-xs ${isLowBalance ? 'text-red-600' : 'text-blue-600'}`} style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                        လက်ကျန်ယူနစ်
                      </p>
                    </div>
                  </div>
                  {isLowBalance && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="p-2 bg-red-200 rounded-lg"
                    >
                      <AlertTriangle className="w-5 h-5 text-red-700" />
                    </motion.div>
                  )}
                </div>

                <div className="mb-3">
                  <div className="flex items-baseline gap-2">
                    <p className={`text-4xl font-bold ${isLowBalance ? 'text-red-800' : 'text-blue-800'}`}>
                      {(availableBalance || 0).toLocaleString()}
                    </p>
                  </div>
                  <p className={`text-xs mt-1 ${isLowBalance ? 'text-red-600' : 'text-blue-600'}`}>
                    Available Units (MMK)
                  </p>
                </div>

                {isLowBalance && (
                  <div className="mb-3 p-2.5 bg-red-200 border border-red-400 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-red-800" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                      ယူနစ်များလုံလောက်မှုမရှိပါ။
                    </p>
                  </div>
                )}

                <button 
                  onClick={() => setShowBuyUnitsModal(true)}
                  className={`w-full py-2.5 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm ${
                    isLowBalance 
                      ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Buy More Units
                </button>
              </div>
            </motion.div>

            {/* Card 2 (Middle): Agent Balances - Units Distributed to Agents */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-300 rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-200 rounded-xl">
                      <Users className="w-6 h-6 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-700">
                        Agent Balances
                      </h3>
                      <p className="text-xs text-blue-600" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                        အေးဂျင့်များရှိယူနစ်
                      </p>
                    </div>
                  </div>
                  <div className="px-2.5 py-1.5 bg-blue-200 rounded-lg">
                    <p className="text-xs font-bold text-blue-800">
                      {myAgents.length} Agents
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-blue-800">
                      {(totalAllocated || 0).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Distributed Units (MMK)
                  </p>
                </div>

                {/* Allocation Progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-blue-700">
                    <span>Distribution Rate</span>
                    <span>{(allocationPercentage || 0).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-blue-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(allocationPercentage || 0, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 3 (Right): Total Network Value - Most Prominent */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-blue-600 to-indigo-700 border-2 border-blue-400 rounded-2xl shadow-2xl overflow-hidden relative"
            >
              {/* Decorative background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
              </div>

              <div className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <Network className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Total Network Value
                      </h3>
                      <p className="text-xs text-blue-200" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                        စုစုပေါင်းယူနစ်ပမာဏ
                      </p>
                    </div>
                  </div>
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex items-baseline gap-2">
                    <motion.p 
                      className="text-5xl font-black text-white drop-shadow-lg"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {(totalBalance || 0).toLocaleString()}
                    </motion.p>
                  </div>
                  <p className="text-sm text-blue-100 mt-1 font-semibold">
                    Total Units (MMK)
                  </p>
                </div>

                {/* Breakdown */}
                <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-100">Your Units:</span>
                    <span className="text-white font-bold">{(availableBalance || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-100">Agent Units:</span>
                    <span className="text-white font-bold">{(totalAllocated || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4 p-2.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <p className="text-xs text-white font-semibold text-center">
                    💎 Your Complete Unit Portfolio
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* STEP 2: Today's Sales Summary - The Market Activity */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Today's Summary</h2>
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              ယနေ့အခြေအနေ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Amount A: Total Sales (Green - Revenue) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-300 rounded-2xl shadow-lg p-5 hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-green-200 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-green-700">Total Sales</h3>
                  <p className="text-xs text-green-600" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    စုစုပေါင်းအရောင်း
                  </p>
                </div>
              </div>
              <p className="text-3xl font-bold text-green-800">
                {(todayTotalSales || 0).toLocaleString()}
              </p>
              <p className="text-xs text-green-600 mt-1">MMK (Today)</p>
            </motion.div>

            {/* Amount B: Commissions (Green - Revenue) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-300 rounded-2xl shadow-lg p-5 hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-green-200 rounded-xl">
                  <Award className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-green-700">Commissions</h3>
                  <p className="text-xs text-green-600" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    ကော်မရှင်
                  </p>
                </div>
              </div>
              <p className="text-3xl font-bold text-green-800">
                {(todayCommissions || 0).toLocaleString()}
              </p>
              <p className="text-xs text-green-600 mt-1">Your Earnings</p>
            </motion.div>

            {/* Payouts (Red - Liability) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-2xl shadow-lg p-5 hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-red-200 rounded-xl">
                  <TrendingDown className="w-5 h-5 text-red-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-700">Payouts</h3>
                  <p className="text-xs text-red-600" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    ထွက်ငွေ
                  </p>
                </div>
              </div>
              <p className="text-3xl font-bold text-red-800">
                {(todayPayouts || 0).toLocaleString()}
              </p>
              <p className="text-xs text-red-600 mt-1">Winnings Paid</p>
            </motion.div>

            {/* Amount C: Net Profit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className={`rounded-2xl shadow-lg p-5 hover:shadow-xl transition-all border-2 ${
                todayNetProfit >= 0
                  ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-300'
                  : 'bg-gradient-to-br from-red-50 to-red-100 border-red-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-xl ${todayNetProfit >= 0 ? 'bg-green-200' : 'bg-red-200'}`}>
                  <Banknote className={`w-5 h-5 ${todayNetProfit >= 0 ? 'text-green-700' : 'text-red-700'}`} />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${todayNetProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    Net Profit
                  </h3>
                  <p className={`text-xs ${todayNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    အသားတင်အမြတ်
                  </p>
                </div>
              </div>
              <p className={`text-3xl font-bold ${todayNetProfit >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                {todayNetProfit >= 0 ? '+' : ''}{(todayNetProfit || 0).toLocaleString()}
              </p>
              <p className={`text-xs mt-1 ${todayNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {todayNetProfit >= 0 ? 'Profit Today' : 'Loss Today'}
              </p>
            </motion.div>
          </div>

          {/* Color Legend */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-xl p-4"
          >
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span className="text-sm font-semibold text-gray-700">Blue = Units (Stock)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <span className="text-sm font-semibold text-gray-700">Green = Sales (Revenue)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <span className="text-sm font-semibold text-gray-700">Red = Payouts (Liability)</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Time Period Selector */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Analytics Period</h2>
            </div>
            <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
              {(['daily', 'weekly', 'monthly'] as TimePeriod[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    timePeriod === period
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <div className={`px-3 py-1 bg-gradient-to-r ${stat.color} text-white text-xs font-semibold rounded-full`}>
                    {stat.change}
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '12px'
                  }}
                  formatter={(value: number) => `${formatCurrency(value)} MMK`}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bets Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Betting Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '12px'
                  }}
                />
                <Legend />
                <Bar dataKey="bets" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="players" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Player Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Player Growth & Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '12px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="players"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="bets"
                stroke="#F59E0B"
                strokeWidth={3}
                dot={{ fill: '#F59E0B', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Agent Performance & Unit Velocity Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Unit Velocity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900">Agent Sales Activity</h3>
              <p className="text-sm text-gray-600" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                အေးဂျင့်များ၏ အရောင်းအခြေအနေ
              </p>
            </div>
            
            {myAgents.length > 0 ? (
              <div className="space-y-4">
                {agentPerformance.map((agent, index) => {
                  const allocatedUnits = 100000; // Example allocated units per agent
                  const usedUnits = (agent?.revenue || 0) / 10; // Convert revenue to units
                  const usagePercentage = allocatedUnits > 0 ? (usedUnits / allocatedUnits) * 100 : 0;
                  const isHighUsage = usagePercentage >= 90;
                  
                  return (
                    <div key={agent?.id || index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {(agent?.name || 'A').charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{agent?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">@{agent?.username || 'unknown'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{(usagePercentage || 0).toFixed(1)}%</p>
                          <p className="text-xs text-gray-500">{Math.floor(usedUnits || 0).toLocaleString()} / {(allocatedUnits || 0).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="relative w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(usagePercentage, 100)}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className={`h-full rounded-lg ${
                            isHighUsage 
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600' 
                              : 'bg-gradient-to-r from-blue-500 to-blue-600'
                          } flex items-center justify-end pr-2`}
                        >
                          {isHighUsage && (
                            <motion.span
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                              <AlertTriangle className="w-4 h-4 text-white" />
                            </motion.span>
                          )}
                        </motion.div>
                      </div>
                      {isHighUsage && (
                        <p className="text-xs text-orange-600 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          High usage - Agent may need more units soon
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm">No agent activity data</p>
              </div>
            )}
          </motion.div>

          {/* Top Sellers List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-2xl shadow-lg p-6"
          >
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-purple-900">Top Sellers</h3>
              </div>
              <p className="text-xs text-purple-700">Last 24 hours</p>
            </div>

            {agentPerformance.length > 0 ? (
              <div className="space-y-4">
                {agentPerformance
                  .sort((a, b) => (b?.revenue || 0) - (a?.revenue || 0))
                  .slice(0, 3)
                  .map((agent, index) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    const colors = [
                      'from-yellow-500 to-yellow-600',
                      'from-gray-400 to-gray-500',
                      'from-orange-600 to-orange-700'
                    ];
                    
                    return (
                      <motion.div
                        key={agent?.id || index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="bg-white rounded-xl p-4 shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 bg-gradient-to-br ${colors[index]} rounded-full flex items-center justify-center text-2xl`}>
                            {medals[index]}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-bold text-gray-900">{agent?.name || 'Unknown'}</p>
                              <span className="text-xs font-semibold text-purple-600">#{index + 1}</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">@{agent?.username || 'unknown'}</p>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Units Sold:</span>
                                <span className="font-bold text-gray-900">{Math.floor((agent?.revenue || 0) / 10).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Revenue:</span>
                                <span className="font-bold text-green-600">{formatCurrency(agent?.revenue || 0)} MMK</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  
                {agentPerformance.length === 0 && (
                  <div className="py-6 text-center">
                    <TrendingDown className="w-10 h-10 text-purple-300 mx-auto mb-2" />
                    <p className="text-sm text-purple-700">No sales data yet</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center">
                <Users className="w-10 h-10 text-purple-300 mx-auto mb-2" />
                <p className="text-sm text-purple-700">No agents assigned</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Agent Performance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
        >
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Agent Performance</h2>
            <p className="text-sm text-gray-600 mt-1">Overview of agents under your management</p>
          </div>

          {myAgents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Agent Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Players</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Bets</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Revenue (MMK)</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {agentPerformance.map((agent, index) => (
                    <motion.tr
                      key={agent?.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {(agent?.name || 'A').charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{agent?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">Agent</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">@{agent?.username || 'unknown'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                          {agent?.playersCount || 0} Players
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">{agent?.betsCount || 0}</td>
                      <td className="px-6 py-4 text-gray-900 font-bold">{formatCurrency(agent?.revenue || 0)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <Activity className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedAgent(myAgents.find(a => a.id === agent?.id) || null)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all font-semibold text-sm shadow-lg"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No agents assigned yet</p>
              <p className="text-gray-400 text-sm mt-1">Contact admin to assign agents to your account</p>
            </div>
          )}
        </motion.div>

        {/* Network Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Network Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Players</span>
                <span className="text-2xl font-bold text-green-600">{myPlayers.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pending Bets</span>
                <span className="text-2xl font-bold text-orange-600">43</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Completed Today</span>
                <span className="text-2xl font-bold text-blue-600">582</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg p-6 text-white"
          >
            <h3 className="text-lg font-bold mb-4">Revenue Insights</h3>
            <div className="space-y-4">
              <div>
                <p className="text-blue-200 text-sm">Current Period Revenue</p>
                <p className="text-3xl font-bold">{(stats.revenue / 1000000).toFixed(1)}M MMK</p>
                <p className="text-blue-200 text-xs mt-1">↑ {stats.growth} {stats.comparison}</p>
              </div>
              <div className="pt-4 border-t border-blue-400">
                <p className="text-blue-200 text-sm">Monthly Target</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 bg-blue-400 rounded-full h-2">
                    <div className="bg-white rounded-full h-2" style={{ width: '72%' }}></div>
                  </div>
                  <span className="text-sm font-semibold">72%</span>
                </div>
              </div>
            </div>
          </motion.div>
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
            pendingRequests: 2,
            completedTransactions: 45,
          };

          return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl shadow-lg">
                      {selectedAgent.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedAgent.name}</h2>
                      <p className="text-blue-100 text-sm mt-1">@{selectedAgent.username} • Agent</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 hide-scrollbar">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                      <Wallet className="w-6 h-6 text-blue-600 mb-2" />
                      <p className="text-xs text-blue-600 font-semibold mb-1">Unit Balance</p>
                      <p className="text-xl font-bold text-blue-900">{formatCurrency(agentDetails.balance)}</p>
                      <p className="text-xs text-blue-600">MMK</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
                      <Users className="w-6 h-6 text-green-600 mb-2" />
                      <p className="text-xs text-green-600 font-semibold mb-1">Total Players</p>
                      <p className="text-xl font-bold text-green-900">{agentPlayers.length}</p>
                      <p className="text-xs text-green-600">Active</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
                      <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
                      <p className="text-xs text-purple-600 font-semibold mb-1">Total Bets</p>
                      <p className="text-xl font-bold text-purple-900">{agentPerf?.betsCount || 0}</p>
                      <p className="text-xs text-purple-600">This period</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200">
                      <DollarSign className="w-6 h-6 text-orange-600 mb-2" />
                      <p className="text-xs text-orange-600 font-semibold mb-1">Revenue</p>
                      <p className="text-xl font-bold text-orange-900">{formatCurrency(agentPerf?.revenue || 0)}</p>
                      <p className="text-xs text-orange-600">MMK</p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-gray-50 rounded-xl p-5 mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Phone className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Phone Number</p>
                          <p className="font-semibold text-gray-900">{agentDetails.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Email Address</p>
                          <p className="font-semibold text-gray-900">{agentDetails.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Location</p>
                          <p className="font-semibold text-gray-900">{agentDetails.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Joined Date</p>
                          <p className="font-semibold text-gray-900">{agentDetails.joinedDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Overview */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Transaction Summary</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">Total Deposits</span>
                          <span className="font-bold text-green-600">{formatCurrency(agentDetails.totalDeposits)} MMK</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Activity Status</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">Last Active</span>
                          <span className="text-green-600 font-semibold text-sm flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                            {agentDetails.lastActive}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">Pending Requests</span>
                          <span className="font-bold text-orange-600">{agentDetails.pendingRequests}</span>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <span className="text-gray-900 font-semibold">Completed Transactions</span>
                          <span className="font-bold text-blue-600">{agentDetails.completedTransactions}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Players List */}
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        Players Under This Agent
                      </span>
                      <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                        {agentPlayers.length} Players
                      </span>
                    </h3>
                    
                    {agentPlayers.length > 0 ? (
                      <div className="max-h-64 overflow-y-auto hide-scrollbar">
                        <div className="grid grid-cols-2 gap-3">
                          {agentPlayers.map((player, index) => (
                            <div
                              key={player.id}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
                            >
                              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                                {player.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{player.name}</p>
                                <p className="text-xs text-gray-500">Player #{player.id.slice(-4)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No players assigned yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Activity className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-600">Active</span>
                    <span className="text-gray-400">•</span>
                    <span>ID: {selectedAgent.id}</span>
                  </div>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-all font-semibold"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Selected Request Detail Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRequest(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 rounded-t-2xl flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                    {(selectedRequest?.requesterName || 'A').charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedRequest?.requesterName || 'Agent'}'s Request</h2>
                    <p className="text-blue-100 text-sm" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                      ယူနစ်တောင်းခံမှု အသေးစိတ်
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="bg-white border-2 border-blue-300 rounded-2xl overflow-hidden shadow-lg">
                  {/* Status Badge */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-white" />
                      <p className="text-sm font-bold text-white">Pending Approval</p>
                    </div>
                    <div className="px-3 py-1.5 bg-orange-400 rounded-lg">
                      <p className="text-xs font-bold text-white">Awaiting Action</p>
                    </div>
                  </div>

                  {/* Verification Card - Side by Side Layout */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      {/* Left: Request Details */}
                      <div className="space-y-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-5">
                          <p className="text-xs text-blue-600 font-semibold mb-2 uppercase">Amount Requested</p>
                          <p className="text-4xl font-bold text-blue-900 mb-1">{(selectedRequest?.amount || 0).toLocaleString()}</p>
                          <p className="text-sm text-blue-700 font-semibold">Units</p>
                          <div className="mt-3 pt-3 border-t-2 border-blue-300">
                            <p className="text-xs text-blue-600">Equivalent Amount:</p>
                            <p className="text-xl font-bold text-blue-800">≈ {(selectedRequest?.amount || 0).toLocaleString()} MMK</p>
                          </div>
                        </div>

                        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 space-y-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                            <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                              <Wallet className="w-4 h-4 text-blue-600" />
                              {selectedRequest?.paymentMethod || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                            <p className="text-sm font-mono font-semibold text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
                              {selectedRequest?.transactionId || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Requested At</p>
                            <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-600" />
                              {selectedRequest?.requestedAt ? new Date(selectedRequest.requestedAt).toLocaleString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Payment Receipt Image */}
                      <div className="space-y-4">
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Upload className="w-5 h-5 text-purple-600" />
                            <h4 className="font-bold text-purple-900">Payment Receipt</h4>
                            <span className="text-xs text-purple-600" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                              (ငွေလွှဲပြေစာ)
                            </span>
                          </div>
                          
                          {selectedRequest?.paymentScreenshot ? (
                            <div className="bg-white rounded-xl p-2 border-2 border-purple-200">
                              <img
                                src={selectedRequest.paymentScreenshot}
                                alt="Payment Receipt"
                                className="w-full rounded-lg cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => window.open(selectedRequest.paymentScreenshot, '_blank')}
                              />
                              <button
                                onClick={() => window.open(selectedRequest.paymentScreenshot, '_blank')}
                                className="w-full mt-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Full Size
                              </button>
                            </div>
                          ) : (
                            <div className="bg-gray-100 rounded-xl p-8 text-center">
                              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">No receipt uploaded</p>
                            </div>
                          )}
                        </div>

                        {selectedRequest?.note && (
                          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                            <h4 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              Additional Note
                            </h4>
                            <p className="text-sm text-yellow-800">{selectedRequest.note}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          const reason = prompt('Please provide a reason for rejection:');
                          if (reason && reason.trim() && onRejectDeposit) {
                            onRejectDeposit(selectedRequest.id, reason.trim());
                            setSelectedRequest(null);
                          }
                        }}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject Request
                      </button>
                      <button
                        onClick={() => {
                          handleApproveWithAnimation(selectedRequest.id);
                          setSelectedRequest(null);
                        }}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approve & Transfer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Balance Transfer Animation Overlay */}
      <AnimatePresence>
        {showBalanceAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white rounded-3xl p-12 max-w-2xl w-full mx-4 shadow-2xl"
            >
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <CheckCircle className="w-24 h-24 text-green-600 mx-auto" />
              </motion.div>

              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Transfer Approved!</h2>
                <p className="text-gray-600 mb-6">
                  Units successfully transferred to agent's account
                </p>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
                  <p className="text-sm text-gray-600 mb-1">Amount Transferred</p>
                  <p className="text-4xl font-bold text-green-600">
                    {transferAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Units</p>
                </div>
              </motion.div>

              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => setShowBalanceAnimation(false)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-bold shadow-lg transition-all"
              >
                Continue
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buy Units Modal - matching Agent DashboardView style */}
      <AnimatePresence>
        {showBuyUnitsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBuyUnitsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 rounded-t-2xl flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Request Units from Admin</h2>
                  <p className="text-blue-100 text-sm" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    Admin ထံမှ ယူနစ်တောင်းခံရန်
                  </p>
                </div>
                <button
                  onClick={() => setShowBuyUnitsModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount (Units)
                    <span className="text-xs font-normal ml-2 text-gray-500" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                      (ပမာဏ)
                    </span>
                  </label>
                  <input
                    type="number"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-lg font-semibold"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    ≈ {(parseInt(buyAmount) || 0).toLocaleString()} MMK (1 unit = 1 MMK)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Method
                    <span className="text-xs font-normal ml-2 text-gray-500" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                      (ငွေပေးချေမှုနည်းလမ်း)
                    </span>
                  </label>
                  <select
                    value={buyPaymentMethod}
                    onChange={(e) => setBuyPaymentMethod(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-semibold"
                  >
                    <option>KBZ Pay</option>
                    <option>Wave Money</option>
                    <option>CB Pay</option>
                    <option>AYA Pay</option>
                    <option>Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Transaction ID
                    <span className="text-xs font-normal ml-2 text-gray-500" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                      (ငွေလွှဲအမှတ်)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={buyTransactionId}
                    onChange={(e) => setBuyTransactionId(e.target.value)}
                    placeholder="Enter transaction ID from payment app"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Screenshot
                    <span className="text-xs font-normal ml-2 text-gray-500" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                      (ငွေလွှဲပြေစာ)
                    </span>
                  </label>
                  <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-all cursor-pointer">
                    {!buyPaymentScreenshot ? (
                      <>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 font-medium">Click to upload receipt</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </>
                    ) : (
                      <div className="relative">
                        <img
                          src={buyPaymentScreenshot}
                          alt="Payment Receipt"
                          className="max-h-48 mx-auto rounded-lg border-2 border-blue-300"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setBuyPaymentScreenshot('');
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all"
                        >
                          <X className="w-4 h-4" />
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
                            setBuyPaymentScreenshot(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {buyPaymentScreenshot && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-blue-800 font-medium">Receipt uploaded successfully</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Note (Optional)
                    <span className="text-xs font-normal ml-2 text-gray-500" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                      (မှတ်ချက်)
                    </span>
                  </label>
                  <textarea
                    value={buyNote}
                    onChange={(e) => setBuyNote(e.target.value)}
                    placeholder="Add any additional information..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                  />
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Important:</p>
                      <p className="text-xs text-blue-700 mt-1" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                        Admin ၏ ငွေလက်ခံအကောင့်သို့ တိကျသောပမာဏ လွှဲပြောင်းပြီး Transaction ID ကို ပေးပါ။ သင့်တောင်းခံမှုကို Admin က စစ်ဆေးပါမည်။
                      </p>
                    </div>
                  </div>
                </div>

                {showSuccessMessage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-blue-100 border border-blue-300 rounded-xl flex items-center gap-3"
                  >
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-bold text-blue-800">Request Submitted!</p>
                      <p className="text-xs text-blue-700" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                        တောင်းခံမှု အောင်မြင်စွာ ပေးပို့ပြီးပါပြီ
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBuyUnitsModal(false)}
                    className="flex-1 px-5 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (onRequestUnitDeposit && buyAmount && buyTransactionId) {
                        onRequestUnitDeposit({
                          amount: parseInt(buyAmount),
                          paymentMethod: buyPaymentMethod,
                          transactionId: buyTransactionId,
                          paymentScreenshot: buyPaymentScreenshot || undefined,
                          note: buyNote || undefined,
                        });
                        setShowSuccessMessage(true);
                        setTimeout(() => {
                          setShowSuccessMessage(false);
                          setShowBuyUnitsModal(false);
                          setBuyAmount('');
                          setBuyTransactionId('');
                          setBuyPaymentScreenshot('');
                          setBuyNote('');
                        }, 2000);
                      }
                    }}
                    disabled={!buyAmount || !buyTransactionId}
                    className={`flex-1 px-5 py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                      buyAmount && buyTransactionId
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    Submit Request
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
