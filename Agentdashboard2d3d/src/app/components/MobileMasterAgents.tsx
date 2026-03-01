import { ArrowLeft, UserCheck, Users, TrendingUp, Activity, Search, Ban, Eye, User, Key, Phone, Mail, Calendar, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { BlockedNumbersModal } from './BlockedNumbersModal';
import { AgentStatementModal } from './AgentStatementModal';

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

interface MobileMasterAgentsProps {
  onBack: () => void;
  currentUser: User;
  allUsers: User[];
  allPlayers: Player[];
  blockedNumbers: { [agentId: string]: { '2D': string[], '3D': string[] } };
  onUpdateBlockedNumbers: (agentId: string, gameType: '2D' | '3D', numbers: string[]) => void;
}

export function MobileMasterAgents({ onBack, currentUser, allUsers, allPlayers, blockedNumbers, onUpdateBlockedNumbers }: MobileMasterAgentsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [selectedAgentForBlock, setSelectedAgentForBlock] = useState<User | null>(null);
  const [showAgentInfoModal, setShowAgentInfoModal] = useState(false);
  const [selectedAgentForInfo, setSelectedAgentForInfo] = useState<User | null>(null);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [selectedAgentForStatement, setSelectedAgentForStatement] = useState<User | null>(null);

  // Get agents under this master
  const myAgents = allUsers.filter(u => u.role === 'agent' && u.parentId === currentUser.id);

  // Filter agents based on search
  const filteredAgents = myAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAgentStats = (agentId: string, index: number) => {
    const agentPlayers = allPlayers.filter(p => p.agentId === agentId);
    
    // Dummy data for each agent
    const dummyData = [
      { revenue: 425000, betsCount: 156 },
      { revenue: 380000, betsCount: 132 },
      { revenue: 510000, betsCount: 189 },
      { revenue: 290000, betsCount: 98 },
      { revenue: 445000, betsCount: 167 },
      { revenue: 360000, betsCount: 125 },
      { revenue: 475000, betsCount: 178 }
    ];
    
    const data = dummyData[index % dummyData.length];
    
    return {
      playersCount: agentPlayers.length,
      revenue: data.revenue,
      betsCount: data.betsCount
    };
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) {
      return '0';
    }
    return amount.toLocaleString('en-US');
  };

  const handleOpenBlockedModal = (agent: User) => {
    setSelectedAgentForBlock(agent);
    setShowBlockedModal(true);
  };

  const handleOpenInfoModal = (agent: User) => {
    setSelectedAgentForInfo(agent);
    setShowAgentInfoModal(true);
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

  return (
    <div className="w-full max-w-[375px] h-screen bg-[#F5F7FA] flex flex-col mx-auto overflow-hidden">
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
            <h1 className="text-lg font-bold text-white">My Agents</h1>
            <p className="text-xs text-blue-100">Manage your agent network</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/90 backdrop-blur-sm rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <p className="text-[10px] text-gray-600 font-medium">Agents</p>
            </div>
            <p className="text-lg font-bold text-gray-900">{myAgents.length}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-3.5 h-3.5 text-green-600" />
              <p className="text-[10px] text-gray-600 font-medium">Players</p>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {allPlayers.filter(p => p.agentId && myAgents.map(a => a.id).includes(p.agentId)).length}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
              <p className="text-[10px] text-gray-600 font-medium">Active</p>
            </div>
            <p className="text-lg font-bold text-gray-900">{myAgents.length}</p>
          </div>
        </div>
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 hide-scrollbar">
        {filteredAgents.length > 0 ? (
          <div className="space-y-3">
            {filteredAgents.map((agent, index) => {
              const stats = getAgentStats(agent.id, index);
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  {/* Agent Header */}
                  <div className="p-3 flex items-center gap-3 border-b border-gray-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {agent.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{agent.name}</p>
                      <p className="text-xs text-gray-500">@{agent.username}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full flex items-center gap-1 flex-shrink-0">
                      <Activity className="w-2.5 h-2.5" />
                      Active
                    </span>
                  </div>

                  {/* Agent Stats */}
                  <div className="p-3 grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="text-[10px] text-gray-600 mb-0.5">Players</p>
                      <p className="text-base font-bold text-gray-900">{stats.playersCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-600 mb-0.5">Bets</p>
                      <p className="text-base font-bold text-gray-900">{stats.betsCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-600 mb-0.5">Revenue</p>
                      <p className="text-sm font-bold text-blue-600">{(stats.revenue / 1000).toFixed(0)}K</p>
                    </div>
                  </div>

                  {/* Detailed Revenue */}
                  <div className="px-3 py-2 bg-gray-50 flex items-center justify-between border-b border-gray-100">
                    <span className="text-xs text-gray-600">Total Revenue (MMK)</span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(stats.revenue)}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-3 space-y-2">
                    {/* Statement Button */}
                    <button
                      onClick={() => handleOpenStatementModal(agent)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-200 rounded-lg transition-all active:scale-95"
                    >
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-bold text-green-700" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>ရှင်းတမ်း</span>
                    </button>

                    {/* View Info Button */}
                    <button
                      onClick={() => handleOpenInfoModal(agent)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 rounded-lg transition-all active:scale-95"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-blue-700">View Agent Info</span>
                    </button>

                    {/* Blocked Numbers Button */}
                    <button
                      onClick={() => handleOpenBlockedModal(agent)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-2 border-red-200 rounded-lg transition-all active:scale-95"
                    >
                      <Ban className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-bold text-red-700">ပိတ်ကွက်များ</span>
                      {getBlockedCount(agent.id) > 0 && (
                        <span className="ml-auto px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full">
                          {getBlockedCount(agent.id)}
                        </span>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <UserCheck className="w-16 h-16 text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {searchQuery ? 'No agents found' : 'No agents assigned'}
            </p>
            <p className="text-xs text-gray-500 text-center px-8">
              {searchQuery 
                ? 'Try a different search term' 
                : 'Contact admin to assign agents to your account'}
            </p>
          </div>
        )}
      </div>

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
        {showAgentInfoModal && selectedAgentForInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowAgentInfoModal(false);
              setSelectedAgentForInfo(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-[340px] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Agent Information</h3>
                    <p className="text-xs text-blue-100">Detailed account info</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAgentInfoModal(false);
                    setSelectedAgentForInfo(null);
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4">
                {/* Agent Avatar & Name */}
                <div className="flex flex-col items-center text-center pb-4 border-b border-gray-200">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mb-3 shadow-lg">
                    {selectedAgentForInfo.name.charAt(0)}
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">{selectedAgentForInfo.name}</h4>
                  <p className="text-sm text-gray-500">@{selectedAgentForInfo.username}</p>
                  <span className="mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Active Agent
                  </span>
                </div>

                {/* Agent Details */}
                <div className="space-y-3">
                  {/* Account ID */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Key className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 mb-0.5">Account ID</p>
                      <p className="text-sm font-bold text-gray-900 break-all">{selectedAgentForInfo.id}</p>
                    </div>
                  </div>

                  {/* Username */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 mb-0.5">Username</p>
                      <p className="text-sm font-bold text-gray-900">@{selectedAgentForInfo.username}</p>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Key className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 mb-0.5">Password</p>
                      <p className="text-sm font-mono font-bold text-gray-900">{selectedAgentForInfo.password}</p>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <UserCheck className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 mb-0.5">Role</p>
                      <p className="text-sm font-bold text-gray-900 capitalize">{selectedAgentForInfo.role}</p>
                    </div>
                  </div>

                  {/* Stats Summary */}
                  <div className="pt-2">
                    <p className="text-xs font-bold text-gray-700 mb-2">Performance Overview</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl text-center border border-blue-200">
                        <Users className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                        <p className="text-xs text-blue-600 mb-0.5">Players</p>
                        <p className="text-lg font-bold text-blue-700">
                          {allPlayers.filter(p => p.agentId === selectedAgentForInfo.id).length}
                        </p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl text-center border border-green-200">
                        <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
                        <p className="text-xs text-green-600 mb-0.5">Status</p>
                        <p className="text-sm font-bold text-green-700">Active</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowAgentInfoModal(false);
                    setSelectedAgentForInfo(null);
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all active:scale-95"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
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
          isMobile={true}
          hasPlayers={allPlayers.filter(p => p.agentId === selectedAgentForStatement.id).length > 0}
        />
      )}
    </div>
  );
}
