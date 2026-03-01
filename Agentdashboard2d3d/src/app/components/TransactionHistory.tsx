import { ArrowUpRight, ArrowDownLeft, Plus, CheckCircle, History } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'transfer_in' | 'transfer_out' | 'deposit_approve' | 'deposit_request' | 'admin_create';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  relatedUserName?: string;
  timestamp: string;
  note?: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  currentBalance: number;
}

export function TransactionHistory({ transactions, currentBalance }: TransactionHistoryProps) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'transfer_in':
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case 'transfer_out':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'deposit_approve':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'deposit_request':
        return <ArrowUpRight className="w-4 h-4 text-orange-600" />;
      case 'admin_create':
        return <Plus className="w-4 h-4 text-yellow-600" />;
      default:
        return <History className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'transfer_in':
        return 'လက်ခံရရှိ';
      case 'transfer_out':
        return 'လွှဲပြောင်း';
      case 'deposit_approve':
        return 'ငွေသွင်း အတည်ပြု';
      case 'deposit_request':
        return 'ငွေသွင်း တောင်းဆို';
      case 'admin_create':
        return 'ယူနစ်ဖန်တီး';
      default:
        return type;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'transfer_in':
        return 'bg-green-100 border-green-200';
      case 'transfer_out':
        return 'bg-red-100 border-red-200';
      case 'deposit_approve':
        return 'bg-blue-100 border-blue-200';
      case 'deposit_request':
        return 'bg-orange-100 border-orange-200';
      case 'admin_create':
        return 'bg-yellow-100 border-yellow-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'transfer_in':
      case 'admin_create':
        return 'text-green-600';
      case 'transfer_out':
      case 'deposit_approve':
      case 'deposit_request':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getAmountPrefix = (type: string) => {
    switch (type) {
      case 'transfer_in':
      case 'admin_create':
        return '+';
      case 'transfer_out':
      case 'deposit_approve':
      case 'deposit_request':
        return '-';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'အခုလေးတင်';
    if (diffMins < 60) return `${diffMins} မိနစ်က`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} နာရီက`;
    
    return date.toLocaleDateString('my-MM', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ငွေကြေး မှတ်တမ်း</h2>
          <p className="text-sm text-gray-600 mt-1">
            စုစုပေါင်း {transactions.length} ခု
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl px-4 py-2 border border-purple-100">
          <div className="text-xs text-gray-600">လက်ရှိယူနစ်</div>
          <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
            {currentBalance.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Transaction List */}
      {transactions.length > 0 ? (
        <div className="space-y-2">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left Side */}
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-lg ${getTransactionColor(transaction.type)} border flex items-center justify-center flex-shrink-0`}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {getTransactionLabel(transaction.type)}
                      </h4>
                      {transaction.relatedUserName && (
                        <span className="text-sm text-gray-500">
                          • {transaction.relatedUserName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(transaction.timestamp)}</p>
                    {transaction.note && (
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg px-3 py-1.5">
                        {transaction.note}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Side - Amount */}
                <div className="text-right flex-shrink-0">
                  <div className={`text-xl font-bold ${getAmountColor(transaction.type)}`}>
                    {getAmountPrefix(transaction.type)}{transaction.amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    လက်ကျန်: {transaction.balanceAfter.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 text-center border border-gray-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <History className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            မှတ်တမ်း မရှိသေးပါ
          </h3>
          <p className="text-sm text-gray-500">
            ငွေကြေးလွှဲပြောင်းမှု မှတ်တမ်းများ ဤနေရာတွင် ပေါ်လာပါမည်
          </p>
        </div>
      )}
    </div>
  );
}
