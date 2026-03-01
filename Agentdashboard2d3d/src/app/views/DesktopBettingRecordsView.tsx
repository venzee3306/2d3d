import { ArrowLeft, Printer, Share2, Trash2, ChevronDown, ChevronUp, Copy, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface BetItem {
  number: string;
  amount: number;
  pattern?: {
    type: 'manual' | 'group' | 'head' | 'tail' | 'break' | 'round' | 'khwe' | 'khwe-puu' | 'nat-kyauk' | 'apone' | 'apout' | 'brothers' | 'power-2' | 'power-3' | 'break-2' | 'break-3' | 'opposite' | 'twin' | 'natkhat-body';
    input: string;
    label: string;
  };
}

interface BettingRecord {
  id: string;
  session: string;
  timestamp: string;
  playerName: string;
  bets: BetItem[];
  total: number;
}

interface DesktopBettingRecordsViewProps {
  records: BettingRecord[];
  onBack?: () => void;
  onDeleteRecord: (id: string) => void;
}

interface GroupedBet {
  pattern: {
    type: string;
    input: string;
    label: string;
  };
  bets: BetItem[];
  totalAmount: number;
}

export function DesktopBettingRecordsView({ records, onBack, onDeleteRecord }: DesktopBettingRecordsViewProps) {
  const [expandedGroups, setExpandedGroups] = useState<{ [recordId: string]: { [groupIndex: number]: boolean } }>({});
  const [selectedRecord, setSelectedRecord] = useState<BettingRecord | null>(null);
  const [expandAllStates, setExpandAllStates] = useState<{ [recordId: string]: boolean }>({});

  const handlePrint = (id: string) => {
    console.log('Print record:', id);
    alert(`Printing record ${id}`);
  };

  const handleShare = (id: string) => {
    console.log('Share record:', id);
    alert(`Sharing record ${id}`);
  };

  const handleDelete = (id: string) => {
    console.log('Delete record:', id);
    if (confirm('Are you sure you want to delete this record?')) {
      onDeleteRecord(id);
    }
  };

  const handleCopyAllBets = () => {
    if (!selectedRecord) return;
    const text = selectedRecord.bets.map(bet => `${bet.number} = ${formatNumber(bet.amount)}`).join('\n');
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handlePrintAllBets = () => {
    if (!selectedRecord) return;
    alert('Printing all bets...');
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  const toggleGroup = (recordId: string, groupIndex: number) => {
    setExpandedGroups(prev => ({
      ...prev,
      [recordId]: {
        ...prev[recordId],
        [groupIndex]: !prev[recordId]?.[groupIndex]
      }
    }));
  };

  const toggleExpandAll = (recordId: string, groupCount: number) => {
    const isCurrentlyExpanded = expandAllStates[recordId];
    const newState = !isCurrentlyExpanded;
    
    // Set the expand all state for this record
    setExpandAllStates(prev => ({
      ...prev,
      [recordId]: newState
    }));
    
    // Expand or collapse all groups
    const newGroupStates: { [groupIndex: number]: boolean } = {};
    for (let i = 0; i < groupCount; i++) {
      newGroupStates[i] = newState;
    }
    
    setExpandedGroups(prev => ({
      ...prev,
      [recordId]: newGroupStates
    }));
  };

  // Group bets by pattern
  const groupBetsByPattern = (bets: BetItem[]): GroupedBet[] => {
    const groups: { [key: string]: GroupedBet } = {};
    
    bets.forEach(bet => {
      if (bet.pattern) {
        // For Quick Add Patterns: Group by pattern type AND input digit
        // This keeps each pattern usage separate (e.g., "2 ထိပ်" separate from "3 ထိပ်")
        const key = `${bet.pattern.type}-${bet.pattern.input}-${bet.pattern.label}`;
        if (!groups[key]) {
          groups[key] = {
            pattern: bet.pattern,
            bets: [],
            totalAmount: 0
          };
        }
        groups[key].bets.push(bet);
        groups[key].totalAmount += bet.amount;
      } else {
        // Manual entries (ရိုးရို) - group ALL manual bets together
        const key = 'manual-all';
        if (!groups[key]) {
          groups[key] = {
            pattern: {
              type: 'manual',
              input: '',
              label: 'ရိုးရို'
            },
            bets: [],
            totalAmount: 0
          };
        }
        groups[key].bets.push(bet);
        groups[key].totalAmount += bet.amount;
      }
    });

    // For manual bets, update the input to show the count
    return Object.values(groups).map(group => {
      if (group.pattern.type === 'manual') {
        return {
          ...group,
          pattern: {
            ...group.pattern,
            input: group.bets.length.toString()
          }
        };
      }
      return group;
    });
  };

  // Helper function: Check if pattern should show count
  // Input-based patterns (ထိပ်, ဘြိတ်, နောက်, ပါတ်, ခွေ, ခွေပူး, စုံကပ်, စုံကပ်R, မကပ်, မကပ်R) show count
  // Instant-generation patterns (ပါဝါ, နက္ခ, စုံပူး, etc.) don't show count
  const shouldShowCount = (patternType: string) => {
    const inputBasedPatterns = ['head', 'tail', 'break', 'round', 'khwe', 'khwe-puu', 'sone-kat', 'sone-kat-r', 'ma-kat', 'ma-kat-r', 'manual'];
    return inputBasedPatterns.includes(patternType);
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 shadow-lg flex-shrink-0">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              အရောင်း မှတ်တမ်းများ
            </h1>
            <p className="text-sm text-purple-100">View and manage betting records</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content - Grid Layout */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {records.length === 0 ? (
          /* Empty State */
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-700">No records found.</p>
              <p className="text-lg text-gray-500 mt-2" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                ဇယားဝယ်မရှိပါ
              </p>
            </div>
          </div>
        ) : (
          /* Record Cards Grid - 3 columns on xl screens, 2 on lg, 1 on smaller */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {records.map((record) => {
              const groupedBets = groupBetsByPattern(record.bets);
              
              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                >
                  {/* Top Row - Session, Timestamp & Action Icons */}
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 font-medium">
                        {record.session} ({record.timestamp})
                      </span>
                      <div className="flex items-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handlePrint(record.id)}
                          className="p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          <Printer className="w-4 h-4 text-green-600" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleShare(record.id)}
                          className="p-1.5 rounded-lg hover:bg-orange-50 transition-colors"
                        >
                          <Share2 className="w-4 h-4 text-orange-500" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(record.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Body - Player Name & Global Button */}
                  <div className="px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900">{record.playerName}</h3>
                      
                      {/* Global Expand/Collapse Button - Header Position */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleExpandAll(record.id, groupedBets.length)}
                        className={`px-2.5 py-1.5 text-[10px] font-bold rounded-md border transition-all flex items-center gap-1 ${
                          expandAllStates[record.id]
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-purple-600 border-purple-300 hover:bg-purple-50'
                        }`}
                        style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
                      >
                        {expandAllStates[record.id] ? (
                          <>
                            <ChevronUp className="w-3 h-3" />
                            <span>ပိတ်</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            <span>အားလုံး</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                    
                    {/* Grouped Bets - Collapsible Short Form */}
                    <div className="space-y-2">
                      {groupedBets.map((group, groupIndex) => {
                        const isExpanded = expandedGroups[record.id]?.[groupIndex];
                        
                        return (
                          <div key={groupIndex} className="bg-white border border-gray-300 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            {/* Collapsible Summary Row */}
                            <motion.button
                              whileHover={{ backgroundColor: 'rgb(249 250 251)' }}
                              whileTap={{ scale: 0.995 }}
                              onClick={() => toggleGroup(record.id, groupIndex)}
                              className="w-full px-4 py-3 flex items-center gap-3 bg-white transition-colors"
                            >
                              {/* Chevron Icon - LEFT SIDE */}
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-purple-600 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                              )}
                              
                              {/* Summary Text */}
                              <span className="text-base font-extrabold text-gray-900 flex-1 text-left" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                                {shouldShowCount(group.pattern.type) 
                                  ? `${group.pattern.input} ${group.pattern.label} ${formatNumber(group.totalAmount)}`
                                  : `${group.pattern.label} ${formatNumber(group.totalAmount)}`
                                }
                              </span>
                            </motion.button>

                            {/* Expanded Individual Bet Details */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3, ease: 'easeOut' }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-4 py-4 bg-gradient-to-br from-slate-50 to-blue-50 border-t border-gray-200">
                                    {/* 5-Column Grid Layout - Clean, No Individual Borders */}
                                    <div className="grid grid-cols-5 gap-2.5 mb-3">
                                      {group.bets.map((bet, betIndex) => (
                                        <div key={betIndex} className="flex flex-col items-center justify-center py-2 px-1 bg-white rounded-lg shadow-sm hover:shadow transition-shadow">
                                          <span className="text-sm font-bold text-gray-900" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                            {bet.number}
                                          </span>
                                          <span className="text-[10px] font-medium text-gray-500 mt-0.5">
                                            {formatNumber(bet.amount)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                    
                                    {/* Total Summary */}
                                    <div className="pt-2.5 border-t border-dashed border-gray-300 flex items-center justify-between">
                                      <span className="text-xs font-bold text-gray-700" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                                        စုစုပေါင်း:
                                      </span>
                                      <span className="text-sm font-bold text-purple-600">
                                        {formatNumber(group.totalAmount)} ks
                                      </span>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer - Total */}
                  <div className="px-4 py-3 border-t border-dashed border-gray-300 bg-blue-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-800" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                        စုစုပေါင်း
                      </span>
                      <span className="text-base font-bold text-blue-600">
                        {formatNumber(record.total)} ks
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Bet Details Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedRecord(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                      ပါဝင်သော အကြောင်းများ:
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedRecord.session} ({selectedRecord.timestamp})
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Modal Body - All Bets in 2 Columns */}
              <div className="px-6 py-4 overflow-y-auto max-h-[calc(85vh-180px)]">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{selectedRecord.playerName}</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                  {selectedRecord.bets.map((bet, index) => (
                    <div key={index} className="text-base text-gray-700">
                      <span className="font-semibold text-gray-800">{bet.number}</span>
                      <span className="mx-2 text-gray-400">=</span>
                      <span className="font-medium">{formatNumber(bet.amount)}</span>
                    </div>
                  ))}
                </div>
                
                {/* Total */}
                <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-300 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    စုစုပေါင်း: = {formatNumber(selectedRecord.total)} ks
                  </span>
                </div>
              </div>

              {/* Modal Footer - Action Buttons */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-center gap-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyAllBets}
                  className="flex flex-col items-center gap-1 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Copy className="w-6 h-6 text-gray-600" />
                  <span className="text-xs text-gray-600">Copy</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrintAllBets}
                  className="flex flex-col items-center gap-1 p-3 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <Printer className="w-6 h-6 text-green-600" />
                  <span className="text-xs text-green-600">Print</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedRecord(null)}
                  className="flex flex-col items-center gap-1 p-3 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-red-600" />
                  <span className="text-xs text-red-600">Close</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
