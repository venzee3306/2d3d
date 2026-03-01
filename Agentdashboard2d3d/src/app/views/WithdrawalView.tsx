import { WithdrawalStatsCard } from '../components/WithdrawalStatsCard';
import { WithdrawalRequestsTable } from '../components/WithdrawalRequestsTable';

interface WithdrawalViewProps {
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function WithdrawalView({ onApprove, onReject }: WithdrawalViewProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-6 shadow-sm sticky top-0 z-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Withdrawal Requests</h1>
          <p className="text-sm text-gray-500">Process and manage player withdrawal requests</p>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Top Row Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <WithdrawalStatsCard title="PENDING" value="1" icon="pending" />
          <WithdrawalStatsCard title="APPROVED" value="2" icon="approved" />
          <WithdrawalStatsCard title="REJECTED" value="0" icon="rejected" />
          <WithdrawalStatsCard title="PENDING AMOUNT" value="2,500,000 MMK" icon="amount" />
        </div>

        {/* Withdrawal Requests Table */}
        <WithdrawalRequestsTable onApprove={onApprove} onReject={onReject} />
      </div>
    </div>
  );
}
