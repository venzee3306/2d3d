import React, { useState } from 'react';
import { ArrowLeft, Filter, TrendingUp, TrendingDown, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import type { Bet } from '../data/newMockData';

interface NewHistoryScreenProps {
  onNavigate: (screen: string) => void;
  t: (key: string) => string;
  language: 'en' | 'mm';
  bets: Bet[];
  activeBets: Bet[];
  pastBets: Bet[];
  getBetsBySession: (sessionId: string) => Bet[];
}

export const NewHistoryScreen: React.FC<NewHistoryScreenProps> = ({
  onNavigate,
  t,
  language,
  bets,
  activeBets,
  pastBets,
  getBetsBySession
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'won' | 'lost'>('all');
  const [filterGameType, setFilterGameType] = useState<'all' | '2D' | '3D'>('all');
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Filter bets
  const filteredBets = bets.filter(bet => {
    if (filterStatus !== 'all') {
      const statusMap = { pending: 'Pending', won: 'Won', lost: 'Lost' };
      if (bet.status !== statusMap[filterStatus]) return false;
    }
    if (filterGameType !== 'all' && bet.gameType !== filterGameType) return false;
    return true;
  });

  // Group by session
  const sessionIds = [...new Set(filteredBets.map(b => b.sessionId).filter(Boolean))];
  const sessions = sessionIds.map(sessionId => {
    const sessionBets = getBetsBySession(sessionId as string);
    const totalAmount = sessionBets.reduce((sum, bet) => sum + bet.amount, 0);
    const totalWin = sessionBets.reduce((sum, bet) => sum + (bet.winAmount || 0), 0);
    return {
      id: sessionId as string,
      bets: sessionBets,
      totalAmount,
      totalWin,
      netProfit: totalWin - totalAmount,
      timestamp: sessionBets[0]?.placedAt
    };
  });

  const toggleSession = (sessionId: string) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Won': return 'bg-emerald-500';
      case 'Lost': return 'bg-red-500';
      case 'Pending': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Won': return 'bg-emerald-50 border-emerald-200';
      case 'Lost': return 'bg-red-50 border-red-200';
      case 'Pending': return 'bg-amber-50 border-amber-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Won': return 'text-emerald-700';
      case 'Lost': return 'text-red-700';
      case 'Pending': return 'text-amber-700';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className="pb-20 lg:pb-6 min-h-screen bg-gray-50 lg:bg-transparent">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-5 lg:px-8 pt-12 pb-6 shadow-lg sticky top-0 z-20">
        <div className="flex items-center justify-between mb-4 max-w-5xl mx-auto">
          <button onClick={() => onNavigate('dashboard')} className="text-white p-2 -ml-2">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-white font-bold text-2xl">{t('betHistory')}</h1>
          <button onClick={() => setShowFilters(!showFilters)} className="text-white p-2 -mr-2">
            <Filter size={24} />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-center">
            <p className="text-white/70 text-xs font-semibold mb-1">Total Bets</p>
            <p className="text-white font-black text-2xl">{filteredBets.length}</p>
          </div>
          <div className="bg-emerald-500/20 backdrop-blur-xl border border-emerald-400/30 rounded-2xl p-4 text-center">
            <p className="text-emerald-100 text-xs font-semibold mb-1">Wins</p>
            <p className="text-white font-black text-2xl">
              {filteredBets.filter(b => b.status === 'Won').length}
            </p>
          </div>
          <div className="bg-red-500/20 backdrop-blur-xl border border-red-400/30 rounded-2xl p-4 text-center">
            <p className="text-red-100 text-xs font-semibold mb-1">Losses</p>
            <p className="text-white font-black text-2xl">
              {filteredBets.filter(b => b.status === 'Lost').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-gray-700 font-bold text-sm mb-2">Status</p>
            <div className="flex gap-2">
              {(['all', 'pending', 'won', 'lost'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    filterStatus === status
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-gray-700 font-bold text-sm mb-2">Game Type</p>
            <div className="flex gap-2">
              {(['all', '2D', '3D'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterGameType(type)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    filterGameType === type
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="px-5 py-6 space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 font-semibold">No bets found</p>
            <p className="text-gray-400 text-sm mt-1">Your bet history will appear here</p>
          </div>
        ) : (
          sessions.map(session => {
            const isExpanded = expandedSessions.has(session.id);
            const mainStatus = session.bets[0]?.status;

            return (
              <div key={session.id} className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Session Header */}
                <button
                  onClick={() => toggleSession(session.id)}
                  className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(mainStatus)}`}></div>
                      <p className="text-gray-900 font-bold">
                        Session - {session.bets.length} {session.bets.length > 1 ? 'bets' : 'bet'}
                      </p>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBg(mainStatus)} ${getStatusText(mainStatus)}`}>
                        {mainStatus}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-3">
                      {format(new Date(session.timestamp), 'MMM dd, yyyy - HH:mm')}
                    </p>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-gray-500 text-xs">Total Bet</p>
                        <p className="text-gray-900 font-bold">{session.totalAmount.toLocaleString()} MMK</p>
                      </div>
                      {session.totalWin > 0 && (
                        <>
                          <div className="w-px h-8 bg-gray-200"></div>
                          <div>
                            <p className="text-gray-500 text-xs">Total Win</p>
                            <p className="text-emerald-600 font-bold">{session.totalWin.toLocaleString()} MMK</p>
                          </div>
                        </>
                      )}
                      {mainStatus !== 'Pending' && (
                        <>
                          <div className="w-px h-8 bg-gray-200"></div>
                          <div>
                            <p className="text-gray-500 text-xs">Net</p>
                            <p className={`font-bold flex items-center gap-1 ${session.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {session.netProfit >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                              {session.netProfit >= 0 ? '+' : ''}{session.netProfit.toLocaleString()}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="ml-3">
                    {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                  </div>
                </button>

                {/* Session Bets */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50 p-4 space-y-2">
                    {session.bets.map(bet => (
                      <div
                        key={bet.id}
                        className={`rounded-2xl p-4 border-2 ${getStatusBg(bet.status)}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-3xl font-black text-gray-900">{bet.betNumber}</span>
                              <div className="flex flex-col gap-1">
                                <span className="px-2.5 py-0.5 bg-white rounded-full text-xs font-bold text-gray-700 border border-gray-300">
                                  {bet.gameType}
                                </span>
                                <span className="px-2.5 py-0.5 bg-white rounded-full text-xs font-bold text-gray-700 border border-gray-300">
                                  {language === 'mm' ? (bet.round === 'Morning' ? 'နံနက်' : 'ညနေ') : bet.round}
                                </span>
                              </div>
                            </div>
                            {bet.pattern && bet.pattern.type !== 'manual' && (
                              <p className="text-gray-600 text-xs font-semibold mt-1">
                                Pattern: {language === 'mm' ? bet.pattern.labelMM : bet.pattern.label}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className={`text-2xl font-black ${getStatusText(bet.status)}`}>
                              {bet.amount.toLocaleString()}
                            </p>
                            <p className="text-gray-500 text-xs">MMK</p>
                          </div>
                        </div>

                        {bet.winAmount && bet.winAmount > 0 && (
                          <div className="bg-white rounded-xl p-3 border-2 border-emerald-300">
                            <div className="flex items-center justify-between">
                              <span className="text-emerald-700 font-bold text-sm">Win Amount</span>
                              <span className="text-emerald-600 font-black text-xl">
                                +{bet.winAmount.toLocaleString()} MMK
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};