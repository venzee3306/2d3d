import { LayoutDashboard, Users, ScrollText, History, Settings, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'players', icon: Users, label: 'Player List' },
    { id: 'credits', icon: ScrollText, label: 'Credit Logs' },
    { id: 'history', icon: History, label: 'Game History' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 h-screen bg-[#0A0A0A] border-r border-[#1F1F1F] flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-[#1F1F1F]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00D1FF] to-[#0088CC] flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-white">Agent System</h1>
            <p className="text-xs text-gray-500">Management Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#00D1FF]/20 to-transparent border border-[#00D1FF]/30 text-[#00D1FF]'
                  : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 text-left text-sm">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#1F1F1F]">
        <div className="bg-[#1A1A1A] rounded-lg p-3 border border-[#2A2A2A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center">
              <span className="text-sm font-semibold text-[#0A0A0A]">AG</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Agent_007</p>
              <p className="text-xs text-gray-500">Master Agent</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
