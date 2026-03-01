import { ShoppingCart, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CartItem {
  id: string;
  player: string;
  gameMode: '2D' | '3D';
  number: string;
  amount: number;
}

interface BetEntryCartPanelProps {
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onSubmit: () => void;
}

export function BetEntryCartPanel({ items, onRemoveItem, onSubmit }: BetEntryCartPanelProps) {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const commissionRate = 0.15;
  const commission = subtotal * commissionRate;
  const total = subtotal + commission;

  return (
    <div className="h-screen bg-gradient-to-b from-gray-50 to-white border-l-2 border-gray-200 flex flex-col shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <ShoppingCart className="w-6 h-6 text-white" />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                {items.length}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-white">Bet Cart</h2>
        </div>
        <p className="text-sm text-blue-100">Review your bets before submission</p>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center py-12"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-500 font-bold text-lg mb-1">Cart is Empty</p>
              <p className="text-sm text-gray-400">Add bets to get started</p>
            </motion.div>
          ) : (
            items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${
                          item.gameMode === '2D'
                            ? 'bg-blue-100 text-blue-700 border-blue-300'
                            : 'bg-purple-100 text-purple-700 border-purple-300'
                        }`}
                      >
                        {item.gameMode}
                      </span>
                      <span className="text-sm text-gray-500 font-medium">{item.player}</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">{item.number}</div>
                    <div className="text-lg font-bold text-gray-800">{item.amount.toLocaleString()} MMK</div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onRemoveItem(item.id)}
                    className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Summary & Submit */}
      <div className="border-t-2 border-gray-200 p-6 bg-white">
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-semibold">Subtotal</span>
            <span className="text-lg font-bold text-gray-800">{subtotal.toLocaleString()} MMK</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-semibold">Commission (15%)</span>
            <span className="text-lg font-bold text-blue-600">+{commission.toLocaleString()} MMK</span>
          </div>
          <div className="h-px bg-gray-300"></div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-gray-800 font-bold text-lg">Total</span>
            <span className="text-3xl font-bold text-green-600">{total.toLocaleString()} MMK</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSubmit}
          disabled={items.length === 0}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          Submit Bets ({items.length})
        </motion.button>
      </div>
    </div>
  );
}
