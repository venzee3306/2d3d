import { Plus, RotateCw, BarChart3, Circle, ArrowLeft, Grid3x3, Repeat } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface BetEntryLeftPanelProps {
  onAddToCart: (player: string, gameMode: '2D' | '3D', number: string, amount: number) => void;
}

export function BetEntryLeftPanel({ onAddToCart }: BetEntryLeftPanelProps) {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [gameMode, setGameMode] = useState<'2D' | '3D'>('2D');
  const [betNumber, setBetNumber] = useState('');
  const [betAmount, setBetAmount] = useState('');

  const players = [
    { id: 'P001', name: 'Aye Aye' },
    { id: 'P002', name: 'Mg Mg' },
    { id: 'P003', name: 'Su Su' },
    { id: 'P004', name: 'Ko Ko' },
    { id: 'P005', name: 'Thida' },
    { id: 'P006', name: 'Zaw Zaw' },
    { id: 'P007', name: 'Myo Myo' },
    { id: 'P008', name: 'Htun Htun' },
  ];

  const handleNumberPad = (num: string) => {
    if (betNumber.length < 4) {
      setBetNumber(betNumber + num);
    }
  };

  const handleClear = () => {
    setBetNumber('');
  };

  const handleBackspace = () => {
    setBetNumber(betNumber.slice(0, -1));
  };

  const handleAddToCart = () => {
    if (betNumber && betAmount && selectedPlayer) {
      onAddToCart(selectedPlayer, gameMode, betNumber, parseInt(betAmount));
      setBetNumber('');
      setBetAmount('');
    }
  };

  const handlePattern = (type: string) => {
    console.log(`Apply ${type} pattern to ${betNumber}`);
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Select Player */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Select Player</label>
        <select
          value={selectedPlayer}
          onChange={(e) => setSelectedPlayer(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        >
          <option value="">Choose a player...</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.name}
            </option>
          ))}
        </select>
      </div>

      {/* Game Mode Toggle */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Game Mode</label>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setGameMode('2D')}
            className={`py-4 rounded-xl font-bold text-lg transition-all ${
              gameMode === '2D'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
            }`}
          >
            2D Mode
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setGameMode('3D')}
            className={`py-4 rounded-xl font-bold text-lg transition-all ${
              gameMode === '3D'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
            }`}
          >
            3D Mode
          </motion.button>
        </div>
      </div>

      {/* Number Display */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Number Display</label>
        <div className="w-full px-6 py-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl text-center shadow-inner">
          <span className="text-5xl font-bold text-blue-600 tracking-[0.5em]">
            {betNumber || '---'}
          </span>
        </div>
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Amount (MMK)</label>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          placeholder="Enter bet amount"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-800 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Numeric Keypad */}
      <div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <motion.button
              key={num}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNumberPad(num.toString())}
              className="py-5 bg-white hover:bg-blue-50 border-2 border-gray-300 hover:border-blue-400 rounded-xl text-2xl font-bold text-gray-700 hover:text-blue-600 transition-all shadow-sm"
            >
              {num}
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClear}
            className="py-5 bg-red-500 hover:bg-red-600 border-2 border-red-600 rounded-xl text-lg font-bold text-white transition-all shadow-md"
          >
            Clear
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNumberPad('0')}
            className="py-5 bg-white hover:bg-blue-50 border-2 border-gray-300 hover:border-blue-400 rounded-xl text-2xl font-bold text-gray-700 hover:text-blue-600 transition-all shadow-sm"
          >
            0
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBackspace}
            className="py-5 bg-yellow-500 hover:bg-yellow-600 border-2 border-yellow-600 rounded-xl text-lg font-bold text-white transition-all shadow-md"
          >
            ⌫
          </motion.button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddToCart}
        disabled={!betNumber || !betAmount || !selectedPlayer}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 rounded-xl text-white font-bold text-lg shadow-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add to Cart
      </motion.button>

      {/* Quick Add Patterns */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Quick Add Patterns</label>
        <div className="grid grid-cols-3 gap-2.5">
          {/* အုပ်စု - Blue */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePattern('group')}
            className="py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-[10px] text-white font-bold shadow-md transition-all"
            style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Grid3x3 className="w-4 h-4" />
              <span className="text-sm">အုပ်စု</span>
            </div>
          </motion.button>

          {/* ထိပ် - Purple */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePattern('top')}
            className="py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-[10px] text-white font-bold shadow-md transition-all"
            style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
          >
            <div className="flex items-center justify-center gap-1.5">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">ထိပ်</span>
            </div>
          </motion.button>

          {/* ဘြိတ် - Indigo */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePattern('break')}
            className="py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-[10px] text-white font-bold shadow-md transition-all"
            style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Circle className="w-4 h-4" />
              <span className="text-sm">ဘြိတ်</span>
            </div>
          </motion.button>

          {/* နောက် - Orange */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(249, 115, 22, 0.5)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePattern('back')}
            className="py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-[10px] text-white font-bold shadow-md transition-all"
            style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
          >
            <div className="flex items-center justify-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">နောက်</span>
            </div>
          </motion.button>

          {/* ပါတ် - Teal */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(20, 184, 166, 0.5)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePattern('power')}
            className="py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-[10px] text-white font-bold shadow-md transition-all"
            style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Repeat className="w-4 h-4" />
              <span className="text-sm">ပါတ်</span>
            </div>
          </motion.button>

          {/* R - Green */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePattern('reverse')}
            className="py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-[10px] text-white font-bold shadow-md transition-all"
          >
            <div className="flex items-center justify-center gap-1.5">
              <RotateCw className="w-4 h-4" />
              <span className="text-lg font-bold">R</span>
            </div>
          </motion.button>
        </div>

        {/* Tip Text */}
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-gray-600 leading-relaxed">
            <span className="font-bold text-blue-600">Tip:</span> Enter a number and amount, then click a pattern to add multiple bets at once.
          </p>
        </div>
      </div>
    </div>
  );
}
