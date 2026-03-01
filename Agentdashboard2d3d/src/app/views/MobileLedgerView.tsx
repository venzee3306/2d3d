import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface MobileLedgerViewProps {
  agentName: string;
  onBack?: () => void;
}

export function MobileLedgerView({ agentName, onBack }: MobileLedgerViewProps) {
  return (
    <div className="w-full max-w-[375px] h-[812px] bg-[#F5F7FA] flex flex-col mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 shadow-lg flex-shrink-0">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          <div>
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              လေဂျာ
            </h1>
            <p className="text-xs text-blue-100">Ledger for {agentName}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-gray-600 text-center text-sm">Ledger view coming soon...</p>
        </div>
      </div>
    </div>
  );
}
