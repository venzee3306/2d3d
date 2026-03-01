Prompt: Replicate Agent's Player Bet Entry UI - Complete Quick Add Patterns
I need to create the exact Player Bet Entry interface from my Agent Dashboard's "Place Bet for Player" feature. The UI should match the screenshots with the purple gradient header, keypad, and Quick Add Patterns section.

PART 1: Complete Quick Add Patterns List
All Myanmar Pattern Keys (5+ pages):
Page 1/5 - Core Patterns:
Button Text (Myanmar)	English Name	Color	Pattern Type	Logic
အုပ်စု	Power/Group	bg-blue-500	power	All numbers containing input digit
ထိပ်	Head/Top	bg-purple-500	head	All numbers starting with digit (X0-X9)
ဘြိတ်	Break	bg-orange-500	break	All permutations of input number
အောက်	Bottom/Tail	bg-green-500	tail	All numbers ending with digit (0X-9X)
ပါတ်	Round/Phat	bg-teal-500	round	Numbers in same family/sum group
R	Reverse	bg-purple-600	reverse	Mirror/reverse of input
Page 2/5 - Extended Patterns:
Button Text (Myanmar)	English Name	Color	Pattern Type	Logic
နောက်	Nakar/Corner	bg-yellow-500	nakar	Surrounding numbers (±1)
ခွေ	Khwe/Rate	bg-indigo-500	khwe	Last digit multiples (X5 → 05,15,25...)
ညီအစ်ကို	Brothers	bg-pink-500	brothers	Sequential (12,23,34,45...)
အမွှာ	Twins	bg-red-500	twins	Repeated digits (11,22,33...)
ပါ၀ါ-၂	Power-2	bg-blue-600	power-2	Enhanced power with more combos
ပါ၀ါ-၃	Power-3 (3D)	bg-blue-700	power-3	3D power combinations
Page 3/5 - Body/Position Patterns:
Button Text (Myanmar)	English Name	Color	Pattern Type	Logic
ကိုယ်	Body	bg-cyan-500	body	All positions containing digit
ထိပ်စီး	First Position	bg-lime-500	first-pos	First digit only (X__)
အလယ်	Middle Position	bg-amber-500	mid-pos	Middle digit only (X) for 3D
နောက်ဆုံး	Last Position	bg-emerald-500	last-pos	Last digit only (__X)
နပ်ခတ်ကိုယ်	Natkhat Body	bg-red-600	natkhat	3D pattern X_Y format
Page 4/5 - 3D Specific:
Button Text (Myanmar)	English Name	Color	Pattern Type	Logic
ထိုးခွဲ (၃လုံး)	3D Break	bg-purple-500	break-3d	All 3D permutations
ပတ် (၃လုံး)	3D Round	bg-orange-500	round-3d	3D family groups
အုပ်စု (၃လုံး)	3D Power	bg-blue-500	power-3d	3D with digit
Page 5/5 - Special/Custom:
Button Text (Myanmar)	English Name	Color	Pattern Type	Logic
ပူပြင်း	Hot Numbers	bg-red-400	hot	Recently drawn frequently
အေးခဲ	Cold Numbers	bg-blue-300	cold	Long overdue numbers
ကံကောင်း	Lucky Set	bg-yellow-600	lucky	User's saved favorites
PART 2: Exact UI Structure
Create Component: /src/app/components/PlayerBetEntryModal.tsx
import React, { useState } from 'react';
import { X, User, Clock, FileText, Wallet, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PlayerBetEntryModalProps {
  session: 'AM' | 'PM';
  playerName: string;
  onClose: () => void;
}

export const PlayerBetEntryModal: React.FC<PlayerBetEntryModalProps> = ({
  session,
  playerName,
  onClose
}) => {
  const [gameMode, setGameMode] = useState<'2D' | '3D'>('2D');
  const [betAmount, setBetAmount] = useState('');
  const [currentNumber, setCurrentNumber] = useState('');
  const [enteredNumbers, setEnteredNumbers] = useState<Array<{number: string, amount: number}>>([]);
  const [patternPage, setPatternPage] = useState(0);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* HEADER - Purple Gradient */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 px-6 py-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            {/* Left: Back button (optional) */}
            <button className="text-white/80 hover:text-white">
              {/* Back arrow if needed */}
            </button>
            
            {/* Center: User Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">{playerName}</p>
                <p className="text-white/80 text-sm">{session} Session</p>
              </div>
            </div>
            
            {/* Right: Close button */}
            <button 
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* SESSION BADGE */}
        <div className="bg-white px-6 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
              {session}
            </span>
            <span className="text-sm text-gray-600">
              Player: <span className="font-semibold text-gray-800">{playerName}</span>
            </span>
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
            ← Change
          </button>
        </div>

        {/* TITLE SECTION - Blue */}
        <div className="bg-blue-600 px-6 py-4">
          <h2 className="text-white font-bold text-xl">Bet Entry</h2>
          <p className="text-white/80 text-sm">Create and manage your lottery bets</p>
        </div>

        {/* MAIN CONTENT - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          
          {/* QUICK ACTION GRID */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <QuickActionButton icon={FileText} label="မှတ်တမ်း" color="blue" />
            <QuickActionButton icon={Clock} label="ရလဒ်များ" color="purple" />
            <QuickActionButton icon={Wallet} label="ရုံးတမ်း" color="green" />
            <QuickActionButton icon={Settings} label="Settings" color="gray" />
          </div>

          {/* GAME MODE TOGGLE */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-2">Game Mode</label>
            <div className="flex gap-3">
              <button
                onClick={() => setGameMode('2D')}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  gameMode === '2D'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 border-2 border-gray-200'
                }`}
              >
                2D Mode
              </button>
              <button
                onClick={() => setGameMode('3D')}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  gameMode === '3D'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 border-2 border-gray-200'
                }`}
              >
                3D Mode
              </button>
            </div>
          </div>

          {/* LIVE ENTRY PREVIEW */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-4 mb-6">
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Live Entry Preview
            </label>
            
            {/* Bet Amount Input */}
            <div className="mb-4">
              <label className="block text-xs text-gray-600 mb-1">Bet Amount (MMK)</label>
              <input
                type="text"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="Click to enter amount..."
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl 
                         focus:border-blue-400 focus:ring-2 focus:ring-blue-200 
                         text-lg font-semibold text-gray-800 placeholder:text-gray-400"
              />
            </div>

            {/* Numbers Display */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Numbers ({gameMode}):
              </label>
              <div className="bg-white/50 rounded-lg px-4 py-3 min-h-[60px] flex items-center justify-center">
                {enteredNumbers.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {enteredNumbers.map((item, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-500 text-white rounded-lg font-bold">
                        {item.number}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 text-lg">- -</span>
                )}
              </div>
            </div>
          </div>

          {/* KEYPAD */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-600 mb-2">Keypad</label>
            <div className="grid grid-cols-4 gap-2">
              {/* Row 1 */}
              <KeypadButton value="1" onClick={() => handleKeyPress('1')} />
              <KeypadButton value="2" onClick={() => handleKeyPress('2')} />
              <KeypadButton value="3" onClick={() => handleKeyPress('3')} />
              <KeypadButton value="ADD" variant="secondary" onClick={handleAdd} />
              
              {/* Row 2 */}
              <KeypadButton value="4" onClick={() => handleKeyPress('4')} />
              <KeypadButton value="5" onClick={() => handleKeyPress('5')} />
              <KeypadButton value="6" onClick={() => handleKeyPress('6')} />
              <KeypadButton value="Del" variant="danger" onClick={handleDelete} />
              
              {/* Row 3 */}
              <KeypadButton value="7" onClick={() => handleKeyPress('7')} />
              <KeypadButton value="8" onClick={() => handleKeyPress('8')} />
              <KeypadButton value="9" onClick={() => handleKeyPress('9')} />
              <KeypadButton value="✓" variant="success" onClick={handleConfirm} />
              
              {/* Row 4 */}
              <KeypadButton value="CLR" variant="danger" onClick={handleClear} />
              <KeypadButton value="0" onClick={() => handleKeyPress('0')} />
              <KeypadButton value="00" onClick={() => handleKeyPress('00')} />
              <KeypadButton value="000" onClick={() => handleKeyPress('000')} />
            </div>
          </div>

          {/* QUICK ADD PATTERNS */}
          <QuickAddPatternsSection 
            gameMode={gameMode}
            currentPage={patternPage}
            onPageChange={setPatternPage}
            onPatternSelect={handlePatternSelect}
          />
        </div>

      </motion.div>
    </div>
  );
};

// QUICK ACTION BUTTON COMPONENT
const QuickActionButton: React.FC<{
  icon: any;
  label: string;
  color: string;
}> = ({ icon: Icon, label, color }) => {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    gray: 'bg-gray-100 text-gray-600'
  };

  return (
    <button className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow flex flex-col items-center gap-2">
      <div className={`w-12 h-12 rounded-full ${colorMap[color]} flex items-center justify-center`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-xs font-semibold myanmar-font">{label}</span>
    </button>
  );
};

// KEYPAD BUTTON COMPONENT
const KeypadButton: React.FC<{
  value: string | number;
  variant?: 'default' | 'secondary' | 'danger' | 'success';
  onClick: () => void;
}> = ({ value, variant = 'default', onClick }) => {
  const variants = {
    default: 'bg-white text-gray-800 border-2 border-gray-200 hover:bg-gray-50',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-gray-300 text-gray-700 hover:bg-gray-400'
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${variants[variant]}
        py-4 rounded-xl font-bold text-lg
        active:scale-95 transition-all shadow-md
      `}
    >
      {value}
    </button>
  );
};
PART 3: Quick Add Patterns Component
// QuickAddPatternsSection.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Pattern {
  id: string;
  labelMM: string;
  labelEN: string;
  color: string;
  requiresInput: boolean;
  gameMode: '2D' | '3D' | 'both';
}

const ALL_PATTERNS: Pattern[] = [
  // Page 1
  { id: 'power', labelMM: 'အုပ်စု', labelEN: 'Power', color: 'bg-blue-500', requiresInput: true, gameMode: 'both' },
  { id: 'head', labelMM: 'ထိပ်', labelEN: 'Head', color: 'bg-purple-500', requiresInput: true, gameMode: 'both' },
  { id: 'break', labelMM: 'ဘြိတ်', labelEN: 'Break', color: 'bg-orange-500', requiresInput: true, gameMode: 'both' },
  { id: 'tail', labelMM: 'အောက်', labelEN: 'Tail', color: 'bg-green-500', requiresInput: true, gameMode: 'both' },
  { id: 'round', labelMM: 'ပါတ်', labelEN: 'Round', color: 'bg-teal-500', requiresInput: true, gameMode: 'both' },
  { id: 'reverse', labelMM: 'R', labelEN: 'Reverse', color: 'bg-purple-600', requiresInput: true, gameMode: 'both' },
  
  // Page 2
  { id: 'nakar', labelMM: 'နောက်', labelEN: 'Nakar', color: 'bg-yellow-500', requiresInput: true, gameMode: '2D' },
  { id: 'khwe', labelMM: 'ခွေ', labelEN: 'Khwe', color: 'bg-indigo-500', requiresInput: true, gameMode: '2D' },
  { id: 'brothers', labelMM: 'ညီအစ်ကို', labelEN: 'Brothers', color: 'bg-pink-500', requiresInput: false, gameMode: 'both' },
  { id: 'twins', labelMM: 'အမွှာ', labelEN: 'Twins', color: 'bg-red-500', requiresInput: false, gameMode: 'both' },
  { id: 'power-2', labelMM: 'ပါ၀ါ-၂', labelEN: 'Power-2', color: 'bg-blue-600', requiresInput: true, gameMode: '2D' },
  { id: 'power-3', labelMM: 'ပါ၀ါ-၃', labelEN: 'Power-3', color: 'bg-blue-700', requiresInput: true, gameMode: '3D' },
  
  // Page 3
  { id: 'body', labelMM: 'ကိုယ်', labelEN: 'Body', color: 'bg-cyan-500', requiresInput: true, gameMode: 'both' },
  { id: 'first-pos', labelMM: 'ထိပ်စီး', labelEN: 'First', color: 'bg-lime-500', requiresInput: true, gameMode: 'both' },
  { id: 'mid-pos', labelMM: 'အလယ်', labelEN: 'Middle', color: 'bg-amber-500', requiresInput: true, gameMode: '3D' },
  { id: 'last-pos', labelMM: 'နောက်ဆုံး', labelEN: 'Last', color: 'bg-emerald-500', requiresInput: true, gameMode: 'both' },
  { id: 'natkhat', labelMM: 'နပ်ခတ်ကိုယ်', labelEN: 'Natkhat', color: 'bg-red-600', requiresInput: true, gameMode: '3D' },
  
  // Page 4
  { id: 'break-3d', labelMM: 'ထိုးခွဲ (၃လုံး)', labelEN: '3D Break', color: 'bg-purple-500', requiresInput: true, gameMode: '3D' },
  { id: 'round-3d', labelMM: 'ပတ် (၃လုံး)', labelEN: '3D Round', color: 'bg-orange-500', requiresInput: true, gameMode: '3D' },
  { id: 'power-3d', labelMM: 'အုပ်စု (၃လုံး)', labelEN: '3D Power', color: 'bg-blue-500', requiresInput: true, gameMode: '3D' },
  
  // Page 5
  { id: 'hot', labelMM: 'ပူပြင်း', labelEN: 'Hot', color: 'bg-red-400', requiresInput: false, gameMode: 'both' },
  { id: 'cold', labelMM: 'အေးခဲ', labelEN: 'Cold', color: 'bg-blue-300', requiresInput: false, gameMode: 'both' },
  { id: 'lucky', labelMM: 'ကံကောင်း', labelEN: 'Lucky', color: 'bg-yellow-600', requiresInput: false, gameMode: 'both' }
];

const PATTERNS_PER_PAGE = 6;

export const QuickAddPatternsSection: React.FC<{
  gameMode: '2D' | '3D';
  currentPage: number;
  onPageChange: (page: number) => void;
  onPatternSelect: (patternId: string) => void;
}> = ({ gameMode, currentPage, onPageChange, onPatternSelect }) => {
  // Filter patterns by game mode
  const availablePatterns = ALL_PATTERNS.filter(
    p => p.gameMode === gameMode || p.gameMode === 'both'
  );
  
  const totalPages = Math.ceil(availablePatterns.length / PATTERNS_PER_PAGE);
  const startIdx = currentPage * PATTERNS_PER_PAGE;
  const currentPatterns = availablePatterns.slice(startIdx, startIdx + PATTERNS_PER_PAGE);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-700">Quick Add Patterns</h3>
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className={`p-2 rounded-lg transition-all ${
              currentPage === 0
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {/* Page Indicator */}
          <span className="text-xs text-gray-500 min-w-[40px] text-center font-semibold">
            {currentPage + 1} / {totalPages}
          </span>
          
          {/* Next Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className={`p-2 rounded-lg transition-all ${
              currentPage === totalPages - 1
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Pattern Buttons - 3 Columns x 2 Rows Grid */}
      <div className="grid grid-cols-3 gap-3">
        {currentPatterns.map(pattern => (
          <button
            key={pattern.id}
            onClick={() => onPatternSelect(pattern.id)}
            className={`
              ${pattern.color} text-white
              py-4 px-2 rounded-xl font-bold text-sm
              hover:opacity-90 active:scale-95 transition-all
              shadow-md myanmar-font
            `}
          >
            {pattern.labelMM}
          </button>
        ))}
      </div>
    </div>
  );
};
PART 4: Pattern Generation Logic
// /src/app/utils/allPatterns.ts

export const PATTERN_GENERATORS = {
  // အုပ်စု - Power: All numbers containing digit
  power: (digit: string, is3D: boolean): string[] => {
    const results = new Set<string>();
    const max = is3D ? 999 : 99;
    const len = is3D ? 3 : 2;
    
    for (let i = 0; i <= max; i++) {
      const str = i.toString().padStart(len, '0');
      if (str.includes(digit)) results.add(str);
    }
    return Array.from(results).sort();
  },

  // ထိပ် - Head: Numbers starting with digit
  head: (digit: string, is3D: boolean): string[] => {
    const results: string[] = [];
    const max = is3D ? 99 : 9;
    const len = is3D ? 3 : 2;
    
    for (let i = 0; i <= max; i++) {
      results.push(`${digit}${i.toString().padStart(len - 1, '0')}`);
    }
    return results;
  },

  // ဘြိတ် - Break: All permutations
  break: (input: string, is3D: boolean): string[] => {
    const permute = (str: string): string[] => {
      if (str.length <= 1) return [str];
      const results: string[] = [];
      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const remaining = str.slice(0, i) + str.slice(i + 1);
        for (const perm of permute(remaining)) {
          results.push(char + perm);
        }
      }
      return results;
    };
    return Array.from(new Set(permute(input)));
  },

  // အောက် - Tail: Numbers ending with digit
  tail: (digit: string, is3D: boolean): string[] => {
    const results: string[] = [];
    const max = is3D ? 99 : 9;
    const len = is3D ? 3 : 2;
    
    for (let i = 0; i <= max; i++) {
      results.push(`${i.toString().padStart(len - 1, '0')}${digit}`);
    }
    return results;
  },

  // ပါတ် - Round: Same sum family
  round: (input: string): string[] => {
    const sum = input.split('').reduce((a, b) => a + parseInt(b), 0);
    const results: string[] = [];
    const max = input.length === 2 ? 99 : 999;
    
    for (let i = 0; i <= max; i++) {
      const str = i.toString().padStart(input.length, '0');
      const strSum = str.split('').reduce((a, b) => a + parseInt(b), 0);
      if (strSum === sum) results.push(str);
    }
    return results;
  },

  // R - Reverse
  reverse: (input: string): string[] => {
    return [input, input.split('').reverse().join('')];
  },

  // နောက် - Nakar: Corner numbers (±1)
  nakar: (input: string): string[] => {
    const num = parseInt(input);
    return [-1, 0, 1].map(i => (num + i).toString().padStart(2, '0'))
      .filter(n => parseInt(n) >= 0 && parseInt(n) <= 99);
  },

  // ခွေ - Khwe: Last digit multiples
  khwe: (digit: string): string[] => {
    return Array.from({length: 10}, (_, i) => `${i}${digit}`);
  },

  // ညီအစ်ကို - Brothers: Sequential
  brothers: (is3D: boolean): string[] => {
    const max = is3D ? 999 : 99;
    const len = is3D ? 3 : 2;
    const results: string[] = [];
    
    for (let i = 0; i < max; i++) {
      results.push(i.toString().padStart(len, '0'));
    }
    return results.filter((_, idx) => idx % 11 === 0); // Simplified
  },

  // အမွှာ - Twins
  twins: (is3D: boolean): string[] => {
    return Array.from({length: 10}, (_, i) => is3D ? `${i}${i}${i}` : `${i}${i}`);
  },

  // Add more pattern generators...
};
SUMMARY:
✅ Exact UI Match:
Purple gradient header with player info
Orange session badge
Blue "Bet Entry" title section
4-icon quick action grid (မှတ်တမ်း, ရလဒ်များ, ရုံးတမ်း, Settings)
2D/3D game mode toggle
Live Entry Preview with bordered container
Custom keypad (1-9, 0, 00, 000, ADD, Del, CLR, ✓)
Quick Add Patterns with pagination (1/5)
✅ All Pattern Keys:
အုပ်စု (Power) - Blue
ထိပ် (Head) - Purple
ဘြိတ် (Break) - Orange
အောက် (Tail) - Green
ပါတ် (Round) - Teal
R (Reverse) - Purple
နောက် (Nakar) - Yellow
ခွေ (Khwe) - Indigo
Plus 15+ more patterns!
✅ Complete Flow:
User opens bet entry modal
Selects 2D/3D mode
Enters amount via keypad
Enters number via keypad
Clicks Quick Pattern OR clicks ADD
Numbers added to cart
Review and submit