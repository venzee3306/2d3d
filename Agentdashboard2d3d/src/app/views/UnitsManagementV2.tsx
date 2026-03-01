import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { WalletDashboard } from '../components/WalletDashboard';
import { TransferUnitsModal } from '../components/TransferUnitsModal';
import { TransactionHistoryView } from '../components/TransactionHistoryView';

interface User {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'master' | 'agent' | 'player';
  parentId?: string;
}

interface Transaction {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
  type: 'deposit' | 'withdraw';
  timestamp: string;
  note?: string;
  newBalance: number;
}

interface UnitsManagementV2Props {
  currentUser: User;
  allUsers: User[];
  userBalances: { [userId: string]: number };
  transactions: Transaction[];
  onTransfer: (toUserId: string, amount: number, type: 'deposit' | 'withdraw', note?: string) => void;
}

export function UnitsManagementV2({
  currentUser,
  allUsers,
  userBalances,
  transactions,
  onTransfer
}: UnitsManagementV2Props) {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [preselectedUserId, setPreselectedUserId] = useState('');

  const handleQuickDeposit = (userId: string) => {
    setPreselectedUserId(userId);
    setShowTransferModal(true);
  };

  const handleQuickWithdraw = (userId: string) => {
    setPreselectedUserId(userId);
    setShowTransferModal(true);
  };

  if (showHistory) {
    return (
      <TransactionHistoryView
        transactions={transactions}
        currentUserId={currentUser.id}
        onBack={() => setShowHistory(false)}
      />
    );
  }

  return (
    <div className="p-8">
      <WalletDashboard
        currentUser={currentUser}
        users={allUsers}
        userBalances={userBalances}
        onQuickDeposit={handleQuickDeposit}
        onQuickWithdraw={handleQuickWithdraw}
        onViewHistory={() => setShowHistory(true)}
      />

      <AnimatePresence>
        {showTransferModal && (
          <TransferUnitsModal
            currentUser={currentUser}
            allUsers={allUsers}
            userBalances={userBalances}
            onClose={() => {
              setShowTransferModal(false);
              setPreselectedUserId('');
            }}
            onTransfer={onTransfer}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
