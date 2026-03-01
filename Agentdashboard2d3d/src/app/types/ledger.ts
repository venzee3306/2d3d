// Hierarchical Ledger System Types

export interface UserWallet {
  userId: string;
  userName: string;
  role: 'admin' | 'master' | 'agent' | 'player';
  availableBalance: number;
  creditLimit: number; // Amount user can go negative (set by parent)
  totalCredit: number; // availableBalance + creditLimit
  totalDeposits: number; // Lifetime deposits received
  totalWithdrawals: number; // Lifetime withdrawals made
  totalCommission: number; // Total commission earned
  lockedBalance: number; // Pending/locked funds
  lastUpdated: string;
}

export interface CreditLimitSetting {
  id: string;
  userId: string;
  userName: string;
  userRole: 'master' | 'agent';
  setBy: string; // Admin ID who set it
  setByName: string;
  creditLimit: number;
  previousLimit: number;
  reason?: string;
  setAt: string;
}

export interface SettlementReport {
  id: string;
  userId: string;
  userName: string;
  userRole: 'admin' | 'master' | 'agent';
  periodType: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  
  // Financial Summary
  totalIn: number; // All deposits received
  totalOut: number; // All withdrawals/transfers made
  commissionEarned: number;
  netSettlement: number; // totalIn - totalOut + commissionEarned
  
  // Transaction Breakdown
  depositCount: number;
  withdrawalCount: number;
  transferInCount: number;
  transferOutCount: number;
  
  // Balance Changes
  openingBalance: number;
  closingBalance: number;
  balanceChange: number;
  
  generatedAt: string;
  generatedBy: string;
}

export interface TransactionReceipt {
  id: string;
  receiptNumber: string; // Unique receipt number (e.g., RCP-20240225-001)
  
  // Transaction Details
  transactionType: 'deposit' | 'withdrawal' | 'transfer' | 'topup';
  amount: number;
  
  // From/To Information
  fromUserId: string;
  fromUserName: string;
  fromUserRole: 'admin' | 'master' | 'agent' | 'player';
  toUserId: string;
  toUserName: string;
  toUserRole: 'admin' | 'master' | 'agent' | 'player';
  
  // Balance Information
  previousBalance: number;
  newBalance: number;
  
  // Payment Details
  paymentMethod?: string;
  transactionId?: string;
  
  // Status & Timestamps
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  note?: string;
  
  // Sharing
  sharedVia?: 'viber' | 'messenger' | 'telegram' | 'whatsapp';
  sharedAt?: string;
}

export interface LedgerEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: 'admin' | 'master' | 'agent' | 'player';
  
  // Transaction Type
  entryType: 'credit' | 'debit';
  category: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'commission' | 'payout' | 'refund' | 'adjustment';
  
  // Amounts
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  
  // Related Information
  relatedUserId?: string;
  relatedUserName?: string;
  relatedReceiptId?: string;
  
  // Metadata
  timestamp: string;
  description: string;
  note?: string;
}

export interface BalanceShieldLog {
  id: string;
  masterId: string;
  masterName: string;
  agentId: string;
  agentName: string;
  action: 'deposit_to_agent' | 'withdrawal_from_agent';
  amount: number;
  masterBalanceBefore: number;
  masterBalanceAfter: number;
  timestamp: string;
  verified: boolean;
}
