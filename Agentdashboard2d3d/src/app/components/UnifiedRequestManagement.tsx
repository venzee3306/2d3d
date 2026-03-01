import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Wallet, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { UnitRequestModal } from './UnitRequestModal';
import { CashoutRequestModal } from './CashoutRequestModal';
import { QuickTransferModal } from './QuickTransferModal';
import { VerificationDesk } from './VerificationDesk';

interface Agent {
  id: string;
  name: string;
  username: string;
}

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
}

interface UnifiedRequestManagementProps {
  userRole: 'admin' | 'master' | 'agent';
  userName: string;
  availableBalance: number;
  requests: Request[];
  availableAgents?: Agent[];
  onSubmitUnitRequest: (request: any) => void;
  onSubmitCashoutRequest: (request: any) => void;
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
  onQuickTransfer?: (transfer: any) => void;
}

export function UnifiedRequestManagement({
  userRole,
  userName,
  availableBalance,
  requests,
  availableAgents = [],
  onSubmitUnitRequest,
  onSubmitCashoutRequest,
  onApproveRequest,
  onRejectRequest,
  onQuickTransfer
}: UnifiedRequestManagementProps) {
  const [showUnitRequestModal, setShowUnitRequestModal] = useState(false);
  const [showCashoutModal, setShowCashoutModal] = useState(false);
  const [showQuickTransferModal, setShowQuickTransferModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'verification' | 'my-requests'>('verification');

  const canVerify = userRole === 'admin' || userRole === 'master';
  const myRequests = requests.filter(r => r.requesterId === userName);

  return (
    <div className="space-y-6">
      {/* Header with Action Buttons */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Request Management</h2>
            <p className="text-gray-600 mt-1" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              ယူနစ်စီမံခန့်ခွဲမှု
            </p>
          </div>

          {/* Balance Display */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-700 mb-1">Available Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-900">
                {availableBalance.toLocaleString()}
              </span>
              <span className="text-lg font-semibold text-blue-600">Units</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Unit Request Button */}
          <button
            onClick={() => setShowUnitRequestModal(true)}
            className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-all">
                <TrendingUp className="w-7 h-7" />
              </div>
              <Plus className="w-6 h-6 opacity-70" />
            </div>
            <h3 className="text-lg font-bold mb-1">Request Units</h3>
            <p className="text-sm text-blue-100" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              ယူနစ်ဝယ်ယူရန်
            </p>
          </button>

          {/* Cash-out Request Button */}
          <button
            onClick={() => setShowCashoutModal(true)}
            className="bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-all">
                <TrendingDown className="w-7 h-7" />
              </div>
              <Plus className="w-6 h-6 opacity-70" />
            </div>
            <h3 className="text-lg font-bold mb-1">Cash-out Request</h3>
            <p className="text-sm text-orange-100" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              ယူနစ်ထုတ်ယူရန်
            </p>
          </button>

          {/* Quick Transfer Button (Master/Admin only) */}
          {canVerify && onQuickTransfer && (
            <button
              onClick={() => setShowQuickTransferModal(true)}
              className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-all">
                  <Zap className="w-7 h-7" />
                </div>
                <Plus className="w-6 h-6 opacity-70" />
              </div>
              <h3 className="text-lg font-bold mb-1">Quick Transfer</h3>
              <p className="text-sm text-purple-100" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                တိုက်ရိုက်လွှဲပါ
              </p>
            </button>
          )}
        </div>
      </div>

      {/* Tabs for Master/Admin */}
      {canVerify && (
        <div className="bg-white rounded-2xl shadow-lg p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('verification')}
              className={`flex-1 px-6 py-3.5 rounded-xl font-bold transition-all ${
                activeTab === 'verification'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Verification Desk
            </button>
            <button
              onClick={() => setActiveTab('my-requests')}
              className={`flex-1 px-6 py-3.5 rounded-xl font-bold transition-all ${
                activeTab === 'my-requests'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              My Requests
              {myRequests.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white/30 rounded-full text-xs">
                  {myRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {canVerify && activeTab === 'verification' ? (
          <VerificationDesk
            requests={requests}
            onApprove={onApproveRequest}
            onReject={onRejectRequest}
            userRole={userRole as 'admin' | 'master'}
            currentBalance={availableBalance}
          />
        ) : (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">My Requests</h3>
            {myRequests.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {myRequests.map(request => (
                  <div
                    key={request.id}
                    className={`border-2 rounded-xl p-5 ${
                      request.status === 'pending'
                        ? 'border-yellow-300 bg-yellow-50'
                        : request.status === 'completed'
                        ? 'border-green-300 bg-green-50'
                        : request.status === 'rejected'
                        ? 'border-red-300 bg-red-50'
                        : 'border-blue-300 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-gray-600">
                        {request.type === 'unit-request' ? 'Unit Request' : 'Cash-out'}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        request.status === 'pending'
                          ? 'bg-yellow-200 text-yellow-800'
                          : request.status === 'completed'
                          ? 'bg-green-200 text-green-800'
                          : request.status === 'rejected'
                          ? 'bg-red-200 text-red-800'
                          : 'bg-blue-200 text-blue-800'
                      }`}>
                        {request.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                      {request.amount.toLocaleString()} Units
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(request.requestedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No requests yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <UnitRequestModal
        isOpen={showUnitRequestModal}
        onClose={() => setShowUnitRequestModal(false)}
        onSubmit={(request) => {
          onSubmitUnitRequest(request);
          setShowUnitRequestModal(false);
        }}
        userRole={userRole === 'admin' ? 'master' : 'agent'}
        userName={userName}
      />

      <CashoutRequestModal
        isOpen={showCashoutModal}
        onClose={() => setShowCashoutModal(false)}
        onSubmit={(request) => {
          onSubmitCashoutRequest(request);
          setShowCashoutModal(false);
        }}
        userRole={userRole === 'admin' ? 'master' : 'agent'}
        userName={userName}
        availableBalance={availableBalance}
      />

      {canVerify && onQuickTransfer && (
        <QuickTransferModal
          isOpen={showQuickTransferModal}
          onClose={() => setShowQuickTransferModal(false)}
          onSubmit={(transfer) => {
            onQuickTransfer(transfer);
            setShowQuickTransferModal(false);
          }}
          availableAgents={availableAgents}
          currentBalance={availableBalance}
          userRole={userRole as 'admin' | 'master'}
        />
      )}
    </div>
  );
}
