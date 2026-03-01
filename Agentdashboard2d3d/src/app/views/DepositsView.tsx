import { DepositRequests } from '../components/DepositRequests';

interface DepositRequest {
  id: string;
  playerId: string;
  playerName: string;
  agentId: string;
  amount: number;
  transactionId: string;
  paymentMethod?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  note?: string;
}

interface User {
  id: string;
  name: string;
  role: 'admin' | 'master' | 'agent';
}

interface DepositsViewProps {
  currentUser: User;
  currentBalance: number;
  depositRequests: DepositRequest[];
  onApprove: (requestId: string, amount: number) => void;
  onReject: (requestId: string) => void;
}

export function DepositsView({
  currentUser,
  currentBalance,
  depositRequests,
  onApprove,
  onReject
}: DepositsViewProps) {
  return (
    <div className="p-8">
      <DepositRequests
        requests={depositRequests}
        currentBalance={currentBalance}
        onApprove={onApprove}
        onReject={onReject}
      />
    </div>
  );
}
