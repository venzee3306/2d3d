import { useState, useEffect } from 'react';
import { X, Sun, Moon, User, Clock, ChevronLeft, ChevronDown, Wallet, Phone, Trophy, FileText, List } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SplitBetEntry } from './SplitBetEntry';
import { MobileLedger } from './MobileLedger';
import { MobileSettlement } from './MobileSettlement';
import { PlayerBettingRecords } from './PlayerBettingRecords';

interface Player {
  id: string;
  name: string;
  password: string;
  phoneNumber: string;
  totalBets: number;
  totalAmount: number;
  winAmount: number;
  lossAmount: number;
  currentBalance: number;
  status: 'active' | 'inactive';
  createdAt: string;
  lastBetDate?: string;
}

interface CartItem {
  id: string;
  player: string;
  playerName: string;
  gameMode: '2D' | '3D';
  number: string;
  amount: number;
}

interface DashboardBet {
  id: string;
  playerName: string;
  gameType: '2D' | '3D';
  betNumber: string;
  amount: number;
  round: string;
  time: string;
  status: 'Won' | 'Lost' | 'Pending';
}

interface PlayerBetEntryModalProps {
  player: Player | null;
  onClose: () => void;
  onSubmitBets: (items: CartItem[]) => void;
  dashboardBets?: DashboardBet[];
  onDeleteBettingSession?: (playerName: string, sessionKey: string) => void;
  blockedNumbers?: { [agentId: string]: { '2D': string[], '3D': string[] } };
  currentAgentId?: string;
}

