import React, { useState } from 'react';
import { ArrowLeft, Trophy, Calendar, TrendingUp, Star, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import type { DailyResult, Bet } from '../data/newMockData';

interface NewResultsScreenProps {
  onNavigate: (screen: string) => void;
  t: (key: string) => string;
  language: 'en' | 'mm';
  dailyResults: DailyResult[];
  bets: Bet[];
}

export const NewResultsScreen: React.FC<NewResultsScreenProps> = ({
  onNavigate,
  t,
  language,
  dailyResults,
  bets
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Group results by date
  const resultsByDate = dailyResults.reduce((acc, result) => {
    if (!acc[result.date]) {
      acc[result.date] = [];
    }
    acc[result.date].push(result);
    return acc;
  }, {} as Record<string, DailyResult[]>);

  const dates = Object.keys(resultsByDate).sort((a, b) => b.localeCompare(a));

  // Check if user won for a specific result
  const checkWinningBets = (result: DailyResult) => {
    return bets.filter(
      bet =>
        bet.gameType === result.gameType &&
        bet.round === result.round &&
        bet.betNumber === result.winningNumber &&
        bet.status === 'Won'
    );
  };

  return (
    <div className="pb-20 lg:pb-6 min-h-screen bg-gray-50 lg:bg-transparent">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-5 lg:px-8 pt-12 pb-6 shadow-lg sticky top-0 z-20">
        <div className="flex items-center justify-between mb-4 max-w-5xl mx-auto">
          <button onClick={() => onNavigate('dashboard')} className="text-white/90 hover:text-white p-2 -ml-2">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-white font-black text-2xl tracking-tight flex items-center gap-2">
            <Trophy size={26} />
            {t('results')}
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Date Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          <button
            onClick={() => setSelectedDate('')}
            className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
              selectedDate === ''
                ? 'bg-white text-purple-900 shadow-lg'
                : 'bg-white/20 backdrop-blur-md text-white border border-white/30'
            }`}
          >
            All Dates
          </button>
          {dates.slice(0, 5).map(date => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                selectedDate === date
                  ? 'bg-white text-purple-900 shadow-lg'
                  : 'bg-white/20 backdrop-blur-md text-white border border-white/30'
              }`}
            >
              {format(new Date(date), 'MMM dd')}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-6 space-y-6">
        {dates
          .filter(date => !selectedDate || date === selectedDate)
          .map(date => {
            const results = resultsByDate[date];
            const isToday = date === new Date().toISOString().split('T')[0];

            return (
              <div key={date}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`px-4 py-2 rounded-2xl font-black text-sm flex items-center gap-2 ${
                    isToday
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                      : 'bg-white text-gray-900 border-2 border-gray-200'
                  }`}>
                    <Calendar size={16} />
                    {isToday ? 'TODAY' : format(new Date(date), 'MMMM dd, yyyy')}
                  </div>
                </div>

                {/* Results Grid */}
                <div className="grid gap-4">
                  {results.map(result => {
                    const winningBets = checkWinningBets(result);
                    const hasWon = winningBets.length > 0;
                    const totalWin = winningBets.reduce((sum, bet) => sum + (bet.winAmount || 0), 0);

                    return (
                      <div
                        key={result.id}
                        className={`relative overflow-hidden rounded-3xl shadow-xl border-2 ${
                          hasWon
                            ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-emerald-300'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        {/* Win Badge */}
                        {hasWon && (
                          <div className="absolute top-0 right-0">
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-4 py-1.5 rounded-bl-2xl font-black text-xs flex items-center gap-1 shadow-lg">
                              <Star size={14} fill="currentColor" />
                              YOU WON!
                            </div>
                          </div>
                        )}

                        <div className="p-6">
                          {/* Game Info */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`px-4 py-2 rounded-xl font-black text-sm ${
                              result.gameType === '2D'
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            }`}>
                              {result.gameType}
                            </div>
                            <div className="px-4 py-2 bg-gray-900 rounded-xl font-black text-sm text-white">
                              {language === 'mm'
                                ? result.round === 'Morning'
                                  ? 'နံနက်'
                                  : 'ညနေ'
                                : result.round}
                            </div>
                            <div className="ml-auto text-gray-500 text-sm font-semibold">
                              {format(new Date(result.announcedAt), 'HH:mm')}
                            </div>
                          </div>

                          {/* Winning Number */}
                          <div className="relative">
                            <div className="text-center mb-4">
                              <p className={`text-sm font-bold mb-2 ${hasWon ? 'text-emerald-700' : 'text-gray-500'}`}>
                                {t('winningNumber')}
                              </p>
                              <div className={`inline-flex items-center justify-center rounded-3xl px-8 py-4 ${
                                hasWon
                                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/50'
                                  : 'bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl'
                              }`}>
                                <span className="text-white font-black text-6xl tracking-wider drop-shadow-lg">
                                  {result.winningNumber}
                                </span>
                              </div>
                            </div>

                            {/* Win Details */}
                            {hasWon && (
                              <div className="bg-white rounded-2xl p-5 border-2 border-emerald-300 shadow-lg">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="text-emerald-600" size={20} />
                                    <span className="text-emerald-900 font-black text-sm">Your Winning Bets</span>
                                  </div>
                                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-black">
                                    {winningBets.length} {winningBets.length > 1 ? 'bets' : 'bet'}
                                  </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                  {winningBets.map(bet => (
                                    <div key={bet.id} className="flex items-center justify-between bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                                      <div>
                                        <p className="text-emerald-900 font-bold">Bet: {bet.amount.toLocaleString()} MMK</p>
                                        {bet.pattern && bet.pattern.type !== 'manual' && (
                                          <p className="text-emerald-700 text-xs">
                                            {language === 'mm' ? bet.pattern.labelMM : bet.pattern.label}
                                          </p>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <p className="text-emerald-600 font-black text-lg">
                                          +{(bet.winAmount || 0).toLocaleString()}
                                        </p>
                                        <p className="text-emerald-700 text-xs">MMK</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-4">
                                  <div className="flex items-center justify-between">
                                    <span className="text-white font-black">TOTAL WIN</span>
                                    <span className="text-white font-black text-2xl flex items-center gap-2">
                                      <TrendingUp size={24} />
                                      {totalWin.toLocaleString()} MMK
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

        {dates.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="text-purple-400" size={32} />
            </div>
            <p className="text-gray-500 font-semibold">No results yet</p>
            <p className="text-gray-400 text-sm mt-1">Results will appear here when announced</p>
          </div>
        )}
      </div>

      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};