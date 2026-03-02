import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  mockPlayer,
  mockBets,
  mockTransactions,
  mockDailyResults,
  mockPayoutRates,
  mockBlockedNumbers,
  mockFavoriteNumbers,
  isNumberBlocked,
  calculateWinAmount,
  type Player,
  type Bet,
  type CartItem,
  type Transaction,
  type DailyResult,
  type PayoutRate,
  type BlockedNumber
} from '../data/newMockData';
import { userApi, setAuthToken, getAuthToken, mapApiPlayerToPlayer } from '../api/client';
import { translations, type Language } from '../data/newTranslations';
import type { PatternType } from '../utils/patterns';

interface AppContextType {
  // Auth
  player: Player | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshPlayer: () => Promise<void>;
  
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  
  // Balance
  balance: number;
  updateBalance: (amount: number) => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (items: CartItem | CartItem[]) => void;
  removeFromCart: (id: string) => void;
  updateCartItem: (id: string, amount: number) => void;
  clearCart: () => void;
  cartTotal: number;
  
  // Bets
  bets: Bet[];
  activeBets: Bet[];
  pastBets: Bet[];
  placeBets: (sessionId: string) => Promise<boolean>;
  getBetsBySession: (sessionId: string) => Bet[];
  
  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  
  // Results
  dailyResults: DailyResult[];
  getTodayResults: () => DailyResult[];
  
  // Payout Rates
  payoutRates: PayoutRate[];
  getPayoutRate: (gameType: '2D' | '3D') => PayoutRate | undefined;
  
  // Blocked Numbers
  blockedNumbers: BlockedNumber[];
  checkBlockedNumber: (number: string, gameType: '2D' | '3D') => BlockedNumber | null;
  hasBlockedNumbersInCart: () => boolean;
  removeBlockedFromCart: () => void;
  
  // Favorites
  favoriteNumbers: typeof mockFavoriteNumbers;
  addToFavorites: (number: string, gameType: '2D' | '3D') => void;
  removeFromFavorites: (number: string, gameType: '2D' | '3D') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>('en');
  const [balance, setBalance] = useState<number>(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [favoriteNumbers, setFavoriteNumbers] = useState(mockFavoriteNumbers);

  // Restore session on mount: try me() with credentials (cookie sent by browser)
  React.useEffect(() => {
    userApi
      .me()
      .then(async apiPlayer => {
        setAuthToken('cookie');
        const p = mapApiPlayerToPlayer(apiPlayer);
        setPlayer(p);
        setBalance(p.balance);
        setIsAuthenticated(true);
        const [betsRes, txRes] = await Promise.all([userApi.getBets(), userApi.getTransactions()]);
        if (Array.isArray(betsRes)) {
          setBets(
            betsRes.map(b => ({
              id: b.id,
              playerId: b.player_id,
              playerName: p.name,
              gameType: b.game_type as '2D' | '3D',
              betNumber: b.bet_number,
              amount: b.amount,
              round: (b.round_name === 'Evening' ? 'Evening' : 'Morning') as 'Morning' | 'Evening',
              placedAt: b.placed_at,
              status: b.status as 'Pending' | 'Won' | 'Lost',
              sessionId: b.session_id ?? undefined,
              winAmount: b.win_amount ?? undefined,
            }))
          );
        }
        if (Array.isArray(txRes)) {
          setTransactions(
            txRes.map(t => ({
              id: t.id,
              playerId: t.player_id,
              type: t.type as 'deposit' | 'bet' | 'win' | 'loss',
              amount: t.amount,
              balance: t.balance_after,
              description: t.description ?? '',
              descriptionMM: t.description ?? '',
              timestamp: t.timestamp,
              relatedBetId: t.related_bet_id ?? undefined,
            }))
          );
        }
      })
      .catch(() => {
        setAuthToken(null);
      });
  }, []);

  // Translation function
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  // Auth functions: try API first (secure cookies), fall back to mock
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await userApi.login(username, password);
      setAuthToken('cookie'); // tokens in HttpOnly cookies; no token in body
      const p = mapApiPlayerToPlayer(res.player);
      setPlayer(p);
      setBalance(p.balance);
      setIsAuthenticated(true);
      return true;
    } catch {
      if (username === mockPlayer.username && password === mockPlayer.password) {
        setAuthToken(null);
        setPlayer(mockPlayer);
        setBalance(mockPlayer.balance);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    }
  };

  const refreshPlayer = async () => {
    if (!getAuthToken()) return;
    try {
      const apiPlayer = await userApi.me();
      const p = mapApiPlayerToPlayer(apiPlayer);
      setPlayer(p);
      setBalance(p.balance);
    } catch {
      // Session may have expired
    }
  };

  const logout = async () => {
    try {
      await userApi.logout();
    } catch {
      /* ignore */
    }
    setAuthToken(null);
    setPlayer(null);
    setIsAuthenticated(false);
    setBalance(0);
    setCart([]);
    setBets([]);
    setTransactions([]);
  };

  // Balance functions
  const updateBalance = (amount: number) => {
    const newBalance = balance + amount;
    setBalance(newBalance);
    if (player) {
      setPlayer({ ...player, balance: newBalance });
    }
  };