export function PlayerBetEntryModal({ player, onClose, onSubmitBets, dashboardBets = [], onDeleteBettingSession, blockedNumbers = {}, currentAgentId }: PlayerBetEntryModalProps) {
  const [selectedSession, setSelectedSession] = useState<'AM' | 'PM' | null>(null);
  const [showLedger, setShowLedger] = useState(false);
  const [showBettingRecords, setShowBettingRecords] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);

  useEffect(() => {
    const handleOpenLedger = () => setShowLedger(true);
    const handleOpenBettingRecords = () => setShowBettingRecords(true);
    const handleOpenSettlement = () => setShowSettlement(true);

    window.addEventListener('openLedger', handleOpenLedger);
    window.addEventListener('openBettingRecords', handleOpenBettingRecords);
    window.addEventListener('openSettlement', handleOpenSettlement);

    return () => {
      window.removeEventListener('openLedger', handleOpenLedger);
      window.removeEventListener('openBettingRecords', handleOpenBettingRecords);
      window.removeEventListener('openSettlement', handleOpenSettlement);
    };
  }, []);

  if (!player) return null;

  // Filter bets for this specific player
  const playerBets = dashboardBets.filter(bet => bet.playerName === player.name);
  
  // Convert dashboard bets to ledger format (only number and amount, no details)
  const ledgerBets = playerBets.map(bet => ({
    number: bet.betNumber,
    amount: bet.amount
  }));

  const handleSessionSelect = (session: 'AM' | 'PM') => {
    setSelectedSession(session);
  };

  const handleBack = () => {
    setSelectedSession(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] overflow-hidden"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white sm:rounded-3xl shadow-2xl w-full sm:w-[95vw] sm:max-w-6xl h-full sm:h-[92vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-shrink-0 shadow-lg">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {selectedSession && (
                <button
                  onClick={handleBack}
                  className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 sm:hidden"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
              )}
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm sm:text-xl font-bold text-white truncate">
                  {selectedSession ? (
                    <>
                      <span className="hidden sm:inline">{selectedSession} Session - </span>
                      {player.name}
                    </>
                  ) : (
                    `Place Bet for ${player.name}`
                  )}
                </h2>
                <p className="text-blue-100 text-xs sm:text-sm truncate">
                  {selectedSession ? (
                    <>
                      <span className="sm:hidden">{selectedSession} Session</span>
                      <span className="hidden sm:inline">Enter betting numbers</span>
                    </>
                  ) : (
                    'Choose betting session'
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto bg-gray-50 hide-scrollbar">
            {!selectedSession ? (
              /* Session Selection */
              <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
                <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
                  {/* Title Section */}
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                      ဘယ် Session မှာ ထိုးမလဲ?
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">Select betting session</p>
                  </div>

                  {/* Session Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-8">
                    {/* AM Session */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSessionSelect('AM')}
                      className="group relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl hover:shadow-2xl transition-all"
                    >
                      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 group-active:bg-white/20 transition-colors" />
                      
                      {/* Decorative circles */}
                      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                      
                      <div className="relative">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                          <Sun className="w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                        <h4 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">AM Session</h4>
                        <p className="text-amber-100 text-sm sm:text-base mb-3 sm:mb-4 font-medium">မနက်ပိုင်း Draw</p>
                        <div className="bg-white/25 backdrop-blur-md rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 inline-block shadow-lg">
                          <p className="text-xs sm:text-sm font-bold">Draw: 12:01 PM</p>
                        </div>
                      </div>
                    </motion.button>

                    {/* PM Session */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSessionSelect('PM')}
                      className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl hover:shadow-2xl transition-all"
                    >
                      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 group-active:bg-white/20 transition-colors" />
                      
                      {/* Decorative circles */}
                      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                      
                      <div className="relative">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                          <Moon className="w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                        <h4 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">PM Session</h4>
                        <p className="text-indigo-100 text-sm sm:text-base mb-3 sm:mb-4 font-medium">ညနေပိုင်း Draw</p>
                        <div className="bg-white/25 backdrop-blur-md rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 inline-block shadow-lg">
                          <p className="text-xs sm:text-sm font-bold">Draw: 4:30 PM</p>
                        </div>
                      </div>
                    </motion.button>
                  </div>

                  {/* Player Info Cards */}
                  <div className="mt-auto">
                    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-500 font-medium">Player Information</p>
                          <p className="text-base sm:text-lg font-bold text-gray-900 truncate">{player.name}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-green-100">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                            <p className="text-xs text-green-700 font-medium">Balance</p>
                          </div>
                          <p className="text-sm sm:text-base lg:text-lg font-bold text-green-700 truncate">
                            {player.currentBalance.toLocaleString()}
                            <span className="text-xs sm:text-sm ml-0.5"> ks</span>
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-blue-100">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                            <p className="text-xs text-blue-700 font-medium">Phone</p>
                          </div>
                          <p className="text-xs sm:text-sm lg:text-base font-bold text-blue-700 truncate">{player.phoneNumber}</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-purple-100">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                            <p className="text-xs text-purple-700 font-medium">Bets</p>
                          </div>
                          <p className="text-sm sm:text-base lg:text-lg font-bold text-purple-700">{player.totalBets}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Bet Entry Interface */
              <div className="h-full flex flex-col">
                {/* Session Info Bar */}
                <div className="bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 flex-shrink-0 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold text-white text-xs sm:text-sm shadow-lg ${
                        selectedSession === 'AM' 
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                          : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                      }`}>
                        {selectedSession === 'AM' ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                        <span className="hidden sm:inline">{selectedSession} Session</span>
                        <span className="sm:hidden">{selectedSession}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm min-w-0">
                        <span className="text-gray-500 font-medium flex-shrink-0">Player:</span>
                        <span className="font-bold text-gray-900 truncate">{player.name}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleBack}
                      className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors flex-shrink-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden lg:inline">Change</span>
                    </button>
                  </div>
                </div>
                
                {/* Bet Entry Content */}
                <div className="flex-1 overflow-auto hide-scrollbar">
                  <SplitBetEntry 
                    selectedPlayer={player.id}
                    selectedPlayerName={player.name}
                    selectedSession={selectedSession}
                    onSubmitBets={(items) => {
                      onSubmitBets(items);
                      onClose();
                    }}
                    blockedNumbers={currentAgentId ? blockedNumbers[currentAgentId] : undefined}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Ledger Modal */}
        {showLedger && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center"
            onClick={() => setShowLedger(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-[95vw] max-w-4xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <MobileLedger 
                onBack={() => setShowLedger(false)} 
                agentName={player.name}
                gameMode="2D"
                bets={ledgerBets}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Betting Records Modal */}
        {showBettingRecords && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center"
            onClick={() => setShowBettingRecords(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-[95vw] max-w-4xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Betting Records Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between shadow-lg flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                      မှတ်တမ်း
                    </h2>
                    <p className="text-sm text-purple-100">Betting Records for {player.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBettingRecords(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Betting Records Content */}
              <div className="flex-1 overflow-auto hide-scrollbar p-6 bg-gray-50">
                <PlayerBettingRecords
                  playerName={player.name}
                  bets={playerBets}
                  onClose={() => setShowBettingRecords(false)}
                  onDeleteSession={(sessionKey) => {
                    onDeleteBettingSession?.(player.name, sessionKey);
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Settlement Modal */}
        {showSettlement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center"
            onClick={() => setShowSettlement(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-[95vw] max-w-4xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <MobileSettlement 
                onBack={() => setShowSettlement(false)}
                agentName={player.name}
                winningNumber="45"
                salesTotal={player.totalAmount || 0}
                commission={(player.totalAmount || 0) * 0.15}
                grandTotal={(player.totalAmount || 0) * 1.15}
                totalPaid={player.totalAmount || 0}
                winningBet={player.winAmount || 0}
                payout={player.winAmount || 0}
                netProfit={(player.totalAmount - player.winAmount) || 0}
              />
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
