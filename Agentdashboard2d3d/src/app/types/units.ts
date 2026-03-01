// Unit Transfer and Deposit System Types

export interface UnitBalance {
  userId: string;
  balance: number;
  lockedBalance: number; // Units pending in transfers
}

export interface UnitTransfer {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserRole: 'admin' | 'master' | 'agent';
  toUserId: string;
  toUserName: string;
  toUserRole: 'admin' | 'master' | 'agent' | 'player';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  timestamp: string;
  note?: string;
}

export interface DepositRequest {
  id: string;
  playerId: string;
  playerName: string;
  agentId: string;
  amount: number;
  transactionId: string; // Payment gateway transaction ID (KBZ Pay, Wave Money, etc.)
  paymentMethod?: string; // KBZ Pay, Wave Money, CB Pay, etc.
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  note?: string;
}

/**
 * Unit Deposit Request (Agent/Master requesting units from upstream)
 * Flow:
 * - Agent requests deposit → Master approves (deducts from Master, adds to Agent)
 * - Master requests deposit → Admin approves (deducts from Admin, adds to Master)
 */
export interface UnitDepositRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterRole: 'agent' | 'master';
  approverId: string; // Master or Admin who will approve
  approverName: string;
  amount: number;
  paymentMethod: string; // How agent/master will pay (KBZ Pay, Wave Money, etc.)
  transactionId: string; // Payment proof transaction ID
  paymentScreenshot?: string; // Base64 encoded image or URL to receipt image
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  note?: string;
  rejectionReason?: string;
}

/**
 * Withdrawal Request Flow:
 * - Agent requests withdrawal → Master approves/rejects
 * - Master requests withdrawal → Admin approves/rejects
 * - When approved, units are returned to the requester's balance
 * - Payment is made manually outside the system to the specified account
 */
export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: 'agent' | 'master';
  toUserId: string; // Master or Admin who will process it
  toUserName: string;
  amount: number;
  paymentMethod: string; // KBZ Pay, Wave Money, CB Pay, etc.
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  note?: string;
  rejectionReason?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'transfer_in' | 'transfer_out' | 'deposit_approve' | 'deposit_request' | 'withdrawal_approve' | 'withdrawal_request' | 'unit_deposit_approve' | 'unit_deposit_request' | 'admin_create';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  relatedUserId?: string;
  relatedUserName?: string;
  timestamp: string;
  note?: string;
}
