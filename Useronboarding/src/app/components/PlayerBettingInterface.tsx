import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, X, FileText, Clock, Wallet, Settings, 
  ChevronRight, ChevronLeft, Trash2, Check, Plus 
} from 'lucide-react';
import { generateQuickPattern, type QuickPatternType } from '../utils/quickPatterns';
import { ALL_QUICK_PATTERNS, type QuickPatternDefinition } from '../data/patternDefinitions';
import type { CartItem } from '../data/newMockData';

interface PlayerBettingInterfaceProps {
  onClose: () => void;
  onNavigate: (screen: string) => void;
  language: 'en' | 'mm';
  playerName: string;
  playerNameMM?: string;
  session: 'Morning' | 'Evening';
  onAddToCart: (items: CartItem[]) => void;
  balance: number;
  t: (key: string) => string;
}

export const PlayerBettingInterface: React.FC<PlayerBettingInterfaceProps> = ({
  onClose,
  onNavigate,
  language,
  playerName,
  playerNameMM,
  session,
  onAddToCart,
  balance,
  t
}) => {
  const [gameMode, setGameMode] = useState<'2D' | '3D'>('2D');
  const [betAmount, setBetAmount] = useState<string>('');
  const [currentNumber, setCurrentNumber] = useState<string>('');
  const [enteredBets, setEnteredBets] = useState<Array<{ number: string; amount: number; gameMode: '2D' | '3D' }>>([]);
  const [inputMode, setInputMode] = useState<'amount' | 'number'>('amount');
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<QuickPatternDefinition | null>(null);
  const [patternPage, setPatternPage] = useState(0);

  const displayName = language === 'mm' && playerNameMM ? playerNameMM : playerName;
  const sessionMM = session === 'Morning' ? 'နံနက်' : 'ညနေ';
  const sessionBadge = session === 'Morning' ? 'AM' : 'PM';

  const quickActions = [
    { icon: FileText, label: language === 'mm' ? 'မှတ်တမ်း' : 'History', labelEn: 'History', color: 'bg-blue-500', action: () => onNavigate('history') },
    { icon: Clock, label: language === 'mm' ? 'ရလဒ်များ' : 'Results', labelEn: 'Results', color: 'bg-purple-500', action: () => onNavigate('results') },
    { icon: Wallet, label: language === 'mm' ? 'ငွေလက်ကျန်' : 'Balance', labelEn: 'Balance', color: 'bg-emerald-500', action: () => onNavigate('transactions') },
    { icon: Settings, label: language === 'mm' ? 'ဆက်တင်' : 'Settings', labelEn: 'Settings', color: 'bg-gray-500', action: () => onNavigate('profile') }
  ];

  const quickAmounts = [1000, 2000, 5000, 10000];

  const handleKeypadPress = (value: string) => {
    if (inputMode === 'amount') {
      if (value === 'CLR') {
        setBetAmount('');
      } else if (value === 'Del') {
        setBetAmount(prev => prev.slice(0, -1));
      } else if (value === '✓') {
        if (betAmount) {
          setInputMode('number');
        }
      } else if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '000'].includes(value)) {
        setBetAmount(prev => prev + value);
      }
    } else {
      // Number input mode
      if (value === 'CLR') {
        setCurrentNumber('');
      } else if (value === 'Del') {
        setCurrentNumber(prev => prev.slice(0, -1));
      } else if (value === 'ADD') {
        if (currentNumber && betAmount) {
          const maxLength = gameMode === '2D' ? 2 : 3;
          if (currentNumber.length === maxLength) {
            addBet(currentNumber, parseInt(betAmount));
            setCurrentNumber('');
            // Keep amount for next entry
          }
        }
      } else if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(value)) {
        const maxLength = gameMode === '2D' ? 2 : 3;
        if (currentNumber.length < maxLength) {
          setCurrentNumber(prev => prev + value);
        }
      }
    }
  };

  const addBet = (number: string, amount: number) => {
    setEnteredBets(prev => [...prev, { number, amount, gameMode }]);
  };

  const removeBet = (index: number) => {
    setEnteredBets(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllBets = () => {
    if (confirm(language === 'mm' ? 'ထိုးငွေအားလုံးကို ဖျက်မှာသေချာပါသလား?' : 'Clear all bets?')) {
      setEnteredBets([]);
      setBetAmount('');
      setCurrentNumber('');
      setInputMode('amount');
    }
  };

  const handleQuickAmount = (amount: number) => {
    setBetAmount(amount.toString());
  };

  const handlePatternClick = (patternId: QuickPatternType) => {
    if (!betAmount) {
      alert(language === 'mm' ? 'ထိုးငွေအရင်ထည့်ပါ' : 'Please enter bet amount first');
      return;
    }

    const pattern = ALL_QUICK_PATTERNS.find(p => p.id === patternId);
    if (!pattern) return;

    // Check game mode compatibility
    if (pattern.gameMode === '2D' && gameMode === '3D') {
      alert(language === 'mm' ? 'ဤပုံစံသည် 2D အတွက်သာ' : 'This pattern is for 2D only');
      return;
    }
    if (pattern.gameMode === '3D' && gameMode === '2D') {
      alert(language === 'mm' ? 'ဤပုံစံသည် 3D အတွက်သာ' : 'This pattern is for 3D only');
      return;
    }

    const amount = parseInt(betAmount);
    let numbers: string[] = [];

    try {
      // If pattern requires input
      if (pattern.requiresInput) {
        const prompt1 = language === 'mm' ? pattern.promptMM : pattern.promptEN;
        const input1 = prompt(prompt1);
        if (!input1) return;

        // If pattern requires two inputs
        if (pattern.requiresTwoInputs) {
          const prompt2 = language === 'mm' ? (pattern.prompt2MM || '') : (pattern.prompt2EN || '');
          const input2 = prompt(prompt2);
          if (!input2) return;
          
          numbers = generateQuickPattern(patternId, input1, input2, gameMode === '3D');
        } else {
          numbers = generateQuickPattern(patternId, input1, '', gameMode === '3D');
        }
      } else {
        // No input required, generate directly
        numbers = generateQuickPattern(patternId, '', '', gameMode === '3D');
      }

      if (numbers.length === 0) {
        alert(language === 'mm' ? 'မှားယွင်းနေပါသည်' : 'Invalid pattern input');
        return;
      }

      // Add all generated numbers
      numbers.forEach(num => {
        addBet(num, amount);
      });
      
      alert(`${numbers.length} ${language === 'mm' ? 'ဂဏန်းများ ထည့်ပြီးပါပြီ' : 'numbers added'}`);
      setBetAmount('');
      setInputMode('amount');
    } catch (error) {
      alert(language === 'mm' ? 'မှားယွင်းနေပါသည်' : 'Error generating pattern');
    }
  };

  const handleSubmit = () => {
    if (enteredBets.length === 0) return;

    const total = totalAmount;
    if (total > balance) {
      alert(language === 'mm' ? 'ငွေလက်ကျန် မလုံလောက်ပါ' : 'Insufficient balance');
      return;
    }

    const cartItems: CartItem[] = enteredBets.map((bet, index) => ({
      id: `bet-${Date.now()}-${index}`,
      gameMode: bet.gameMode,
      number: bet.number,
      amount: bet.amount
    }));

    onAddToCart(cartItems);
    setEnteredBets([]);
    setBetAmount('');
    setCurrentNumber('');
    setInputMode('amount');
    onClose();
  };

  const totalAmount = enteredBets.reduce((sum, bet) => sum + bet.amount, 0);
  const totalBets = enteredBets.length;

  // Pattern pagination - use ALL_QUICK_PATTERNS
  const patternsPerPage = 6; // 3 columns x 2 rows
  const totalPages = Math.ceil(ALL_QUICK_PATTERNS.length / patternsPerPage);
  const currentPatterns = ALL_QUICK_PATTERNS.slice(
    patternPage * patternsPerPage,
    (patternPage + 1) * patternsPerPage
  );

  const handleNextPatternPage = () => {
    if (patternPage < totalPages - 1) {
      setPatternPage(patternPage + 1);
    }
  };

  const handlePrevPatternPage = () => {
    if (patternPage > 0) {
      setPatternPage(patternPage - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto scrollbar-hide">
      <div className="max-w-[430px] lg:max-w-2xl mx-auto min-h-screen bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 lg:px-6 pt-12 pb-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onClose} className="text-white p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft size={24} />
            </button>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-1">
                <span className="text-white font-bold text-lg">{displayName.charAt(0)}</span>
              </div>
              <p className="text-white font-bold" style={{ fontFamily: language === 'mm' ? 'Padauk, Noto Sans Myanmar' : 'inherit' }}>
                {displayName}
              </p>
              <p className="text-white/80 text-xs" style={{ fontFamily: language === 'mm' ? 'Padauk, Noto Sans Myanmar' : 'inherit' }}>
                {language === 'mm' ? sessionMM : session} Session
              </p>
            </div>
            <button onClick={onClose} className="text-white p-2 -mr-2 hover:bg-white/10 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Session Badge */}
        <div className="px-5 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="bg-orange-500 text-white px-3 py-1.5 rounded-lg font-bold text-sm shadow-md">
                {sessionBadge}
              </span>
              <span className="text-gray-600 text-sm font-medium">
                Player: <span className="text-gray-900 font-bold">{displayName}</span>
              </span>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-xs">Balance</p>
              <p className="text-emerald-600 font-bold text-sm">{balance.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Bet Entry Title */}
        <div className="bg-blue-600 px-5 py-4 shadow-md">
          <h2 className="text-white font-bold text-xl mb-1">Bet Entry</h2>
          <p className="text-white/80 text-sm">Create and manage your lottery bets</p>
        </div>

        <div className="px-5 py-6 space-y-6 pb-40">
          {/* Quick Action Grid */}
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all active:scale-95 border border-gray-100"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mx-auto mb-3 shadow-md`}>
                    <Icon className="text-white" size={20} />
                  </div>
                  <p className="text-gray-900 font-semibold text-sm text-center" style={{ fontFamily: language === 'mm' ? 'Padauk, Noto Sans Myanmar' : 'inherit' }}>
                    {action.label}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Game Mode Toggle */}
          <div>
            <label className="text-gray-600 font-bold text-sm mb-2 block">Game Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (currentNumber) {
                    if (confirm(language === 'mm' ? 'ထည့်ထားသောဂဏန်းများ ပျက်သွားမည်' : 'Current entry will be cleared')) {
                      setGameMode('2D');
                      setCurrentNumber('');
                    }
                  } else {
                    setGameMode('2D');
                  }
                }}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  gameMode === '2D'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                2D Mode
              </button>
              <button
                onClick={() => {
                  if (currentNumber) {
                    if (confirm(language === 'mm' ? 'ထည့်ထားသောဂဏန်းများ ပျက်သွားမည်' : 'Current entry will be cleared')) {
                      setGameMode('3D');
                      setCurrentNumber('');
                    }
                  } else {
                    setGameMode('3D');
                  }
                }}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  gameMode === '3D'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                3D Mode
              </button>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <label className="text-gray-600 font-bold text-sm mb-2 block">Quick Amount</label>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map(amount => (
                <button
                  key={amount}
                  onClick={() => handleQuickAmount(amount)}
                  className={`py-2.5 rounded-lg font-bold text-sm transition-all ${
                    betAmount === amount.toString()
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Live Entry Preview */}
          <div className="border-2 border-blue-300 rounded-2xl p-4 bg-blue-50/30">
            {/* Bet Amount Input */}
            <div className="mb-4">
              <label className="text-gray-600 font-semibold text-sm mb-2 block">Bet Amount (MMK)</label>
              <div className={`bg-white rounded-lg border-2 p-4 transition-colors ${
                inputMode === 'amount' ? 'border-blue-500' : 'border-gray-200'
              }`}>
                <p className="text-gray-900 font-bold text-2xl">
                  {betAmount || <span className="text-gray-400">Click to enter amount...</span>}
                </p>
              </div>
            </div>

            {/* Numbers Display */}
            <div>
              <label className="text-gray-600 font-semibold text-sm mb-2 block">
                Numbers ({gameMode}):
              </label>
              <div className={`bg-white rounded-lg border-2 p-4 min-h-[60px] transition-colors ${
                inputMode === 'number' ? 'border-blue-500' : 'border-gray-200'
              }`}>
                {currentNumber ? (
                  <p className="text-gray-900 font-bold text-3xl">{currentNumber}</p>
                ) : (
                  <p className="text-gray-400 text-xl">
                    {gameMode === '2D' ? '- -' : '- - -'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Entered Bets */}
          {enteredBets.length > 0 && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border-2 border-emerald-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-emerald-900 font-bold">Current Bets ({enteredBets.length})</h3>
                <p className="text-emerald-700 font-bold">{totalAmount.toLocaleString()} MMK</p>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
                {enteredBets.map((bet, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="bg-emerald-100 text-emerald-900 font-bold px-3 py-1.5 rounded-lg">
                        {bet.number}
                      </span>
                      <span className="text-gray-600 text-sm">{bet.gameMode}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-bold">{bet.amount.toLocaleString()}</span>
                      <button onClick={() => removeBet(index)} className="text-red-500 p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keypad */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-gray-600 font-semibold text-sm mb-3">
              {inputMode === 'amount' ? 'Enter Bet Amount' : `Enter ${gameMode} Number`}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {/* Row 1 */}
              <button onClick={() => handleKeypadPress('1')} className="bg-white text-gray-900 font-bold text-xl py-4 rounded-xl shadow-md active:scale-95 transition-transform">1</button>
              <button onClick={() => handleKeypadPress('2')} className="bg-white text-gray-900 font-bold text-xl py-4 rounded-xl shadow-md active:scale-95 transition-transform">2</button>
              <button onClick={() => handleKeypadPress('3')} className="bg-white text-gray-900 font-bold text-xl py-4 rounded-xl shadow-md active:scale-95 transition-transform">3</button>
              <button onClick={() => handleKeypadPress('ADD')} className="bg-gray-300 text-gray-700 font-bold text-sm py-4 rounded-xl shadow-md active:scale-95 transition-transform">ADD</button>

              {/* Row 2 */}
              <button onClick={() => handleKeypadPress('4')} className="bg-white text-gray-900 font-bold text-xl py-4 rounded-xl shadow-md active:scale-95 transition-transform">4</button>
              <button onClick={() => handleKeypadPress('5')} className="bg-white text-gray-900 font-bold text-xl py-4 rounded-xl shadow-md active:scale-95 transition-transform">5</button>
              <button onClick={() => handleKeypadPress('6')} className="bg-white text-gray-900 font-bold text-xl py-4 rounded-xl shadow-md active:scale-95 transition-transform">6</button>
              <button onClick={() => handleKeypadPress('Del')} className="bg-red-500 text-white font-bold text-sm py-4 rounded-xl shadow-md active:scale-95 transition-transform">Del</button>

              {/* Row 3 */}
              <button onClick={() => handleKeypadPress('7')} className="bg-white text-gray-900 font-bold text-xl py-4 rounded-xl shadow-md active:scale-95 transition-transform">7</button>
              <button onClick={() => handleKeypadPress('8')} className="bg-white text-gray-900 font-bold text-xl py-4 rounded-xl shadow-md active:scale-95 transition-transform">8</button>
              <button onClick={() => handleKeypadPress('9')} className="bg-white text-gray-900 font-bold text-xl py-4 rounded-xl shadow-md active:scale-95 transition-transform">9</button>
              <button onClick={() => handleKeypadPress('✓')} className="bg-emerald-500 text-white font-bold text-xl py-4 rounded-xl shadow-md active:scale-95 transition-transform">✓</button>

              {/* Row 4 */}
              <button onClick={() => handleKeypadPress('CLR')} className="bg-red-500 text-white font-bold text-xs py-4 rounded-xl shadow-md active:scale-95 transition-transform">CLR</button>
              <button onClick={() => handleKeypadPress('0')} className="bg-white text-gray-900 font-bold text-xl py-4 rounded-xl shadow-md active:scale-95 transition-transform">0</button>
              <button onClick={() => handleKeypadPress('00')} className="bg-white text-gray-900 font-bold text-xl py-4 rounded-xl shadow-md active:scale-95 transition-transform">00</button>
              <button onClick={() => handleKeypadPress('000')} className="bg-white text-gray-900 font-bold text-xl py-4 rounded-xl shadow-md active:scale-95 transition-transform">000</button>
            </div>
          </div>

          {/* Quick Add Patterns */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-600 font-bold text-sm">Quick Add Patterns</h3>
              <span className="text-gray-400 text-xs">{patternPage + 1}/{totalPages}</span>
            </div>
            
            {/* Pattern Grid with Side Arrows */}
            <div className="flex items-center gap-2">
              {/* Left Arrow */}
              <button
                onClick={handlePrevPatternPage}
                disabled={patternPage <= 0}
                className={`p-3 rounded-xl shadow-md flex items-center justify-center transition-all flex-shrink-0 ${
                  patternPage <= 0
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : 'bg-white text-gray-600 hover:bg-gray-50 active:scale-95'
                }`}
              >
                <ChevronLeft size={20} />
              </button>

              {/* 3x2 Grid for Patterns */}
              <div className="grid grid-cols-3 gap-2 flex-1">
                {currentPatterns.map(pattern => (
                  <button
                    key={pattern.id}
                    onClick={() => handlePatternClick(pattern.id)}
                    className={`${pattern.color} text-white font-bold py-4 px-3 rounded-xl shadow-lg active:scale-95 transition-transform text-sm`}
                    style={{ fontFamily: 'Padauk, Noto Sans Myanmar' }}
                  >
                    {language === 'mm' ? pattern.labelMM : pattern.labelEN}
                  </button>
                ))}
              </div>

              {/* Right Arrow */}
              <button
                onClick={handleNextPatternPage}
                disabled={patternPage >= totalPages - 1}
                className={`p-3 rounded-xl shadow-md flex items-center justify-center transition-all flex-shrink-0 ${
                  patternPage >= totalPages - 1
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : 'bg-white text-gray-600 hover:bg-gray-50 active:scale-95'
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        {enteredBets.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-gray-600 text-sm">Total Bets: {enteredBets.length}</p>
                <p className="text-gray-900 font-bold text-xl">{totalAmount.toLocaleString()} MMK</p>
              </div>
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl flex items-center gap-2 active:scale-95 transition-transform"
              >
                <Check size={20} />
                Submit Bets
              </button>
            </div>
          </div>
        )}

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
    </div>
  );
};