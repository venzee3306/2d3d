import { useState } from 'react';
import { ChevronLeft, ChevronDown, ChevronUp, Share2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BetItem {
  number: string;
  amount: number;
  pattern?: {
    type: string;
    input: string;
    label: string;
  };
}

interface SavedRecord {
  id: string;
  session: string;
  timestamp: string;
  playerName: string;
  bets: BetItem[];
  total: number;
}

interface SavedBettingRecordsProps {
  records: SavedRecord[];
  onBack: () => void;
  onDeleteRecord?: (id: string) => void;
}

export function SavedBettingRecords({ records, onBack, onDeleteRecord }: SavedBettingRecordsProps) {
  const [expandedRecords, setExpandedRecords] = useState<Record<string, boolean>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleRecord = (recordId: string) => {
    setExpandedRecords(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
    }));
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  // Group bets by pattern within a record
  const groupBetsByPattern = (bets: BetItem[]) => {
    const grouped: Record<string, BetItem[]> = {};
    
    bets.forEach(bet => {
      let groupKey: string;
      
      if (bet.pattern) {
        // Group by pattern label and input
        groupKey = `${bet.pattern.label}-${bet.pattern.input}`;
      } else {
        // Individual manual bets
        groupKey = `manual-${bet.number}`;
      }
      
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(bet);
    });
    
    return grouped;
  };

  // Patterns that show input number first
  const inputFirstPatterns = ['ထိပ်', 'နောက်', 'ဘြိတ်', 'ပါတ်', 'ခွေ', 'ခွေပူး', 'စုံကပ်', 'စုံကပ်R', 'မကပ်', 'မကပ်R'];

  const renderGroupHeader = (groupKey: string, bets: BetItem[], recordId: string) => {
    const firstBet = bets[0];
    const totalAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
    const pattern = firstBet.pattern;
    const fullGroupKey = `${recordId}-${groupKey}`;
    const isExpanded = expandedGroups[fullGroupKey];

    if (!pattern) {
      // Manual bet without pattern - single number
      return (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-purple-600">{firstBet.number}</span>
          </div>
          <span className="text-lg font-bold text-gray-900">{totalAmount.toLocaleString()} ks</span>
        </div>
      );
    }

    // Pattern bet
    const showsInputFirst = inputFirstPatterns.includes(pattern.label);
    
    return (
      <button
        onClick={() => toggleGroup(fullGroupKey)}
        className="w-full flex items-center justify-between"
      >
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
          {bets.length > 1 && (
            <span className="text-sm text-gray-600">({bets.length} numbers)</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-gray-900">{totalAmount.toLocaleString()} ks</span>
          {bets.length > 1 && (
            isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )
          )}
        </div>
      </button>
    );
  };

  const handleShare = (record: SavedRecord) => {
    const groupedBets = groupBetsByPattern(record.bets);
    let shareText = `${record.session}\n${record.playerName}\n\n`;
    
    Object.entries(groupedBets).forEach(([groupKey, bets]) => {
      const firstBet = bets[0];
      const totalAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
      
      if (firstBet.pattern) {
        const showsInputFirst = inputFirstPatterns.includes(firstBet.pattern.label);
        if (showsInputFirst) {
          shareText += `${firstBet.pattern.input} ${firstBet.pattern.label} ${totalAmount}\n`;
        } else {
          shareText += `${firstBet.pattern.label} ${totalAmount}\n`;
        }
        // Add individual numbers if expanded
        if (bets.length > 1) {
          bets.forEach(bet => {
            shareText += `  ${bet.number}: ${bet.amount}\n`;
          });
        }
      } else {
        shareText += `${firstBet.number} ${totalAmount}\n`;
      }
    });
    
    shareText += `\nစုစုပေါင်း: ${record.total.toLocaleString()} ks`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Betting Record',
        text: shareText,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-4 shadow-lg flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              သွင်းထားသောမှတ်တမ်း
            </h1>
            <p className="text-sm text-purple-100">Betting Records</p>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="flex-1 overflow-auto hide-scrollbar bg-gray-50 p-4">
        <div className="space-y-4">
          {records.length > 0 ? (
            records.map((record) => {
              const groupedBets = groupBetsByPattern(record.bets);
              const isRecordExpanded = expandedRecords[record.id];

              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                >
                  {/* Record Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 font-medium">
                          {record.session}
                        </p>
                        <p className="text-xs text-gray-500">
                          ({record.timestamp})
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleShare(record)}
                          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                        >
                          <Share2 className="w-5 h-5 text-green-600" />
                        </button>
                        {onDeleteRecord && (
                          <button
                            onClick={() => onDeleteRecord(record.id)}
                            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Player Name */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">{record.playerName}</h3>
                      <button
                        onClick={() => toggleRecord(record.id)}
                        className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold hover:bg-purple-200 transition-colors"
                        style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
                      >
                        {isRecordExpanded ? 'ပိတ်မည်' : 'အသေးစိတ်'}
                      </button>
                    </div>
                  </div>

                  {/* Grouped Bets */}
                  <div className="px-4 py-3 space-y-2">
                    {Object.entries(groupedBets).map(([groupKey, bets]) => {
                      const fullGroupKey = `${record.id}-${groupKey}`;
                      const isGroupExpanded = expandedGroups[fullGroupKey];

                      return (
                        <div
                          key={groupKey}
                          className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
                        >
                          {/* Group Header */}
                          <div className="px-4 py-3">
                            {renderGroupHeader(groupKey, bets, record.id)}
                          </div>

                          {/* Expanded Group Details */}
                          <AnimatePresence>
                            {isGroupExpanded && bets.length > 1 && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border-t border-gray-200 bg-white"
                              >
                                <div className="px-4 py-3 space-y-2">
                                  {bets.map((bet, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                                    >
                                      <span className="text-base font-bold text-purple-600">
                                        {bet.number}
                                      </span>
                                      <span className="text-base font-bold text-gray-900">
                                        {bet.amount.toLocaleString()} ks
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total */}
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3 flex items-center justify-between">
                    <span className="text-base font-bold text-white" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                      စုစုပေါင်း:
                    </span>
                    <span className="text-xl font-bold text-white">
                      {record.total.toLocaleString()} ks
                    </span>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-md text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChevronLeft className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Saved Records
              </h3>
              <p className="text-gray-600">
                Your saved betting records will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
