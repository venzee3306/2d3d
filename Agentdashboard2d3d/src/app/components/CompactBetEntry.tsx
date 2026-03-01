import { Plus, RotateCw, BarChart3, Circle, ArrowLeft, Grid3x3, Repeat, ShoppingCart, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

interface CartItem {
  id: string;
  player: string;
  gameMode: '2D' | '3D';
  number: string;
  amount: number;
}

interface CompactBetEntryProps {
  onSubmitBets: (items: CartItem[]) => void;
}

export function CompactBetEntry({ onSubmitBets }: CompactBetEntryProps) {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [gameMode, setGameMode] = useState<'2D' | '3D'>('2D');
  const [betNumber, setBetNumber] = useState('');
  const [betAmount, setBetAmount] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // Confirm Dialog State
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

  const handleAddToCart = () => {
    if (betNumber && betAmount && selectedPlayer) {
      const newItem: CartItem = {
        id: `${Date.now()}-${Math.random()}`,
        player: selectedPlayer,
        gameMode,
        number: betNumber,
        amount: parseInt(betAmount),
      };
      setCartItems([...cartItems, newItem]);
      setBetNumber('');
      setBetAmount('');
    }
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const handlePattern = (type: string) => {
    console.log(`Apply ${type} pattern to ${betNumber}`);
  };

  const handleSubmit = () => {
    if (cartItems.length > 0) {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmSubmit = () => {
    onSubmitBets(cartItems);
    setCartItems([]);
    setShowConfirmDialog(false);
  };

  const handleCancelSubmit = () => {
    setShowConfirmDialog(false);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.amount, 0);
  const commission = subtotal * 0.15;
  const total = subtotal + commission;

  return (
    <div className="flex-1 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Bet Entry</h1>
      </div>

      {/* Main Content */}
      <div className="p-4 h-[calc(100vh-76px)] flex flex-col">
        {/* Top Row - Player & Amount */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Select Player</label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose...</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Amount (MMK)</label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Game Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setGameMode('2D')}
                className={`py-2 rounded-lg font-bold text-sm transition-all ${
                  gameMode === '2D'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              >
                2D
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setGameMode('3D')}
                className={`py-2 rounded-lg font-bold text-sm transition-all ${
                  gameMode === '3D'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              >
                3D
              </motion.button>
            </div>
          </div>
        </div>

        {/* Middle Row - Keypad & Cart */}
        <div className="grid grid-cols-2 gap-4 flex-1">
          {/* Left Side - Keypad & Patterns */}
          <div className="flex flex-col">
            {/* Number Display */}
            <div className="mb-2">
              <div className="w-full px-4 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg text-center">
                <span className="text-3xl font-bold text-blue-600 tracking-[0.3em]">
                  {betNumber || '---'}
                </span>
              </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <motion.button
                  key={num}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNumberPad(num.toString())}
                  className="py-3 bg-white hover:bg-blue-50 border border-gray-300 hover:border-blue-400 rounded-lg text-xl font-bold text-gray-700 hover:text-blue-600 transition-all shadow-sm"
                >
                  {num}
                </motion.button>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClear}
                className="py-3 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-bold text-white transition-all shadow-sm"
              >
                CLR
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNumberPad('0')}
                className="py-3 bg-white hover:bg-blue-50 border border-gray-300 hover:border-blue-400 rounded-lg text-xl font-bold text-gray-700 hover:text-blue-600 transition-all shadow-sm"
              >
                0
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackspace}
                className="py-3 bg-yellow-500 hover:bg-yellow-600 rounded-lg text-sm font-bold text-white transition-all shadow-sm"
              >
                ⌫
              </motion.button>
            </div>

            {/* Add to Cart Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleAddToCart}
              disabled={!betNumber || !betAmount || !selectedPlayer}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 rounded-lg text-white font-bold text-sm shadow-md transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-2"
            >
              <Plus className="w-4 h-4" />
              Add to Cart
            </motion.button>

            {/* Quick Add Patterns */}
            <div className="grid grid-cols-3 gap-1.5">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePattern('group')}
                className="py-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-[10px] text-white font-bold shadow-sm text-xs"
                style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
              >
                <div className="flex items-center justify-center gap-1">
                  <Grid3x3 className="w-3 h-3" />
                  <span>အုပ်စု</span>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePattern('top')}
                className="py-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-[10px] text-white font-bold shadow-sm text-xs"
                style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
              >
                <div className="flex items-center justify-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  <span>ထိပ်</span>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePattern('break')}
                className="py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-[10px] text-white font-bold shadow-sm text-xs"
                style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
              >
                <div className="flex items-center justify-center gap-1">
                  <Circle className="w-3 h-3" />
                  <span>ဘြိတ်</span>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(249, 115, 22, 0.5)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePattern('back')}
                className="py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-[10px] text-white font-bold shadow-sm text-xs"
                style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
              >
                <div className="flex items-center justify-center gap-1">
                  <ArrowLeft className="w-3 h-3" />
                  <span>နောက်</span>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(236, 72, 153, 0.5)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePattern('power')}
                className="py-2 bg-gradient-to-r from-pink-500 to-pink-600 rounded-[10px] text-white font-bold shadow-sm text-xs"
                style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
              >
                <div className="flex items-center justify-center gap-1">
                  <Repeat className="w-3 h-3" />
                  <span>ပါတ်</span>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(34, 197, 94, 0.5)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePattern('reverse')}
                className="py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-[10px] text-white font-bold shadow-sm text-xs"
              >
                <div className="flex items-center justify-center gap-1">
                  <RotateCw className="w-3 h-3" />
                  <span className="text-sm font-bold">R</span>
                </div>
              </motion.button>
            </div>
          </div>

          {/* Right Side - Cart Preview */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-md flex flex-col overflow-hidden">
            {/* Cart Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-white" />
                <h3 className="text-sm font-bold text-white">Bet Cart ({cartItems.length})</h3>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <AnimatePresence>
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mb-2" />
                    <p className="text-xs text-gray-500 font-medium">Cart is Empty</p>
                  </div>
                ) : (
                  cartItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.03 }}
                      className="bg-gray-50 rounded-lg p-2 border border-gray-200 hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold ${
                                item.gameMode === '2D'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}
                            >
                              {item.gameMode}
                            </span>
                            <span className="text-xs text-gray-500 truncate">{item.player}</span>
                          </div>
                          <div className="text-xl font-bold text-blue-600 mb-0.5">{item.number}</div>
                          <div className="text-sm font-bold text-gray-800">{item.amount.toLocaleString()} MMK</div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemoveItem(item.id)}
                          className="w-6 h-6 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors"
                        >
                          <X className="w-3 h-3 text-red-600" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Cart Summary */}
            <div className="border-t border-gray-200 px-3 py-2 bg-gray-50">
              <div className="space-y-1 text-xs mb-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Subtotal</span>
                  <span className="font-bold text-gray-800">{subtotal.toLocaleString()} MMK</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Commission (15%)</span>
                  <span className="font-bold text-blue-600">+{commission.toLocaleString()} MMK</span>
                </div>
                <div className="h-px bg-gray-300 my-1"></div>
                <div className="flex justify-between">
                  <span className="text-gray-800 font-bold">Total</span>
                  <span className="text-lg font-bold text-green-600">{total.toLocaleString()} MMK</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleSubmit}
                disabled={cartItems.length === 0}
                className="w-full py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 rounded-lg text-white font-bold text-sm shadow-md transition-all disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                Submit Bets ({cartItems.length})
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="အတည်ပြုမည်"
        message={`${gameMode} ဂဏန်း ${cartItems.length}ခုကို ${cartItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString()} ကျပ်ဖြင့် ထည့်သွင်းမည်လား?

Do you want to submit ${cartItems.length} bets with total amount ${cartItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString()} MMK?`}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
        confirmText="Yes"
        cancelText="No"
        type="info"
      />
    </div>
  );
}
