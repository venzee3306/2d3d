import { motion } from 'motion/react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Package,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw
} from 'lucide-react';

interface WalletBalanceCardProps {
  availableBalance: number;
  totalAllocated?: number;
  totalBalance?: number;
  userRole: 'admin' | 'master' | 'agent';
  userName: string;
  lowBalanceThreshold?: number;
  onRequestDeposit?: () => void;
  onManualTransaction?: () => void;
  showAllocated?: boolean;
}

export function WalletBalanceCard({
  availableBalance,
  totalAllocated = 0,
  totalBalance,
  userRole,
  userName,
  lowBalanceThreshold = 100000,
  onRequestDeposit,
  onManualTransaction,
  showAllocated = true
}: WalletBalanceCardProps) {
  const calculatedTotalBalance = totalBalance || (availableBalance + totalAllocated);
  const isLowBalance = availableBalance < lowBalanceThreshold;
  const allocationPercentage = calculatedTotalBalance > 0 
    ? (totalAllocated / calculatedTotalBalance) * 100 
    : 0;

  return (
    <div className="space-y-4">
      {/* Main Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-6 shadow-2xl border-4 ${
          isLowBalance ? 'border-yellow-400 animate-pulse' : 'border-white/20'
        }`}
      >
        {/* Low Balance Warning */}
        {isLowBalance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-yellow-400 text-yellow-900 rounded-xl p-3 mb-4 flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            <div className="flex-1">
              <p className="font-bold text-sm">Low Balance Warning!</p>
              <p className="text-xs">လက်ကျန် ယူနစ် နည်းနေပါသည်</p>
            </div>
          </motion.div>
        )}

        {/* User Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">Wallet Balance</p>
              <p className="text-white font-bold">{userName}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-xs uppercase tracking-wider">{userRole}</p>
            <p className="text-white text-xs mt-1" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              {userRole === 'admin' && 'စီမံခန့်ခွဲသူ'}
              {userRole === 'master' && 'မာစတာ'}
              {userRole === 'agent' && 'အေးဂျင့်'}
            </p>
          </div>
        </div>

        {/* Available Balance */}
        <div className="mb-6">
          <p className="text-white/90 text-sm mb-2 flex items-center gap-2">
            <span>Available Balance</span>
            <span style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              (လက်ကျန်ယူနစ်)
            </span>
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-5xl font-bold text-white">
              {availableBalance.toLocaleString()}
            </p>
            <p className="text-white/80 text-xl font-medium">Units</p>
          </div>
          <p className="text-white/70 text-sm mt-2">
            ≈ {availableBalance.toLocaleString()} MMK
          </p>
        </div>

        {/* Total Balance (if showing allocated) */}
        {showAllocated && totalAllocated > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-white/80" />
                <p className="text-white/80 text-xs">Total Owned</p>
              </div>
              <p className="text-white text-lg font-bold">
                {calculatedTotalBalance.toLocaleString()}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-white/80" />
                <p className="text-white/80 text-xs">Allocated</p>
              </div>
              <p className="text-white text-lg font-bold">
                {totalAllocated.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Allocation Bar */}
        {showAllocated && totalAllocated > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-white/80 mb-2">
              <span>Allocation: {allocationPercentage.toFixed(1)}%</span>
              <span>{availableBalance.toLocaleString()} available</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${allocationPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {onRequestDeposit && (
            <button
              onClick={onRequestDeposit}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl py-3 font-bold transition-all flex items-center justify-center gap-2 border border-white/30"
            >
              <ArrowDownCircle className="w-5 h-5" />
              <span>Request</span>
            </button>
          )}
          {onManualTransaction && (
            <button
              onClick={onManualTransaction}
              className="bg-white hover:bg-white/90 text-blue-600 rounded-xl py-3 font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Transfer</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border-2 border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <p className="text-xs text-gray-600">Today In</p>
          </div>
          <p className="text-lg font-bold text-green-600">+0</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <p className="text-xs text-gray-600">Today Out</p>
          </div>
          <p className="text-lg font-bold text-red-600">-0</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-1">
            <RefreshCw className="w-4 h-4 text-blue-600" />
            <p className="text-xs text-gray-600">Net</p>
          </div>
          <p className="text-lg font-bold text-blue-600">0</p>
        </div>
      </div>
    </div>
  );
}
