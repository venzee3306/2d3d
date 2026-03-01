import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, ArrowDownCircle, ArrowUpCircle, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import type { Transaction } from '../data/newMockData';

interface NewTransactionsScreenProps {
  onNavigate: (screen: string) => void;
  t: (key: string) => string;
  language: 'en' | 'mm';
  transactions: Transaction[];
  balance: number;
}

export const NewTransactionsScreen: React.FC<NewTransactionsScreenProps> = ({
  onNavigate,
  t,
  language,
  transactions,
  balance
}) => {
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'bet' | 'win'>('all');

  const filteredTransactions = transactions.filter(txn => {
    if (filterType === 'all') return true;
    if (filterType === 'win') return txn.type === 'win' || txn.type === 'loss';
    return txn.type === filterType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownCircle className="text-emerald-600" size={24} />;
      case 'bet':
        return <ArrowUpCircle className="text-red-600" size={24} />;
      case 'win':
        return <TrendingUp className="text-amber-600" size={24} />;
      case 'loss':
        return <TrendingDown className="text-gray-600" size={24} />;
      default:
        return <DollarSign className="text-gray-600" size={24} />;
    }
  };

  const getTypeBg = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'bg-emerald-100';
      case 'bet':
        return 'bg-red-100';
      case 'win':
        return 'bg-amber-100';
      case 'loss':
        return 'bg-gray-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'deposit':
        return language === 'mm' ? 'ငွေသွင်း' : 'Deposit';
      case 'bet':
        return language === 'mm' ? 'ထိုးငွေ' : 'Bet';
      case 'win':
        return language === 'mm' ? 'အနိုင်' : 'Win';
      case 'loss':
        return language === 'mm' ? 'ရှုံး' : 'Loss';
      default:
        return type;
    }
  };

  // Calculate stats
  const totalDeposits = transactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalBets = transactions
    .filter(t => t.type === 'bet')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalWins = transactions
    .filter(t => t.type === 'win')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="pb-20 lg:pb-6 min-h-screen bg-gray-50 lg:bg-transparent">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 lg:px-8 pt-12 pb-6 shadow-lg sticky top-0 z-20">
        <div className="flex items-center justify-between mb-6 max-w-5xl mx-auto">
          <button onClick={() => onNavigate('dashboard')} className="text-white/90 hover:text-white p-2 -ml-2">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-white font-black text-2xl tracking-tight">{t('transactionHistory')}</h1>
          <div className="w-10"></div>
        </div>

        {/* Balance Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-4">
          <p className="text-white/70 text-sm font-semibold mb-1">{t('currentBalance')}</p>
          <p className="text-white font-black text-4xl">
            {balance.toLocaleString()}
            <span className="text-xl ml-2 opacity-80">MMK</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-500/20 backdrop-blur-xl border border-emerald-400/30 rounded-2xl p-4 text-center">
            <p className="text-emerald-100 text-xs font-semibold mb-1">Deposits</p>
            <p className="text-white font-black text-lg">{totalDeposits.toLocaleString()}</p>
          </div>
          <div className="bg-red-500/20 backdrop-blur-xl border border-red-400/30 rounded-2xl p-4 text-center">
            <p className="text-red-100 text-xs font-semibold mb-1">Bets</p>
            <p className="text-white font-black text-lg">{totalBets.toLocaleString()}</p>
          </div>
          <div className="bg-amber-500/20 backdrop-blur-xl border border-amber-400/30 rounded-2xl p-4 text-center">
            <p className="text-amber-100 text-xs font-semibold mb-1">Wins</p>
            <p className="text-white font-black text-lg">{totalWins.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-200 px-5 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {(['all', 'deposit', 'bet', 'win'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                filterType === type
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/30'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="px-5 py-6 space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 font-semibold">No transactions found</p>
            <p className="text-gray-400 text-sm mt-1">Your transaction history will appear here</p>
          </div>
        ) : (
          filteredTransactions.map(txn => (
            <div
              key={txn.id}
              className="bg-white rounded-3xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 ${getTypeBg(txn.type)} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    {getTypeIcon(txn.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-gray-900 font-black text-base mb-1">
                          {getTypeText(txn.type)}
                        </p>
                        <p className="text-gray-600 text-sm leading-tight">
                          {language === 'mm' ? txn.descriptionMM : txn.description}
                        </p>
                      </div>
                      <div className="text-right ml-3">
                        <p className={`font-black text-xl ${
                          txn.amount >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {txn.amount >= 0 ? '+' : ''}{txn.amount.toLocaleString()}
                        </p>
                        <p className="text-gray-500 text-xs">MMK</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <p className="text-gray-400 text-xs font-semibold">
                        {format(new Date(txn.timestamp), 'MMM dd, yyyy - HH:mm')}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-500 text-xs font-semibold">Balance:</p>
                        <p className="text-gray-900 font-black text-sm">{txn.balance.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
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