import { ArrowLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AgentStatementData {
  betType: '2D' | '3D';          // Type of lottery
  totalRevenue: number;          // ရောင်းရငွေ - Total revenue from all bets for this agent
  commission: number;            // ကော်မရှင်ကြေး - Commission for agent
  winningNumber: string | null;  // ထွက်ဂဏန်း - The winning number (null if not confirmed)
  winningBetAmount: number;      // ပေါက်ကွက် - Total bet amount on winning number
  individualBets: number[];      // Individual player bet amounts on winning number
}

interface AgentStatementModalProps {
  agentName: string;
  agentId: string;
  onClose: () => void;
  isMobile?: boolean;
  hasPlayers?: boolean; // Check if agent has any players (betting activity indicator)
}

export function AgentStatementModal({ agentName, agentId, onClose, isMobile = false, hasPlayers = false }: AgentStatementModalProps) {
  // Check if agent has any betting activity
  // Newly created agents with no players have no statement data
  const hasBettingActivity = hasPlayers;
  
  // Generate unique statement data based on agentId
  // This creates a deterministic but unique result for each agent
  const generateUniqueStatementData = (agentId: string): AgentStatementData => {
    // If no betting activity, return all zeros
    if (!hasBettingActivity) {
      return {
        betType: '2D',
        totalRevenue: 0,
        commission: 0,
        winningNumber: null,
        winningBetAmount: 0,
        individualBets: []
      };
    }
    
    // Use agentId to seed random-like values
    const seed = agentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Pseudo-random number generator based on seed
    const seededRandom = (min: number, max: number, offset: number = 0) => {
      const x = Math.sin(seed + offset) * 10000;
      return Math.floor(min + (x - Math.floor(x)) * (max - min));
    };
    
    // Determine bet type based on agent ID
    const betType: '2D' | '3D' = seededRandom(0, 2, 1) === 0 ? '2D' : '3D';
    
    // Winning number is NOT confirmed yet - always show "??"
    // In real app, this would be updated when admin confirms the lottery result
    const winningNumber: string | null = null;
    
    // Generate total revenue (varies by agent)
    const totalRevenue = seededRandom(1500, 8000, 4) * 100;
    
    // Commission (8-15%)
    const commissionRate = seededRandom(8, 16, 5) / 100;
    const commission = Math.floor(totalRevenue * commissionRate);
    
    // Since winning number is not confirmed, no winning bets yet
    const winningBetAmount = 0;
    const individualBets: number[] = [];
    
    return {
      betType,
      totalRevenue,
      commission,
      winningNumber,
      winningBetAmount,
      individualBets
    };
  };
  
  const statementData = generateUniqueStatementData(agentId);

  // Calculate payout based on bet type (80x for 2D, 500x for 3D)
  const payoutMultiplier = statementData.betType === '2D' ? 80 : 500;
  const payoutAmount = statementData.winningBetAmount * payoutMultiplier;

  // Calculate final result (profit or loss)
  const finalResult = statementData.totalRevenue - statementData.commission - payoutAmount;
  const isProfit = finalResult >= 0;

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) {
      return '0 Ks';
    }
    return `${amount.toLocaleString()} Ks`;
  };

  if (isMobile) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#F5F7FA] rounded-2xl shadow-2xl w-full max-w-[380px] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <h1 className="text-base font-semibold text-white flex-1" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                  {agentName} ၏ ရှင်းတမ်း
                </h1>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                {/* Winning Number Display */}
                <div className="px-5 py-5 border-b-2 border-gray-200">
                  <p className="text-center text-xs text-gray-600 mb-2" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    ထွက်ဂဏန်း
                  </p>
                  <div className="bg-white border-2 border-gray-300 rounded-xl px-6 py-6 text-center">
                    {statementData.winningNumber ? (
                      <p className="text-5xl font-bold text-green-600">{statementData.winningNumber}</p>
                    ) : (
                      <p className="text-5xl font-bold text-green-600">??</p>
                    )}
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="px-5 py-4 space-y-3">
                  {/* Total Revenue */}
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-gray-700" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                      ရောင်းရငွေ
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(statementData.totalRevenue)}
                    </span>
                  </div>

                  {/* Commission */}
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-gray-700" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                      ကော်မရှင်ကြေး
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(statementData.commission)}
                    </span>
                  </div>

                  {/* Winning Bet Amount */}
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-gray-700" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                      ပေါက်ကွက်
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(statementData.winningBetAmount)}
                    </span>
                  </div>

                  {/* Payout Amount with multiplier */}
                  <div className="py-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                        ယော်ငွေ
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(payoutAmount)}
                      </span>
                    </div>
                    {statementData.winningNumber && statementData.winningBetAmount > 0 && (
                      <p className="text-xs text-gray-500 text-right">
                        ({formatCurrency(statementData.winningBetAmount)} × {payoutMultiplier})
                      </p>
                    )}
                  </div>

                  {/* Final Result - Profit or Loss */}
                  <div className={`flex items-center justify-between py-3 rounded-xl px-4 ${
                    isProfit 
                      ? 'bg-green-100' 
                      : 'bg-red-100'
                  }`}>
                    <span className={`text-sm font-bold ${
                      isProfit ? 'text-green-700' : 'text-red-700'
                    }`} style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                      {isProfit ? 'အမြတ်' : 'အရှုံး'}
                    </span>
                    <span className={`text-base font-bold ${
                      isProfit ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {formatCurrency(Math.abs(finalResult))}
                    </span>
                  </div>
                </div>

                {/* Individual Bet Amounts - Only show when winning number is confirmed */}
                {statementData.winningNumber && statementData.individualBets.length > 0 && (
                  <div className="px-5 pb-5">
                    <div className="flex flex-wrap gap-2">
                      {statementData.individualBets.map((bet, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-xs font-medium"
                        >
                          {formatCurrency(bet)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Info Note */}
                {!statementData.winningNumber && (
                  <div className="px-5 pb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                      <p className="text-xs text-blue-700 text-center" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                        ပေါက်သည့်ဂဏန်းမရှိပါက အမြတ်ငွေများကို Admin ၏ပိုက်ဆံအိတ်သို့ ထည့်ပါမည်
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Desktop version
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              {agentName} ၏ ရှင်းတမ်း
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="bg-gray-50 rounded-2xl p-6">
              {/* Winning Number Display */}
              <div className="mb-6">
                <p className="text-center text-sm text-gray-600 mb-3" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                  ထွက်ဂဏန်း
                </p>
                <div className="bg-white border-2 border-gray-300 rounded-xl px-8 py-10 text-center">
                  {statementData.winningNumber ? (
                    <p className="text-6xl font-bold text-green-600">{statementData.winningNumber}</p>
                  ) : (
                    <p className="text-6xl font-bold text-green-600">??</p>
                  )}
                </div>
              </div>

              {/* Transaction Details */}
              <div className="space-y-3">
                {/* Total Revenue */}
                <div className="flex items-center justify-between py-3 px-4 bg-white rounded-xl">
                  <span className="text-base text-gray-700" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    ရောင်းရငွေ
                  </span>
                  <span className="text-base font-bold text-gray-900">
                    {formatCurrency(statementData.totalRevenue)}
                  </span>
                </div>

                {/* Commission */}
                <div className="flex items-center justify-between py-3 px-4 bg-white rounded-xl">
                  <span className="text-base text-gray-700" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    ကော်မရှင်ကြေး
                  </span>
                  <span className="text-base font-bold text-gray-900">
                    {formatCurrency(statementData.commission)}
                  </span>
                </div>

                {/* Winning Bet Amount */}
                <div className="flex items-center justify-between py-3 px-4 bg-white rounded-xl">
                  <span className="text-base text-gray-700" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    ပေါက်ကွက်
                  </span>
                  <span className="text-base font-bold text-gray-900">
                    {formatCurrency(statementData.winningBetAmount)}
                  </span>
                </div>

                {/* Payout Amount with multiplier */}
                <div className="py-3 px-4 bg-white rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base text-gray-700" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                      ယော်ငွေ
                    </span>
                    <span className="text-base font-bold text-gray-900">
                      {formatCurrency(payoutAmount)}
                    </span>
                  </div>
                  {statementData.winningNumber && statementData.winningBetAmount > 0 && (
                    <p className="text-sm text-gray-500 text-right">
                      ({formatCurrency(statementData.winningBetAmount)} × {payoutMultiplier})
                    </p>
                  )}
                </div>

                {/* Final Result - Profit or Loss */}
                <div className={`flex items-center justify-between py-4 px-5 rounded-xl border-2 ${
                  isProfit 
                    ? 'bg-green-100 border-green-200' 
                    : 'bg-red-100 border-red-200'
                }`}>
                  <span className={`text-base font-bold ${
                    isProfit ? 'text-green-700' : 'text-red-700'
                  }`} style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    {isProfit ? 'အမြတ်' : 'အရှုံး'}
                  </span>
                  <span className={`text-lg font-bold ${
                    isProfit ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {formatCurrency(Math.abs(finalResult))}
                  </span>
                </div>
              </div>

              {/* Individual Bet Amounts - Only show when winning number is confirmed */}
              {statementData.winningNumber && statementData.individualBets.length > 0 && (
                <div className="mt-5">
                  <div className="flex flex-wrap gap-2">
                    {statementData.individualBets.map((bet, idx) => (
                      <span
                        key={idx}
                        className="px-5 py-2.5 bg-gray-200 text-gray-600 rounded-full text-sm font-medium"
                      >
                        {formatCurrency(bet)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Info Note */}
              {!statementData.winningNumber && (
                <div className="mt-5">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                    <p className="text-sm text-blue-700 text-center" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                      ပေါက်သည့်ဂဏန်းမရှိပါက အမြတ်ငွေများကို Admin ၏ပိုက်ဆံအိတ်သို့ ထည့်ပါမည်
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all"
              style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
            >
              ပိတ်မည်
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
