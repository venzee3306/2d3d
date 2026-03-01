import React from 'react';
import { Home, Plus, History, TrendingUp, User, LogOut, Wallet } from 'lucide-react';

interface LeftSidebarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  t: (key: string) => string;
  language: 'en' | 'mm';
  player: any;
  balance: number;
  logout: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  currentScreen,
  onNavigate,
  t,
  language,
  player,
  balance,
  logout
}) => {
  const navItems = [
    { 
      id: 'dashboard', 
      icon: Home, 
      label: language === 'mm' ? 'ပင်မ' : 'Dashboard'
    },
    { 
      id: 'place-bet', 
      icon: Plus, 
      label: language === 'mm' ? 'ထိုးမည်' : 'Place Bet'
    },
    { 
      id: 'my-bets', 
      icon: History, 
      label: language === 'mm' ? 'ကျွန်ုပ်၏ထိုးငွေများ' : 'My Bets'
    },
    { 
      id: 'results', 
      icon: TrendingUp, 
      label: language === 'mm' ? 'ရလဒ်များ' : 'Results'
    },
    { 
      id: 'transactions', 
      icon: Wallet, 
      label: language === 'mm' ? 'ငွေစာရင်း' : 'Transactions'
    },
    { 
      id: 'profile', 
      icon: User, 
      label: language === 'mm' ? 'ကျွန်ုပ်' : 'Profile'
    },
  ];

  const handleLogout = () => {
    if (confirm(language === 'mm' ? 'ထွက်မှာ သေချာပါသလား?' : 'Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:w-64 bg-white border-r border-gray-200 z-50">
      {/* Logo & Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-white">2D</span>
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-base">
              {language === 'mm' ? 'မြန်မာ လော့ထရီ' : 'Myanmar Lottery'}
            </h1>
            <p className="text-gray-500 text-xs">
              {language === 'mm' ? 'ကစားသမား' : 'Player Portal'}
            </p>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('profile')}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-700 font-bold text-sm">
                {language === 'mm' ? player.nameMM.charAt(0) : player.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-semibold text-sm truncate">
                {language === 'mm' ? player.nameMM : player.name}
              </p>
              <p className="text-gray-500 text-xs truncate">@{player.username}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-blue-100">
            <span className="text-gray-600 text-xs font-medium">{t('balance')}</span>
            <div className="text-gray-900 font-bold text-base">
              {balance.toLocaleString()}
              <span className="text-xs ml-1 text-gray-500">MMK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full transition-all rounded-lg p-3 flex items-center gap-3 ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="font-medium text-sm" style={{ fontFamily: language === 'mm' ? 'Padauk, Noto Sans Myanmar' : 'inherit' }}>
                {item.label}
              </span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-lg p-3 font-medium text-sm transition-all flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          <span style={{ fontFamily: language === 'mm' ? 'Padauk, Noto Sans Myanmar' : 'inherit' }}>
            {t('logout')}
          </span>
        </button>

        {/* Version */}
        <div className="mt-3 text-center">
          <p className="text-gray-400 text-xs">Myanmar Lottery v1.0.0</p>
        </div>
      </div>
    </div>
  );
};