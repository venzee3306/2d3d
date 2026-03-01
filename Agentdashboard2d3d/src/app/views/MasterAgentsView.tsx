import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, UserCheck, Eye, EyeOff, X, Ban, Info, User, Calendar, Activity, TrendingUp, Shield, FileText, Copy, Check, Phone, Wallet, Power } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BlockedNumbersModal } from '../components/BlockedNumbersModal';
import { AgentStatementModal } from '../components/AgentStatementModal';

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

interface MasterAgentsViewProps {
  currentUser: User;
  allUsers: User[];
  allPlayers: Player[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onEditUser: (id: string, user: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  blockedNumbers: { [agentId: string]: { '2D': string[], '3D': string[] } };
  onUpdateBlockedNumbers: (agentId: string, gameType: '2D' | '3D', numbers: string[]) => void;
  userBalances?: { [userId: string]: number };
}

export function MasterAgentsView({ currentUser, allUsers, allPlayers, onAddUser, onEditUser, onDeleteUser, blockedNumbers, onUpdateBlockedNumbers, userBalances = {} }: MasterAgentsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingAgent, setViewingAgent] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    agentName: '',
    phoneNumber: '',
    username: '',
    password: '',
    commissionRate: 10,
    totalBetLimit: 5000000,
    singleNumberLimit: 500000,
    payout2D: 80,
    payout3D: 500
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [selectedAgentForBlock, setSelectedAgentForBlock] = useState<User | null>(null);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [selectedAgentForStatement, setSelectedAgentForStatement] = useState<User | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const myAgents = allUsers.filter(u => u.role === 'agent' && u.parentId === currentUser.id);

  const filteredAgents = myAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAgentPlayers = (agentId: string) => {
    return allPlayers.filter(p => p.agentId === agentId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Master's commission rate (mock data - in real app would come from currentUser)
    const masterCommissionRate = 17;
    
    // Validate commission rate
    if (formData.commissionRate > masterCommissionRate) {
      alert(`Commission rate cannot exceed Master's rate (${masterCommissionRate}%)`);
      return;
    }
    
    // Validate limits
    if (formData.totalBetLimit <= 0) {
      alert('Total bet limit must be greater than 0');
      return;
    }
    
    if (formData.singleNumberLimit <= 0) {
      alert('Single number limit must be greater than 0');
      return;
    }
    
    if (formData.singleNumberLimit > formData.totalBetLimit) {
      alert('Single number limit cannot exceed total bet limit');
      return;
    }
    
    if (editingUser) {
      onEditUser(editingUser.id, { 
        name: formData.agentName,
        username: formData.username,
        password: formData.password
      });
    } else {
      onAddUser({
        name: formData.agentName,
        username: formData.username,
        password: formData.password,
        role: 'agent',
        parentId: currentUser.id
      });
    }
    
    handleCloseModal();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      agentName: user.name,
      phoneNumber: '',
      username: user.username,
      password: user.password,
      commissionRate: 10,
      totalBetLimit: 5000000,
      singleNumberLimit: 500000,
      payout2D: 80,
      payout3D: 500
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingUser(null);
    setFormData({ 
      agentName: '',
      phoneNumber: '',
      username: '', 
      password: '',
      commissionRate: 10,
      totalBetLimit: 5000000,
      singleNumberLimit: 500000,
      payout2D: 80,
      payout3D: 500
    });
    setShowPassword(false);
  };

  const handleOpenBlockedModal = (agent: User) => {
    setSelectedAgentForBlock(agent);
    setShowBlockedModal(true);
  };

  const handleOpenStatementModal = (agent: User) => {
    setSelectedAgentForStatement(agent);
    setShowStatementModal(true);
  };

  const getBlockedCount = (agentId: string) => {
    const blocked = blockedNumbers[agentId];
    if (!blocked) return 0;
    return (blocked['2D']?.length || 0) + (blocked['3D']?.length || 0);
  };

  const handleCopyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  return (
    <div className="flex-1 bg-[#F5F5F5] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white px-6 py-5 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage agent accounts under your network</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30"
        >
          <Plus className="w-5 h-5" />
          Add Agent
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search agents by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
          />
        </div>
      </div>

      {/* Agents List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => {
            const agentPlayers = getAgentPlayers(agent.id);
            
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{agent.name}</h3>
                        <p className="text-blue-100 text-sm">@{agent.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewingAgent(agent)}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                        title="View agent info"
                      >
                        <Info className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => handleEdit(agent)}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete agent ${agent.name}?`)) {
                            onDeleteUser(agent.id);
                          }
                        }}
                        className="p-2 bg-white/20 hover:bg-red-500 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Total Players</span>
                      <span className="text-2xl font-bold text-gray-900">{agentPlayers.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Total Bets</span>
                      <span className="text-lg font-bold text-gray-900">{Math.floor(Math.random() * 200) + 50}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Revenue (MMK)</span>
                      <span className="text-lg font-bold text-green-600">
                        {(Math.floor(Math.random() * 500000) + 100000).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Status</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                    {/* Statement Button */}
                    <button
                      onClick={() => handleOpenStatementModal(agent)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-200 rounded-xl transition-all group"
                    >
                      <FileText className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-bold text-green-700" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>ရှင်းတမ်း</span>
                    </button>

                    {/* Blocked Numbers Button */}
                    <button
                      onClick={() => handleOpenBlockedModal(agent)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-2 border-red-200 rounded-xl transition-all group"
                    >
                      <Ban className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-bold text-red-700">ပိတ်ကွက်များ</span>
                      {getBlockedCount(agent.id) > 0 && (
                        <span className="ml-auto px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
                          {getBlockedCount(agent.id)}
                        </span>
                      )}
                    </button>
                  </div>

                  {agentPlayers.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2 font-semibold">Recent players:</p>
                      <div className="flex flex-wrap gap-2">
                        {agentPlayers.slice(0, 3).map((player) => (
                          <span
                            key={player.id}
                            className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium"
                          >
                            {player.name}
                          </span>
                        ))}
                        {agentPlayers.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                            +{agentPlayers.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No agents found</p>
            <p className="text-gray-400 text-sm mt-1">Create your first agent to get started</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (() => {
          const masterCommissionRate = 17; // Mock data - in real app would come from currentUser
          
          return (
            <div 
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
              onClick={(e) => {
                if (e.target === e.currentTarget) handleCloseModal();
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    {editingUser ? 'Edit Agent' : 'Create New Agent'}
                  </h2>
                  <button onClick={handleCloseModal} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto hide-scrollbar">
                  {/* Account Credentials Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-bold text-gray-900">Account Credentials</h3>
                    </div>
                    
                    {/* Agent Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Agent Name <span style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>(အေးဂျင့်အမည်)</span>
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.agentName}
                        onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        placeholder="Ko Zaw Zaw"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Full name of the agent</p>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number <span style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>(ဖုန်းနံပါတ်)</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        placeholder="09xxxxxxxxx"
                      />
                      <p className="text-xs text-gray-500 mt-1">Optional contact number</p>
                    </div>

                    {/* Username */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Username
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        placeholder="agent_username"
                        required
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all pr-12"
                          placeholder="Enter secure password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200"></div>

                  {/* Business Rules Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-bold text-gray-900">Business Rules</h3>
                    </div>

                    {/* Commission Rate */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Commission Rate <span style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>(ကော်မရှင်)</span>
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.commissionRate}
                          onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all pr-12"
                          min="0"
                          max={masterCommissionRate}
                          step="0.5"
                          required
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">%</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">Agent's earning percentage</p>
                        <p className="text-xs text-purple-600 font-semibold">Max: {masterCommissionRate}% (Your rate)</p>
                      </div>
                      {formData.commissionRate > masterCommissionRate && (
                        <div className="mt-2 bg-red-50 border-2 border-red-200 rounded-lg p-2 flex items-start gap-2">
                          <Activity className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-red-700">Commission rate cannot exceed your rate ({masterCommissionRate}%)</p>
                        </div>
                      )}
                    </div>

                    {/* Betting Limits */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Total Bet Limit */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <span style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>စုစုပေါင်း ထိုးကြေး</span>
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.totalBetLimit}
                          onChange={(e) => setFormData({ ...formData, totalBetLimit: Number(e.target.value) })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                          min="0"
                          step="100000"
                          placeholder="5000000"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Total Bet Limit (MMK)</p>
                      </div>

                      {/* Single Number Limit */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <span style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>ဂဏန်းတစ်လုံးချင်း</span>
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.singleNumberLimit}
                          onChange={(e) => setFormData({ ...formData, singleNumberLimit: Number(e.target.value) })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                          min="0"
                          step="10000"
                          placeholder="500000"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Single Number Limit (MMK)</p>
                      </div>
                    </div>

                    {/* Limits Info */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                          <p className="font-semibold mb-1">Risk Management</p>
                          <p className="text-blue-700 text-xs">
                            Total Bet Limit: Maximum total amount per session/draw
                            <br />
                            Single Number Limit: Maximum amount on any individual 2D/3D number
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200"></div>

                  {/* Payout Rates Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-bold text-gray-900">
                        Payout Rates <span style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>(လျော်ကြေးနှုန်း)</span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* 2D Payout */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          2D Payout Rate
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.payout2D}
                            onChange={(e) => setFormData({ ...formData, payout2D: Number(e.target.value) })}
                            className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all pr-12 bg-green-50"
                            min="1"
                            step="1"
                            placeholder="Enter 2D rate..."
                            required
                          />
                          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-700 font-bold">x</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">e.g., 80x, 85x, 90x</p>
                      </div>

                      {/* 3D Payout */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          3D Payout Rate
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.payout3D}
                            onChange={(e) => setFormData({ ...formData, payout3D: Number(e.target.value) })}
                            className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all pr-12 bg-purple-50"
                            min="1"
                            step="1"
                            placeholder="Enter 3D rate..."
                            required
                          />
                          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-700 font-bold">x</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">e.g., 500x, 600x, 700x</p>
                      </div>
                    </div>

                    {/* Payout Preview */}
                    <div className="bg-gradient-to-br from-green-50 to-purple-50 border-2 border-green-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-3">Payout Preview</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">2D Win Example</p>
                          <p className="text-sm">
                            <span className="text-gray-700">1 MMK × </span>
                            <span className="font-bold text-green-700">{formData.payout2D}x</span>
                            <span className="text-gray-700"> = </span>
                            <span className="font-bold text-green-900">{formData.payout2D.toLocaleString()} MMK</span>
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-purple-200">
                          <p className="text-xs text-gray-600 mb-1">3D Win Example</p>
                          <p className="text-sm">
                            <span className="text-gray-700">1 MMK × </span>
                            <span className="font-bold text-purple-700">{formData.payout3D}x</span>
                            <span className="text-gray-700"> = </span>
                            <span className="font-bold text-purple-900">{formData.payout3D.toLocaleString()} MMK</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg flex items-center justify-center gap-2"
                    >
                      <UserCheck className="w-5 h-5" />
                      {editingUser ? 'Update Agent' : 'Create Agent'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Blocked Numbers Modal */}
      <AnimatePresence>
        {showBlockedModal && selectedAgentForBlock && (
          <BlockedNumbersModal
            agentName={selectedAgentForBlock.name}
            agentId={selectedAgentForBlock.id}
            onClose={() => {
              setShowBlockedModal(false);
              setSelectedAgentForBlock(null);
            }}
            blockedNumbers={blockedNumbers}
            onUpdateBlockedNumbers={onUpdateBlockedNumbers}
          />
        )}
      </AnimatePresence>

      {/* Agent Info Modal */}
      <AnimatePresence>
        {viewingAgent && (() => {
          const agentPlayers = getAgentPlayers(viewingAgent.id);
          // Agent data structure
          const agentData = {
            agentName: viewingAgent.name,
            phoneNumber: '', // Phone is optional now
            commissionRate: 10,
            totalBetLimit: 5000000,
            singleNumberLimit: 500000,
            payout2D: 80,
            payout3D: 500,
            currentBalance: userBalances[viewingAgent.id] || 0,
            isActive: true
          };
          
          return (
            <div 
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
              onClick={() => setViewingAgent(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#F5F5F5] rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Agent Profile</h2>
                        <p className="text-blue-100 text-sm">Complete account information</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setViewingAgent(null)}
                      className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content - Grey Background with White Cards */}
                <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto hide-scrollbar">
                  
                  {/* Account Credentials Card */}
                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="flex items-center gap-2 mb-4">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                      <h3 className="text-base font-bold text-gray-900">Account Credentials</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Agent Name - Master Property Row */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-gray-600" />
                          <div>
                            <p className="text-xs font-semibold text-gray-500">AGENT NAME (အေးဂျင့်အမည်)</p>
                            <p className="text-base font-bold text-gray-900 mt-0.5">{agentData.agentName}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCopyToClipboard(agentData.agentName, 'agentName')}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-all"
                          title="Copy agent name"
                        >
                          {copiedField === 'agentName' ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </div>

                      {agentData.phoneNumber && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-gray-600" />
                            <div>
                              <p className="text-xs font-semibold text-gray-500">PHONE NUMBER (ဖုန်းနံပါတ်)</p>
                              <p className="text-base font-bold text-gray-900 mt-0.5">{agentData.phoneNumber}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCopyToClipboard(agentData.phoneNumber, 'phone')}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-all"
                            title="Copy phone number"
                          >
                            {copiedField === 'phone' ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* Username - Master Property Row */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                        <div className="flex items-center gap-3">
                          <Shield className="w-4 h-4 text-gray-600" />
                          <div>
                            <p className="text-xs font-semibold text-gray-500">USERNAME</p>
                            <p className="text-base font-bold text-gray-900 mt-0.5">@{viewingAgent.username}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCopyToClipboard(viewingAgent.username, 'username')}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-all"
                          title="Copy username"
                        >
                          {copiedField === 'username' ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 bg-blue-50 border-2 border-blue-200 rounded-lg p-2.5 flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700">Use the copy icons to quickly share credentials via Viber/Telegram</p>
                    </div>
                  </div>

                  {/* Account Status & Balance Card */}
                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Current Balance */}
                      <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Wallet className="w-4 h-4 text-green-600" />
                          <p className="text-xs font-semibold text-green-600">CURRENT BALANCE</p>
                        </div>
                        <p className="text-xl font-bold text-green-900">{agentData.currentBalance.toLocaleString()}</p>
                        <p className="text-xs text-green-700 mt-1">MMK</p>
                      </div>

                      {/* Account Status */}
                      <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Power className="w-4 h-4 text-purple-600" />
                          <p className="text-xs font-semibold text-purple-600">ACCOUNT STATUS</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                              agentData.isActive
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            Active
                          </button>
                          <button
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                              !agentData.isActive
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            Inactive
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Business Rules Card */}
                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <h3 className="text-base font-bold text-gray-900">Business Rules</h3>
                    </div>

                    {/* Commission Rate - Master Property Row */}
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border-2 border-purple-200 mb-3">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="text-xs font-semibold text-purple-600">COMMISSION RATE (ကော်မရှင်)</p>
                          <p className="text-xl font-bold text-purple-900 mt-0.5">{agentData.commissionRate}%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-purple-600">Agent's Earnings</p>
                      </div>
                    </div>

                    {/* Bet Limits - Master Property Rows */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-4 h-4 text-blue-600" />
                          <p className="text-xs font-semibold text-blue-600" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>တစ်ပွဲစာ စုစုပေါင်း</p>
                        </div>
                        <p className="text-lg font-bold text-blue-900">{agentData.totalBetLimit.toLocaleString()}</p>
                        <p className="text-xs text-blue-700 mt-1">Total Session Limit (MMK)</p>
                      </div>

                      <div className="p-3 bg-orange-50 rounded-xl border-2 border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-4 h-4 text-orange-600" />
                          <p className="text-xs font-semibold text-orange-600" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>ဂဏန်းတစ်လုံးချင်း</p>
                        </div>
                        <p className="text-lg font-bold text-orange-900">{agentData.singleNumberLimit.toLocaleString()}</p>
                        <p className="text-xs text-orange-700 mt-1">Single Number Limit (MMK)</p>
                      </div>
                    </div>
                  </div>

                  {/* Payout Settings Card */}
                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <h3 className="text-base font-bold text-gray-900">
                        Payout Settings <span style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>(လျော်ကြေးနှုန်း)</span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* 2D Payout - Master Property Row */}
                      <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-300">
                        <p className="text-xs font-semibold text-green-600 mb-2">2D PAYOUT RATE</p>
                        <div className="flex items-baseline gap-1">
                          <p className="text-3xl font-black text-green-700">{agentData.payout2D}</p>
                          <p className="text-2xl font-black text-green-600">x</p>
                        </div>
                        <div className="mt-3 pt-3 border-t-2 border-green-200">
                          <p className="text-xs text-green-700 mb-1">Win Example:</p>
                          <p className="text-sm font-mono">
                            <span className="text-green-700">1 × </span>
                            <span className="font-bold text-green-800">{agentData.payout2D}x</span>
                          </p>
                          <p className="text-base font-bold text-green-900 mt-1">
                            = {agentData.payout2D.toLocaleString()} MMK
                          </p>
                        </div>
                      </div>

                      {/* 3D Payout - Master Property Row */}
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-300">
                        <p className="text-xs font-semibold text-purple-600 mb-2">3D PAYOUT RATE</p>
                        <div className="flex items-baseline gap-1">
                          <p className="text-3xl font-black text-purple-700">{agentData.payout3D}</p>
                          <p className="text-2xl font-black text-purple-600">x</p>
                        </div>
                        <div className="mt-3 pt-3 border-t-2 border-purple-200">
                          <p className="text-xs text-purple-700 mb-1">Win Example:</p>
                          <p className="text-sm font-mono">
                            <span className="text-purple-700">1 × </span>
                            <span className="font-bold text-purple-800">{agentData.payout3D}x</span>
                          </p>
                          <p className="text-base font-bold text-purple-900 mt-1">
                            = {agentData.payout3D.toLocaleString()} MMK
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Card */}
                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Agent Statistics</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-gray-50 rounded-xl border-2 border-gray-200 text-center">
                        <User className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{agentPlayers.length}</p>
                        <p className="text-xs text-gray-500 mt-1">Total Players</p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-xl border-2 border-gray-200 text-center">
                        <Ban className="w-5 h-5 text-red-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{getBlockedCount(viewingAgent.id)}</p>
                        <p className="text-xs text-gray-500 mt-1">Blocked Numbers</p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-xl border-2 border-gray-200 text-center">
                        <Calendar className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">0</p>
                        <p className="text-xs text-gray-500 mt-1">Total Sessions</p>
                      </div>
                    </div>
                  </div>

                  {/* Players List */}
                  {agentPlayers.length > 0 && (
                    <div className="bg-white rounded-xl p-4 shadow-md">
                      <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Players ({agentPlayers.length})
                      </h3>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto hide-scrollbar">
                        {agentPlayers.map((player) => (
                          <div
                            key={player.id}
                            className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200"
                          >
                            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-green-700" />
                            </div>
                            <p className="text-sm font-semibold text-gray-900 truncate">{player.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setViewingAgent(null);
                        handleOpenStatementModal(viewingAgent);
                      }}
                      className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-bold shadow-lg flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-sm" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>ရှင်းတမ်း</span>
                    </button>
                    <button
                      onClick={() => {
                        setViewingAgent(null);
                        handleOpenBlockedModal(viewingAgent);
                      }}
                      className="px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-bold shadow-lg flex items-center justify-center gap-2"
                    >
                      <Ban className="w-4 h-4" />
                      <span className="text-sm">Block</span>
                    </button>
                    <button
                      onClick={() => {
                        setViewingAgent(null);
                        handleEdit(viewingAgent);
                      }}
                      className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-bold shadow-lg flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="text-sm">Edit</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Agent Statement Modal */}
      {showStatementModal && selectedAgentForStatement && (
        <AgentStatementModal
          agentName={selectedAgentForStatement.name}
          agentId={selectedAgentForStatement.id}
          onClose={() => {
            setShowStatementModal(false);
            setSelectedAgentForStatement(null);
          }}
          isMobile={false}
          hasPlayers={getAgentPlayers(selectedAgentForStatement.id).length > 0}
        />
      )}
    </div>
  );
}
