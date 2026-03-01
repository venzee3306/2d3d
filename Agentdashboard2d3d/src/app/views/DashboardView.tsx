import { useState, useEffect } from 'react';
import { Wallet, Calendar, Users, DollarSign, TrendingUp, TrendingDown, Clock, Plus, Upload, X, CheckCircle, AlertCircle, Bell, AlertTriangle, Award, Banknote, UserCheck, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'master' | 'agent';
  parentId?: string;
}

interface DashboardBet {
  id: string;
  playerName: string;
  gameType: '2D' | '3D';
  betNumber: string;
  amount: number;
  round: string;
  time: string;
  status: 'Won' | 'Lost' | 'Pending';
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
  requestedAt: number;
  respondedAt?: number;
  rejectionReason?: string;
}

interface DashboardViewProps {
  bets: DashboardBet[];
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
}

type TimePeriod = 'daily' | 'weekly' | 'monthly';

export function DashboardView({ bets, currentUser, currentBalance = 0, unitDepositRequests = [], onRequestUnitDeposit }: DashboardViewProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('daily');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showBuyUnitsModal, setShowBuyUnitsModal] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [buyAmount, setBuyAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('KBZ Pay');
  const [transactionId, setTransactionId] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<string>('');
  const [note, setNote] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Unit Balance
  const availableBalance = currentBalance;
  const LOW_BALANCE_THRESHOLD = 100000;
  const isLowBalance = (availableBalance || 0) < LOW_BALANCE_THRESHOLD;

  // Today's Sales Summary (Mock Data for Agent)
  const todayTotalSales = 180000;
  const todayCommissions = 27000; // 15% of sales
  const todayPayouts = 72000;
  const todayNetProfit = (todayTotalSales || 0) - (todayPayouts || 0);

  // Get agent's pending requests only
  const myPendingRequests = unitDepositRequests.filter(r => r.requesterId === currentUser.id && r.status === 'pending');

  // Generate data based on time period
  const getChartData = () => {
    if (timePeriod === 'daily') {
      return [
        { name: '00:00', stakes: 85000, commission: 12750, payouts: 68000 },
        { name: '04:00', stakes: 62000, commission: 9300, payouts: 49600 },
        { name: '08:00', stakes: 124000, commission: 18600, payouts: 99200 },
        { name: '12:00', stakes: 198000, commission: 29700, payouts: 158400 },
        { name: '16:00', stakes: 256000, commission: 38400, payouts: 204800 },
        { name: '20:00', stakes: 342000, commission: 51300, payouts: 273600 },
        { name: '23:59', stakes: 245000, commission: 36750, payouts: 196000 }
      ];
    } else if (timePeriod === 'weekly') {
      return [
        { name: 'Mon', stakes: 912000, commission: 136800, payouts: 729600 },
        { name: 'Tue', stakes: 1045000, commission: 156750, payouts: 836000 },
        { name: 'Wed', stakes: 1178000, commission: 176700, payouts: 942400 },
        { name: 'Thu', stakes: 1098000, commission: 164700, payouts: 878400 },
        { name: 'Fri', stakes: 1289000, commission: 193350, payouts: 1031200 },
        { name: 'Sat', stakes: 1456000, commission: 218400, payouts: 1164800 },
        { name: 'Sun', stakes: 1398000, commission: 209700, payouts: 1118400 }
      ];
    } else {
      return [
        { name: 'Jan', stakes: 24150000, commission: 3622500, payouts: 19320000 },
        { name: 'Feb', stakes: 26080000, commission: 3912000, payouts: 20864000 },
        { name: 'Mar', stakes: 27940000, commission: 4191000, payouts: 22352000 },
        { name: 'Apr', stakes: 28950000, commission: 4342500, payouts: 23160000 },
        { name: 'May', stakes: 30780000, commission: 4617000, payouts: 24624000 },
        { name: 'Jun', stakes: 32560000, commission: 4884000, payouts: 26048000 }
      ];
    }
  };

  const getStatsForPeriod = () => {
    if (timePeriod === 'daily') {
      return {
        stakes: 1312000,
        payouts: 1049600,
        commission: 196800,
        players: 48,
        bets: 285,
        growth: '+12.5%',
        comparison: 'vs yesterday'
      };
    } else if (timePeriod === 'weekly') {
      return {
        stakes: 8376000,
        payouts: 6700800,
        commission: 1256400,
        players: 67,
        bets: 1890,
        growth: '+18.3%',
        comparison: 'vs last week'
      };
    } else {
      return {
        stakes: 32560000,
        payouts: 26048000,
        commission: 4884000,
        players: 89,
        bets: 7560,
        growth: '+15.8%',
        comparison: 'vs last month'
      };
    }
  };

  const stats = getStatsForPeriod();
  const chartData = getChartData();

  const statCards = [
    {
      title: 'My Players',
      value: stats.players.toString(),
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      color: 'from-blue-500 to-blue-600',
      change: '+5 this month'
    },
    {
      title: 'Total Bets',
      value: stats.bets.toString(),
      icon: TrendingUp,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      color: 'from-purple-500 to-purple-600',
      change: `${stats.growth} ${stats.comparison}`
    },
    {
      title: 'Stakes (MMK)',
      value: `${(stats.stakes / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      color: 'from-green-500 to-green-600',
      change: `${stats.growth} ${stats.comparison}`
    },
    {
      title: 'Commission (MMK)',
      value: `${(stats.commission / 1000000).toFixed(1)}M`,
      icon: Award,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      color: 'from-orange-500 to-orange-600',
      change: `${stats.growth} ${stats.comparison}`
    }
  ];

  // Recent player activity
  const recentPlayers = [
    { id: 'p1', name: 'Ko Zaw Zaw', betsCount: 45, revenue: 125000, status: 'active' },
    { id: 'p2', name: 'Ma Aye Aye', betsCount: 38, revenue: 98000, status: 'active' },
    { id: 'p3', name: 'U Hla Myint', betsCount: 62, revenue: 185000, status: 'active' },
    { id: 'p4', name: 'Daw Khin Mar', betsCount: 28, revenue: 72000, status: 'inactive' },
    { id: 'p5', name: 'Ko Min Thu', betsCount: 51, revenue: 145000, status: 'active' },
  ];

  const formatCurrency = (amount: number = 0) => {
    return (amount || 0).toLocaleString('en-US');
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {currentUser.name}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-3">
              {/* Pending Requests Notification */}
              {myPendingRequests.length > 0 && (
                <div className="relative">
                  <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
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

                  {/* Notification Dropdown */}
                  <AnimatePresence>
                    {showNotificationDropdown && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setShowNotificationDropdown(false)}
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
                              onClick={() => setShowNotificationDropdown(false)}
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
                              သင့်တောင်းခံမှုများကို Master မှ အတည်ပြုလိမ့်မည်
                            </p>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
              
              <div className="px-4 py-2 bg-green-100 text-green-700 rounded-xl font-semibold text-sm">
                <UserCheck className="w-4 h-4 inline mr-2" />
                Agent Account
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
        {/* STEP 1: Unit Balance Overview */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Unit Balance</h2>
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              ယူနစ် လက်ကျန် အခြေအနေ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: My Units */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`rounded-2xl shadow-xl overflow-hidden border-2 transition-all ${
                isLowBalance 
                  ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-300' 
                  : 'bg-gradient-to-br from-green-50 to-green-100 border-green-300'
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${isLowBalance ? 'bg-red-200' : 'bg-green-200'}`}>
                      <Wallet className={`w-6 h-6 ${isLowBalance ? 'text-red-700' : 'text-green-700'}`} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${isLowBalance ? 'text-red-700' : 'text-green-700'}`}>
                        My Units
                      </h3>
                      <p className={`text-xs ${isLowBalance ? 'text-red-600' : 'text-green-600'}`} style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
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
                  <p className={`text-4xl font-bold ${isLowBalance ? 'text-red-800' : 'text-green-800'}`}>
                    {(availableBalance || 0).toLocaleString()}
                  </p>
                  <p className={`text-xs mt-1 ${isLowBalance ? 'text-red-600' : 'text-green-600'}`}>
                    Available Units (MMK)
                  </p>
                </div>

                {isLowBalance && (
                  <div className="mb-3 p-2.5 bg-red-200 border border-red-400 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-red-800" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                      ယူနစ်များလုံလောက်မှုမရှိပါ။ Master ထံမှ ယူနစ်ဝယ်ယူပါ။
                    </p>
                  </div>
                )}

                <button 
                  onClick={() => setShowBuyUnitsModal(true)}
                  className={`w-full py-2.5 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm ${
                    isLowBalance 
                      ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
                      : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Buy More Units
                </button>
              </div>
            </motion.div>

            {/* Card 2: Sales Overview - Hero Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-600 to-emerald-700 border-2 border-green-400 rounded-2xl shadow-2xl overflow-hidden relative"
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
              </div>

              <div className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Today's Performance
                      </h3>
                      <p className="text-xs text-green-200" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                        ယနေ့ စွမ်းဆောင်ရည်
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-2">
                  <motion.p 
                    className="text-5xl font-black text-white drop-shadow-lg"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {(todayTotalSales || 0).toLocaleString()}
                  </motion.p>
                  <p className="text-sm text-green-100 mt-1 font-semibold">
                    Total Sales (MMK)
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-100">Commission:</span>
                    <span className="text-white font-bold">{(todayCommissions || 0).toLocaleString()} MMK</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-100">Payouts:</span>
                    <span className="text-white font-bold">{(todayPayouts || 0).toLocaleString()} MMK</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-100">Net Profit:</span>
                    <span className={`font-bold ${todayNetProfit >= 0 ? 'text-yellow-300' : 'text-red-300'}`}>
                      {todayNetProfit >= 0 ? '+' : ''}{(todayNetProfit || 0).toLocaleString()} MMK
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* STEP 2: Today's Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Today's Summary</h2>
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              ယနေ့အခြေအနေ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
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
            transition={{ delay: 0.8 }}
            className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-xl p-4"
          >
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <span className="text-sm font-semibold text-gray-700">Green = Revenue/Earnings</span>
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
              <Calendar className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Analytics Period</h2>
            </div>
            <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
              {(['daily', 'weekly', 'monthly'] as TimePeriod[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    timePeriod === period
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Stakes & Commission Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorStakes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
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
                <Legend />
                <Area
                  type="monotone"
                  dataKey="stakes"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorStakes)"
                />
                <Line
                  type="monotone"
                  dataKey="commission"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dot={{ fill: '#F59E0B', r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Stakes vs Payouts</h3>
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
                  formatter={(value: number) => `${formatCurrency(value)} MMK`}
                />
                <Legend />
                <Bar dataKey="stakes" fill="#10B981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="payouts" fill="#EF4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Player Performance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
        >
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Player Performance</h3>
              <p className="text-xs text-gray-500" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                ကစားသူများ စွမ်းဆောင်ရည်
              </p>
            </div>
            <div className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-lg">
              {recentPlayers.length} Players
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Player</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Total Bets</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase">Revenue (MMK)</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentPlayers.map((player, index) => (
                  <motion.tr
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    className="hover:bg-green-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {player.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{player.name}</p>
                          <p className="text-xs text-gray-500">ID: {player.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-bold text-gray-900">{player.betsCount}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold text-green-600">{formatCurrency(player.revenue)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        player.status === 'active' 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {player.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Bets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Recent Bets</h3>
            <p className="text-xs text-gray-500" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              မကြာသေးမီက လောင်းကြေးများ
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Player</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Type</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Number</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase">Amount</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bets.slice(0, 8).map((bet) => (
                  <tr key={bet.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {bet.playerName.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{bet.playerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        bet.gameType === '2D' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {bet.gameType}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center font-bold text-gray-900">{bet.betNumber}</td>
                    <td className="px-6 py-3 text-right font-bold text-gray-900">{bet.amount.toLocaleString()} MMK</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        bet.status === 'Won' ? 'bg-green-100 text-green-700' :
                        bet.status === 'Lost' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {bet.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Buy Units Modal */}
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
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5 rounded-t-2xl flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Buy Units</h2>
                  <p className="text-green-100 text-sm" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    ယူနစ်ဝယ်ယူရန်
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-lg font-semibold"
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
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-semibold"
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
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID from payment app"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Screenshot
                    <span className="text-xs font-normal ml-2 text-gray-500" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                      (ငွေလွှဲပြေစာ)
                    </span>
                  </label>
                  <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-500 transition-all cursor-pointer">
                    {!paymentScreenshot ? (
                      <>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 font-medium">Click to upload receipt</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </>
                    ) : (
                      <div className="relative">
                        <img
                          src={paymentScreenshot}
                          alt="Payment Receipt"
                          className="max-h-48 mx-auto rounded-lg border-2 border-green-300"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setPaymentScreenshot('');
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
                            setPaymentScreenshot(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {paymentScreenshot && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-800 font-medium">Receipt uploaded successfully</span>
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
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add any additional information..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all resize-none"
                  />
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-green-900">Important:</p>
                      <p className="text-xs text-green-700 mt-1">
                        Please transfer the exact amount to your Master's payment account and provide the correct transaction ID. Your request will be reviewed by your Master.
                      </p>
                    </div>
                  </div>
                </div>

                {showSuccessMessage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-green-100 border border-green-300 rounded-xl flex items-center gap-3"
                  >
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-bold text-green-800">Request Submitted!</p>
                      <p className="text-xs text-green-700" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
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
                      if (onRequestUnitDeposit && buyAmount && transactionId) {
                        onRequestUnitDeposit({
                          amount: parseInt(buyAmount),
                          paymentMethod,
                          transactionId,
                          paymentScreenshot: paymentScreenshot || undefined,
                          note: note || undefined,
                        });
                        setShowSuccessMessage(true);
                        setTimeout(() => {
                          setShowSuccessMessage(false);
                          setShowBuyUnitsModal(false);
                          setBuyAmount('');
                          setTransactionId('');
                          setPaymentScreenshot('');
                          setNote('');
                        }, 2000);
                      }
                    }}
                    disabled={!buyAmount || !transactionId}
                    className={`flex-1 px-5 py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                      buyAmount && transactionId
                        ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg'
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
