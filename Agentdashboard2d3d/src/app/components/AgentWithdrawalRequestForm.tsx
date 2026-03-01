import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowUpCircle, 
  Wallet, 
  AlertCircle,
  CheckCircle,
  Phone,
  User as UserIcon
} from 'lucide-react';
import { TransactionCard } from './TransactionCard';
import type { WithdrawalRequest } from '../types/units';

interface AgentWithdrawalRequestFormProps {
  agentBalance: number;
  withdrawalHistory: WithdrawalRequest[];
  onSubmitRequest: (request: {
    amount: number;
    paymentMethod: string;
    accountNumber: string;
    accountName: string;
    note?: string;
  }) => void;
}

export function AgentWithdrawalRequestForm({
  agentBalance,
  withdrawalHistory,
  onSubmitRequest
}: AgentWithdrawalRequestFormProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('KBZ Pay');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const paymentMethods = ['KBZ Pay', 'Wave Money', 'CB Pay', 'AYA Pay', 'Bank Transfer'];

  // Handle submit
  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    
    // Validation
    if (!amount || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (numAmount > agentBalance) {
      setError('Insufficient balance for this withdrawal');
      return;
    }
    if (!accountNumber.trim()) {
      setError('Please enter your account number');
      return;
    }
    if (!accountName.trim()) {
      setError('Please enter the account holder name');
      return;
    }

    // Confirm submission
    if (window.confirm(
      `Submit cash-out request?\n\n` +
      `Amount: ${numAmount.toLocaleString()} Units\n` +
      `Payment Method: ${paymentMethod}\n` +
      `Account: ${accountNumber}\n` +
      `Name: ${accountName}\n\n` +
      `Your Master will process this request and send the payment.`
    )) {
      onSubmitRequest({
        amount: numAmount,
        paymentMethod,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
        note: note.trim()
      });
      
      // Reset form
      setAmount('');
      setAccountNumber('');
      setAccountName('');
      setNote('');
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl shadow-lg">
              <ArrowUpCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Winning Cash-out</h1>
              <p className="text-gray-600 mt-1" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                ငွေထုတ်ရန် တောင်းဆိုမှု
              </p>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-2 text-amber-100">
              <Wallet className="w-5 h-5" />
              <span className="text-sm font-medium">Your Current Balance</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-5xl font-bold text-white">{agentBalance.toLocaleString()}</p>
              <p className="text-xl text-amber-100">Units</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Form */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">New Cash-out Request</h2>
              <p className="text-amber-100 text-sm">Convert your units to cash</p>
            </div>

            <div className="p-6 space-y-5">
              {/* Amount */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Amount (Units) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter amount"
                    max={agentBalance}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xl font-bold"
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-gray-600">
                    Available: {agentBalance.toLocaleString()} Units
                  </p>
                  {amount && parseFloat(amount) > 0 && (
                    <button
                      onClick={() => setAmount(agentBalance.toString())}
                      className="text-sm text-amber-600 hover:text-amber-700 font-bold"
                    >
                      Use Max
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Quick Select</label>
                <div className="grid grid-cols-4 gap-2">
                  {[10000, 50000, 100000, agentBalance].map((quickAmount, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAmount(quickAmount.toString())}
                      disabled={quickAmount > agentBalance}
                      className="px-3 py-2 bg-amber-100 hover:bg-amber-200 disabled:bg-gray-100 disabled:text-gray-400 text-amber-700 rounded-lg text-sm font-bold transition-colors"
                    >
                      {idx === 3 ? 'All' : `${(quickAmount / 1000).toFixed(0)}K`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-semibold"
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select where you want to receive the payment
                </p>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Account Number / Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => {
                      setAccountNumber(e.target.value);
                      setError('');
                    }}
                    placeholder="09xxxxxxxxx or account number"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter your phone number or account number for receiving payment
                </p>
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Account Holder Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => {
                      setAccountName(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter account holder name"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Note (Optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add any additional information..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 h-24 resize-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-900 font-semibold mb-1">
                    How Cash-out Works
                  </p>
                  <p className="text-xs text-amber-700">
                    After you submit this request, your Master will review it and send the payment to your account. 
                    Once the payment is sent, the units will be deducted from your balance.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!amount || !accountNumber || !accountName}
                className="w-full px-6 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-6 h-6" />
                Submit Cash-out Request
              </button>
            </div>
          </div>

          {/* Request History */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Cash-out History</h2>
                <p className="text-gray-300 text-sm">Track your withdrawal requests</p>
              </div>

              <div className="p-6">
                {withdrawalHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <ArrowUpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-semibold">No cash-outs yet</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Your withdrawal requests will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {withdrawalHistory.map((request) => (
                      <TransactionCard
                        key={request.id}
                        id={request.id}
                        type="withdrawal"
                        amount={request.amount}
                        paymentMethod={request.paymentMethod}
                        status={request.status}
                        requestedAt={request.requestedAt}
                        processedAt={request.processedAt}
                        note={request.note}
                        rejectionReason={request.rejectionReason}
                        approverName={request.toUserName}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
