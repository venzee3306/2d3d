import { useState } from 'react';
import { Plus, Search, UserCircle, TrendingUp, TrendingDown, DollarSign, Target, Edit2, Trash2, X } from 'lucide-react';
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
  password: string;
  phoneNumber: string;
  totalBets: number;
  totalAmount: number;
  winAmount: number;
  lossAmount: number;
  currentBalance: number;
  status: 'active' | 'inactive';
  createdAt: string;
  lastBetDate?: string;
}

interface DesktopPlayersProps {
  players: Player[];
  onAddPlayer: (player: Omit<Player, 'id' | 'createdAt' | 'totalBets' | 'totalAmount' | 'winAmount' | 'lossAmount' | 'lastBetDate'>) => void;
  onEditPlayer: (id: string, player: Partial<Player>) => void;
  onDeletePlayer: (id: string) => void;
  onSelectPlayer: (player: Player) => void;
  currentUser: User;
  subUsers: User[];
}

export function DesktopPlayers({ players, onAddPlayer, onEditPlayer, onDeletePlayer, onSelectPlayer, currentUser, subUsers }: DesktopPlayersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    phoneNumber: '',
    currentBalance: 0,
    status: 'active' as 'active' | 'inactive'
  });

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.phoneNumber.includes(searchQuery)
  );

  const totalStats = {
    totalPlayers: players.length,
    activePlayers: players.filter(p => p.status === 'active').length,
    totalBetsAmount: players.reduce((sum, p) => sum + p.totalAmount, 0),
    totalWinAmount: players.reduce((sum, p) => sum + p.winAmount, 0),
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert('Please enter player name');
      return;
    }

    if (!formData.password.trim()) {
      alert('Please enter password');
      return;
    }

    if (editingPlayer) {
      onEditPlayer(editingPlayer.id, formData);
      setEditingPlayer(null);
    } else {
      onAddPlayer(formData);
    }

    setFormData({ name: '', password: '', phoneNumber: '', currentBalance: 0, status: 'active' });
    setShowAddModal(false);
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      password: player.password,
      phoneNumber: player.phoneNumber,
      currentBalance: player.currentBalance,
      status: player.status
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingPlayer(null);
    setFormData({ name: '', password: '', phoneNumber: '', currentBalance: 0, status: 'active' });
  };

  return (
    <div className="flex-1 bg-[#F5F5F5] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white px-6 py-5 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{currentUser.name} ငွေစာရင်း ရှင်းတမ်း</h1>
          <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
            {currentUser.role === 'agent' ? 'ကစားသမားများ စီမံခန့်ခွဲမှု' : 'Users Management - ' + (currentUser.role === 'admin' ? 'Masters' : 'Agents')}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Add New Player</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Players</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalStats.totalPlayers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Players</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{totalStats.activePlayers}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Bets</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{formatNumber(totalStats.totalBetsAmount)} ks</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Wins</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{formatNumber(totalStats.totalWinAmount)} ks</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 pb-4 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or phone number..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Players Table */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Bets</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Win/Loss</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <UserCircle className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500">No players found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPlayers.map((player) => (
                    <tr 
                      key={player.id} 
                      className="hover:bg-blue-50 transition-colors cursor-pointer"
                      onClick={(e) => {
                        // Don't trigger if clicking action buttons
                        if ((e.target as HTMLElement).closest('button')) return;
                        onSelectPlayer(player);
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {player.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{player.name}</p>
                            {player.lastBetDate && (
                              <p className="text-xs text-gray-500">Last bet: {player.lastBetDate}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{player.phoneNumber || '-'}</td>
                      <td className="px-6 py-4 text-right text-gray-900 font-medium">{player.totalBets}</td>
                      <td className="px-6 py-4 text-right text-gray-900 font-medium">{formatNumber(player.totalAmount)} ks</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="flex items-center gap-1 text-green-600">
                            <TrendingUp className="w-4 h-4" />
                            <span className="font-medium text-sm">{formatNumber(player.winAmount)}</span>
                          </div>
                          <span className="text-gray-400">/</span>
                          <div className="flex items-center gap-1 text-red-600">
                            <TrendingDown className="w-4 h-4" />
                            <span className="font-medium text-sm">{formatNumber(player.lossAmount)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-semibold ${player.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatNumber(player.currentBalance)} ks
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            player.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {player.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(player);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Are you sure you want to delete ${player.name}?`)) {
                                onDeletePlayer(player.id);
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editingPlayer ? 'Edit Player' : 'Add New Player'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Player Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter player name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="Enter phone number (optional)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Balance (ks) <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    value={formData.currentBalance}
                    onChange={(e) => setFormData({ ...formData, currentBalance: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.status === 'active'}
                        onChange={() => setFormData({ ...formData, status: 'active' })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.status === 'inactive'}
                        onChange={() => setFormData({ ...formData, status: 'inactive' })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700">Inactive</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 font-medium"
                >
                  {editingPlayer ? 'Update Player' : 'Add Player'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
