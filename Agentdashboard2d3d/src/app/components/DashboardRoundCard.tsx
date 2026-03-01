import { Circle, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardRoundCardProps {
  type: '2D' | '3D';
}

export function DashboardRoundCard({ type }: DashboardRoundCardProps) {
  const colorScheme =
    type === '2D'
      ? { gradient: 'from-[#2563EB] to-[#1E40AF]', text: 'text-[#2563EB]' }
      : { gradient: 'from-[#7C3AED] to-[#6D28D9]', text: 'text-[#7C3AED]' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${colorScheme.gradient} p-5`}>
        <h2 className="text-2xl font-bold text-white">Live {type} Round</h2>
        <p className="text-sm text-white/80 mt-1">Current lottery session</p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Morning Round */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <h3 className="font-bold text-gray-800">Morning Round</h3>
            </div>
            <span className="text-sm font-semibold text-gray-600">12:00 PM</span>
          </div>
          <div className="mb-2">
            <p className="text-xs text-gray-500 mb-1">Winning Number</p>
            <p className={`text-3xl font-bold ${colorScheme.text}`}>Pending</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 border border-green-300 rounded-full text-xs font-bold">
              <Circle className="w-2 h-2 fill-green-600" />
              OPEN
            </span>
          </div>
        </div>

        {/* Evening Round */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <h3 className="font-bold text-gray-800">Evening Round</h3>
            </div>
            <span className="text-sm font-semibold text-gray-600">4:30 PM</span>
          </div>
          <div className="mb-2">
            <p className="text-xs text-gray-500 mb-1">Winning Number</p>
            <p className={`text-3xl font-bold ${colorScheme.text}`}>Pending</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 border border-red-300 rounded-full text-xs font-bold">
              <Circle className="w-2 h-2 fill-red-600" />
              CLOSED
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
