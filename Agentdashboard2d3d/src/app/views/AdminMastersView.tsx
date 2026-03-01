import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Shield, Eye, EyeOff, X, Info, User, Users, Calendar, Activity, TrendingUp, UserCheck, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'master' | 'agent';
  parentId?: string;
}

interface AdminMastersViewProps {
  currentUser: User;
  allUsers: User[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onEditUser: (id: string, user: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
}

export function AdminMastersView({ currentUser, allUsers, onAddUser, onEditUser, onDeleteUser }: AdminMastersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingAgent, setViewingAgent] = useState<User | null>(null);
  const [viewingMaster, setViewingMaster] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    username: '',
    password: '',
    role: 'master' as 'master' | 'agent',
    commissionRate: 10,
    totalBetLimit: 10000000,
    singleNumberLimit: 1000000,
    payout2D: 85,
    payout3D: 500
  });
  const [showPassword, setShowPassword] = useState(false);

  const masters = allUsers.filter(u => u.role === 'master');
  const agents = allUsers.filter(u => u.role === 'agent');

  const filteredMasters = masters.filter(master =>
    master.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    master.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMasterAgents = (masterId: string) => {
    return agents.filter(a => a.parentId === masterId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      onEditUser(editingUser.id, formData);
    } else {
      onAddUser({
        ...formData,
        parentId: currentUser.id
      });
    }
    
    handleCloseModal();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      phoneNumber: (user as any).phoneNumber || '',
      username: user.username,
      password: user.password,
      role: user.role as 'master' | 'agent',
      commissionRate: (user as any).commissionRate || 10,
      totalBetLimit: (user as any).totalBetLimit || 10000000,
      singleNumberLimit: (user as any).singleNumberLimit || 1000000,
      payout2D: (user as any).payout2D || 85,
      payout3D: (user as any).payout3D || 500
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingUser(null);
    setFormData({ 
      name: '', 
      phoneNumber: '',
      username: '', 
      password: '', 
      role: 'master',
      commissionRate: 10,
      totalBetLimit: 10000000,
      singleNumberLimit: 1000000,
      payout2D: 85,
      payout3D: 500
    });
    setShowPassword(false);
  };

  return (
    <div className="flex-1 bg-[#F5F5F5] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white px-6 py-5 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage master accounts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-500/30"
        >
          <Plus className="w-5 h-5" />
          Add Master
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search masters by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
          />
        </div>
      </div>

      {/* Masters List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMasters.map((master) => {
            const masterAgents = getMasterAgents(master.id);
            
            return (
              <motion.div
                key={master.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <Shield className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{master.name}</h3>
                        <p className="text-purple-100 text-sm">@{master.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewingMaster(master)}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                        title="View master details"
                      >
                        <Info className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => handleEdit(master)}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete master ${master.name}?`)) {
                            onDeleteUser(master.id);
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
                      <span className="text-gray-600 text-sm">Total Agents</span>
                      <span className="text-2xl font-bold text-gray-900">{masterAgents.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Status</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Password</span>
                      <span className="text-gray-400 text-sm font-mono">••••••••</span>
                    </div>
                  </div>

                  {masterAgents.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2 font-semibold">Agents under this master:</p>
                      <div className="flex flex-wrap gap-2">
                        {masterAgents.map((agent) => (
                          <div
                            key={agent.id}
                            className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors group"
                          >
                            <span>{agent.name}</span>
                            <button
                              onClick={() => setViewingAgent(agent)}
                              className="p-0.5 hover:bg-blue-200 rounded transition-colors"
                              title="View agent details"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredMasters.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No masters found</p>
            <p className="text-gray-400 text-sm mt-1">Create your first master to get started</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editingUser ? 'Edit Master' : 'Add New Master'}
                </h2>
                <button onClick={handleCloseModal} className="text-white hover:bg-white/20 p-1 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto hide-scrollbar">
                {/* Account Credentials Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <UserCheck className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-900">Account Credentials</h3>
                  </div>
                  
                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number <span style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>(ဖုန်းနံပါတ်)</span>
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                      placeholder="09xxxxxxxxx"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">This will be used as the unique identifier</p>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                      placeholder="Enter full name"
                      required
                    />
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                      placeholder="master_username"
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all pr-12"
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
                    <Shield className="w-5 h-5 text-blue-600" />
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all pr-12"
                        min="0"
                        max="20"
                        step="0.5"
                        required
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Master's earning percentage (typically 10-15%)</p>
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
                        step="1000000"
                        placeholder="10000000"
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
                        step="100000"
                        placeholder="1000000"
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
                          placeholder="85"
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
                          className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all pr-12 bg-green-50"
                          min="1"
                          step="10"
                          placeholder="500"
                          required
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-700 font-bold">x</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">e.g., 450x, 500x, 550x</p>
                    </div>
                  </div>

                  {/* Payout Info */}
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-green-900">
                        <p className="font-semibold mb-1">Payout Configuration</p>
                        <p className="text-green-700 text-xs">
                          If a player bets 1,000 Ks on a 2D number with 85x rate, they win 85,000 Ks
                          <br />
                          Higher rates attract more players but increase risk
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all font-semibold shadow-lg"
                  >
                    {editingUser ? 'Update Master' : 'Create Master'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Agent Info Modal */}
      <AnimatePresence>
        {viewingAgent && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setViewingAgent(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{viewingAgent.name}</h2>
                      <p className="text-blue-100 text-sm">@{viewingAgent.username}</p>
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

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto hide-scrollbar">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <p className="text-xs font-semibold text-blue-600">AGENT NAME</p>
                    </div>
                    <p className="text-lg font-bold text-blue-900">{viewingAgent.name}</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <p className="text-xs font-semibold text-purple-600">USERNAME</p>
                    </div>
                    <p className="text-lg font-bold text-purple-900">@{viewingAgent.username}</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-green-600" />
                      <p className="text-xs font-semibold text-green-600">STATUS</p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-200 text-green-800">
                      Active
                    </span>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <p className="text-xs font-semibold text-orange-600">JOINED</p>
                    </div>
                    <p className="text-lg font-bold text-orange-900">Jan 2024</p>
                  </div>
                </div>

                {/* Master Info */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-2 border-purple-200">
                  <h3 className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Master Account
                  </h3>
                  <div className="bg-white rounded-lg p-3">
                    {(() => {
                      const masterAccount = allUsers.find(u => u.id === viewingAgent.parentId);
                      return masterAccount ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Shield className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{masterAccount.name}</p>
                            <p className="text-sm text-gray-500">@{masterAccount.username}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No master assigned</p>
                      );
                    })()}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 border-2 border-gray-200 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                    <p className="text-xs text-gray-500 mt-1">Total Players</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border-2 border-gray-200 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                    <p className="text-xs text-gray-500 mt-1">Active Bets</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border-2 border-gray-200 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                    <p className="text-xs text-gray-500 mt-1">Total Sessions</p>
                  </div>
                </div>

                {/* Contact & Security */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-900">Account Details</h3>
                  
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Role</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        Agent
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Account ID</span>
                      <span className="text-sm font-mono text-gray-900">{viewingAgent.id.slice(0, 8)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Password</span>
                      <span className="text-sm font-mono text-gray-400">••••••••</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setViewingAgent(null);
                      handleEdit(viewingAgent);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Agent
                  </button>
                  <button
                    onClick={() => setViewingAgent(null)}
                    className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Master Info Modal */}
      <AnimatePresence>
        {viewingMaster && (() => {
          const masterAgents = getMasterAgents(viewingMaster.id);
          const agentIds = masterAgents.map(a => a.id);
          
          // Mock data for master statistics (in real app, this would come from API/database)
          const masterStats = {
            totalRevenue: 4580000,      // Total revenue from all agents
            totalBets: 1245,             // Total bets count
            commission: 458000,          // Master's commission (10%)
            netProfit: 3250000,          // Net profit after all calculations
            activePlayers: 156,          // Active players under this master
            totalPayouts: 872000         // Total payouts to winners
          };
          
          return (
            <div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setViewingMaster(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <Shield className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{viewingMaster.name}</h2>
                        <p className="text-purple-100 text-sm">@{viewingMaster.username} • Master Account</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setViewingMaster(null)}
                      className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto hide-scrollbar">
                  {/* Revenue Overview - Large Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5" />
                        <p className="text-sm font-semibold opacity-90">Total Revenue</p>
                      </div>
                      <p className="text-3xl font-bold">{(masterStats.totalRevenue / 1000000).toFixed(2)}M</p>
                      <p className="text-xs opacity-75 mt-1">MMK</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-5 h-5" />
                        <p className="text-sm font-semibold opacity-90">Net Profit</p>
                      </div>
                      <p className="text-3xl font-bold">{(masterStats.netProfit / 1000000).toFixed(2)}M</p>
                      <p className="text-xs opacity-75 mt-1">MMK</p>
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-blue-900">{masterAgents.length}</p>
                      <p className="text-xs text-blue-600 mt-1 font-semibold">Agents</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-900">{masterStats.activePlayers}</p>
                      <p className="text-xs text-green-600 mt-1 font-semibold">Players</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Activity className="w-5 h-5 text-orange-600" />
                      </div>
                      <p className="text-2xl font-bold text-orange-900">{masterStats.totalBets}</p>
                      <p className="text-xs text-orange-600 mt-1 font-semibold">Total Bets</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold text-purple-900">{masterStats.commission / 1000}K</p>
                      <p className="text-xs text-purple-600 mt-1 font-semibold">Commission</p>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      Financial Breakdown
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Total Revenue</span>
                        <span className="text-sm font-bold text-gray-900">{masterStats.totalRevenue.toLocaleString()} MMK</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Commission Earned</span>
                        <span className="text-sm font-bold text-purple-600">{masterStats.commission.toLocaleString()} MMK</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Total Payouts</span>
                        <span className="text-sm font-bold text-orange-600">{masterStats.totalPayouts.toLocaleString()} MMK</span>
                      </div>
                      <div className="flex items-center justify-between py-2 bg-green-50 rounded-lg px-3">
                        <span className="text-sm font-bold text-green-700">Net Profit</span>
                        <span className="text-base font-bold text-green-700">{masterStats.netProfit.toLocaleString()} MMK</span>
                      </div>
                    </div>
                  </div>

                  {/* Agents under this Master */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200">
                    <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Agents Under This Master ({masterAgents.length})
                    </h3>
                    {masterAgents.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto hide-scrollbar">
                        {masterAgents.map((agent) => (
                          <div key={agent.id} className="bg-white rounded-lg p-3 flex items-center justify-between hover:bg-blue-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{agent.name}</p>
                                <p className="text-sm text-gray-500">@{agent.username}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setViewingMaster(null);
                                setViewingAgent(agent);
                              }}
                              className="p-2 hover:bg-blue-200 rounded-lg transition-colors"
                              title="View agent details"
                            >
                              <Info className="w-4 h-4 text-blue-600" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm bg-white rounded-lg p-3">No agents assigned yet</p>
                    )}
                  </div>

                  {/* Account Details */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-900">Account Information</h3>
                    
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Role</span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                          <Shield className="w-3 h-3 mr-1" />
                          Master
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Account ID</span>
                        <span className="text-sm font-mono text-gray-900">{viewingMaster.id.slice(0, 8)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <Activity className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Joined Date</span>
                        <span className="text-sm text-gray-900">January 2024</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Password</span>
                        <span className="text-sm font-mono text-gray-400">••••••••</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setViewingMaster(null);
                        handleEdit(viewingMaster);
                      }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all font-semibold shadow-lg flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Master
                    </button>
                    <button
                      onClick={() => setViewingMaster(null)}
                      className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