  // Cart functions
  const addToCart = (items: CartItem | CartItem[]) => {
    const itemsArray = Array.isArray(items) ? items : [items];
    setCart(prev => [...prev, ...itemsArray]);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateCartItem = (id: string, amount: number) => {
    setCart(prev =>
      prev.map(item => (item.id === id ? { ...item, amount } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.amount, 0);

  // Bet functions
  const activeBets = bets.filter(bet => bet.status === 'Pending');
  const pastBets = bets.filter(bet => bet.status !== 'Pending');

  const placeBets = async (sessionId: string): Promise<boolean> => {
    if (cart.length === 0) return false;
    if (cartTotal > balance) return false;

    const roundName = new Date().getHours() < 12 ? 'Morning' : 'Evening';
    const gameType = (cart[0]?.gameMode ?? '2D') as '2D' | '3D';
    const today = new Date().toISOString().split('T')[0];

    if (getAuthToken() && player) {
      try {
        const session = await userApi.createSession({ round_name: roundName, date: today });
        const created = await userApi.placeBets({
          session_id: session.id,
          round_name: roundName,
          game_type: gameType,
          bets: cart.map(item => ({
            number: item.number,
            amount: item.amount,
            pattern_type: item.pattern?.type,
            pattern_input: item.pattern?.input,
            pattern_label: item.pattern?.label,
          })),
        });
        const newBets: Bet[] = created.map(b => ({
          id: b.id,
          playerId: b.player_id,
          playerName: player.name,
          gameType: b.game_type as '2D' | '3D',
          betNumber: b.bet_number,
          amount: b.amount,
          round: (b.round_name === 'Evening' ? 'Evening' : 'Morning') as 'Morning' | 'Evening',
          placedAt: b.placed_at,
          status: b.status as 'Pending' | 'Won' | 'Lost',
          sessionId: b.session_id ?? undefined,
          winAmount: b.win_amount ?? undefined,
        }));
        setBets(prev => [...newBets, ...prev]);
        const updated = await userApi.me();
        setBalance(updated.balance);
        setPlayer(mapApiPlayerToPlayer(updated));
        addTransaction({
          playerId: player.id,
          type: 'bet',
          amount: -cartTotal,
          balance: updated.balance,
          description: `Bet session: ${created.length} bets`,
          descriptionMM: `ထိုးငွေ: ${created.length} ခု`,
          timestamp: new Date().toISOString(),
          relatedBetId: sessionId,
        });
        clearCart();
        return true;
      } catch {
        return false;
      }
    }

    const newBets: Bet[] = cart.map(item => ({
      id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      playerId: player?.id || '',
      playerName: player?.name || '',
      gameType: item.gameMode,
      betNumber: item.number,
      amount: item.amount,
      round: roundName as 'Morning' | 'Evening',
      placedAt: new Date().toISOString(),
      status: 'Pending',
      sessionId,
      pattern: item.pattern,
    }));
    setBets(prev => [...newBets, ...prev]);
    updateBalance(-cartTotal);
    addTransaction({
      playerId: player?.id || '',
      type: 'bet',
      amount: -cartTotal,
      balance: balance - cartTotal,
      description: `Bet session: ${newBets.length} bets`,
      descriptionMM: `ထိုးငွေ: ${newBets.length} ခု`,
      timestamp: new Date().toISOString(),
      relatedBetId: sessionId,
    });
    clearCart();
    return true;
  };

  const getBetsBySession = (sessionId: string): Bet[] => {
    return bets.filter(bet => bet.sessionId === sessionId);
  };

  // Transaction functions
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  // Results functions
  const getTodayResults = (): DailyResult[] => {
    const today = new Date().toISOString().split('T')[0];
    return mockDailyResults.filter(result => result.date === today);
  };

  // Payout rate functions
  const getPayoutRate = (gameType: '2D' | '3D'): PayoutRate | undefined => {
    return mockPayoutRates.find(rate => rate.gameType === gameType);
  };

  // Blocked number functions
  const checkBlockedNumber = (number: string, gameType: '2D' | '3D'): BlockedNumber | null => {
    return isNumberBlocked(number, gameType);
  };

  const hasBlockedNumbersInCart = (): boolean => {
    return cart.some(item => isNumberBlocked(item.number, item.gameMode) !== null);
  };

  const removeBlockedFromCart = () => {
    setCart(prev => prev.filter(item => isNumberBlocked(item.number, item.gameMode) === null));
  };

  // Favorites functions
  const addToFavorites = (number: string, gameType: '2D' | '3D') => {
    setFavoriteNumbers(prev => ({
      ...prev,
      [gameType]: [...new Set([...prev[gameType], number])]
    }));
  };

  const removeFromFavorites = (number: string, gameType: '2D' | '3D') => {
    setFavoriteNumbers(prev => ({
      ...prev,
      [gameType]: prev[gameType].filter(n => n !== number)
    }));
  };

  return (
    <AppContext.Provider
      value={{
        player,
        isAuthenticated,
        login,
        logout,
        refreshPlayer,
        language,
        setLanguage,
        t,
        balance,
        updateBalance,
        cart,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        cartTotal,
        bets,
        activeBets,
        pastBets,
        placeBets,
        getBetsBySession,
        transactions,
        addTransaction,
        dailyResults: mockDailyResults,
        getTodayResults,
        payoutRates: mockPayoutRates,
        getPayoutRate,
        blockedNumbers: mockBlockedNumbers,
        checkBlockedNumber,
        hasBlockedNumbersInCart,
        removeBlockedFromCart,
        favoriteNumbers,
        addToFavorites,
        removeFromFavorites
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};