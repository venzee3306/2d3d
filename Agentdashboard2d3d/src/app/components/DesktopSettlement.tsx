import { ArrowLeft } from 'lucide-react';

interface DesktopSettlementProps {
  onBack: () => void;
  agentName: string;
  winningNumber?: string;
  salesTotal: number;
  commission: number;
  winningBet: number;
  payout: number;
  netProfit: number;
}

export function DesktopSettlement({
  onBack,
  agentName,
  winningNumber,
  salesTotal,
  commission,
  winningBet,
  payout,
  netProfit,
}: DesktopSettlementProps) {
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  return (
    <div className="flex-1 bg-[#F5F5F5] flex flex-col overflow-hidden">
      {/* Header - Back Button and Title */}
      <div className="bg-white px-6 py-5 flex items-center gap-4 flex-shrink-0 shadow-sm">
        <button 
          onClick={onBack} 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
          {agentName} ၏ ငွေတောရင်း ရှင်းတမ်း
        </h1>
      </div>

      {/* Main Content - Centered Card */}
      <div className="flex-1 flex items-start justify-center px-6 py-8 overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
          
          {/* Result Section - ထွက်ဂဏန်း */}
          <div className="flex flex-col items-center pt-8 pb-6 px-6">
            {/* Label ABOVE the box */}
            <p className="text-base font-medium text-gray-600 mb-4" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              ထွက်ဂဏန်း
            </p>
            
            {/* Rounded box with ?? */}
            <div className="w-full max-w-[240px] bg-white border-2 border-gray-300 rounded-2xl py-8 flex items-center justify-center">
              {winningNumber ? (
                <span className="text-5xl font-bold text-green-600 tracking-wide">
                  {winningNumber}
                </span>
              ) : (
                <span className="text-5xl font-bold text-green-600">??</span>
              )}
            </div>
          </div>

          {/* Financial Data List - Simple rows */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between py-4 px-6 border-t border-gray-200">
              <span className="text-base font-medium text-gray-800" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                ရောင်းရငွေ
              </span>
              <span className="text-base font-semibold text-gray-900">
                {formatNumber(salesTotal)} ks
              </span>
            </div>

            <div className="flex items-center justify-between py-4 px-6 border-t border-gray-200">
              <span className="text-base font-medium text-gray-800" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                ကော်မရှင်ကြေး
              </span>
              <span className="text-base font-semibold text-gray-900">
                {formatNumber(commission)} ks
              </span>
            </div>

            <div className="flex items-center justify-between py-4 px-6 border-t border-gray-200">
              <span className="text-base font-medium text-gray-800" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                ပေါက်ကွက်
              </span>
              <span className="text-base font-semibold text-gray-900">
                {formatNumber(winningBet)} ks
              </span>
            </div>

            <div className="flex items-center justify-between py-4 px-6 border-t border-gray-200">
              <span className="text-base font-medium text-gray-800" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                ယော်ငွေ
              </span>
              <span className="text-base font-semibold text-gray-900">
                {formatNumber(payout)} ks
              </span>
            </div>

            <div className="flex items-center justify-between py-4 px-6 bg-green-100 border-t border-gray-200">
              <span className="text-base font-medium text-gray-800" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                အမြတ်
              </span>
              <span className="text-base font-semibold text-gray-900">
                {formatNumber(netProfit)} ks
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
