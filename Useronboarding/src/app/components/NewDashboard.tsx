import React from 'react';
import { Wallet, TrendingUp, TrendingDown, Clock, Trophy, Plus, History, BarChart3, Zap } from 'lucide-react';
import { format } from 'date-fns';
import type { Bet, DailyResult } from '../data/newMockData';

interface NewDashboardProps {
  onNavigate: (screen: string) => void;
  onShowQuickBet?: () => void;
  t: (key: string) => string;
  language: 'en' | 'mm';
  player: any;
  balance: number;
  activeBets: Bet[];
  getTodayResults: () => DailyResult[];
  bets: Bet[];
  addToCart?: (items: any[]) => void;
}

export const NewDashboard: React.FC<NewDashboardProps> = ({
  onNavigate,
  onShowQuickBet,
  t,
  language,
  player,
  balance,
  activeBets,
  getTodayResults,
  bets,
  addToCart
}) => {
  const todayResults = getTodayResults();
  
  // Calculate today's stats
  const today = new Date().toISOString().split('T')[0];
  const todayBets = bets.filter(bet => bet.placedAt.split('T')[0] === today);
  const todayWins = todayBets.filter(bet => bet.status === 'Won');
  const todayLosses = todayBets.filter(bet => bet.status === 'Lost');
  
  const totalBetToday = todayBets.reduce((sum, bet) => sum + bet.amount, 0);
  const totalWinToday = todayWins.reduce((sum, bet) => sum + (bet.winAmount || 0), 0);
  const netProfitToday = totalWinToday - totalBetToday;

  return (
    <div className="pb-20 lg:pb-6 min-h-screen bg-gray-50 lg:bg-transparent">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 lg:px-8 pt-12 pb-8 shadow-lg lg:rounded-3xl lg:m-6 lg:mb-0">
        <div className="relative max-w-5xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              {player?.source === 'api' && (
                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-white/20 text-white mb-2">
                  Default dashboard
                </span>
              )}
              <p className="text-white/90 text-sm mb-1 font-medium">{t('welcome')}</p>
              <h1 className="text-white font-bold text-3xl lg:text-4xl mb-1">
                {language === 'mm' ? player?.nameMM : player?.name}
              </h1>
              <p className="text-white/80 text-sm font-medium">{player?.phoneNumber}</p>
            </div>
            <button 
              onClick={() => onNavigate('profile')}
              className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <span className="text-xl font-bold">
                {language === 'mm' ? player.nameMM.charAt(0) : player.name.charAt(0)}
              </span>
            </button>
          </div>

          {/* Balance Card */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm font-semibold">{t('currentBalance')}</p>
              <Wallet className="text-gray-400" size={22} />
            </div>
            <h2 className="text-gray-900 font-bold text-5xl lg:text-6xl mb-4">
              {balance.toLocaleString()}
              <span className="text-xl lg:text-2xl ml-2 text-gray-500">MMK</span>
            </h2>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all"
            >
              View Transactions 
              <span className="text-lg">→</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto">
        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => {
              if (onShowQuickBet) onShowQuickBet();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <Plus size={20} />
            {language === 'mm' ? 'ထိုးမည်' : 'Place Bet'}
          </button>
          <button
            onClick={() => onNavigate('place-bet')}
            className="bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <Zap size={20} />
            {language === 'mm' ? 'အပြည့်အစုံ' : 'Full Page'}
          </button>
        </div>

        {/* Today's Stats */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 font-bold text-lg">Today's Summary</h3>
            <span className="text-gray-500 text-sm">{format(new Date(), 'MMM dd, yyyy')}</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-blue-600 text-xs mb-1">Bets Placed</p>
              <p className="text-blue-900 font-bold text-2xl">{todayBets.length}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-emerald-600 text-xs mb-1">Wins</p>
              <p className="text-emerald-900 font-bold text-2xl">{todayWins.length}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-red-600 text-xs mb-1">Losses</p>
              <p className="text-red-900 font-bold text-2xl">{todayLosses.length}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Net Profit/Loss</span>
              <span className={`font-bold text-lg flex items-center gap-1 ${
                netProfitToday >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {netProfitToday >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                {netProfitToday >= 0 ? '+' : ''}{netProfitToday.toLocaleString()} MMK
              </span>
            </div>
          </div>
        </div>

        {/* Today's Results */}
        {todayResults.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="text-amber-500" size={20} />
                <h3 className="text-gray-900 font-bold text-lg">{t('todayResults')}</h3>
              </div>
              <button
                onClick={() => onNavigate('results')}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                View All →
              </button>
            </div>

            <div className="space-y-3">
              {todayResults.map((result) => (
                <div key={result.id} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-900 font-semibold">
                        {result.gameType} - {language === 'mm' ? 
                          (result.round === 'Morning' ? 'နံနက်' : 'ညနေ') : 
                          result.round
                        }
                      </p>
                      <p className="text-amber-700 text-xs">{format(new Date(result.announcedAt), 'HH:mm')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-700 text-xs mb-1">{t('winningNumber')}</p>
                      <p className="text-amber-900 font-bold text-3xl">{result.winningNumber}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Bets */}
        {activeBets.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="text-orange-500" size={20} />
                <h3 className="text-gray-900 font-bold text-lg">{t('activeBets')}</h3>
              </div>
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                {activeBets.length}
              </span>
            </div>

            <div className="space-y-2">
              {activeBets.slice(0, 5).map((bet) => (
                <div key={bet.id} className="bg-orange-50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <span className="font-bold text-xl text-orange-900">{bet.betNumber}</span>
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold">
                        {bet.gameType} - {language === 'mm' ? 
                          (bet.round === 'Morning' ? 'နံနက်' : 'ညနေ') : 
                          bet.round
                        }
                      </p>
                      <p className="text-gray-600 text-sm">{bet.amount.toLocaleString()} MMK</p>
                      <p className="text-gray-500 text-xs">{format(new Date(bet.placedAt), 'MMM dd, HH:mm')}</p>
                    </div>
                  </div>
                  <span className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold">
                    {t('pending')}
                  </span>
                </div>
              ))}
            </div>

            {activeBets.length > 5 && (
              <button
                onClick={() => onNavigate('history')}
                className="w-full mt-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-900 rounded-xl font-semibold text-sm"
              >
                View All Active Bets ({activeBets.length})
              </button>
            )}
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('history')}
            className="bg-white hover:bg-gray-50 rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col items-center gap-3 transition-all"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <History className="text-blue-600" size={24} />
            </div>
            <span className="text-gray-900 font-semibold">{t('betHistory')}</span>
          </button>

          <button
            onClick={() => onNavigate('results')}
            className="bg-white hover:bg-gray-50 rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col items-center gap-3 transition-all"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="text-purple-600" size={24} />
            </div>
            <span className="text-gray-900 font-semibold">{t('results')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};