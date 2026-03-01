import { TrendingUp, DollarSign, Circle } from 'lucide-react';
import { motion } from 'motion/react';

interface LiveRoundHeaderProps {
  type: '2D' | '3D';
  winningNumber: string;
  status: 'OPEN' | 'CLOSED';
  totalMMK: number;
  totalPayouts: number;
}

export function LiveRoundHeader({ type, winningNumber, status, totalMMK, totalPayouts }: LiveRoundHeaderProps) {
  const isOpen = status === 'OPEN';
  const colorScheme = type === '2D' 
    ? { gradient: 'from-[#2563EB] to-[#1E40AF]', bg: 'bg-[#2563EB]', text: 'text-[#2563EB]', border: 'border-[#2563EB]' }
    : { gradient: 'from-[#7C3AED] to-[#6D28D9]', bg: 'bg-[#7C3AED]', text: 'text-[#7C3AED]', border: 'border-[#7C3AED]' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[15px] shadow-lg border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${colorScheme.gradient} p-5`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Live {type} Round</h2>
            <p className="text-sm text-white/80">Current lottery session</p>
          </div>
          <div
            className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
              isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            <Circle className={`w-3 h-3 ${isOpen ? 'fill-white' : 'fill-white'}`} />
            {status}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Winning Number */}
        <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-[15px] border border-gray-200">
          <p className="text-sm font-semibold text-gray-600 mb-2">Winning Number</p>
          <p className={`text-4xl font-bold ${colorScheme.text}`}>{winningNumber}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total MMK Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[15px] p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs font-bold text-gray-600 uppercase">Total MMK</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{totalMMK.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Total bets placed</p>
          </div>

          {/* Total Payouts Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-[15px] p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs font-bold text-gray-600 uppercase">Total Payouts</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{totalPayouts.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Amount paid out</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
