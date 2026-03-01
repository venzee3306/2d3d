import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Calendar, FileText, Download, X, Activity, PieChart } from 'lucide-react';
import { SettlementReport } from '../types/ledger';

interface SettlementReportViewProps {
  report: SettlementReport;
  onClose: () => void;
}

export function SettlementReportView({ report, onClose }: SettlementReportViewProps) {
  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) {
      return '0';
    }
    return amount.toLocaleString('en-US');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPeriodText = () => {
    switch (report.periodType) {
      case 'daily':
        return 'Daily Report';
      case 'weekly':
        return 'Weekly Report';
      case 'monthly':
        return 'Monthly Report';
      default:
        return 'Report';
    }
  };

  const handleDownload = () => {
    alert('Settlement report download functionality would be implemented here');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Settlement Report</h2>
                <p className="text-sm opacity-90">{getPeriodText()} - {report.userName}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto hide-scrollbar">
          {/* Period Information */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900">Report Period</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Start Date</p>
                <p className="text-lg font-bold text-gray-900">{formatDate(report.startDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">End Date</p>
                <p className="text-lg font-bold text-gray-900">{formatDate(report.endDate)}</p>
              </div>
            </div>
          </div>

          {/* Net Settlement - Main Card */}
          <div className={`bg-gradient-to-br ${report.netSettlement >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} rounded-2xl p-6 text-white shadow-xl`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {report.netSettlement >= 0 ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <TrendingDown className="w-6 h-6" />
                )}
                <h3 className="text-lg font-bold">Net Settlement</h3>
              </div>
              <PieChart className="w-6 h-6 opacity-80" />
            </div>
            <p className="text-5xl font-bold mb-2">{formatCurrency(Math.abs(report.netSettlement))}</p>
            <p className="text-sm opacity-90">MMK</p>
            <div className="mt-4 pt-4 border-t border-white/30">
              <p className="text-sm opacity-90">
                Formula: Total In - Total Out + Commission
              </p>
            </div>
          </div>

          {/* Financial Summary Grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* Total In */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4 text-green-700" />
                </div>
                <p className="text-xs text-green-700 font-semibold">TOTAL IN</p>
              </div>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(report.totalIn)}</p>
              <p className="text-xs text-green-600 mt-1">{report.depositCount} deposits</p>
            </div>

            {/* Total Out */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-orange-700" />
                </div>
                <p className="text-xs text-orange-700 font-semibold">TOTAL OUT</p>
              </div>
              <p className="text-2xl font-bold text-orange-900">{formatCurrency(report.totalOut)}</p>
              <p className="text-xs text-orange-600 mt-1">{report.withdrawalCount} withdrawals</p>
            </div>

            {/* Commission */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-purple-700" />
                </div>
                <p className="text-xs text-purple-700 font-semibold">COMMISSION</p>
              </div>
              <p className="text-2xl font-bold text-purple-900">{formatCurrency(report.commissionEarned)}</p>
              <p className="text-xs text-purple-600 mt-1">Earned</p>
            </div>
          </div>

          {/* Transaction Breakdown */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-gray-900">Transaction Breakdown</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Deposits Received</p>
                <p className="text-xl font-bold text-gray-900">{report.depositCount}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Withdrawals Made</p>
                <p className="text-xl font-bold text-gray-900">{report.withdrawalCount}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Transfers In</p>
                <p className="text-xl font-bold text-gray-900">{report.transferInCount}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Transfers Out</p>
                <p className="text-xl font-bold text-gray-900">{report.transferOutCount}</p>
              </div>
            </div>
          </div>

          {/* Balance Changes */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200">
            <h3 className="font-bold text-gray-900 mb-4">Balance Changes</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-blue-200">
                <span className="text-gray-700 font-medium">Opening Balance</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(report.openingBalance)} MMK</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-blue-200">
                <span className="text-gray-700 font-medium">Closing Balance</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(report.closingBalance)} MMK</span>
              </div>
              <div className="flex items-center justify-between py-3 bg-white rounded-lg px-3">
                <span className="font-bold text-gray-900">Balance Change</span>
                <span className={`text-lg font-bold ${report.balanceChange >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {report.balanceChange >= 0 ? '+' : ''}{formatCurrency(report.balanceChange)} MMK
                </span>
              </div>
            </div>
          </div>

          {/* Calculation Formula */}
          <div className="bg-indigo-50 rounded-xl p-5 border-2 border-indigo-200">
            <h3 className="font-bold text-indigo-900 mb-3">Settlement Calculation</h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total In (Deposits)</span>
                <span className="text-gray-900 font-bold">+{formatCurrency(report.totalIn)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Out (Withdrawals)</span>
                <span className="text-gray-900 font-bold">-{formatCurrency(report.totalOut)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Commission Earned</span>
                <span className="text-gray-900 font-bold">+{formatCurrency(report.commissionEarned)}</span>
              </div>
              <div className="h-px bg-indigo-300 my-2"></div>
              <div className="flex justify-between items-center bg-indigo-100 rounded-lg px-3 py-2">
                <span className="text-indigo-900 font-bold">Net Settlement</span>
                <span className="text-indigo-900 font-bold text-lg">=  {formatCurrency(report.netSettlement)}</span>
              </div>
            </div>
          </div>

          {/* Report Metadata */}
          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600">
            <div className="flex items-center justify-between mb-2">
              <span>Report ID</span>
              <span className="font-mono text-gray-900">{report.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Generated At</span>
              <span className="text-gray-900">{formatDate(report.generatedAt)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleDownload}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl hover:from-indigo-700 hover:to-purple-800 transition-all font-semibold shadow-lg flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Report
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
