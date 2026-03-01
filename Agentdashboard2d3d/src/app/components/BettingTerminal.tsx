import { Search, Shuffle, Zap, Copy } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface BettingTerminalProps {
  onAddToCart: (number: string, amount: number) => void;
}

export function BettingTerminal({ onAddToCart }: BettingTerminalProps) {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [betNumber, setBetNumber] = useState('');
  const [betAmount, setBetAmount] = useState('');

  const players = [
    { id: 'P001', name: 'Aung Ko Ko', balance: 1200000 },
    { id: 'P002', name: 'Su Su Hlaing', balance: 850000 },
    { id: 'P003', name: 'Kyaw Zin', balance: 2400000 },
    { id: 'P004', name: 'Thidar Win', balance: 670000 },
  ];

  const handleNumberPad = (num: string) => {
    if (betNumber.length < 4) {
      setBetNumber(betNumber + num);
    }
  };

  const handleClear = () => {
    setBetNumber('');
  };

  const handleAddToCart = () => {
    if (betNumber && betAmount && selectedPlayer) {
      onAddToCart(betNumber, parseInt(betAmount));
      setBetNumber('');
      setBetAmount('');
    }
  };

  const handlePattern = (type: 'reverse' | 'power' | 'twin') => {
    if (betNumber.length >= 2) {
      console.log(`Apply ${type} pattern to ${betNumber}`);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Betting Terminal</h3>

      {/* Player Selection */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Player</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="">Choose a player...</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name} - {player.balance.toLocaleString()} MMK
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Number Display */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Bet Number</label>
        <div className="w-full px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-center">
          <span className="text-3xl font-bold text-blue-600 tracking-widest">
            {betNumber || '----'}
          </span>
        </div>
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <motion.button
            key={num}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNumberPad(num.toString())}
            className="py-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 border border-gray-300 rounded-xl text-xl font-bold text-gray-700 hover:text-blue-600 transition-all shadow-sm hover:shadow-md"
          >
            {num}
          </motion.button>
        ))}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClear}
          className="py-4 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border border-red-300 rounded-xl text-lg font-bold text-red-600 transition-all shadow-sm hover:shadow-md"
        >
          CLR
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNumberPad('0')}
          className="py-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 border border-gray-300 rounded-xl text-xl font-bold text-gray-700 hover:text-blue-600 transition-all shadow-sm hover:shadow-md"
        >
          0
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setBetNumber(betNumber.slice(0, -1))}
          className="py-4 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border border-orange-300 rounded-xl text-lg font-bold text-orange-600 transition-all shadow-sm hover:shadow-md"
        >
          ⌫
        </motion.button>
      </div>

      {/* Bet Amount */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Bet Amount (MMK)</label>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      {/* Pattern Buttons */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handlePattern('reverse')}
          className="py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl text-white font-bold shadow-md hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-center gap-2">
            <Shuffle className="w-4 h-4" />
            <span>Reverse</span>
          </div>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handlePattern('power')}
          className="py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl text-white font-bold shadow-md hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" />
            <span>Power</span>
          </div>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handlePattern('twin')}
          className="py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl text-white font-bold shadow-md hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-center gap-2">
            <Copy className="w-4 h-4" />
            <span>Twin</span>
          </div>
        </motion.button>
      </div>

      {/* Add to Cart Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddToCart}
        disabled={!betNumber || !betAmount || !selectedPlayer}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed"
      >
        Add to Cart
      </motion.button>
    </div>
  );
}
