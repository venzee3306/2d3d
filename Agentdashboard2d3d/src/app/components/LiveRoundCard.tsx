import { Clock, Circle } from 'lucide-react';
import { motion } from 'motion/react';

interface LiveRoundCardProps {
  type: '2D' | '3D';
  session: 'Morning' | 'Evening';
  status: 'OPEN' | 'CLOSED';
  closingTime: string;
}

export function LiveRoundCard({ type, session, status, closingTime }: LiveRoundCardProps) {
  const isOpen = status === 'OPEN';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              type === '2D'
                ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                : 'bg-gradient-to-br from-purple-500 to-purple-600'
            }`}
          >
            <span className="text-white font-bold text-sm">{type}</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Live {type} Round</h3>
            <p className="text-xs text-gray-500">{session} Draw</p>
          </div>
        </div>
        <div
          className={`px-3 py-1.5 rounded-full text-xs font-bold ${
            isOpen
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Circle className={`w-2 h-2 ${isOpen ? 'fill-green-500' : 'fill-red-500'}`} />
            {status}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
        <Clock className="w-4 h-4" />
        <span className="font-medium">Closes at: {closingTime}</span>
      </div>

      {isOpen && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: 300, ease: 'linear' }}
          className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-3 origin-left"
        />
      )}
    </motion.div>
  );
}
