import { X, Ban, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface BlockedNumbersModalProps {
  agentName: string;
  agentId: string;
  onClose: () => void;
  blockedNumbers: { [agentId: string]: { '2D': string[], '3D': string[] } };
  onUpdateBlockedNumbers: (agentId: string, gameType: '2D' | '3D', numbers: string[]) => void;
}

export function BlockedNumbersModal({ 
  agentName, 
  agentId, 
  onClose, 
  blockedNumbers,
  onUpdateBlockedNumbers 
}: BlockedNumbersModalProps) {
  const [selectedGameType, setSelectedGameType] = useState<'2D' | '3D'>('2D');
  const [inputNumber, setInputNumber] = useState('');

  const currentBlocked = blockedNumbers[agentId] || { '2D': [], '3D': [] };
  const currentList = currentBlocked[selectedGameType] || [];

  const handleAddNumber = () => {
    const trimmed = inputNumber.trim();
    
    // Validate input
    if (selectedGameType === '2D') {
      if (!/^\d{2}$/.test(trimmed)) {
        alert('2D numbers must be exactly 2 digits (00-99)');
        return;
      }
    } else {
      if (!/^\d{3}$/.test(trimmed)) {
        alert('3D numbers must be exactly 3 digits (000-999)');
        return;
      }
    }

    // Check if already blocked
    if (currentList.includes(trimmed)) {
      alert(`Number ${trimmed} is already blocked`);
      return;
    }

    // Add to blocked list
    const updatedList = [...currentList, trimmed].sort();
    onUpdateBlockedNumbers(agentId, selectedGameType, updatedList);
    setInputNumber('');
  };

  const handleRemoveNumber = (number: string) => {
    const updatedList = currentList.filter(n => n !== number);
    onUpdateBlockedNumbers(agentId, selectedGameType, updatedList);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddNumber();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">ပိတ်ကွက်များ - Blocked Numbers</h2>
            <p className="text-red-100 text-sm mt-1">Agent: {agentName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Game Type Tabs */}
        <div className="px-6 pt-4 pb-2 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedGameType('2D')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                selectedGameType === '2D'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              2D Numbers
            </button>
            <button
              onClick={() => setSelectedGameType('3D')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                selectedGameType === '3D'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              3D Numbers
            </button>
          </div>
        </div>

        {/* Add Number Section */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputNumber}
              onChange={(e) => setInputNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedGameType === '2D' ? 'Enter 2D number (00-99)' : 'Enter 3D number (000-999)'}
              maxLength={selectedGameType === '2D' ? 2 : 3}
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
            />
            <button
              onClick={handleAddNumber}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-semibold flex items-center gap-2 shadow-lg"
            >
              <Ban className="w-5 h-5" />
              Block
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {selectedGameType === '2D' 
              ? 'Enter a 2-digit number from 00 to 99' 
              : 'Enter a 3-digit number from 000 to 999'}
          </p>
        </div>

        {/* Blocked Numbers List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">
              Blocked {selectedGameType} Numbers ({currentList.length})
            </h3>
            {currentList.length > 0 && (
              <button
                onClick={() => {
                  if (confirm(`Clear all blocked ${selectedGameType} numbers?`)) {
                    onUpdateBlockedNumbers(agentId, selectedGameType, []);
                  }
                }}
                className="text-xs text-red-600 hover:text-red-700 font-semibold"
              >
                Clear All
              </button>
            )}
          </div>

          {currentList.length > 0 ? (
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {currentList.map((number) => (
                <motion.div
                  key={number}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group"
                >
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-center">
                    <span className="text-lg font-bold text-red-700">{number}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveNumber(number)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Ban className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No blocked {selectedGameType} numbers</p>
              <p className="text-gray-400 text-xs mt-1">Add numbers to block them for this agent</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all font-semibold"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
