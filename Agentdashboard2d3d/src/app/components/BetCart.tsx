import { ShoppingCart, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CartItem {
  id: string;
  number: string;
  amount: number;
}

interface BetCartProps {
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onSubmit: () => void;
}

export function BetCart({ items, onRemoveItem, onSubmit }: BetCartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const commissionRate = 0.15;
  const commission = subtotal * commissionRate;
  const total = subtotal - commission;

  return (
    <div className="w-96 h-screen bg-gradient-to-b from-gray-50 to-white border-l border-gray-200 flex flex-col shadow-xl">
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
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-1">Add bets to get started</p>
            </motion.div>
          ) : (
            items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-4 shadow-md border border-gray-200 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-blue-600">{item.number}</span>
                    </div>
                    <p className="text-lg font-bold text-gray-800">
                      {item.amount.toLocaleString()} MMK
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
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
      <div className="border-t border-gray-200 p-6 bg-white">
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Subtotal</span>
            <span className="text-lg font-bold text-gray-800">{subtotal.toLocaleString()} MMK</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Commission (15%)</span>
            <span className="text-lg font-bold text-red-600">-{commission.toLocaleString()} MMK</span>
          </div>
          <div className="h-px bg-gray-200"></div>
          <div className="flex justify-between items-center">
            <span className="text-gray-800 font-bold">Total</span>
            <span className="text-2xl font-bold text-green-600">{total.toLocaleString()} MMK</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSubmit}
          disabled={items.length === 0}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          Submit Bets ({items.length})
        </motion.button>
      </div>
    </div>
  );
}
