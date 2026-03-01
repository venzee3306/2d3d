import { LayoutDashboard, Calculator } from 'lucide-react';
import { motion } from 'motion/react';

interface BetEntrySidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function BetEntrySidebar({ activeTab, setActiveTab }: BetEntrySidebarProps) {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'bet-entry', icon: Calculator, label: 'Bet Entry' },
  ];

  return (
    <div className="w-72 h-screen bg-[#1B2B4A] flex flex-col shadow-xl">
      {/* Logo */}
      <div className="p-6 border-b border-[#2A3B5A]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4A90E2] to-[#357ABD] flex items-center justify-center shadow-lg">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Lottery Agent</h1>
            <p className="text-xs text-blue-200">Bet Entry System</p>
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
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#4A90E2] to-[#357ABD] text-white shadow-lg'
                  : 'text-blue-100 hover:bg-[#2A3B5A]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 text-left font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Agent Info Footer */}
      <div className="p-4 border-t border-[#2A3B5A]">
        <div className="bg-[#2A3B5A] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4A90E2] to-[#357ABD] flex items-center justify-center">
              <span className="text-sm font-bold text-white">MA</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Master Agent</p>
              <p className="text-xs text-blue-200">ID: AG-12345</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
