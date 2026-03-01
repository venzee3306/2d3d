import { ArrowLeft, Star, Filter, List, Share2 } from 'lucide-react';
import { useState } from 'react';

interface BetItem {
  number: string;
  amount: number;
  details?: string[];
}

interface DesktopLedgerProps {
  onBack: () => void;
  agentName: string;
  gameMode: '2D' | '3D';
  bets: BetItem[];
}

type SortMode = 'none' | 'ascending' | 'descending';

export function DesktopLedger({
  onBack,
  agentName,
  gameMode,
  bets,
}: DesktopLedgerProps) {
  const [filterMode, setFilterMode] = useState<'full' | 'filtered'>('full');
  const [sortMode, setSortMode] = useState<SortMode>('none');

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  // Generate all possible numbers
  const generateAllNumbers = () => {
    if (gameMode === '2D') {
      return Array.from({ length: 100 }, (_, i) => String(i).padStart(2, '0'));
    } else {
      return Array.from({ length: 1000 }, (_, i) => String(i).padStart(3, '0'));
    }
  };

  // Create bet map for quick lookup
  const betMap = new Map<string, BetItem>();
  bets.forEach(bet => {
    if (betMap.has(bet.number)) {
      const existing = betMap.get(bet.number)!;
      existing.amount += bet.amount;
      if (bet.details) {
        existing.details = [...(existing.details || []), ...bet.details];
      }
    } else {
      betMap.set(bet.number, { ...bet });
    }
  });

  // Get display list
  let displayNumbers = generateAllNumbers();
  
  // Apply filter
  if (filterMode === 'filtered') {
    displayNumbers = displayNumbers.filter(num => betMap.has(num));
  }

  // Apply sort
  if (sortMode !== 'none') {
    displayNumbers.sort((a, b) => {
      const amountA = betMap.get(a)?.amount || 0;
      const amountB = betMap.get(b)?.amount || 0;
      
      if (sortMode === 'ascending') {
        return amountA - amountB;
      } else {
        return amountB - amountA;
      }
    });
  }

  // Calculate total
  const total = Array.from(betMap.values()).reduce((sum, bet) => sum + bet.amount, 0);

  const handleSortToggle = () => {
    if (sortMode === 'none') {
      setSortMode('ascending');
    } else if (sortMode === 'ascending') {
      setSortMode('descending');
    } else {
      setSortMode('none');
    }
  };

  const getSortButtonText = () => {
    if (sortMode === 'none') return 'Sort';
    if (sortMode === 'ascending') return 'GTS';
    return 'STG';
  };

  const handleShare = () => {
    const text = `${agentName} ၏ လေဂျာ\n${gameMode} Mode\nTotal: ${formatNumber(total)} ks`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      // Fallback: Show alert on desktop
      alert(`${agentName} ၏ လေဂျာ\n${gameMode} Mode\nTotal: ${formatNumber(total)} ks`);
    }
  };

  return (
    <div className="flex-1 bg-[#F5F5F5] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white px-6 py-5 flex items-center gap-4 flex-shrink-0 shadow-sm">
        <button 
          onClick={onBack} 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
          {agentName} ၏ လေဂျာ
        </h1>
      </div>

      {/* Main Content Card */}
      <div className="flex-1 px-6 py-6 overflow-hidden flex">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">
          
          {/* Column Headers */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 grid grid-cols-[120px_1fr_150px] gap-4 flex-shrink-0">
            <span className="text-base font-semibold text-gray-900">{gameMode}</span>
            <span className="text-base font-semibold text-gray-900">Details</span>
            <span className="text-base font-semibold text-gray-900 text-right">Amount</span>
          </div>

          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto">
            {displayNumbers.map((number) => {
              const bet = betMap.get(number);
              const amount = bet?.amount || 0;
              const details = bet?.details || [];

              return (
                <div
                  key={number}
                  className={`px-6 py-4 border-b border-gray-100 grid grid-cols-[120px_1fr_150px] gap-4 items-center hover:bg-gray-50 transition-colors ${
                    amount > 0 ? 'bg-blue-50' : ''
                  }`}
                >
                  <span className="text-base font-medium text-gray-900">{number}</span>
                  <div className="flex flex-wrap gap-1">
                    {details.length > 0 ? (
                      details.map((detail, idx) => (
                        <span key={idx} className="text-sm text-gray-600">
                          {detail}
                          {idx < details.length - 1 ? ',' : ''}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-transparent">-</span>
                    )}
                  </div>
                  <span className="text-base font-medium text-gray-900 text-right">
                    {amount > 0 ? `${formatNumber(amount)} ks` : '0 ks'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Total Bar */}
          <div className="bg-gray-900 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <span className="text-base font-semibold text-white">Total :</span>
            <span className="text-xl font-bold text-white">{formatNumber(total)} ks</span>
          </div>

          {/* Action Buttons */}
          <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setFilterMode('full')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-colors ${
                filterMode === 'full'
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Star className="w-5 h-5" />
              <span className="text-sm font-medium">Full</span>
            </button>

            <button
              onClick={() => setFilterMode('filtered')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-colors ${
                filterMode === 'filtered'
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span className="text-sm font-medium">Filter</span>
            </button>

            <button
              onClick={handleSortToggle}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border bg-white border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <List className="w-5 h-5" />
              <span className="text-sm font-medium">{getSortButtonText()}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border bg-white border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
