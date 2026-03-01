import { useState } from 'react';
import { ArrowLeft, Users, ChevronRight, Building2, UserCheck, Search, Plus, Edit2, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

interface MobileAdminMastersProps {
  onBack: () => void;
  currentUser: User;
  allUsers: User[];
  allPlayers: Player[];
  onAddUser?: (user: Omit<User, 'id'>) => void;
  onEditUser?: (id: string, user: Partial<User>) => void;
  onDeleteUser?: (id: string) => void;
}

export function MobileAdminMasters({
  onBack,
  currentUser,
  allUsers,
  allPlayers,
  onAddUser = () => {},
  onEditUser = () => {},
  onDeleteUser = () => {}
}: MobileAdminMastersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaster, setSelectedMaster] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    username: '',
    password: '',
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

  const getMasterPlayers = (masterId: string) => {
    const masterAgentIds = getMasterAgents(masterId).map(a => a.id);
    return allPlayers.filter(p => p.agentId && masterAgentIds.includes(p.agentId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      // Only pass the fields that are part of the User interface
      onEditUser(editingUser.id, {
        name: formData.name,
        username: formData.username,
        password: formData.password
      });
    } else {
      // Only pass the fields that are part of the User interface
      onAddUser({
        name: formData.name,
        username: formData.username,
        password: formData.password,
        role: 'master',
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
      commissionRate: (user as any).commissionRate || 10,
      totalBetLimit: (user as any).totalBetLimit || 10000000,
      singleNumberLimit: (user as any).singleNumberLimit || 1000000,
      payout2D: (user as any).payout2D || 85,
      payout3D: (user as any).payout3D || 500
    });
    setShowAddModal(true);
    setSelectedMaster(null);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingUser(null);
    setFormData({ 
      name: '', 
      phoneNumber: '',
      username: '', 
      password: '',
      commissionRate: 10,
      totalBetLimit: 10000000,
      singleNumberLimit: 1000000,
      payout2D: 85,
      payout3D: 500
    });
    setShowPassword(false);
  };

  if (selectedMaster) {
    const masterAgents = getMasterAgents(selectedMaster.id);
    const masterPlayers = getMasterPlayers(selectedMaster.id);

    return (
      <div className="w-full max-w-[375px] h-screen bg-[#F5F7FA] flex flex-col mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-4 shadow-lg flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setSelectedMaster(null)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-lg font-bold text-white">Master Details</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 hide-scrollbar">
          {/* Master Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 shadow-md"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {selectedMaster.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedMaster.name}</h3>
                <p className="text-sm text-gray-600">@{selectedMaster.username}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(selectedMaster)}
                className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedMaster.name}?`)) {
                    onDeleteUser(selectedMaster.id);
                    setSelectedMaster(null);
                  }
                }}
                className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <Users className="w-5 h-5 text-green-600 mb-2" />
              <p className="text-xs text-gray-600 mb-1">Agents</p>
              <p className="text-2xl font-bold text-gray-900">{masterAgents.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md">
              <UserCheck className="w-5 h-5 text-purple-600 mb-2" />
              <p className="text-xs text-gray-600 mb-1">Players</p>
              <p className="text-2xl font-bold text-gray-900">{masterPlayers.length}</p>
            </div>
          </div>

          {/* Agents List */}
          {masterAgents.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-md">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Agents ({masterAgents.length})</h3>
              <div className="space-y-2">
                {masterAgents.map(agent => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                        {agent.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{agent.name}</p>
                        <p className="text-xs text-gray-600">@{agent.username}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[375px] h-screen bg-[#F5F7FA] flex flex-col mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-4 shadow-lg flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Masters</h1>
            <p className="text-xs text-blue-100">Manage all masters</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search masters..."
            className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 text-sm focus:outline-none focus:bg-white/30"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 hide-scrollbar">
        {/* Add Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add New Master
        </button>

        {/* Stats Card */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Total Masters</p>
              <p className="text-3xl font-bold text-blue-600">{masters.length}</p>
            </div>
            <Building2 className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>

        {/* Masters List */}
        {filteredMasters.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-md text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No masters found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMasters.map(master => {
              const masterAgents = getMasterAgents(master.id);
              const masterPlayers = getMasterPlayers(master.id);
              
              return (
                <motion.div
                  key={master.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-4 shadow-md"
                  onClick={() => setSelectedMaster(master)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {master.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{master.name}</h3>
                        <p className="text-xs text-gray-600">@{master.username}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="flex gap-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-gray-600">{masterAgents.length} Agents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-purple-600" />
                      <span className="text-xs text-gray-600">{masterPlayers.length} Players</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Master Modal */}
      <AnimatePresence>
        {showAddModal && (
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
                    {editingUser ? 'Edit Master' : 'Add New Master'}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto hide-scrollbar">
                {/* Account Credentials Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="w-4 h-4 text-purple-600" />
                    <h4 className="text-sm font-bold text-gray-900">Account Credentials</h4>
                  </div>
                  
                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone Number <span style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>(ဖုန်းနံပါတ်)</span>
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="09xxxxxxxxx"
                      required
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Unique identifier</p>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter full name"
                      required
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Username
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="master_username"
                      required
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Password
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Enter secure password"
                        required
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-200"></div>

                {/* Business Rules Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-bold text-gray-900">Business Rules</h4>
                  </div>

                  {/* Commission Rate */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Commission Rate <span style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>(ကော်မရှင်)</span>
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.commissionRate}
                        onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                        min="0"
                        max="20"
                        required
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Master's earning % (10-15%)</p>
                  </div>

                  {/* Betting Limits */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Total Bet Limit */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        <span style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>စုစုပေါင်း</span>
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.totalBetLimit}
                        onChange={(e) => setFormData({ ...formData, totalBetLimit: Number(e.target.value) })}
                        min="0"
                        placeholder="10000000"
                        required
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">Total Limit (MMK)</p>
                    </div>

                    {/* Single Number Limit */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        <span style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>တစ်လုံးချင်း</span>
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.singleNumberLimit}
                        onChange={(e) => setFormData({ ...formData, singleNumberLimit: Number(e.target.value) })}
                        min="0"
                        placeholder="1000000"
                        required
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">Single No. (MMK)</p>
                    </div>
                  </div>

                  {/* Limits Info */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-2.5">
                    <p className="text-xs text-blue-900 font-semibold mb-0.5">Risk Management</p>
                    <p className="text-xs text-blue-700">
                      Total: Max per session/draw
                      <br />
                      Single: Max on any 2D/3D number
                    </p>
                  </div>
                </div>

                <div className="h-px bg-gray-200"></div>

                {/* Payout Rates Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <h4 className="text-sm font-bold text-gray-900">
                      Payout Rates <span style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>(လျော်ကြေး)</span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* 2D Payout */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        2D Payout
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.payout2D}
                          onChange={(e) => setFormData({ ...formData, payout2D: Number(e.target.value) })}
                          min="1"
                          placeholder="85"
                          required
                          className="w-full px-3 py-2.5 border-2 border-green-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none pr-9 bg-green-50"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-700 font-bold text-sm">x</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">e.g., 80x, 85x</p>
                    </div>

                    {/* 3D Payout */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        3D Payout
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.payout3D}
                          onChange={(e) => setFormData({ ...formData, payout3D: Number(e.target.value) })}
                          min="1"
                          placeholder="500"
                          required
                          className="w-full px-3 py-2.5 border-2 border-green-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none pr-9 bg-green-50"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-700 font-bold text-sm">x</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">e.g., 450x, 500x</p>
                    </div>
                  </div>

                  {/* Payout Info */}
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-2.5">
                    <p className="text-xs text-green-900 font-semibold mb-0.5">Payout Config</p>
                    <p className="text-xs text-green-700">
                      1,000 Ks @ 85x = 85,000 Ks win
                      <br />
                      Higher rates = More players + More risk
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 py-2.5 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg transition-all text-sm"
                  >
                    {editingUser ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}