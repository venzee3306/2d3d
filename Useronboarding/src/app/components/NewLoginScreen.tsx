import React, { useState } from 'react';
import { Dices, User, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface NewLoginScreenProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  t: (key: string) => string;
  language: 'en' | 'mm';
  setLanguage: (lang: 'en' | 'mm') => void;
}

export const NewLoginScreen: React.FC<NewLoginScreenProps> = ({ onLogin, t, language, setLanguage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error(t('loginFailed'));
      return;
    }
    setIsLoading(true);
    try {
      const success = await onLogin(username, password);
      if (success) toast.success(t('loginSuccess'));
      else toast.error(t('loginFailed'));
    } catch {
      toast.error(t('loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setUsername('aungaung');
    setPassword('player123');
    setIsLoading(true);
    try {
      const success = await onLogin('aungaung', 'player123');
      if (success) toast.success(t('loginSuccess'));
    } catch {
      toast.error(t('loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-6 overflow-y-auto scrollbar-hide">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-4xl font-bold text-white">2D</span>
          </div>
          <h1 className="text-gray-900 font-bold text-3xl mb-2" style={{ fontFamily: language === 'mm' ? 'Padauk, Noto Sans Myanmar' : 'inherit' }}>
            {language === 'mm' ? 'မြန်မာ လော့ထရီ' : 'Myanmar Lottery'}
          </h1>
          <p className="text-gray-600" style={{ fontFamily: language === 'mm' ? 'Padauk, Noto Sans Myanmar' : 'inherit' }}>
            {language === 'mm' ? 'ကစားသမားတို့အတွက်' : 'Player Platform'}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
          <h2 className="text-gray-900 font-bold text-xl mb-6 text-center" style={{ fontFamily: language === 'mm' ? 'Padauk, Noto Sans Myanmar' : 'inherit' }}>
            {language === 'mm' ? 'အကောင့်ဝင်ရန်' : 'Login to Play'}
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="mb-4">
              <label className="text-gray-700 font-medium mb-2 block text-sm">
                {t('username')}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <User className="text-gray-400" size={20} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={language === 'mm' ? 'အသုံးပြုသူအမည်' : 'Enter username'}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="text-gray-700 font-medium mb-2 block text-sm">
                {t('password')}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={language === 'mm' ? 'စကားဝှက်' : 'Enter password'}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-all mb-3 shadow-md"
            >
              {isLoading ? (language === 'mm' ? 'ဝင်နေသည်...' : 'Logging in...') : t('login')}
            </button>
          </form>

          {/* Demo Login */}
          <button
            onClick={handleDemoLogin}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-all"
          >
            {language === 'mm' ? 'စမ်းသပ်ဝင်ရောက်ရန်' : 'Demo Login'}
          </button>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-blue-900 font-semibold text-sm mb-2">
              {language === 'mm' ? 'စမ်းသပ်အကောင့်:' : 'Demo Account:'}
            </p>
            <p className="text-gray-600 text-xs mb-1">
              {language === 'mm' ? 'အသုံးပြုသူ:' : 'Username:'} <span className="text-gray-900 font-mono font-medium">aungaung</span>
            </p>
            <p className="text-gray-600 text-xs">
              {language === 'mm' ? 'စကားဝှက်:' : 'Password:'} <span className="text-gray-900 font-mono font-medium">player123</span>
            </p>
          </div>
        </div>

        {/* Language Toggle */}
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setLanguage('en')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              language === 'en'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('mm')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              language === 'mm'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            style={{ fontFamily: 'Padauk, Noto Sans Myanmar' }}
          >
            မြန်မာ
          </button>
        </div>

        {/* Footer */}
        <p className="text-gray-500 text-xs text-center mt-6">
          © 2026 Myanmar Lottery Player Platform
        </p>
      </div>
    </div>
  );
};