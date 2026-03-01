import { motion } from 'motion/react';
import { Delete, Check } from 'lucide-react';

interface AlphabetKeyboardProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onClear: () => void;
  onEnter: () => void;
}

export function AlphabetKeyboard({ onKeyPress, onDelete, onClear, onEnter }: AlphabetKeyboardProps) {
  const row1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const row2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  const row3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className="flex-shrink-0 w-full space-y-1">
      {/* Number Row */}
      <div className="grid grid-cols-10 gap-0.5">
        {numbers.map((key) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.95 }}
            onClick={() => onKeyPress(key)}
            className="h-[28px] bg-white border border-gray-300 rounded text-xs font-bold text-gray-700 active:bg-blue-50 active:border-blue-400 shadow-sm"
          >
            {key}
          </motion.button>
        ))}
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-10 gap-0.5">
        {row1.map((key) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.95 }}
            onClick={() => onKeyPress(key)}
            className="h-[28px] bg-white border border-gray-300 rounded text-xs font-bold text-gray-700 active:bg-blue-50 active:border-blue-400 shadow-sm"
          >
            {key}
          </motion.button>
        ))}
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-10 gap-0.5">
        <div className="col-span-1"></div>
        {row2.map((key) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.95 }}
            onClick={() => onKeyPress(key)}
            className="h-[28px] bg-white border border-gray-300 rounded text-xs font-bold text-gray-700 active:bg-blue-50 active:border-blue-400 shadow-sm"
          >
            {key}
          </motion.button>
        ))}
      </div>

      {/* Row 3 with Space, Del, Enter */}
      <div className="grid grid-cols-11 gap-0.5">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClear}
          className="col-span-1 h-[28px] bg-red-500 rounded text-[9px] font-bold text-white shadow-sm"
        >
          CLR
        </motion.button>
        {row3.map((key) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.95 }}
            onClick={() => onKeyPress(key)}
            className="h-[28px] bg-white border border-gray-300 rounded text-xs font-bold text-gray-700 active:bg-blue-50 active:border-blue-400 shadow-sm"
          >
            {key}
          </motion.button>
        ))}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onKeyPress(' ')}
          className="col-span-1 h-[28px] bg-white border border-gray-300 rounded text-[9px] font-bold text-gray-700 active:bg-blue-50 active:border-blue-400 shadow-sm"
        >
          SPC
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onDelete}
          className="col-span-1 h-[28px] bg-red-500 rounded text-white flex items-center justify-center shadow-sm"
        >
          <Delete className="w-3 h-3" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onEnter}
          className="col-span-1 h-[28px] bg-blue-500 rounded text-white flex items-center justify-center shadow-sm"
        >
          <Check className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
