import { useState, useEffect } from 'react';
import { Users, TrendingUp, DollarSign, Activity, Shield, UserCheck, BarChart3, Calendar, Clock, Bell, AlertCircle, X, ArrowRight, CheckCircle, XCircle, Wallet, Upload, Eye, Plus, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

interface UnitDepositRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterRole: string;
  approverId: string;
  approverName: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  paymentScreenshot: string;
  note?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  rejectionReason?: string;
}

interface AdminDashboardProps {
  currentUser: User;
  allUsers: User[];
  allPlayers: Player[];
  unitDepositRequests: UnitDepositRequest[];
  onNavigateToWithdrawals?: () => void;
  onApproveDeposit?: (requestId: string) => void;
  onRejectDeposit?: (requestId: string, reason: string) => void;
  onAddUser?: (userData: Omit<User, 'id'>) => void;
  userBalances?: { [userId: string]: number };
}

type TimePeriod = 'daily' | 'weekly' | 'monthly';

export function AdminDashboard({ currentUser, allUsers, allPlayers, unitDepositRequests, onNavigateToWithdrawals, onApproveDeposit, onRejectDeposit, onAddUser, userBalances = {} }: AdminDashboardProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('daily');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<UnitDepositRequest | null>(null);
  const [showBalanceAnimation, setShowBalanceAnimation] = useState(false);
  const [transferAmount, setTransferAmount] = useState(0);
  const [selectedMaster, setSelectedMaster] = useState<User | null>(null);
  const [showAddMasterModal, setShowAddMasterModal] = useState(false);
  const [newMasterData, setNewMasterData] = useState({
    name: '',
    username: '',
    password: ''
  });

  // Get pending requests from Masters to Admin
  const pendingMasterRequests = unitDepositRequests.filter(
    r => r.status === 'pending' && r.requesterRole === 'master' && r.approverId === currentUser.id
  );

  // Handle approve with animation
  const handleApproveWithAnimation = (requestId: string) => {
    const request = pendingMasterRequests.find(r => r.id === requestId);
    if (request && onApproveDeposit) {
      setTransferAmount(request.amount);
      setShowBalanceAnimation(true);
      onApproveDeposit(requestId);
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

  const masters = allUsers.filter(u => u.role === 'master');
  const agents = allUsers.filter(u => u.role === 'agent');

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
        { name: '00:00', revenue: 245000, bets: 45, players: 28 },
        { name: '04:00', revenue: 189000, bets: 32, players: 22 },
        { name: '08:00', revenue: 423000, bets: 78, players: 45 },
        { name: '12:00', revenue: 678000, bets: 125, players: 68 },
        { name: '16:00', revenue: 892000, bets: 156, players: 89 },
        { name: '20:00', revenue: 1245000, bets: 234, players: 125 },
        { name: '23:59', revenue: 856000, bets: 145, players: 92 }
      ];
    } else if (timePeriod === 'weekly') {
      return [
        { name: 'Mon', revenue: 3240000, bets: 580, players: 245 },
        { name: 'Tue', revenue: 3680000, bets: 645, players: 268 },
        { name: 'Wed', revenue: 4120000, bets: 720, players: 289 },
        { name: 'Thu', revenue: 3890000, bets: 680, players: 275 },
        { name: 'Fri', revenue: 4560000, bets: 798, players: 312 },
        { name: 'Sat', revenue: 5230000, bets: 925, players: 356 },
        { name: 'Sun', revenue: 4980000, bets: 875, players: 334 }
      ];
    } else {
      return [
        { name: 'Jan', revenue: 85400000, bets: 15200, players: 1850 },
        { name: 'Feb', revenue: 92300000, bets: 16800, players: 2020 },
        { name: 'Mar', revenue: 98700000, bets: 18200, players: 2180 },
        { name: 'Apr', revenue: 102500000, bets: 19400, players: 2340 },
        { name: 'May', revenue: 108900000, bets: 20600, players: 2520 },
        { name: 'Jun', revenue: 115200000, bets: 21800, players: 2680 }
      ];
    }
  };

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
        growth: '+15%',
        comparison: 'vs yesterday'
      };
    } else if (timePeriod === 'weekly') {
      return {
        ...baseStats,
        revenue: 29700000,
        bets: 5323,
        growth: '+22%',
        comparison: 'vs last week'
      };
    } else {
      return {
        ...baseStats,
        revenue: 115200000,
        bets: 21800,
        growth: '+18%',
        comparison: 'vs last month'
      };
    }
  };

  const stats = getStatsForPeriod();
  const chartData = getChartData();

  const statCards = [
    {
      title: 'Total Masters',
      value: stats.masters.toString(),
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      change: '+2 this month'
    },
    {
      title: 'Total Agents',
      value: stats.agents.toString(),
      icon: UserCheck,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      change: '+5 this month'
    },
    {
      title: 'Total Players',
      value: stats.players.toString(),
      icon: Users,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      change: '+28 this month'
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

  const masterPerformance = masters.map((master, index) => {
    const masterAgents = agents.filter(a => a.parentId === master.id);
    const agentIds = masterAgents.map(a => a.id);
    const masterPlayers = allPlayers.filter(p => p.agentId && agentIds.includes(p.agentId));
    
    // Static dummy data for each master
    const dummyData = [
      { revenue: 1250000, betsCount: 342 },
      { revenue: 980000, betsCount: 287 },
      { revenue: 1450000, betsCount: 425 },
      { revenue: 750000, betsCount: 198 },
      { revenue: 1100000, betsCount: 315 }
    ];
    
    const data = dummyData[index % dummyData.length];
    
    return {
      id: master.id,
      name: master.name,
      agentsCount: masterAgents.length,
      playersCount: masterPlayers.length,
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
    <div className="flex-1 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {currentUser.name}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Pending Requests Notification */}
            {pendingMasterRequests.length > 0 && (
              <div className="relative">
                <motion.button
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 cursor-pointer hover:shadow-xl transition-all"
                >
                  <div className="relative">
                    <Bell className="w-5 h-5" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">
                      {pendingMasterRequests.length} Pending Request{pendingMasterRequests.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-orange-100">Master unit deposits</p>
                  </div>
                </motion.button>

                {/* Notification Dropdown */}
                <AnimatePresence>
                  {showNotificationDropdown && (
                    <>
                      {/* Backdrop */}
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
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
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-white" />
                            <div>
                              <h3 className="text-white font-bold text-lg">Pending Requests</h3>
                              <p className="text-orange-100 text-xs" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                                ယူနစ်တောင်းခံမှုများ
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowNotificationDropdown(false)}
                            className="text-white hover:bg-orange-700 p-1.5 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Requests List */}
                        <div className="max-h-[400px] overflow-y-auto">
                          {pendingMasterRequests.slice(0, 5).map((request, index) => (
                            <motion.div
                              key={request.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="px-6 py-4 border-b border-gray-100 hover:bg-orange-50 transition-colors cursor-pointer"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowNotificationDropdown(false);
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-bold text-gray-900">{request.requesterName}</p>
                                    <p className="text-sm text-gray-600">
                                      via {request.paymentMethod}
                                      {request.transactionId && (
                                        <span className="text-xs text-gray-500"> • ID: {request.transactionId}</span>
                                      )}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(request.requestedAt).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                  <p className="text-xl font-bold text-orange-600">
                                    {request.amount.toLocaleString()}
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
                          {pendingMasterRequests.length > 5 && (
                            <p className="text-center text-sm text-gray-600">
                              + {pendingMasterRequests.length - 5} more request{pendingMasterRequests.length - 5 > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            <div className="flex flex-col items-end gap-3">
              <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-semibold text-sm">
                <Shield className="w-4 h-4 inline mr-2" />
                Administrator
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
      </div>

      <div className="p-8">
        {/* Time Period Selector */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Analytics Period</h2>
            </div>
            <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
              {(['daily', 'weekly', 'monthly'] as TimePeriod[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    timePeriod === period
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
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
                  formatter={(value: number) => `${formatCurrency(value)} MMK`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bets & Players Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Bets & Active Players</h3>
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
                <Bar dataKey="bets" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="players" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Master Performance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
        >
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Master Performance</h2>
              <p className="text-sm text-gray-600 mt-1">Overview of all masters in the system</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddMasterModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all font-semibold text-sm shadow-lg hover:shadow-xl"
              >
                <UserPlus className="w-4 h-4" />
                Add New Master
              </button>
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Master Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Agents</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Players</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Bets</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Revenue (MMK)</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {masterPerformance.map((master, index) => {
                  const masterUser = masters.find(m => m.id === master.id);
                  return (
                    <motion.tr
                      key={master.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {master.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{master.name}</p>
                            <p className="text-xs text-gray-500">Master</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                          {master.agentsCount} Agents
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                          {master.playersCount} Players
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">{master.betsCount}</td>
                      <td className="px-6 py-4 text-gray-900 font-bold">{formatCurrency(master.revenue)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <Activity className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMaster(masterUser || null);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all font-semibold text-sm shadow-lg hover:shadow-xl"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">System Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Sessions</span>
                <span className="text-2xl font-bold text-green-600">248</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pending Bets</span>
                <span className="text-2xl font-bold text-orange-600">87</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Completed Today</span>
                <span className="text-2xl font-bold text-blue-600">1,163</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-lg p-6 text-white"
          >
            <h3 className="text-lg font-bold mb-4">Revenue Insights</h3>
            <div className="space-y-4">
              <div>
                <p className="text-purple-200 text-sm">Current Period Revenue</p>
                <p className="text-3xl font-bold">{(stats.revenue / 1000000).toFixed(1)}M MMK</p>
                <p className="text-purple-200 text-xs mt-1">↑ {stats.growth} {stats.comparison}</p>
              </div>
              <div className="pt-4 border-t border-purple-400">
                <p className="text-purple-200 text-sm">Monthly Target</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 bg-purple-400 rounded-full h-2">
                    <div className="bg-white rounded-full h-2" style={{ width: '68%' }}></div>
                  </div>
                  <span className="text-sm font-semibold">68%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Selected Request Detail Modal - matching Master Dashboard's blue-themed approval UI */}
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
                    {(selectedRequest?.requesterName || 'M').charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedRequest?.requesterName || 'Master'}'s Request</h2>
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
                              (ငွေလွဲပြေစာ)
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
                  Units successfully transferred to master's account
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

      {/* Master Detail Modal */}
      <AnimatePresence>
        {selectedMaster && (() => {
          const masterAgents = agents.filter(a => a.parentId === selectedMaster.id);
          const agentIds = masterAgents.map(a => a.id);
          const masterPlayers = allPlayers.filter(p => p.agentId && agentIds.includes(p.agentId));
          const masterBalance = userBalances[selectedMaster.id] || 0;
          const masterRequests = unitDepositRequests.filter(r => r.requesterId === selectedMaster.id);
          const pendingRequests = masterRequests.filter(r => r.status === 'pending').length;
          const approvedRequests = masterRequests.filter(r => r.status === 'approved').length;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedMaster(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-5 rounded-t-2xl flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold text-2xl">
                      {selectedMaster.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedMaster.name}</h2>
                      <p className="text-purple-100 text-sm flex items-center gap-2 mt-1">
                        <Shield className="w-4 h-4" />
                        Master Account
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMaster(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Wallet className="w-8 h-8 text-purple-600" />
                        <span className="text-xs font-semibold text-purple-600 uppercase">Balance</span>
                      </div>
                      <p className="text-3xl font-bold text-purple-900">{masterBalance.toLocaleString()}</p>
                      <p className="text-sm text-purple-600 mt-1">Units</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <UserCheck className="w-8 h-8 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-600 uppercase">Agents</span>
                      </div>
                      <p className="text-3xl font-bold text-blue-900">{masterAgents.length}</p>
                      <p className="text-sm text-blue-600 mt-1">Active Agents</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Users className="w-8 h-8 text-green-600" />
                        <span className="text-xs font-semibold text-green-600 uppercase">Players</span>
                      </div>
                      <p className="text-3xl font-bold text-green-900">{masterPlayers.length}</p>
                      <p className="text-sm text-green-600 mt-1">Total Players</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Clock className="w-8 h-8 text-orange-600" />
                        <span className="text-xs font-semibold text-orange-600 uppercase">Requests</span>
                      </div>
                      <p className="text-3xl font-bold text-orange-900">{pendingRequests}</p>
                      <p className="text-sm text-orange-600 mt-1">Pending</p>
                    </div>
                  </div>

                  {/* Account Info */}
                  <div className="bg-gray-50 rounded-xl p-5 mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Username</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedMaster.username}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">User ID</p>
                        <p className="text-sm font-mono font-semibold text-gray-900">{selectedMaster.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Role</p>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                          <Shield className="w-3 h-3 mr-1" />
                          Master
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <Activity className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Agents List */}
                  <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden mb-6">
                    <div className="bg-blue-50 px-5 py-3 border-b-2 border-blue-200">
                      <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                        <UserCheck className="w-5 h-5" />
                        Associated Agents ({masterAgents.length})
                      </h3>
                    </div>
                    <div className="p-4">
                      {masterAgents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {masterAgents.map((agent) => {
                            const agentPlayers = allPlayers.filter(p => p.agentId === agent.id);
                            const agentBalance = userBalances[agent.id] || 0;
                            return (
                              <div key={agent.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                      {agent.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-900 text-sm">{agent.name}</p>
                                      <p className="text-xs text-gray-500">@{agent.username}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-blue-900">{agentBalance.toLocaleString()}</p>
                                    <p className="text-xs text-blue-600">Units</p>
                                  </div>
                                </div>
                                <div className="mt-2 pt-2 border-t border-blue-200 flex items-center justify-between text-xs">
                                  <span className="text-gray-600">{agentPlayers.length} Players</span>
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold">Active</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <UserCheck className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p>No agents associated with this master</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Request History */}
                  <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-purple-50 px-5 py-3 border-b-2 border-purple-200">
                      <h3 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Deposit Request History
                      </h3>
                    </div>
                    <div className="p-4">
                      {masterRequests.length > 0 ? (
                        <div className="space-y-2">
                          {masterRequests.slice(0, 5).map((request) => (
                            <div 
                              key={request.id} 
                              className={`flex items-center justify-between p-3 rounded-lg border-2 ${ request.status === 'pending' 
                                ? 'bg-yellow-50 border-yellow-200' 
                                : request.status === 'approved' 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-red-50 border-red-200'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ 
                                  request.status === 'pending' 
                                    ? 'bg-yellow-200' 
                                    : request.status === 'approved' 
                                    ? 'bg-green-200' 
                                    : 'bg-red-200'
                                }`}>
                                  {request.status === 'pending' && <Clock className="w-4 h-4 text-yellow-700" />}
                                  {request.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-700" />}
                                  {request.status === 'rejected' && <XCircle className="w-4 h-4 text-red-700" />}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{request.amount.toLocaleString()} Units</p>
                                  <p className="text-xs text-gray-500">{new Date(request.requestedAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                request.status === 'pending' 
                                  ? 'bg-yellow-200 text-yellow-800' 
                                  : request.status === 'approved' 
                                  ? 'bg-green-200 text-green-800' 
                                  : 'bg-red-200 text-red-800'
                              }`}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </span>
                            </div>
                          ))}
                          {masterRequests.length > 5 && (
                            <p className="text-center text-sm text-gray-500 pt-2">
                              + {masterRequests.length - 5} more requests
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p>No deposit requests from this master</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
                  <button
                    onClick={() => setSelectedMaster(null)}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 rounded-xl font-bold shadow-lg transition-all"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Add Master Modal */}
      <AnimatePresence>
        {showAddMasterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddMasterModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Add New Master</h3>
                    <p className="text-sm text-purple-100">Create a new master account</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddMasterModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newMasterData.name}
                    onChange={(e) => setNewMasterData({ ...newMasterData, name: e.target.value })}
                    placeholder="Enter master's full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newMasterData.username}
                    onChange={(e) => setNewMasterData({ ...newMasterData, username: e.target.value })}
                    placeholder="Enter username"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={newMasterData.password}
                    onChange={(e) => setNewMasterData({ ...newMasterData, password: e.target.value })}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 flex gap-3">
                <button
                  onClick={() => {
                    setShowAddMasterModal(false);
                    setNewMasterData({ name: '', username: '', password: '' });
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (onAddUser && newMasterData.name && newMasterData.username && newMasterData.password) {
                      onAddUser({
                        name: newMasterData.name,
                        username: newMasterData.username,
                        password: newMasterData.password,
                        role: 'master'
                      });
                      setShowAddMasterModal(false);
                      setNewMasterData({ name: '', username: '', password: '' });
                    }
                  }}
                  disabled={!newMasterData.name || !newMasterData.username || !newMasterData.password}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    newMasterData.name && newMasterData.username && newMasterData.password
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Create Master
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}