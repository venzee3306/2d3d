import { useState } from 'react';
import { Plus, Search, UserCircle, TrendingUp, TrendingDown, DollarSign, Target, Edit2, Trash2, X, ArrowLeft, FileText, Clock, List } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MobileLedger } from './MobileLedger';
import { MobileSettlement } from './MobileSettlement';
import { PlayerBettingRecords } from './PlayerBettingRecords';

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

interface MobilePlayersProps {
  players: Player[];
  onBack: () => void;
  onAddPlayer: (player: Omit<Player, 'id' | 'createdAt' | 'totalBets' | 'totalAmount' | 'winAmount' | 'lossAmount' | 'lastBetDate'>) => void;
  onEditPlayer: (id: string, player: Partial<Player>) => void;
  onDeletePlayer: (id: string) => void;
  onSelectPlayer: (player: Player) => void;
  currentUser: User;
  dashboardBets?: DashboardBet[];
  onDeleteBettingSession?: (playerName: string, sessionKey: string) => void;
}

export function MobilePlayers({ players, onBack, onAddPlayer, onEditPlayer, onDeletePlayer, onSelectPlayer, currentUser, dashboardBets = [], onDeleteBettingSession }: MobilePlayersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showLedger, setShowLedger] = useState(false);
  const [showBettingRecords, setShowBettingRecords] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  const [modalPlayer, setModalPlayer] = useState<Player | null>(null);
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
    setSelectedPlayer(null);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingPlayer(null);
    setFormData({ name: '', password: '', phoneNumber: '', currentBalance: 0, status: 'active' });
  };

  return (
    <div className="w-full max-w-[375px] h-[812px] bg-[#F5F5F5] flex flex-col mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 flex-shrink-0 shadow-sm">
        <button onClick={onBack} className="p-1 -ml-1">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-semibold text-gray-900">{currentUser.name} ငွေစာရင်း ရှင်းတမ်း</h1>
          <p className="text-xs text-gray-500" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
            {currentUser.role === 'agent' ? 'ကစားသမားများ' : currentUser.role === 'admin' ? 'Masters' : 'Agents'}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="px-4 py-4 grid grid-cols-2 gap-3 flex-shrink-0">
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserCircle className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600">Players</p>
          </div>
          <p className="text-xl font-bold text-gray-900">{totalStats.totalPlayers}</p>
          <p className="text-xs text-green-600 mt-0.5">{totalStats.activePlayers} active</p>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-xs text-gray-600">Total Bets</p>
          </div>
          <p className="text-lg font-bold text-gray-900">{formatNumber(totalStats.totalBetsAmount)}</p>
          <p className="text-xs text-gray-500 mt-0.5">kyats</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-3 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search players..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Players List */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto hide-scrollbar">
        <div className="space-y-3">
          {filteredPlayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <UserCircle className="w-16 h-16 text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">No players found</p>
            </div>
          ) : (
            filteredPlayers.map((player) => (
              <div
                key={player.id}
                onClick={() => setSelectedPlayer(player)}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{player.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          player.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {player.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {player.phoneNumber && (
                      <p className="text-sm text-gray-600">{player.phoneNumber}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Bets</p>
                    <p className="text-sm font-semibold text-gray-900">{player.totalBets}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Amount</p>
                    <p className="text-sm font-semibold text-gray-900">{formatNumber(player.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Balance</p>
                    <p className={`text-sm font-semibold ${player.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatNumber(player.currentBalance)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Player Detail Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-white rounded-t-3xl w-full max-w-[375px] overflow-hidden"
            >
              <div className="px-4 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Player Details</h3>
                  <button
                    onClick={() => setSelectedPlayer(null)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {selectedPlayer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{selectedPlayer.name}</h4>
                    {selectedPlayer.phoneNumber && (
                      <p className="text-sm text-gray-600">{selectedPlayer.phoneNumber}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xs text-blue-600 mb-1">Total Bets</p>
                    <p className="text-xl font-bold text-blue-700">{selectedPlayer.totalBets}</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3">
                    <p className="text-xs text-purple-600 mb-1">Total Amount</p>
                    <p className="text-xl font-bold text-purple-700">{formatNumber(selectedPlayer.totalAmount)}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">Win Amount</span>
                    </div>
                    <span className="font-bold text-green-700">{formatNumber(selectedPlayer.winAmount)} ks</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-700 font-medium">Loss Amount</span>
                    </div>
                    <span className="font-bold text-red-700">{formatNumber(selectedPlayer.lossAmount)} ks</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-100 rounded-xl">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700 font-medium">Current Balance</span>
                    </div>
                    <span className={`font-bold ${selectedPlayer.currentBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {formatNumber(selectedPlayer.currentBalance)} ks
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onSelectPlayer(selectedPlayer);
                      setSelectedPlayer(null);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold shadow-lg"
                  >
                    <Target className="w-5 h-5" />
                    Place Bet for {selectedPlayer.name}
                  </button>

                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setModalPlayer(selectedPlayer);
                        setShowLedger(true);
                        setSelectedPlayer(null);
                      }}
                      className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl active:scale-95 transition-transform"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-1">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-bold text-blue-700" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                        လေဂျာ
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setModalPlayer(selectedPlayer);
                        setShowBettingRecords(true);
                        setSelectedPlayer(null);
                      }}
                      className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl active:scale-95 transition-transform"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-1">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-bold text-purple-700" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                        မှတ်တမ်း
                      </span>
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(selectedPlayer)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${selectedPlayer.name}?`)) {
                          onDeletePlayer(selectedPlayer.id);
                          setSelectedPlayer(null);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-white rounded-t-3xl w-full max-w-[375px] overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  {editingPlayer ? 'Edit Player' : 'Add New Player'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto hide-scrollbar">
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

              <div className="px-4 py-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-200">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium shadow-lg"
                >
                  {editingPlayer ? 'Update' : 'Add'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ledger Modal */}
      <AnimatePresence>
        {showLedger && modalPlayer && (() => {
          // Filter bets for this specific player
          const playerBets = dashboardBets.filter(bet => bet.playerName === modalPlayer.name);
          
          // Convert dashboard bets to ledger format (only number and amount, no details)
          const ledgerBets = playerBets.map(bet => ({
            number: bet.betNumber,
            amount: bet.amount
          }));

          return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-[95vw] max-w-[375px] h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
              >
                <MobileLedger 
                  onBack={() => {
                    setShowLedger(false);
                    setModalPlayer(null);
                  }} 
                  agentName={modalPlayer.name}
                  gameMode="2D"
                  bets={ledgerBets}
                />
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Betting Records Modal */}
      <AnimatePresence>
        {showBettingRecords && modalPlayer && (() => {
          // Filter bets for this specific player
          const playerBets = dashboardBets.filter(bet => bet.playerName === modalPlayer.name);

          return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-[95vw] max-w-[375px] h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              >
                {/* Betting Records Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-4 flex items-center justify-between shadow-lg flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                        မှတ်တမ်း
                      </h2>
                      <p className="text-xs text-purple-100">Betting Records for {modalPlayer.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowBettingRecords(false);
                      setModalPlayer(null);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Betting Records Content */}
                <div className="flex-1 overflow-auto hide-scrollbar p-4 bg-gray-50">
                  <PlayerBettingRecords
                    playerName={modalPlayer.name}
                    bets={playerBets}
                    onClose={() => {
                      setShowBettingRecords(false);
                      setModalPlayer(null);
                    }}
                    onDeleteSession={(sessionKey) => {
                      onDeleteBettingSession?.(modalPlayer.name, sessionKey);
                    }}
                  />
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Settlement Modal */}
      <AnimatePresence>
        {showSettlement && modalPlayer && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-[95vw] max-w-[375px] h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <MobileSettlement 
                onBack={() => {
                  setShowSettlement(false);
                  setModalPlayer(null);
                }}
                agentName={modalPlayer.name}
                winningNumber="45"
                salesTotal={modalPlayer.totalAmount || 0}
                commission={modalPlayer.totalAmount * 0.15 || 0}
                grandTotal={modalPlayer.totalAmount * 1.15 || 0}
                totalPaid={modalPlayer.totalAmount || 0}
                winningBet={modalPlayer.winAmount || 0}
                payout={modalPlayer.winAmount || 0}
                netProfit={(modalPlayer.totalAmount - modalPlayer.winAmount) || 0}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}