import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DashboardBet {
  id: string;
  playerName: string;
  gameType: '2D' | '3D';
  betNumber: string;
  amount: number;
  round: string;
  time: string;
  status: 'Won' | 'Lost' | 'Pending';
  pattern?: {
    type: string;
    input: string;
    label: string;
  };
  patternGroup?: string;
}

interface GroupedBettingRecordsProps {
  groupedBets: Record<string, DashboardBet[]>;
}

export function GroupedBettingRecords({ groupedBets }: GroupedBettingRecordsProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  // Patterns that show input number first (ထိပ်, နောက်, etc.)
  const inputFirstPatterns = ['ထိပ်', 'နောက်', 'ဘြိတ်', 'ပါတ်', 'ခွေ', 'ခွေပူး', 'စုံကပ်', 'စုံကပ်R', 'မကပ်', 'မကပ်R'];

  const renderGroupHeader = (groupKey: string, bets: DashboardBet[]) => {
    const firstBet = bets[0];
    const totalAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
    const pattern = firstBet.pattern;
    const isExpanded = expandedGroups[groupKey];

    if (!pattern) {
      // Manual bet without pattern
      return (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-purple-600">{firstBet.betNumber}</span>
            <span className="text-sm text-gray-600">({bets.length} bet{bets.length > 1 ? 's' : ''})</span>
          </div>
          <span className="text-lg font-bold text-gray-900">{totalAmount.toLocaleString()} ks</span>
        </div>
      );
    }

    // Pattern bet
    const showsInputFirst = inputFirstPatterns.includes(pattern.label);
    
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showsInputFirst ? (
            <>
              <span className="text-lg font-bold text-purple-600">{pattern.input}</span>
              <span className="text-base font-bold text-gray-700" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                {pattern.label}
              </span>
            </>
          ) : (
            <span className="text-base font-bold text-gray-700" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              {pattern.label}
            </span>
          )}
          <span className="text-sm text-gray-600">({bets.length} numbers)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-gray-900">{totalAmount.toLocaleString()} ks</span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {Object.entries(groupedBets).map(([groupKey, bets]) => (
        <div key={groupKey} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          {/* Group Header - Clickable */}
          <button
            onClick={() => toggleGroup(groupKey)}
            className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
          >
            {renderGroupHeader(groupKey, bets)}
          </button>

          {/* Expanded Details */}
          {expandedGroups[groupKey] && (
            <div className="border-t border-gray-200 bg-gray-50">
              <div className="p-4 space-y-2">
                {bets.map((bet, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 flex items-center justify-between border border-gray-200">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-purple-600 w-16">{bet.betNumber}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          bet.gameType === '2D' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {bet.gameType}
                        </span>
                        <span className="text-xs text-gray-600">{bet.round}</span>
                        <span className="text-xs text-gray-500">{bet.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-gray-900">{bet.amount.toLocaleString()} ks</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bet.status === 'Won' ? 'bg-green-100 text-green-700' :
                        bet.status === 'Lost' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {bet.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
