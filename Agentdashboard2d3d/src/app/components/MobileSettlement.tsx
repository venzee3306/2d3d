import { ArrowLeft } from 'lucide-react';

interface MobileSettlementProps {
  onBack: () => void;
  agentName: string;
  winningNumber?: string;
  salesTotal: number;
  commission: number;
  winningBet: number;
  payout: number;
  netProfit: number;
}

export function MobileSettlement({
  onBack,
  agentName,
  winningNumber,
  salesTotal,
  commission,
  winningBet,
  payout,
  netProfit,
}: MobileSettlementProps) {
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  return (
    <div className="w-full max-w-[375px] h-[812px] bg-[#F5F5F5] flex flex-col mx-auto overflow-hidden">
      {/* Header - Back Button and Title */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 flex-shrink-0 shadow-sm">
        <button 
          onClick={onBack} 
          className="p-1 -ml-1"
          style={{ touchAction: 'manipulation' }}
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-base font-semibold text-gray-900 flex-1 text-center pr-7" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
          {agentName} ၏ ငွေတောရင်း ရှင်းတမ်း
        </h1>
      </div>

      {/* Main Content - Scrollable */}
      <div 
        className="flex-1 px-4 pt-6 pb-4 overflow-y-auto hide-scrollbar"
      >
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm overflow-hidden">
          
          {/* Result Section - ထွက်ဂဏန်း */}
          <div className="flex flex-col items-center pt-6 pb-4 px-4">
            {/* Label ABOVE the box */}
            <p className="text-sm font-medium text-gray-600 mb-3" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
              ထွက်ဂဏန်း
            </p>
            
            {/* Rounded box with ?? */}
            <div className="w-full max-w-[200px] bg-white border-2 border-gray-300 rounded-2xl py-6 flex items-center justify-center">
              {winningNumber ? (
                <span className="text-4xl font-bold text-green-600 tracking-wide">
                  {winningNumber}
                </span>
              ) : (
                <span className="text-4xl font-bold text-green-600">??</span>
              )}
            </div>
          </div>

          {/* Financial Data List - Simple rows */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between py-3 px-5 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-800" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                ရောင်းရငွေ
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {formatNumber(salesTotal)} ks
              </span>
            </div>

            <div className="flex items-center justify-between py-3 px-5 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-800" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                ကော်မရှင်ကြေး
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {formatNumber(commission)} ks
              </span>
            </div>

            <div className="flex items-center justify-between py-3 px-5 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-800" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                ပေါက်ကွက်
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {formatNumber(winningBet)} ks
              </span>
            </div>

            <div className="flex items-center justify-between py-3 px-5 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-800" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                ယော်ငွေ
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {formatNumber(payout)} ks
              </span>
            </div>

            <div className="flex items-center justify-between py-3 px-5 bg-green-100 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-800" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                အမြတ်
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {formatNumber(netProfit)} ks
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
