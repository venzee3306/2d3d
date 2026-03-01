import { LayoutDashboard, Calculator, User } from 'lucide-react';
import { motion } from 'motion/react';

interface LotterySidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function LotterySidebar({ activeTab, setActiveTab }: LotterySidebarProps) {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'bet-entry', icon: Calculator, label: 'Bet Entry' },
  ];

  return (
    <div className="w-64 h-screen bg-[#1A2742] flex flex-col shadow-2xl">
      {/* Logo */}
      <div className="p-6 border-b border-[#2A3752]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[15px] bg-gradient-to-br from-[#2563EB] to-[#1E40AF] flex items-center justify-center shadow-lg">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">2D/3D Lottery</h1>
            <p className="text-xs text-blue-200">Agent Portal</p>
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
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-[15px] transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white shadow-lg shadow-blue-500/30'
                  : 'text-blue-100 hover:bg-[#2A3752]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 text-left font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-[#2A3752]">
        <div className="bg-[#2A3752] rounded-[15px] p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E40AF] flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">Ko Aung Aung</p>
              <p className="text-xs text-blue-200">Master Agent</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
