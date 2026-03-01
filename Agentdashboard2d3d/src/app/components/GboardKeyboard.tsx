import { motion } from 'motion/react';
import { Delete, Check, ArrowUp, Globe } from 'lucide-react';
import { useState } from 'react';

interface GboardKeyboardProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onEnter: () => void;
}

export function GboardKeyboard({ onKeyPress, onDelete, onEnter }: GboardKeyboardProps) {
  const [isUpperCase, setIsUpperCase] = useState(false);
  const [language, setLanguage] = useState<'english' | 'myanmar'>('english');

  // English QWERTY Layout
  const englishLayout = {
    numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    row1: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    row2: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    row3: ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  };

  // Myanmar Unicode Keyboard Layout (Proper Myanmar keyboard)
  const myanmarLayout = {
    numbers: ['၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉', '၀'],
    row1: ['ေ', 'ျ', 'ြ', 'ွ', 'ှ', 'ု', 'ူ', 'ံ', 'း', '့'],
    row2: ['ာ', 'ါ', 'ိ', 'ီ', 'က', 'ခ', 'ဂ', 'ဃ', 'င'],
    row3: ['စ', 'ဆ', 'ဇ', 'ဈ', 'ည', 'တ', 'န'],
  };

  const currentLayout = language === 'english' ? englishLayout : myanmarLayout;

  const getDisplayKey = (key: string) => {
    if (language === 'english' && isUpperCase) {
      return key.toUpperCase();
    }
    return key;
  };

  const handleKeyPress = (key: string) => {
    if (language === 'english' && isUpperCase) {
      onKeyPress(key.toUpperCase());
    } else {
      onKeyPress(key);
    }
  };

  const toggleCase = () => {
    setIsUpperCase(!isUpperCase);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'english' ? 'myanmar' : 'english');
    setIsUpperCase(false); // Reset case when switching language
  };

  return (
    <div className="flex-shrink-0 w-full bg-[#D0D4D9] px-1.5 py-2 rounded-t-xl border-t-2 border-gray-300 shadow-inner">
      <div className="space-y-1">
        {/* Number Row */}
        <div className="grid grid-cols-10 gap-1">
          {currentLayout.numbers.map((key, idx) => (
            <motion.button
              key={`num-${idx}`}
              whileTap={{ scale: 0.95 }}
              onClick={() => onKeyPress(key)}
              className="h-[32px] bg-white rounded-md text-sm font-semibold text-gray-800 shadow-sm active:shadow-none active:bg-gray-100 transition-all"
            >
              {key}
            </motion.button>
          ))}
        </div>

        {/* Row 1 - Full Width */}
        <div className="grid grid-cols-10 gap-1">
          {currentLayout.row1.map((key, idx) => (
            <motion.button
              key={`row1-${idx}`}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleKeyPress(key)}
              className="h-[32px] bg-white rounded-md text-sm font-semibold text-gray-800 shadow-sm active:shadow-none active:bg-gray-100 transition-all"
              style={language === 'myanmar' ? { fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' } : {}}
            >
              {getDisplayKey(key)}
            </motion.button>
          ))}
        </div>

        {/* Row 2 - Slightly Indented with Backspace */}
        <div className="grid grid-cols-10 gap-1">
          <div className="col-span-0.5"></div>
          {currentLayout.row2.map((key, idx) => (
            <motion.button
              key={`row2-${idx}`}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleKeyPress(key)}
              className="h-[32px] bg-white rounded-md text-sm font-semibold text-gray-800 shadow-sm active:shadow-none active:bg-gray-100 transition-all"
              style={language === 'myanmar' ? { fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' } : {}}
            >
              {getDisplayKey(key)}
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onDelete}
            className="col-span-1 h-[32px] bg-[#ABB5BE] rounded-md flex items-center justify-center shadow-sm active:shadow-none active:bg-gray-400 transition-all"
          >
            <Delete className="w-4 h-4 text-gray-700" />
          </motion.button>
        </div>

        {/* Row 3 - Shift, Letters, Done */}
        <div className="grid grid-cols-10 gap-1">
          {/* Shift Key */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleCase}
            className={`col-span-1 h-[32px] rounded-md flex items-center justify-center shadow-sm active:shadow-none transition-all ${
              isUpperCase && language === 'english'
                ? 'bg-blue-500 text-white'
                : 'bg-[#ABB5BE] text-gray-700'
            }`}
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>

          {currentLayout.row3.map((key, idx) => (
            <motion.button
              key={`row3-${idx}`}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleKeyPress(key)}
              className="h-[32px] bg-white rounded-md text-sm font-semibold text-gray-800 shadow-sm active:shadow-none active:bg-gray-100 transition-all"
              style={language === 'myanmar' ? { fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' } : {}}
            >
              {getDisplayKey(key)}
            </motion.button>
          ))}

          {/* Done Key */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onEnter}
            className="col-span-2 h-[32px] bg-blue-500 rounded-md flex items-center justify-center shadow-sm active:shadow-none active:bg-blue-600 transition-all"
          >
            <Check className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {/* Bottom Row - Globe, Space, .com */}
        <div className="grid grid-cols-10 gap-1">
          {/* Globe Language Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleLanguage}
            className="col-span-1 h-[32px] bg-[#ABB5BE] rounded-md flex items-center justify-center shadow-sm active:shadow-none active:bg-gray-400 transition-all"
          >
            <Globe className="w-4 h-4 text-gray-700" />
          </motion.button>

          {/* .com or @ key */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onKeyPress(language === 'english' ? '.com' : '@')}
            className="col-span-2 h-[32px] bg-white rounded-md text-xs font-semibold text-gray-800 shadow-sm active:shadow-none active:bg-gray-100 transition-all"
          >
            {language === 'english' ? '.com' : '@'}
          </motion.button>

          {/* Space Bar */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onKeyPress(' ')}
            className="col-span-5 h-[32px] bg-white rounded-md text-xs font-semibold text-gray-700 shadow-sm active:shadow-none active:bg-gray-100 transition-all"
          >
            space
          </motion.button>

          {/* Period */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onKeyPress('.')}
            className="col-span-1 h-[32px] bg-white rounded-md text-sm font-bold text-gray-800 shadow-sm active:shadow-none active:bg-gray-100 transition-all"
          >
            .
          </motion.button>

          {/* Emoji/@ Key */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onKeyPress(language === 'english' ? '@' : '။')}
            className="col-span-1 h-[32px] bg-white rounded-md text-sm font-bold text-gray-800 shadow-sm active:shadow-none active:bg-gray-100 transition-all"
            style={language === 'myanmar' ? { fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' } : {}}
          >
            {language === 'english' ? '@' : '။'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
