import { TransactionHistory } from '../components/TransactionHistory';

interface Transaction {
  id: string;
  userId: string;
  type: 'transfer_in' | 'transfer_out' | 'deposit_approve' | 'deposit_request' | 'admin_create';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  relatedUserId?: string;
  relatedUserName?: string;
  timestamp: string;
  note?: string;
}

interface User {
  id: string;
  name: string;
  role: 'admin' | 'master' | 'agent';
}

interface TransactionsViewProps {
  currentUser: User;
  currentBalance: number;
  transactions: Transaction[];
}

export function TransactionsView({ currentUser, currentBalance, transactions }: TransactionsViewProps) {
  return (
    <div className="p-8">
      <TransactionHistory transactions={transactions} currentBalance={currentBalance} />
    </div>
  );
}
