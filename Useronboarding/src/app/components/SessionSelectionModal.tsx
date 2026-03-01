import React from 'react';
import { Clock, Sun, Moon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SessionSelectionModalProps {
  onSelectSession: (session: 'AM' | 'PM') => void;
  onClose: () => void;
  language: 'en' | 'mm';
}

export const SessionSelectionModal: React.FC<SessionSelectionModalProps> = ({
  onSelectSession,
  onClose,
  language
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl w-full max-w-lg p-8 relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Clock Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
            <Clock className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 myanmar-font">
            {language === 'mm' ? 'ဘယ် Session မှာ ထိုးမယ်လဲ?' : 'Which Session?'}
          </h2>
          <p className="text-gray-600">
            {language === 'mm' ? 'လောင်းကစားမည့် အချိန်ကို ရွေးချယ်ပါ' : 'Select betting session'}
          </p>
        </div>

        {/* Session Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* AM Session */}
          <button
            onClick={() => onSelectSession('AM')}
            className="group relative overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 rounded-2xl p-8 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            {/* Sun Icon Background */}
            <div className="absolute top-6 right-6 w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Sun className="w-8 h-8 text-white" />
            </div>

            <div className="relative z-10 text-left">
              <h3 className="text-3xl font-bold mb-2">AM Session</h3>
              <p className="text-white/90 text-sm mb-4 myanmar-font">
                {language === 'mm' ? 'နံနက်ပိုင်း Draw' : 'Morning Draw'}
              </p>
              <div className="inline-block bg-white/25 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-sm font-semibold">Draw: 12:01 PM</p>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          </button>

          {/* PM Session */}
          <button
            onClick={() => onSelectSession('PM')}
            className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 rounded-2xl p-8 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            {/* Moon Icon Background */}
            <div className="absolute top-6 right-6 w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Moon className="w-8 h-8 text-white" />
            </div>

            <div className="relative z-10 text-left">
              <h3 className="text-3xl font-bold mb-2">PM Session</h3>
              <p className="text-white/90 text-sm mb-4 myanmar-font">
                {language === 'mm' ? 'ညနေပိုင်း Draw' : 'Evening Draw'}
              </p>
              <div className="inline-block bg-white/25 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-sm font-semibold">Draw: 4:30 PM</p>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          </button>
        </div>

        {/* Info Text */}
        <p className="text-center text-gray-500 text-sm mt-6">
          {language === 'mm' 
            ? 'သင်သည် နောက်မှ Session ကို ပြောင်းလဲနိုင်ပါသည်' 
            : 'You can change the session later'}
        </p>
      </motion.div>
    </div>
  );
};
