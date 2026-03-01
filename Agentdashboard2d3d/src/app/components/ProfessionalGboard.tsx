import { motion } from 'motion/react';
import { Delete, Check, ArrowUp, Globe } from 'lucide-react';
import { useState } from 'react';

interface ProfessionalGboardProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onEnter: () => void;
}

export function ProfessionalGboard({ onKeyPress, onDelete, onEnter }: ProfessionalGboardProps) {
  const [isUpperCase, setIsUpperCase] = useState(false);
  const [language, setLanguage] = useState<'English' | 'Myanmar'>('English');

  // English QWERTY Layout
  const englishLayout = {
    numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    row1: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    row2: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    row3: ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  };

  // Myanmar Unicode Keyboard Layout (Authentic Burmese)
  const myanmarLayout = {
    numbers: ['၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉', '၀'],
    row1: ['ေ', 'ျ', 'ြ', 'ွ', 'ှ', 'ု', 'ူ', 'ံ', 'း', '့'],
    row2: ['ာ', 'ါ', 'ိ', 'ီ', 'က', 'ခ', 'ဂ', 'ဃ', 'င'],
    row3: ['စ', 'ဆ', 'ဇ', 'ဈ', 'ည', 'တ', 'န'],
  };

  const currentLayout = language === 'English' ? englishLayout : myanmarLayout;

  const getDisplayKey = (key: string) => {
    if (language === 'English' && isUpperCase) {
      return key.toUpperCase();
    }
    return key;
  };

  const handleKeyPress = (key: string) => {
    if (language === 'English' && isUpperCase) {
      onKeyPress(key.toUpperCase());
    } else {
      onKeyPress(key);
    }
  };

  const toggleCase = () => {
    setIsUpperCase(!isUpperCase);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'English' ? 'Myanmar' : 'English');
    setIsUpperCase(false);
  };

  return (
    <div className="flex-shrink-0 w-full bg-[#EFF1F3] px-1 py-2 rounded-t-2xl shadow-lg border-t border-gray-200">
      <div className="space-y-[3px]">
        {/* Number Row - Circular Keys */}
        <div className="flex justify-center gap-[3px] px-1">
          {currentLayout.numbers.map((key, idx) => (
            <motion.button
              key={`num-${idx}`}
              whileTap={{ scale: 0.92 }}
              onClick={() => onKeyPress(key)}
              className="w-[33px] h-[32px] bg-white rounded-[4px] text-[15px] font-semibold text-gray-800 shadow-sm active:shadow-none active:bg-gray-100 transition-all flex items-center justify-center"
              style={language === 'Myanmar' ? { fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' } : {}}
            >
              {key}
            </motion.button>
          ))}
        </div>

        {/* Row 1 - QWERTY */}
        <div className="flex justify-center gap-[3px] px-0.5">
          {currentLayout.row1.map((key, idx) => (
            <motion.button
              key={`row1-${idx}`}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleKeyPress(key)}
              className="w-[34px] h-[35px] bg-white rounded-[4px] text-[15px] font-semibold text-gray-800 shadow-sm active:shadow-none active:bg-gray-100 transition-all flex items-center justify-center"
              style={language === 'Myanmar' ? { fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' } : {}}
            >
              {getDisplayKey(key)}
            </motion.button>
          ))}
        </div>

        {/* Row 2 - ASDF + Backspace */}
        <div className="flex justify-center gap-[3px] px-3">
          {currentLayout.row2.map((key, idx) => (
            <motion.button
              key={`row2-${idx}`}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleKeyPress(key)}
              className="w-[34px] h-[35px] bg-white rounded-[4px] text-[15px] font-semibold text-gray-800 shadow-sm active:shadow-none active:bg-gray-100 transition-all flex items-center justify-center"
              style={language === 'Myanmar' ? { fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' } : {}}
            >
              {getDisplayKey(key)}
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onDelete}
            className="w-[38px] h-[35px] bg-[#B8BCC3] rounded-[4px] flex items-center justify-center shadow-sm active:shadow-none active:bg-gray-400 transition-all ml-1"
          >
            <Delete className="w-[18px] h-[18px] text-gray-700" />
          </motion.button>
        </div>

        {/* Row 3 - Shift + ZXCV */}
        <div className="flex justify-center gap-[3px] px-0.5">
          {/* Shift Key */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={toggleCase}
            className={`w-[44px] h-[35px] rounded-[4px] flex items-center justify-center shadow-sm active:shadow-none transition-all ${
              isUpperCase && language === 'English'
                ? 'bg-blue-500 text-white'
                : 'bg-[#B8BCC3] text-gray-700'
            }`}
          >
            <ArrowUp className="w-[18px] h-[18px]" />
          </motion.button>

          {currentLayout.row3.map((key, idx) => (
            <motion.button
              key={`row3-${idx}`}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleKeyPress(key)}
              className="w-[34px] h-[35px] bg-white rounded-[4px] text-[15px] font-semibold text-gray-800 shadow-sm active:shadow-none active:bg-gray-100 transition-all flex items-center justify-center"
              style={language === 'Myanmar' ? { fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' } : {}}
            >
              {getDisplayKey(key)}
            </motion.button>
          ))}

          {/* Backspace Icon for shorter row */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onDelete}
            className="w-[44px] h-[35px] bg-[#B8BCC3] rounded-[4px] flex items-center justify-center shadow-sm active:shadow-none active:bg-gray-400 transition-all"
          >
            <Delete className="w-[18px] h-[18px] text-gray-700" />
          </motion.button>
        </div>

        {/* Bottom Row - Globe, Space, Done */}
        <div className="flex justify-center gap-[3px] px-2">
          {/* Globe Language Toggle */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={toggleLanguage}
            className="w-[38px] h-[35px] bg-[#B8BCC3] rounded-[4px] flex items-center justify-center shadow-sm active:shadow-none active:bg-gray-400 transition-all"
          >
            <Globe className="w-[18px] h-[18px] text-gray-700" />
          </motion.button>

          {/* Period */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => onKeyPress(language === 'English' ? ',' : '၊')}
            className="w-[32px] h-[35px] bg-white rounded-[4px] text-[16px] font-bold text-gray-800 shadow-sm active:shadow-none active:bg-gray-100 transition-all flex items-center justify-center"
            style={language === 'Myanmar' ? { fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' } : {}}
          >
            {language === 'English' ? ',' : '၊'}
          </motion.button>

          {/* Space Bar - Pill Shaped with Language Label */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onKeyPress(' ')}
            className="flex-1 h-[35px] bg-white rounded-full text-[13px] font-medium text-gray-600 shadow-sm active:shadow-none active:bg-gray-100 transition-all flex items-center justify-center px-4"
          >
            {language}
          </motion.button>

          {/* Period/Fullstop */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => onKeyPress(language === 'English' ? '.' : '။')}
            className="w-[32px] h-[35px] bg-white rounded-[4px] text-[16px] font-bold text-gray-800 shadow-sm active:shadow-none active:bg-gray-100 transition-all flex items-center justify-center"
            style={language === 'Myanmar' ? { fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' } : {}}
          >
            {language === 'English' ? '.' : '။'}
          </motion.button>

          {/* Done Button - Circular Light Blue */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onEnter}
            className="w-[38px] h-[35px] bg-blue-400 rounded-full flex items-center justify-center shadow-md active:shadow-sm active:bg-blue-500 transition-all"
          >
            <Check className="w-[18px] h-[18px] text-white stroke-[2.5]" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
