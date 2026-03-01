// Updated Mock Data for Myanmar Lottery Player Platform

import type { PatternType } from '../utils/patterns';

export interface Player {
  id: string;
  name: string;
  nameMM: string;
  username: string;
  password: string;
  phoneNumber: string;
  balance: number;
  agentId: string;
  status: 'active' | 'suspended';
  createdAt: string;
  /** Set when user comes from external platform API; use for default dashboard layout. */
  source?: 'portal' | 'api';
  /** External platform identifier; use with source for default dashboard / white-label. */
  platform_id?: string | null;
}

export interface Bet {
  id: string;
  playerId: string;
  playerName: string;
  gameType: '2D' | '3D';
  betNumber: string;
  amount: number;
  round: 'Morning' | 'Evening';
  placedAt: string;
  status: 'Pending' | 'Won' | 'Lost';
  winAmount?: number;
  sessionId?: string;
  pattern?: {
    type: PatternType;
    input: string;
    label: string;
    labelMM: string;
  };
}

export interface CartItem {
  id: string;
  gameMode: '2D' | '3D';
  number: string;
  amount: number;
  pattern?: {
    type: PatternType;
    input: string;
    label: string;
    labelMM: string;
  };
}

export interface Transaction {
  id: string;
  playerId: string;
  type: 'deposit' | 'bet' | 'win' | 'loss';
  amount: number;
  balance: number;
  description: string;
  descriptionMM: string;
  timestamp: string;
  relatedBetId?: string;
}

export interface DailyResult {
  id: string;
  date: string;
  gameType: '2D' | '3D';
  round: 'Morning' | 'Evening';
  winningNumber: string;
  announcedAt: string;
}

export interface PayoutRate {
  gameType: '2D' | '3D';
  multiplier: number;
  description: string;
  descriptionMM: string;
}

export interface BlockedNumber {
  number: string;
  gameType: '2D' | '3D';
  reason: string;
  reasonMM: string;
}

// Mock Player
export const mockPlayer: Player = {
  id: 'player-001',
  name: 'Aung Aung',
  nameMM: 'အောင်အောင်',
  username: 'aungaung',
  password: 'player123',
  phoneNumber: '09123456789',
  balance: 100000,
  agentId: 'agent-001',
  status: 'active',
  createdAt: '2026-01-15T10:00:00Z'
};

// Mock Payout Rates
export const mockPayoutRates: PayoutRate[] = [
  {
    gameType: '2D',
    multiplier: 85,
    description: '85x payout (Bet 1,000 → Win 85,000)',
    descriptionMM: '85 ဆ ရငွေ (1,000 ထိုး → 85,000 ရ)'
  },
  {
    gameType: '3D',
    multiplier: 500,
    description: '500x payout (Bet 1,000 → Win 500,000)',
    descriptionMM: '500 ဆ ရငွေ (1,000 ထိုး → 500,000 ရ)'
  }
];

// Mock Blocked Numbers (Empty by default)
export const mockBlockedNumbers: BlockedNumber[] = [];

// Mock Bets (Empty by default)
export const mockBets: Bet[] = [];

// Mock Transactions (Empty by default)
export const mockTransactions: Transaction[] = [];

// Mock Daily Results (Empty by default)
export const mockDailyResults: DailyResult[] = [];

// Favorite Numbers (Empty by default)
export const mockFavoriteNumbers = {
  '2D': [] as string[],
  '3D': [] as string[]
};

// Helper function to check if number is blocked
export const isNumberBlocked = (number: string, gameType: '2D' | '3D'): BlockedNumber | null => {
  const blocked = mockBlockedNumbers.find(
    b => b.number === number && b.gameType === gameType
  );
  return blocked || null;
};

// Helper function to calculate win amount
export const calculateWinAmount = (amount: number, gameType: '2D' | '3D'): number => {
  const rate = mockPayoutRates.find(r => r.gameType === gameType);
  return rate ? amount * rate.multiplier : 0;
};