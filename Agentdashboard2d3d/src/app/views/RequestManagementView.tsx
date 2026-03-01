import { useState } from 'react';
import { UnifiedRequestManagement } from '../components/UnifiedRequestManagement';
import { toast } from 'sonner';

interface Request {
  id: string;
  requesterId: string;
  requesterName: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  paymentScreenshot?: string;
  note?: string;
  requestedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  type: 'unit-request' | 'cashout';
  accountInfo?: string;
}

export function RequestManagementView() {
  const [userRole, setUserRole] = useState<'admin' | 'master' | 'agent'>('master');
  const [availableBalance, setAvailableBalance] = useState(850000);
  const [requests, setRequests] = useState<Request[]>([
    {
      id: 'req-001',
      requesterId: 'agent-001',
      requesterName: 'Agent Kyaw',
      amount: 50000,
      paymentMethod: 'KBZ Pay (KPay)',
      transactionId: 'KBZ123456789',
      paymentScreenshot: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400',
      note: 'Payment for today\'s operations',
      requestedAt: new Date().toISOString(),
      status: 'pending',
      type: 'unit-request'
    },
    {
      id: 'req-002',
      requesterId: 'agent-002',
      requesterName: 'Agent Zaw',
      amount: 30000,
      paymentMethod: 'Wave Pay',
      transactionId: 'WAVE987654321',
      paymentScreenshot: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
      requestedAt: new Date(Date.now() - 3600000).toISOString(),
      status: 'pending',
      type: 'unit-request'
    },
    {
      id: 'req-003',
      requesterId: 'agent-003',
      requesterName: 'Agent Mya',
      amount: 25000,
      paymentMethod: 'KBZ Pay (KPay)',
      transactionId: '',
      accountInfo: '09123456789',
      requestedAt: new Date(Date.now() - 7200000).toISOString(),
      status: 'pending',
      type: 'cashout'
    },
    {
      id: 'req-004',
      requesterId: 'agent-004',
      requesterName: 'Agent Hla',
      amount: 100000,
      paymentMethod: 'CB Pay',
      transactionId: 'CBP456789123',
      paymentScreenshot: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
      requestedAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed',
      type: 'unit-request'
    },
    {
      id: 'req-005',
      requesterId: 'agent-005',
      requesterName: 'Agent Win',
      amount: 15000,
      paymentMethod: 'Wave Pay',
      transactionId: 'WAVE111222333',
      requestedAt: new Date(Date.now() - 172800000).toISOString(),
      status: 'rejected',
      type: 'unit-request'
    }
  ]);

  const availableAgents = [
    { id: 'agent-001', name: 'Agent Kyaw', username: 'kyaw_agent' },
    { id: 'agent-002', name: 'Agent Zaw', username: 'zaw_agent' },
    { id: 'agent-003', name: 'Agent Mya', username: 'mya_agent' },
    { id: 'agent-004', name: 'Agent Hla', username: 'hla_agent' },
    { id: 'agent-005', name: 'Agent Win', username: 'win_agent' },
    { id: 'agent-006', name: 'Agent Thu', username: 'thu_agent' },
  ];

  const handleSubmitUnitRequest = (request: any) => {
    const newRequest: Request = {
      id: `req-${Date.now()}`,
      requesterId: 'current-user',
      requesterName: 'Current User',
      amount: request.amount,
      paymentMethod: request.paymentMethod,
      transactionId: request.transactionId,
      paymentScreenshot: request.paymentScreenshot,
      note: request.note,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      type: 'unit-request'
    };

    setRequests([newRequest, ...requests]);
    toast.success('✅ Unit request submitted successfully!', {
      description: `Request for ${request.amount.toLocaleString()} units is now pending approval.`
    });
  };

  const handleSubmitCashoutRequest = (request: any) => {
    const newRequest: Request = {
      id: `req-${Date.now()}`,
      requesterId: 'current-user',
      requesterName: 'Current User',
      amount: request.amount,
      paymentMethod: request.paymentMethod,
      transactionId: '',
      accountInfo: request.accountInfo,
      note: request.note,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      type: 'cashout'
    };

    setRequests([newRequest, ...requests]);
    toast.success('💰 Cash-out request submitted successfully!', {
      description: `Request for ${request.amount.toLocaleString()} units cash-out is now pending approval.`
    });
  };

  const handleApproveRequest = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    setRequests(requests.map(r => 
      r.id === requestId 
        ? { ...r, status: 'completed' as const }
        : r
    ));

    if (request.type === 'unit-request') {
      setAvailableBalance(prev => prev - request.amount);
      toast.success('✅ Request Approved!', {
        description: `${request.amount.toLocaleString()} units transferred to ${request.requesterName}`,
        duration: 5000
      });
    } else {
      toast.success('✅ Cash-out Approved!', {
        description: `${request.amount.toLocaleString()} units deducted from ${request.requesterName}`,
        duration: 5000
      });
    }
  };

  const handleRejectRequest = (requestId: string, reason: string) => {
    const request = requests.find(r => r.id === requestId);
    setRequests(requests.map(r => 
      r.id === requestId 
        ? { ...r, status: 'rejected' as const, note: reason }
        : r
    ));

    toast.error('❌ Request Rejected', {
      description: `Reason: ${reason}`,
      duration: 5000
    });
  };

  const handleQuickTransfer = (transfer: any) => {
    const agent = availableAgents.find(a => a.id === transfer.recipientId);
    if (!agent) return;

    setAvailableBalance(prev => prev - transfer.amount);
    
    toast.success('⚡ Quick Transfer Completed!', {
      description: `${transfer.amount.toLocaleString()} units transferred to ${agent.name}`,
      duration: 5000
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Request Management System
            </h1>
            <p className="text-gray-600" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              ယူနစ်တောင်းခံမှုနှင့် ထုတ်ယူမှုစနစ်
            </p>
          </div>

          {/* Role Switcher */}
          <div className="flex gap-2 bg-gray-100 rounded-xl p-2">
            {(['admin', 'master', 'agent'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setUserRole(role)}
                className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${
                  userRole === role
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-yellow-500">
          <p className="text-sm font-semibold text-gray-600 mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">
            {requests.filter(r => r.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-blue-500">
          <p className="text-sm font-semibold text-gray-600 mb-1">Processing</p>
          <p className="text-3xl font-bold text-blue-600">
            {requests.filter(r => r.status === 'processing').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-green-500">
          <p className="text-sm font-semibold text-gray-600 mb-1">Completed</p>
          <p className="text-3xl font-bold text-green-600">
            {requests.filter(r => r.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-red-500">
          <p className="text-sm font-semibold text-gray-600 mb-1">Rejected</p>
          <p className="text-3xl font-bold text-red-600">
            {requests.filter(r => r.status === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Main Component */}
      <UnifiedRequestManagement
        userRole={userRole}
        userName="current-user"
        availableBalance={availableBalance}
        requests={requests}
        availableAgents={availableAgents}
        onSubmitUnitRequest={handleSubmitUnitRequest}
        onSubmitCashoutRequest={handleSubmitCashoutRequest}
        onApproveRequest={handleApproveRequest}
        onRejectRequest={handleRejectRequest}
        onQuickTransfer={handleQuickTransfer}
      />
    </div>
  );
}
