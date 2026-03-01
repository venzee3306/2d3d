import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart, Trash2, Plus, AlertTriangle, Star, X, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { generatePattern, getPatternLabel, type PatternType } from '../utils/patterns';
import type { CartItem } from '../data/newMockData';
import { toast } from 'sonner';

interface NewBetScreenProps {
  onNavigate: (screen: string) => void;
  t: (key: string) => string;
  language: 'en' | 'mm';
  cart: CartItem[];
  addToCart: (items: CartItem | CartItem[]) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;
  balance: number;
  placeBets: (sessionId: string) => Promise<boolean>;
  checkBlockedNumber: (number: string, gameType: '2D' | '3D') => any;
  hasBlockedNumbersInCart: () => boolean;
  removeBlockedFromCart: () => void;
  getPayoutRate: (gameType: '2D' | '3D') => any;
  favoriteNumbers: { '2D': string[]; '3D': string[] };
}

export const NewBetScreen: React.FC<NewBetScreenProps> = ({
  onNavigate,
  t,
  language,
  cart,
  addToCart,
  removeFromCart,
  clearCart,
  cartTotal,
  balance,
  placeBets,
  checkBlockedNumber,
  hasBlockedNumbersInCart,
  removeBlockedFromCart,
  getPayoutRate,
  favoriteNumbers
}) => {
  const [gameMode, setGameMode] = useState<'2D' | '3D'>('2D');
  const [round, setRound] = useState<'Morning' | 'Evening'>('Morning');
  const [patternType, setPatternType] = useState<PatternType>('manual');
  const [manualNumber, setManualNumber] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [patternInput, setPatternInput] = useState('');
  const [patternInput2, setPatternInput2] = useState(''); // For natkhat-body tail digit
  const [generatedNumbers, setGeneratedNumbers] = useState<string[]>([]);
  const [bulkAmount, setBulkAmount] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [patternPage, setPatternPage] = useState(0); // For pattern pagination

  const quickAmounts = [1000, 2000, 5000, 10000];
  const maxDigits = gameMode === '2D' ? 2 : 3;

  const patterns2D: PatternType[] = ['manual', 'power-2', 'break-2', 'round', 'khwe', 'apone', 'apout', 'brothers', 'twin'];
  const patterns3D: PatternType[] = ['manual', 'power-3', 'break-3', 'round', 'apone', 'apout', 'brothers', 'twin', 'natkhat-body'];

  const availablePatterns = gameMode === '2D' ? patterns2D : patterns3D;

  // Quick pattern buttons with pagination (3 columns x 2 rows = 6 per page)
  const allQuickPatterns = [
    { id: 'manual', labelMM: 'ကိုယ်တိုင်ရိုက်', color: 'bg-gray-600' },
    { id: 'power-2', labelMM: 'ပါ၀ါ-၂', color: 'bg-blue-500' },
    { id: 'power-3', labelMM: 'ပါ၀ါ-၃', color: 'bg-blue-600' },
    { id: 'break-2', labelMM: 'ထီခွဲ-၂', color: 'bg-purple-500' },
    { id: 'break-3', labelMM: 'ထီခွဲ-၃', color: 'bg-purple-600' },
    { id: 'round', labelMM: 'ပတ်', color: 'bg-orange-500' },
    { id: 'khwe', labelMM: 'ခွေ', color: 'bg-green-500' },
    { id: 'apone', labelMM: 'အပုံး', color: 'bg-teal-500' },
    { id: 'apout', labelMM: 'အပေါက်', color: 'bg-cyan-500' },
    { id: 'brothers', labelMM: 'ညီအစ်ကို', color: 'bg-indigo-500' },
    { id: 'twin', labelMM: 'အမွှာ', color: 'bg-pink-500' },
    { id: 'natkhat-body', labelMM: 'နပ်ခတ်ကိုယ်', color: 'bg-red-500' }
  ];

  const quickPatterns = allQuickPatterns.filter(p => 
    gameMode === '2D' 
      ? !p.id.includes('3') && p.id !== 'natkhat-body' 
      : !p.id.includes('2') || p.id === 'manual'
  );

  const patternsPerPage = 6;
  const totalPages = Math.ceil(quickPatterns.length / patternsPerPage);
  const currentPatterns = quickPatterns.slice(
    patternPage * patternsPerPage, 
    (patternPage + 1) * patternsPerPage
  );

  const handleNextPage = () => {
    if (patternPage < totalPages - 1) {
      setPatternPage(patternPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (patternPage > 0) {
      setPatternPage(patternPage - 1);
    }
  };

  // Generate numbers based on pattern
  const handleGeneratePattern = () => {
    if (!patternInput && patternType !== 'twin') {
      toast.error(t('enterNumber'));
      return;
    }

    const numbers = generatePattern(
      patternType,
      patternInput,
      gameMode === '3D',
      patternInput2
    );

    if (numbers.length === 0) {
      toast.error('Invalid input for selected pattern');
      return;
    }

    setGeneratedNumbers(numbers);
    toast.success(`${numbers.length} ${t('numbersGenerated')}`);
  };

  // Add manual bet
  const handleAddManualBet = () => {
    if (manualNumber.length !== maxDigits) {
      toast.error(`Please enter ${maxDigits} digits`);
      return;
    }

    const amount = parseInt(manualAmount);
    if (!amount || amount <= 0) {
      toast.error(t('invalidAmount'));
      return;
    }

    // Check if blocked
    const blocked = checkBlockedNumber(manualNumber, gameMode);
    if (blocked) {
      toast.error(`${t('numberBlocked')}: ${language === 'mm' ? blocked.reasonMM : blocked.reason}`);
      return;
    }

    const cartItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      gameMode,
      number: manualNumber,
      amount,
      pattern: {
        type: 'manual',
        input: manualNumber,
        label: getPatternLabel('manual').en,
        labelMM: getPatternLabel('manual').mm
      }
    };

    addToCart(cartItem);
    toast.success(t('addToCart'));
    setManualNumber('');
    setManualAmount('');
  };

  // Add generated numbers to cart
  const handleAddGeneratedToCart = () => {
    if (generatedNumbers.length === 0) {
      toast.error('Please generate numbers first');
      return;
    }

    const amount = parseInt(bulkAmount);
    if (!amount || amount <= 0) {
      toast.error(t('invalidAmount'));
      return;
    }

    const patternLabel = getPatternLabel(patternType);
    const cartItems: CartItem[] = generatedNumbers.map(number => {
      const blocked = checkBlockedNumber(number, gameMode);
      if (blocked) return null;

      return {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        gameMode,
        number,
        amount,
        pattern: {
          type: patternType,
          input: patternInput,
          label: patternLabel.en,
          labelMM: patternLabel.mm
        }
      };
    }).filter(Boolean) as CartItem[];

    if (cartItems.length === 0) {
      toast.error('All generated numbers are blocked');
      return;
    }

    const blockedCount = generatedNumbers.length - cartItems.length;
    addToCart(cartItems);
    
    if (blockedCount > 0) {
      toast.warning(`Added ${cartItems.length} numbers. ${blockedCount} blocked numbers skipped.`);
    } else {
      toast.success(`${cartItems.length} ${t('addToCart')}`);
    }

    setGeneratedNumbers([]);
    setBulkAmount('');
    setPatternInput('');
    setPatternInput2('');
  };

  // Add favorite to cart
  const handleAddFavorite = (number: string) => {
    setManualNumber(number);
  };

  // Confirm and place bets
  const handleConfirmBets = () => {
    if (cart.length === 0) {
      toast.error(t('cartEmpty'));
      return;
    }

    if (cartTotal > balance) {
      toast.error(t('insufficientBalance'));
      return;
    }

    setShowConfirm(true);
  };

  const [isPlacing, setIsPlacing] = useState(false);
  const handlePlaceBets = async () => {
    const sessionId = `session-${Date.now()}`;
    setIsPlacing(true);
    try {
      const success = await placeBets(sessionId);
      if (success) {
        toast.success(t('betPlaced'));
        setShowConfirm(false);
        setTimeout(() => onNavigate('dashboard'), 1000);
      } else {
        toast.error(t('betFailed'));
      }
    } catch {
      toast.error(t('betFailed'));
    } finally {
      setIsPlacing(false);
    }
  };

  const payoutRate = getPayoutRate(gameMode);

  return (
    <div className="min-h-screen bg-gray-50 lg:bg-transparent pb-24 lg:pb-6">
      {/* Player Info Bar - Balance Display at Top */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 lg:px-8 pt-12 pb-6 shadow-lg sticky top-0 z-20">
        <div className="max-w-5xl mx-auto">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => onNavigate('dashboard')} className="text-white p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-white font-bold text-xl">{t('placeBet')}</h1>
            <button onClick={() => setShowCart(true)} className="relative text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ShoppingCart size={24} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                  {cart.length}
                </span>
              )}
            </button>
          </div>

          {/* Balance Info Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center text-white">
              <div>
                <p className="text-sm opacity-90 mb-1">{language === 'mm' ? 'ကစားသမား' : 'Player'}</p>
                <p className="text-lg font-bold">{language === 'mm' ? t('player') : 'You'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90 mb-1">{t('balance')}</p>
                <p className="text-xl font-bold">{balance.toLocaleString()} <span className="text-sm opacity-80">MMK</span></p>
              </div>
            </div>
          </div>

          {/* Game Mode Toggle */}
          <div className="flex gap-3 mb-3">
            <button
              onClick={() => {
                setGameMode('2D');
                setGeneratedNumbers([]);
                setPatternType('manual');
              }}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                gameMode === '2D'
                  ? 'bg-white text-blue-700 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              2D (၂လုံး)
            </button>
            <button
              onClick={() => {
                setGameMode('3D');
                setGeneratedNumbers([]);
                setPatternType('manual');
              }}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                gameMode === '3D'
                  ? 'bg-white text-blue-700 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              3D (၃လုံး)
            </button>
          </div>

          {/* Round Selection */}
          <div className="flex gap-3">
            <button
              onClick={() => setRound('Morning')}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                round === 'Morning'
                  ? 'bg-white text-blue-700 shadow-md'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {language === 'mm' ? 'နံနက်' : 'Morning'}
            </button>
            <button
              onClick={() => setRound('Evening')}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                round === 'Evening'
                  ? 'bg-white text-blue-700 shadow-md'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {language === 'mm' ? 'ညနေ' : 'Evening'}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-5xl mx-auto">
        {/* Payout Rate Display */}
        {payoutRate && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-6">
            <p className="text-amber-900 font-semibold text-sm mb-1">{t('payoutRate')}</p>
            <p className="text-amber-900 font-bold text-2xl">
              {payoutRate.multiplier}x
            </p>
            <p className="text-amber-700 text-xs mt-1">
              {language === 'mm' ? payoutRate.descriptionMM : payoutRate.description}
            </p>
          </div>
        )}

        {/* Quick Pattern Buttons - 3x2 Grid with Left/Right Navigation */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-gray-900">
              {language === 'mm' ? 'အမြန်ပုံစံများ' : 'Select Pattern'}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={patternPage === 0}
                className={`p-2 rounded-lg transition-all ${
                  patternPage === 0
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-xs text-gray-500 min-w-[40px] text-center">
                {patternPage + 1} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={patternPage === totalPages - 1}
                className={`p-2 rounded-lg transition-all ${
                  patternPage === totalPages - 1
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          {/* 3 columns x 2 rows grid */}
          <div className="grid grid-cols-3 gap-3">
            {currentPatterns.map(pattern => (
              <button
                key={pattern.id}
                onClick={() => {
                  setPatternType(pattern.id as PatternType);
                  setGeneratedNumbers([]);
                  setPatternInput('');
                  setPatternInput2('');
                }}
                className={`py-4 px-2 rounded-xl font-bold text-sm text-white
                           hover:opacity-90 active:scale-95 transition-all shadow-md
                           ${pattern.id === patternType ? 'ring-4 ring-offset-2 ring-blue-300' : ''}
                           ${pattern.color}`}
                style={{ fontFamily: 'Padauk, Noto Sans Myanmar' }}
              >
                {pattern.labelMM}
              </button>
            ))}
          </div>
        </div>

        {/* Betting Interface */}
        {patternType === 'manual' ? (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 mb-6">
            <p className="text-gray-900 font-bold mb-3">{t('manual')}</p>
            
            <div className="mb-4">
              <label className="text-gray-700 font-semibold mb-2 block text-sm">{t('betNumber')}</label>
              <input
                type="text"
                value={manualNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, maxDigits);
                  setManualNumber(val);
                }}
                placeholder={gameMode === '2D' ? '00-99' : '000-999'}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-xl font-bold text-center"
                maxLength={maxDigits}
              />
            </div>

            <div className="mb-4">
              <label className="text-gray-700 font-semibold mb-2 block text-sm">{t('amount')}</label>
              <input
                type="number"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-xl font-bold"
              />
              <div className="flex gap-2 mt-2">
                {quickAmounts.map(amt => (
                  <button
                    key={amt}
                    onClick={() => setManualAmount(amt.toString())}
                    className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-900 font-semibold text-sm"
                  >
                    {amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddManualBet}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3.5 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              {t('addToCart')}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 mb-6">
            <p className="text-gray-900 font-bold mb-3">
              {language === 'mm' ? getPatternLabel(patternType).mm : getPatternLabel(patternType).en}
            </p>

            {patternType === 'natkhat-body' ? (
              <>
                <div className="mb-4">
                  <label className="text-gray-700 font-semibold mb-2 block text-sm">{t('headDigit')}</label>
                  <input
                    type="text"
                    value={patternInput}
                    onChange={(e) => setPatternInput(e.target.value.replace(/\D/g, '').slice(0, 1))}
                    placeholder="0-9"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-xl font-bold text-center"
                    maxLength={1}
                  />
                </div>
                <div className="mb-4">
                  <label className="text-gray-700 font-semibold mb-2 block text-sm">{t('tailDigit')}</label>
                  <input
                    type="text"
                    value={patternInput2}
                    onChange={(e) => setPatternInput2(e.target.value.replace(/\D/g, '').slice(0, 1))}
                    placeholder="0-9"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-xl font-bold text-center"
                    maxLength={1}
                  />
                </div>
              </>
            ) : patternType !== 'twin' && (
              <div className="mb-4">
                <label className="text-gray-700 font-semibold mb-2 block text-sm">{t('inputDigit')}</label>
                <input
                  type="text"
                  value={patternInput}
                  onChange={(e) => setPatternInput(e.target.value.replace(/\D/g, '').slice(0, maxDigits))}
                  placeholder={gameMode === '2D' ? '1-2 digits' : '1-3 digits'}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-xl font-bold text-center"
                />
              </div>
            )}

            <button
              onClick={handleGeneratePattern}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 mb-4"
            >
              <Sparkles size={20} />
              Generate Numbers
            </button>

            {generatedNumbers.length > 0 && (
              <>
                <div className="bg-gray-50 rounded-xl p-4 mb-4 max-h-48 overflow-y-auto scrollbar-hide">
                  <p className="text-gray-700 font-semibold text-sm mb-2">
                    {generatedNumbers.length} {t('numbersGenerated')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {generatedNumbers.slice(0, 20).map((num, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900 font-semibold text-sm">
                        {num}
                      </span>
                    ))}
                    {generatedNumbers.length > 20 && (
                      <span className="px-3 py-1.5 bg-gray-200 rounded-lg text-gray-600 text-sm">
                        +{generatedNumbers.length - 20} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-gray-700 font-semibold mb-2 block text-sm">{t('amount')} ({t('each')})</label>
                  <input
                    type="number"
                    value={bulkAmount}
                    onChange={(e) => setBulkAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-xl font-bold"
                  />
                  <div className="flex gap-2 mt-2">
                    {quickAmounts.map(amt => (
                      <button
                        key={amt}
                        onClick={() => setBulkAmount(amt.toString())}
                        className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-900 font-semibold text-sm"
                      >
                        {amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAddGeneratedToCart}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3.5 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  {t('addToCart')} ({generatedNumbers.length} {t('numbersGenerated')})
                </button>
              </>
            )}
          </div>
        )}

        {/* Favorites */}
        {favoriteNumbers[gameMode].length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Star className="text-amber-500" size={20} />
              <p className="text-gray-900 font-bold">{t('favorites')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {favoriteNumbers[gameMode].map(num => (
                <button
                  key={num}
                  onClick={() => handleAddFavorite(num)}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-amber-900 font-semibold"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-emerald-900 font-bold text-lg">{cart.length} {t('itemsInCart')}</p>
                <p className="text-emerald-700 text-sm">{t('total')}: {cartTotal.toLocaleString()} MMK</p>
              </div>
              {hasBlockedNumbersInCart() && (
                <button
                  onClick={removeBlockedFromCart}
                  className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1"
                >
                  <AlertTriangle size={16} />
                  {t('removeBlocked')}
                </button>
              )}
            </div>
            <button
              onClick={handleConfirmBets}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold shadow-lg"
            >
              {t('confirmBets')}
            </button>
          </div>
        )}
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-[430px] max-h-[85vh] flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-gray-900 font-bold text-xl">{t('cart')} ({cart.length})</h2>
              <button onClick={() => setShowCart(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500">{t('cartEmpty')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => {
                    const blocked = checkBlockedNumber(item.number, item.gameMode);
                    return (
                      <div
                        key={item.id}
                        className={`bg-gray-50 rounded-xl p-4 flex items-center justify-between ${
                          blocked ? 'border-2 border-red-300 bg-red-50' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-gray-900">{item.number}</span>
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                              {item.gameMode}
                            </span>
                            {blocked && (
                              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                                <AlertTriangle size={12} />
                                {t('numberBlocked')}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">{item.amount.toLocaleString()} MMK</p>
                          {item.pattern && (
                            <p className="text-gray-500 text-xs">
                              {language === 'mm' ? item.pattern.labelMM : item.pattern.label}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-5 rounded-b-3xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-700 font-semibold">{t('total')}</span>
                  <span className="text-gray-900 font-bold text-2xl">{cartTotal.toLocaleString()} MMK</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={clearCart}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-xl font-semibold"
                  >
                    {t('clearCart')}
                  </button>
                  <button
                    onClick={() => {
                      setShowCart(false);
                      handleConfirmBets();
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
                  >
                    {t('confirm')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6">
            <h2 className="text-gray-900 font-bold text-2xl mb-4">{t('confirmBets')}</h2>
            
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 mb-5">
              <div className="flex justify-between mb-3">
                <span className="text-gray-700">Game Type:</span>
                <span className="font-semibold text-gray-900">{gameMode}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-gray-700">Round:</span>
                <span className="font-semibold text-gray-900">{round}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-gray-700">Total Bets:</span>
                <span className="font-semibold text-gray-900">{cart.length}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-gray-700">Total Amount:</span>
                <span className="font-bold text-lg text-gray-900">{cartTotal.toLocaleString()} MMK</span>
              </div>
              <div className="h-px bg-gray-300 my-3"></div>
              <div className="flex justify-between">
                <span className="text-gray-700">Balance After:</span>
                <span className={`font-bold text-lg ${
                  balance - cartTotal >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {(balance - cartTotal).toLocaleString()} MMK
                </span>
              </div>
            </div>

            {balance - cartTotal < 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center gap-2">
                <AlertTriangle className="text-red-600" size={20} />
                <p className="text-red-700 text-sm font-semibold">{t('insufficientBalance')}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-4 rounded-xl font-bold"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handlePlaceBets}
                disabled={balance - cartTotal < 0 || isPlacing}
                className={`flex-1 py-4 rounded-xl font-bold ${
                  balance - cartTotal >= 0 && !isPlacing
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isPlacing
                  ? (language === 'mm' ? 'တင်နေသည်...' : 'Placing...')
                  : language === 'mm'
                    ? 'ကျွန်ုပ်၏ထိုးငွေများ တင်မည်'
                    : `Submit My Bets (${cart.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};