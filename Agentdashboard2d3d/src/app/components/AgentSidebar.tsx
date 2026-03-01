import { LayoutDashboard, Calculator, User, Users, LogOut, Shield, Wallet, History, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'master' | 'agent';
  parentId?: string;
}

interface AgentSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onLogout: () => void;
  currentBalance?: number;
  pendingRequestsCount?: number; // New prop for notification badge
}

export function AgentSidebar({ activeTab, setActiveTab, currentUser, onLogout, currentBalance = 0, pendingRequestsCount = 0 }: AgentSidebarProps) {
  // Different navigation items based on role
  const getNavItems = () => {
    if (currentUser.role === 'admin') {
      return [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Analytics' },
        { id: 'masters', icon: Shield, label: 'Masters' },
        { id: 'units', icon: Wallet, label: 'Units' },
        { id: 'withdrawals', icon: ArrowDownLeft, label: 'Withdrawals' },
        { id: 'transactions', icon: History, label: 'Transactions' },
      ];
    } else if (currentUser.role === 'master') {
      return [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'agents', icon: Users, label: 'Agents' },
        { id: 'deposits', icon: ArrowUpRight, label: 'Deposits' },
        { id: 'units', icon: Wallet, label: 'Units' },
        { id: 'withdrawals', icon: ArrowDownLeft, label: 'Withdrawals' },
        { id: 'transactions', icon: History, label: 'Transactions' },
      ];
    } else {
      return [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'players', icon: Users, label: 'Players' },
        { id: 'deposits', icon: Wallet, label: 'Deposits' },
        { id: 'withdrawals', icon: ArrowDownLeft, label: 'Withdrawals' },
        { id: 'transactions', icon: History, label: 'Transactions' },
      ];
    }
  };

  const navItems = getNavItems();

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'master':
        return 'Master';
      case 'agent':
        return 'Agent';
      default:
        return 'User';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'from-purple-500 to-purple-700';
      case 'master':
        return 'from-blue-500 to-blue-700';
      case 'agent':
        return 'from-green-500 to-green-700';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  const getPortalTitle = () => {
    switch (currentUser.role) {
      case 'admin':
        return 'Admin Portal';
      case 'master':
        return 'Master Portal';
      case 'agent':
        return 'Agent Portal';
      default:
        return 'Portal';
    }
  };

  return (
    <div className="w-64 h-screen bg-[#1A2742] flex flex-col shadow-2xl">
      {/* Logo */}
      <div className="p-6 border-b border-[#2A3752]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1E40AF] flex items-center justify-center shadow-lg">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">{getPortalTitle()}</h1>
            <p className="text-xs text-blue-200">Lottery System</p>
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
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all relative ${
                isActive
                  ? 'bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white shadow-lg shadow-blue-500/30'
                  : 'text-blue-100 hover:bg-[#2A3752]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 text-left font-medium">{item.label}</span>
              
              {/* Notification Badge for Withdrawals tab (Admin only) */}
              {currentUser.role === 'admin' && item.id === 'withdrawals' && pendingRequestsCount > 0 && (
                <div className="absolute -top-1 -right-1 min-w-[24px] h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-2 shadow-lg animate-pulse">
                  {pendingRequestsCount > 99 ? '99+' : pendingRequestsCount}
                </div>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-[#2A3752] space-y-3">
        <div className="bg-[#2A3752] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRoleBadgeColor(currentUser.role)} flex items-center justify-center shadow-lg`}>
              {currentUser.role === 'admin' ? (
                <Shield className="w-6 h-6 text-white" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-blue-200">{getRoleDisplay(currentUser.role)}</p>
            </div>
          </div>
          
          {/* Unit Balance */}
          <div className="bg-[#1A2742] rounded-lg p-3 border border-[#3A4762]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-blue-200">Units</span>
              </div>
              <span className="text-sm font-bold text-white">{currentBalance.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        {/* Logout Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-medium shadow-lg"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </motion.button>
      </div>
    </div>
  );
}
