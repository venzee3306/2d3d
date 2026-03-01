import { Users, ChevronDown, ChevronRight, Crown } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface SubAgent {
  id: string;
  name: string;
  players: number;
  revenue: number;
  status: 'active' | 'inactive';
  level: number;
}

export function AgentHierarchy() {
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set(['main']));

  const agents: SubAgent[] = [
    { id: 'SA-001', name: 'Agent_Alpha', players: 45, revenue: 125000, status: 'active', level: 1 },
    { id: 'SA-002', name: 'Agent_Beta', players: 32, revenue: 98000, status: 'active', level: 1 },
    { id: 'SA-003', name: 'Agent_Gamma', players: 28, revenue: 76000, status: 'active', level: 1 },
    { id: 'SA-004', name: 'Agent_Delta', players: 15, revenue: 42000, status: 'inactive', level: 2 },
    { id: 'SA-005', name: 'Agent_Epsilon', players: 22, revenue: 61000, status: 'active', level: 2 },
  ];

  const toggleAgent = (agentId: string) => {
    setExpandedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  };

  const isExpanded = (agentId: string) => expandedAgents.has(agentId);

  return (
    <div className="rounded-xl overflow-hidden border border-[#1F1F1F] bg-[#0A0A0A]/50 backdrop-blur-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A1A1A] to-[#0F0F0F] p-4 border-b border-[#1F1F1F]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#FFD700]" />
            <h2 className="text-xl font-semibold text-white">Agent Hierarchy</h2>
          </div>
          <span className="text-xs text-gray-400">5 Sub-Agents</span>
        </div>
      </div>

      {/* Tree View */}
      <div className="p-4 space-y-2">
        {/* Main Agent (You) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg border border-[#FFD700]/30 bg-gradient-to-r from-[#FFD700]/10 to-transparent p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleAgent('main')}
                className="text-[#FFD700] hover:bg-[#FFD700]/10 p-1 rounded transition-colors"
              >
                {isExpanded('main') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center">
                <Crown className="w-5 h-5 text-[#0A0A0A]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Agent_007 (You)</p>
                <p className="text-xs text-gray-400">Master Agent</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-right">
              <div>
                <p className="text-xs text-gray-400">Total Players</p>
                <p className="text-sm font-semibold text-white">142</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Revenue</p>
                <p className="text-sm font-semibold text-[#FFD700]">$402,000</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sub-Agents */}
        {isExpanded('main') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pl-8 space-y-2"
          >
            {agents.filter((a) => a.level === 1).map((agent, index) => (
              <div key={agent.id}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-lg border border-[#00D1FF]/30 bg-[#1A1A1A] p-3 hover:bg-[#1F1F1F] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleAgent(agent.id)}
                        className="text-[#00D1FF] hover:bg-[#00D1FF]/10 p-1 rounded transition-colors"
                      >
                        {isExpanded(agent.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D1FF]/30 to-[#0088CC]/30 border border-[#00D1FF]/40 flex items-center justify-center">
                        <Users className="w-4 h-4 text-[#00D1FF]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{agent.name}</p>
                        <p className="text-xs text-gray-500">{agent.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <p className="text-xs text-gray-400">Players</p>
                        <p className="text-sm font-medium text-white">{agent.players}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Revenue</p>
                        <p className="text-sm font-medium text-[#00D1FF]">${agent.revenue.toLocaleString()}</p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          agent.status === 'active'
                            ? 'bg-[#00FF87]/20 text-[#00FF87] border border-[#00FF87]/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}
                      >
                        {agent.status}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Level 2 Sub-Agents */}
                {isExpanded(agent.id) && agent.id === 'SA-001' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pl-8 mt-2 space-y-2"
                  >
                    {agents
                      .filter((a) => a.level === 2)
                      .map((subAgent, subIndex) => (
                        <motion.div
                          key={subAgent.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: subIndex * 0.05 }}
                          className="rounded-lg border border-[#9D4EDD]/30 bg-[#1A1A1A] p-3 hover:bg-[#1F1F1F] transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9D4EDD]/30 to-[#7B2CBF]/30 border border-[#9D4EDD]/40 flex items-center justify-center">
                                <Users className="w-4 h-4 text-[#9D4EDD]" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{subAgent.name}</p>
                                <p className="text-xs text-gray-500">{subAgent.id}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-right">
                              <div>
                                <p className="text-xs text-gray-400">Players</p>
                                <p className="text-sm font-medium text-white">{subAgent.players}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Revenue</p>
                                <p className="text-sm font-medium text-[#9D4EDD]">
                                  ${subAgent.revenue.toLocaleString()}
                                </p>
                              </div>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  subAgent.status === 'active'
                                    ? 'bg-[#00FF87]/20 text-[#00FF87] border border-[#00FF87]/30'
                                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                }`}
                              >
                                {subAgent.status}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </motion.div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
