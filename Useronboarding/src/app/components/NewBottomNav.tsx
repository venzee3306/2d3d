import React from 'react';
import { Home, Plus, History, BarChart3, User } from 'lucide-react';

interface NewBottomNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onShowQuickBet?: () => void;
  t: (key: string) => string;
  language: 'en' | 'mm';
}

export const NewBottomNav: React.FC<NewBottomNavProps> = ({ currentScreen, onNavigate, onShowQuickBet, t, language }) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: language === 'mm' ? 'ပင်မ' : 'Home' },
    { id: 'history', icon: History, label: language === 'mm' ? 'မှတ်တမ်း' : 'History' },
    { id: 'place-bet', icon: Plus, label: language === 'mm' ? 'ထိုး' : 'Bet', isCenter: true },
    { id: 'results', icon: BarChart3, label: language === 'mm' ? 'ရလဒ်' : 'Results' },
    { id: 'profile', icon: User, label: language === 'mm' ? 'ပရိုဖိုင်' : 'Profile' },
  ];

  const handleNavClick = (itemId: string) => {
    if (itemId === 'place-bet' && onShowQuickBet) {
      onShowQuickBet();
    } else {
      onNavigate(itemId);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="max-w-[430px] mx-auto">
        <div className="bg-white border-t border-gray-200 px-3 pt-2 pb-safe shadow-lg">
          <div className="flex items-end justify-around relative">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;

              if (item.isCenter) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className="flex flex-col items-center -mt-8"
                  >
                    <div className="w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-xl flex items-center justify-center mb-1 transition-all">
                      <Icon className="text-white" size={26} strokeWidth={2.5} />
                    </div>
                    <span className="text-gray-700 font-semibold text-xs">{item.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="flex flex-col items-center py-2 px-3 min-w-[60px] relative"
                >
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-1 bg-blue-600 rounded-full"></div>
                  )}
                  <div className={`mb-1 transition-all ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  }`}>
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-xs font-medium transition-all ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};