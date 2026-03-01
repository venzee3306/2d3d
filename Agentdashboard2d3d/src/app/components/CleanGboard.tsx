import { motion } from 'motion/react';
import { Globe, ArrowUp, X } from 'lucide-react';
import { useState } from 'react';

interface CleanGboardProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onEnter: () => void;
}

export function CleanGboard({ onKeyPress, onDelete, onEnter }: CleanGboardProps) {
  const [isShiftActive, setIsShiftActive] = useState(false); // Single letter uppercase
  const [isCapsLock, setIsCapsLock] = useState(false); // All caps mode
  const [language, setLanguage] = useState<'English' | 'Myanmar'>('English');
  const [lastShiftTap, setLastShiftTap] = useState(0); // Track double-tap timing

  // English QWERTY Layout (no number row)
  const englishLayout = {
    row1: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    row2: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    row3: ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  };

  // Myanmar Unicode Keyboard Layout
  const myanmarLayout = {
    row1: ['ေ', 'ျ', 'ြ', 'ွ', 'ှ', 'ု', 'ူ', 'ံ', 'း', '့'],
    row2: ['ာ', 'ါ', 'ိ', 'ီ', 'က', 'ခ', 'ဂ', 'ဃ', 'င'],
    row3: ['စ', 'ဆ', 'ဇ', 'ဈ', 'ည', 'တ', 'န'],
  };

  const currentLayout = language === 'English' ? englishLayout : myanmarLayout;

  const getDisplayKey = (key: string) => {
    if (language === 'English' && (isShiftActive || isCapsLock)) {
      return key.toUpperCase();
    }
    return key;
  };

  const handleKeyPress = (key: string) => {
    if (language === 'English' && (isShiftActive || isCapsLock)) {
      onKeyPress(key.toUpperCase());
      // If shift was active (single tap), turn it off after one letter
      if (isShiftActive && !isCapsLock) {
        setIsShiftActive(false);
      }
    } else {
      onKeyPress(key);
    }
  };

  const toggleCase = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastShiftTap;
    
    // Double-tap detected (within 300ms)
    if (timeSinceLastTap < 300 && (isShiftActive || isCapsLock)) {
      setIsCapsLock(!isCapsLock);
      setIsShiftActive(false);
    } else {
      // Single tap - toggle shift for one letter only
      if (isCapsLock) {
        setIsCapsLock(false);
        setIsShiftActive(false);
      } else {
        setIsShiftActive(true);
      }
    }
    
    setLastShiftTap(now);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'English' ? 'Myanmar' : 'English');
    setIsShiftActive(false);
    setIsCapsLock(false);
  };

  return (
    <div className="flex-shrink-0 w-full bg-[#F1F3F4] px-1.5 py-2.5 rounded-t-xl">
      <div className="space-y-[6px]">
        {/* Row 1 - QWERTY (10 keys) */}
        <div className="flex justify-center gap-[3px]">
          {currentLayout.row1.map((key, idx) => (
            <motion.button
              key={`row1-${idx}`}
              whileTap={{ scale: 0.93 }}
              onClick={() => handleKeyPress(key)}
              className="w-[34px] h-[40px] bg-white rounded-md text-[17px] font-medium text-gray-800 active:bg-gray-200 transition-colors flex items-center justify-center"
              style={language === 'Myanmar' ? { fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' } : { fontFamily: 'Inter, Roboto, sans-serif' }}
            >
              {getDisplayKey(key)}
            </motion.button>
          ))}
        </div>

        {/* Row 2 - ASDF (9 keys) */}
        <div className="flex justify-center gap-[3px] px-4">
          {currentLayout.row2.map((key, idx) => (
            <motion.button
              key={`row2-${idx}`}
              whileTap={{ scale: 0.93 }}
              onClick={() => handleKeyPress(key)}
              className="w-[34px] h-[40px] bg-white rounded-md text-[17px] font-medium text-gray-800 active:bg-gray-200 transition-colors flex items-center justify-center"
              style={language === 'Myanmar' ? { fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' } : { fontFamily: 'Inter, Roboto, sans-serif' }}
            >
              {getDisplayKey(key)}
            </motion.button>
          ))}
        </div>

        {/* Row 3 - Shift + ZXCV + Backspace */}
        <div className="flex justify-center gap-[3px] px-1">
          {/* Shift Key - Hollow Arrow with Caps Lock Indicator */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={toggleCase}
            className={`w-[44px] h-[40px] rounded-md flex items-center justify-center transition-colors relative ${
              isCapsLock 
                ? 'bg-gray-700' 
                : (isShiftActive && language === 'English') 
                  ? 'bg-gray-500' 
                  : 'bg-[#B1B3B6]'
            }`}
          >
            <ArrowUp 
              className={`w-[20px] h-[20px] ${
                (isCapsLock || (isShiftActive && language === 'English')) 
                  ? 'text-white' 
                  : 'text-gray-700'
              }`}
              strokeWidth={2}
            />
            {/* Caps Lock Indicator - Small dot at top-right */}
            {isCapsLock && (
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full" />
            )}
          </motion.button>

          {currentLayout.row3.map((key, idx) => (
            <motion.button
              key={`row3-${idx}`}
              whileTap={{ scale: 0.93 }}
              onClick={() => handleKeyPress(key)}
              className="w-[34px] h-[40px] bg-white rounded-md text-[17px] font-medium text-gray-800 active:bg-gray-200 transition-colors flex items-center justify-center"
              style={language === 'Myanmar' ? { fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' } : { fontFamily: 'Inter, Roboto, sans-serif' }}
            >
              {getDisplayKey(key)}
            </motion.button>
          ))}

          {/* Backspace - X in Pointed Box */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={onDelete}
            className="w-[44px] h-[40px] bg-[#B1B3B6] rounded-md flex items-center justify-center active:bg-gray-400 transition-colors"
          >
            <div className="relative flex items-center justify-center">
              {/* Pointed box shape */}
              <svg width="24" height="20" viewBox="0 0 24 20" fill="none" className="absolute">
                <path
                  d="M2 10L7 2H22C22.5523 2 23 2.44772 23 3V17C23 17.5523 22.5523 18 22 18H7L2 10Z"
                  fill="#8A8C8E"
                />
              </svg>
              <X className="w-[14px] h-[14px] text-white relative z-10" strokeWidth={2.5} />
            </div>
          </motion.button>
        </div>

        {/* Bottom Row - ?123, Globe, Space, Enter */}
        <div className="flex justify-center gap-[3px] px-1">
          {/* ?123 Key */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            className="w-[44px] h-[40px] bg-[#B1B3B6] rounded-md text-[15px] font-medium text-gray-700 active:bg-gray-400 transition-colors flex items-center justify-center"
          >
            ?123
          </motion.button>

          {/* Globe Icon */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={toggleLanguage}
            className="w-[40px] h-[40px] bg-[#B1B3B6] rounded-md flex items-center justify-center active:bg-gray-400 transition-colors"
          >
            <Globe className="w-[20px] h-[20px] text-gray-700" strokeWidth={2} />
          </motion.button>

          {/* Space Bar - Wide Pill */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onKeyPress(' ')}
            className="flex-1 h-[40px] bg-white rounded-full text-[15px] font-normal text-gray-400 active:bg-gray-200 transition-colors flex items-center justify-center"
            style={{ fontFamily: 'Inter, Roboto, sans-serif' }}
          >
            {language}
          </motion.button>

          {/* Enter/Check Key - Circular Blue */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={onEnter}
            className="w-[44px] h-[40px] bg-[#6DB0F5] rounded-lg flex items-center justify-center active:bg-blue-400 transition-colors shadow-sm"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M16 6L8.5 13.5L4 9"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
