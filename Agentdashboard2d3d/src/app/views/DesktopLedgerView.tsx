import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface DesktopLedgerViewProps {
  agentName: string;
  onBack?: () => void;
}

export function DesktopLedgerView({ agentName, onBack }: DesktopLedgerViewProps) {
  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 shadow-lg flex-shrink-0">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              လေဂျာ
            </h1>
            <p className="text-sm text-blue-100">Ledger for {agentName}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-center">Ledger view coming soon...</p>
        </div>
      </div>
    </div>
  );
}
