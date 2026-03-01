import React from 'react';
import { ArrowLeft, User, Phone, Wallet, Calendar, Shield, LogOut, Globe, Bell, Lock } from 'lucide-react';
import { format } from 'date-fns';

interface NewProfileScreenProps {
  onNavigate: (screen: string) => void;
  t: (key: string) => string;
  language: 'en' | 'mm';
  setLanguage: (lang: 'en' | 'mm') => void;
  player: any;
  balance: number;
  logout: () => void;
}

export const NewProfileScreen: React.FC<NewProfileScreenProps> = ({
  onNavigate,
  t,
  language,
  setLanguage,
  player,
  balance,
  logout
}) => {
  const handleLogout = () => {
    if (confirm(language === 'mm' ? 'ထွက်မှာ သေချာပါသလား?' : 'Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="pb-20 lg:pb-6 min-h-screen bg-gray-50 lg:bg-transparent">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 lg:px-8 pt-12 pb-24 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => onNavigate('dashboard')} className="text-white/90 hover:text-white p-2 -ml-2">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-white font-bold text-xl">{t('profile')}</h1>
            <div className="w-10"></div>
          </div>

          {/* Profile Avatar */}
          <div className="text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <span className="text-blue-600 font-bold text-3xl">
                {language === 'mm' ? player.nameMM.charAt(0) : player.name.charAt(0)}
              </span>
            </div>
            <h2 className="text-white font-bold text-2xl mb-1">
              {language === 'mm' ? player.nameMM : player.name}
            </h2>
            <p className="text-white/80 text-sm mb-3">@{player.username}</p>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
              player.status === 'active'
                ? 'bg-green-500/20 text-green-100 border border-green-400/30'
                : 'bg-red-500/20 text-red-100 border border-red-400/30'
            }`}>
              <Shield size={12} />
              {player.status === 'active' ? 'Active Account' : 'Suspended'}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="px-5 -mt-16 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          {/* Balance Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <div className="flex items-center gap-2 text-white/90 mb-1">
              <Wallet size={18} />
              <span className="font-medium text-sm">{t('currentBalance')}</span>
            </div>
            <p className="text-white font-bold text-4xl">
              {balance.toLocaleString()}
              <span className="text-xl ml-2 opacity-80">MMK</span>
            </p>
          </div>

          {/* Info Items */}
          <div className="divide-y divide-gray-200">
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <User className="text-blue-600" size={18} />
              </div>
              <div className="flex-1">
                <p className="text-gray-500 text-xs font-medium mb-0.5">Full Name</p>
                <p className="text-gray-900 font-semibold">{language === 'mm' ? player.nameMM : player.name}</p>
              </div>
            </div>

            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Phone className="text-green-600" size={18} />
              </div>
              <div className="flex-1">
                <p className="text-gray-500 text-xs font-medium mb-0.5">Phone Number</p>
                <p className="text-gray-900 font-semibold">{player.phoneNumber}</p>
              </div>
            </div>

            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Calendar className="text-purple-600" size={18} />
              </div>
              <div className="flex-1">
                <p className="text-gray-500 text-xs font-medium mb-0.5">Member Since</p>
                <p className="text-gray-900 font-semibold">{format(new Date(player.createdAt), 'MMMM dd, yyyy')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-gray-900 font-bold text-base">{t('settings')}</h3>
          </div>

          <div className="divide-y divide-gray-200">
            {/* Language */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <Globe className="text-indigo-600" size={18} />
                </div>
                <div>
                  <p className="text-gray-900 font-semibold text-sm">{t('language')}</p>
                  <p className="text-gray-500 text-xs">Change app language</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                    language === 'en'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('mm')}
                  className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                    language === 'mm'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  မြန်မာ
                </button>
              </div>
            </div>

            {/* Notifications (Disabled) */}
            <div className="p-4 flex items-center justify-between opacity-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Bell className="text-amber-600" size={18} />
                </div>
                <div>
                  <p className="text-gray-900 font-semibold text-sm">{t('notifications')}</p>
                  <p className="text-gray-500 text-xs">Coming soon</p>
                </div>
              </div>
            </div>

            {/* Change Password (Disabled) */}
            <div className="p-4 flex items-center justify-between opacity-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <Lock className="text-red-600" size={18} />
                </div>
                <div>
                  <p className="text-gray-900 font-semibold text-sm">{t('changePassword')}</p>
                  <p className="text-gray-500 text-xs">Coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md"
        >
          <LogOut size={20} />
          {t('logout')}
        </button>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs">Myanmar Lottery Player Platform</p>
          <p className="text-gray-400 text-xs mt-1">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
};