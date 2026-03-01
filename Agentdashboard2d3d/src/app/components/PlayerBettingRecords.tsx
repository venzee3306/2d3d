import { useState } from 'react';
import { Clock, Printer, Share2, ChevronDown, Copy, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

interface GroupedBet {
  pattern: {
    type: string;
    input: string;
    label: string;
  } | null;
  bets: DashboardBet[];
  totalAmount: number;
  displayText: string;
}

interface BettingSession {
  sessionKey: string;
  session: string;
  timestamp: string;
  bets: DashboardBet[];
  total: number;
  groupedBets: GroupedBet[];
}

interface PlayerBettingRecordsProps {
  playerName: string;
  bets: DashboardBet[];
  onClose: () => void;
  onDeleteSession?: (sessionKey: string) => void;
}

export function PlayerBettingRecords({ playerName, bets, onClose, onDeleteSession }: PlayerBettingRecordsProps) {
  const [selectedGroup, setSelectedGroup] = useState<GroupedBet | null>(null);

  // Group bets by session (round + time)
  const groupBetsBySession = (allBets: DashboardBet[]): BettingSession[] => {
    const sessions: Record<string, BettingSession> = {};

    allBets.forEach(bet => {
      const sessionKey = `${bet.round}-${bet.time}`;
      
      if (!sessions[sessionKey]) {
        // Create session date string
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        sessions[sessionKey] = {
          sessionKey: sessionKey,
          session: `${dateStr}-${bet.round.toLowerCase()}`,
          timestamp: bet.time,
          bets: [],
          total: 0,
          groupedBets: []
        };
      }
      
      sessions[sessionKey].bets.push(bet);
      sessions[sessionKey].total += bet.amount;
    });

    // Group bets within each session by pattern
    Object.values(sessions).forEach(session => {
      session.groupedBets = groupBetsByPattern(session.bets);
    });

    // Sort sessions by most recent first
    return Object.values(sessions).sort((a, b) => {
      return b.timestamp.localeCompare(a.timestamp);
    });
  };

  // Group bets by pattern within a session
  const groupBetsByPattern = (sessionBets: DashboardBet[]): GroupedBet[] => {
    const groups: Record<string, GroupedBet> = {};
    
    sessionBets.forEach(bet => {
      let groupKey: string;
      
      if (bet.pattern && bet.patternGroup) {
        // Use patternGroup as key to keep same pattern generation together
        groupKey = bet.patternGroup;
      } else if (bet.pattern) {
        // Fallback to pattern type + input
        groupKey = `${bet.pattern.type}-${bet.pattern.input}`;
      } else {
        // Manual bets - group all together by game type (2D or 3D)
        groupKey = `manual-${bet.gameType}`;
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          pattern: bet.pattern || null,
          bets: [],
          totalAmount: 0,
          displayText: ''
        };
      }
      
      groups[groupKey].bets.push(bet);
      groups[groupKey].totalAmount += bet.amount;
    });

    // Generate display text for each group
    return Object.values(groups).map(group => {
      // Get game type from first bet in group
      const gameType = group.bets[0]?.gameType || '2D';
      
      if (!group.pattern) {
        // Manual bets - show as "ရိုးရိုး" (Normal)
        return {
          ...group,
          displayText: `${gameType} : ရိုးရိုး ${group.totalAmount.toLocaleString()}`
        };
      } else {
        // Pattern bet - show input + label + total or just label + total
        const inputFirstPatterns = ['ထိပ်', 'နောက်', 'ဘြိတ်', 'ပါတ်', 'ပတ်လည်', 'ခွေ', 'ခွေပူး', 'စုံကပ်', 'စုံကပ်R', 'မကပ်', 'မကပ်R'];
        
        if (inputFirstPatterns.includes(group.pattern.label) && group.pattern.input) {
          return {
            ...group,
            displayText: `${gameType} : ${group.pattern.input} ${group.pattern.label} ${group.totalAmount.toLocaleString()}`
          };
        } else {
          return {
            ...group,
            displayText: `${gameType} : ${group.pattern.label} ${group.totalAmount.toLocaleString()}`
          };
        }
      }
    });
  };

  const sessions = groupBetsBySession(bets);

  const handleShare = (session: BettingSession) => {
    let shareText = `${session.session} (${session.timestamp})\n`;
    shareText += `${playerName}\n\n`;
    
    session.groupedBets.forEach(group => {
      shareText += `${group.displayText}\n`;
    });
    
    shareText += `\nစုစုပေါင်း = ${session.total.toLocaleString()} ks`;
    
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

  const handlePrint = (session: BettingSession) => {
    console.log('Print session:', session);
    alert('Printing...');
  };

  const handleDelete = (sessionKey: string) => {
    if (window.confirm('ဒီလောင်းကြေးမှတ်တမ်းကို ဖျက်ပစ်မှာ သေချာပါသလား?')) {
      onDeleteSession?.(sessionKey);
    }
  };

  const handleCopyGroupBets = () => {
    if (!selectedGroup) return;
    const text = selectedGroup.bets.map(bet => `${bet.betNumber} = ${bet.amount}`).join('\n');
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handlePrintGroupBets = () => {
    if (!selectedGroup) return;
    alert('Printing group bets...');
  };

  return (
    <>
      <div className="space-y-4">
        {sessions.length > 0 ? (
          sessions.map((session, sessionIndex) => (
            <motion.div
              key={sessionIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sessionIndex * 0.05 }}
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
            >
              {/* Session Header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    {session.session}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    ({session.timestamp})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrint(session)}
                    className="p-1.5 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <Printer className="w-4 h-4 text-green-600" />
                  </button>
                  <button
                    onClick={() => handleShare(session)}
                    className="p-1.5 hover:bg-orange-100 rounded-lg transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-orange-500" />
                  </button>
                  {onDeleteSession && (
                    <button
                      onClick={() => handleDelete(session.sessionKey)}
                      className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
              </div>

              {/* Player Name */}
              <div className="px-4 py-3 bg-white border-b border-gray-100">
                <p className="text-base font-bold text-gray-900">{playerName}</p>
              </div>

              {/* Grouped Bets with Dropdowns */}
              <div className="px-4 py-3 bg-white space-y-2">
                {session.groupedBets.map((group, groupIndex) => {
                  const showDropdown = group.bets.length > 1;

                  return (
                    <div key={groupIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Summary Row */}
                      <button
                        onClick={() => showDropdown && setSelectedGroup(group)}
                        disabled={!showDropdown}
                        className={`w-full px-3 py-2.5 flex items-center justify-between bg-white transition-colors ${
                          showDropdown ? 'hover:bg-gray-50 active:bg-gray-100 cursor-pointer' : 'cursor-default'
                        }`}
                        style={{ touchAction: 'manipulation' }}
                      >
                        <span 
                          className="text-sm font-bold text-gray-900 flex-1 text-left" 
                          style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
                        >
                          {group.displayText}
                        </span>
                        {showDropdown && (
                          <div className="ml-2 flex-shrink-0">
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-purple-100 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span 
                    className="text-sm font-bold text-gray-900" 
                    style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
                  >
                    စုစုပေါင်း =
                  </span>
                  <span className="text-base font-bold text-purple-600">
                    {session.total.toLocaleString()} ks
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-white rounded-xl p-8 shadow-md text-center">
            <Clock className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Betting Records</h3>
            <p className="text-sm text-gray-600">
              Betting history for {playerName} will appear here
            </p>
          </div>
        )}
      </div>

      {/* Modal for Bet Details */}
      <AnimatePresence>
        {selectedGroup && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 
                  className="text-lg font-bold text-gray-900 text-center" 
                  style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
                >
                  ပါဝင်သော အကြောင်းများ:
                </h3>
              </div>

              {/* Modal Body - 2 Column Grid */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {selectedGroup.bets.map((bet, index) => (
                    <div key={index} className="text-base text-gray-800">
                      <span className="font-medium">{bet.betNumber}</span>
                      <span className="mx-1.5">=</span>
                      <span className="font-semibold">{bet.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                {/* Total */}
                <div className="flex items-center justify-center mb-4">
                  <span 
                    className="text-base font-bold text-gray-900" 
                    style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
                  >
                    စုစုပေါင်း = 
                  </span>
                  <span className="text-lg font-bold text-purple-600 ml-2">
                    {selectedGroup.totalAmount.toLocaleString()} ks
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-8">
                  <button
                    onClick={handleCopyGroupBets}
                    className="flex flex-col items-center gap-1.5 p-3 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Copy className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-xs text-gray-600 font-medium">Copy</span>
                  </button>

                  <button
                    onClick={handlePrintGroupBets}
                    className="flex flex-col items-center gap-1.5 p-3 hover:bg-green-50 rounded-xl transition-colors"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Printer className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-xs text-gray-600 font-medium">Print</span>
                  </button>

                  <button
                    onClick={() => setSelectedGroup(null)}
                    className="flex flex-col items-center gap-1.5 p-3 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <X className="w-5 h-5 text-red-600" />
                    </div>
                    <span className="text-xs text-gray-600 font-medium">Close</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
