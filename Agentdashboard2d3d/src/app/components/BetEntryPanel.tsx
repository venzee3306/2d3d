import { Shuffle, Zap, Copy, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface BetEntryPanelProps {
  onAddBet: (player: string, number: string, amount: number, type: '2D' | '3D') => void;
}

export function BetEntryPanel({ onAddBet }: BetEntryPanelProps) {
  const [betNumber, setBetNumber] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [betAmount, setBetAmount] = useState('');
  const [betType, setBetType] = useState<'2D' | '3D'>('2D');

  const players = [
    { id: 'P001', name: 'Aye Aye' },
    { id: 'P002', name: 'Mg Mg' },
    { id: 'P003', name: 'Su Su' },
    { id: 'P004', name: 'Ko Ko' },
    { id: 'P005', name: 'Thida' },
    { id: 'P006', name: 'Zaw Zaw' },
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

  const handleAddBet = () => {
    if (betNumber && betAmount && selectedPlayer) {
      onAddBet(selectedPlayer, betNumber, parseInt(betAmount), betType);
      setBetNumber('');
      setBetAmount('');
    }
  };

  const handlePattern = (type: 'reverse' | 'power' | 'twin') => {
    console.log(`Apply ${type} pattern to ${betNumber}`);
  };

  return (
    <div className="bg-white rounded-[15px] shadow-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Bet Entry</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Number Keypad */}
        <div>
          {/* Number Display */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">Enter Number</label>
            <div className="w-full px-6 py-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-[15px] text-center">
              <span className="text-4xl font-bold text-blue-600 tracking-widest">
                {betNumber || '----'}
              </span>
            </div>
          </div>

          {/* Number Keypad */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <motion.button
                key={num}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNumberPad(num.toString())}
                className="py-4 bg-white hover:bg-blue-50 border-2 border-gray-300 hover:border-blue-400 rounded-[15px] text-xl font-bold text-gray-700 hover:text-blue-600 transition-all shadow-sm"
              >
                {num}
              </motion.button>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClear}
              className="py-4 bg-red-50 hover:bg-red-100 border-2 border-red-300 rounded-[15px] text-lg font-bold text-red-600 transition-all shadow-sm"
            >
              CLR
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNumberPad('0')}
              className="py-4 bg-white hover:bg-blue-50 border-2 border-gray-300 hover:border-blue-400 rounded-[15px] text-xl font-bold text-gray-700 hover:text-blue-600 transition-all shadow-sm"
            >
              0
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackspace}
              className="py-4 bg-orange-50 hover:bg-orange-100 border-2 border-orange-300 rounded-[15px] text-lg font-bold text-orange-600 transition-all shadow-sm"
            >
              ⌫
            </motion.button>
          </div>

          {/* Pattern Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePattern('reverse')}
              className="py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-[15px] text-white font-bold shadow-md transition-all"
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
              className="py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-[15px] text-white font-bold shadow-md transition-all"
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
              className="py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-[15px] text-white font-bold shadow-md transition-all"
            >
              <div className="flex items-center justify-center gap-2">
                <Copy className="w-4 h-4" />
                <span>Twin</span>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Right Side - Player Selection & Amount */}
        <div className="space-y-4">
          {/* Bet Type Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Bet Type</label>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setBetType('2D')}
                className={`py-3 rounded-[15px] font-bold text-lg transition-all ${
                  betType === '2D'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                }`}
              >
                2D
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setBetType('3D')}
                className={`py-3 rounded-[15px] font-bold text-lg transition-all ${
                  betType === '3D'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                }`}
              >
                3D
              </motion.button>
            </div>
          </div>

          {/* Player Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Select Player</label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-[15px] bg-gray-50 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">Choose a player...</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Amount (MMK)</label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="Enter bet amount"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-[15px] bg-gray-50 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Quick Amount</label>
            <div className="grid grid-cols-3 gap-2">
              {[1000, 5000, 10000].map((amount) => (
                <motion.button
                  key={amount}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setBetAmount(amount.toString())}
                  className="py-2 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-lg text-sm font-bold text-blue-700 transition-all"
                >
                  {amount.toLocaleString()}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Add Bet Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddBet}
            disabled={!betNumber || !betAmount || !selectedPlayer}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 rounded-[15px] text-white font-bold text-lg shadow-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Bet
          </motion.button>
        </div>
      </div>
    </div>
  );
}
