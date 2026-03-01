 have a Myanmar Lottery Player platform with an existing bet entry implementation documented in /src/imports/place-bet-flow.md. I need to enhance and complete the Bet Entry system with professional UI, all Myanmar lottery patterns, and improved user experience.

Current Project Structure:
/src/app/components/
  ├── NewBetScreen.tsx           (Main bet entry - needs enhancement)
  ├── PlayerBettingInterface.tsx (Quick bet modal - needs enhancement)
  └── Dashboard.tsx               (Entry point)

/src/app/utils/
  └── patterns.ts                 (Pattern generators - needs completion)

/src/app/data/
  └── newMockData.ts             (Data types, blocked numbers)
PART 1: Enhance Pattern Generation System
File: /src/app/utils/patterns.ts
Add ALL missing Myanmar lottery patterns with proper logic:

export type PatternType = 
  | 'manual'
  | 'power-2' | 'power-3'
  | 'break-2' | 'break-3'
  | 'round' | 'khwe'
  | 'apone' | 'apout'
  | 'brothers' | 'twin'
  | 'natkhat-body'
  | 'body' | 'head'
  | 'nakar' | 'reverse';

// 1. POWER PATTERN (ပါ၀ါ) - Enhanced
export function generatePower2(digit: string): string[] {
  // Generate all 2D numbers containing this digit
  // Example: "5" → [05, 15, 25, 35, 45, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 65, 75, 85, 95]
  const results = new Set<string>();
  
  for (let i = 0; i <= 9; i++) {
    results.add(`${digit}${i}`.padStart(2, '0'));
    results.add(`${i}${digit}`.padStart(2, '0'));
  }
  
  return Array.from(results).sort();
}

export function generatePower3(digit: string): string[] {
  // Generate all 3D numbers containing this digit
  const results = new Set<string>();
  
  for (let i = 0; i <= 9; i++) {
    for (let j = 0; j <= 9; j++) {
      results.add(`${digit}${i}${j}`.padStart(3, '0'));
      results.add(`${i}${digit}${j}`.padStart(3, '0'));
      results.add(`${i}${j}${digit}`.padStart(3, '0'));
    }
  }
  
  return Array.from(results).sort();
}

// 2. BREAK PATTERN (ထိုးခွဲ) - All permutations
export function generateBreak2(input: string): string[] {
  if (input.length !== 2) return [];
  
  const [a, b] = input.split('');
  return Array.from(new Set([
    `${a}${b}`,
    `${b}${a}`
  ]));
}

export function generateBreak3(input: string): string[] {
  if (input.length !== 3) return [];
  
  const permute = (str: string): string[] => {
    if (str.length <= 1) return [str];
    const results: string[] = [];
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const remaining = str.slice(0, i) + str.slice(i + 1);
      for (const perm of permute(remaining)) {
        results.push(char + perm);
      }
    }
    return results;
  };
  
  return Array.from(new Set(permute(input)));
}

// 3. ROUND PATTERN (ပတ်ခွဲ) - Sum-based grouping
export function generateRound(input: string): string[] {
  const sum = input.split('').reduce((acc, d) => acc + parseInt(d), 0);
  const results: string[] = [];
  
  for (let i = 0; i <= 99; i++) {
    const numStr = i.toString().padStart(2, '0');
    const numSum = numStr.split('').reduce((acc, d) => acc + parseInt(d), 0);
    if (numSum === sum) {
      results.push(numStr);
    }
  }
  
  return results;
}

// 4. KHWE PATTERN (ခွေ) - Reverse/mirror
export function generateKhwe(input: string): string[] {
  const reversed = input.split('').reverse().join('');
  return Array.from(new Set([input, reversed]));
}

// 5. APONE PATTERN (အပုံး) - Lead digit
export function generateApone(digit: string, is3D: boolean): string[] {
  const results: string[] = [];
  const max = is3D ? 999 : 99;
  const length = is3D ? 3 : 2;
  
  for (let i = 0; i <= max; i++) {
    const numStr = i.toString().padStart(length, '0');
    if (numStr.startsWith(digit)) {
      results.push(numStr);
    }
  }
  
  return results;
}

// 6. APOUT PATTERN (အပေါက်) - Tail digit
export function generateApout(digit: string, is3D: boolean): string[] {
  const results: string[] = [];
  const max = is3D ? 999 : 99;
  const length = is3D ? 3 : 2;
  
  for (let i = 0; i <= max; i++) {
    const numStr = i.toString().padStart(length, '0');
    if (numStr.endsWith(digit)) {
      results.push(numStr);
    }
  }
  
  return results;
}

// 7. BROTHERS PATTERN (ညီအစ်ကို) - Sequential
export function generateBrothers(input: string, is3D: boolean): string[] {
  const num = parseInt(input);
  const results: string[] = [];
  const length = is3D ? 3 : 2;
  const max = is3D ? 999 : 99;
  
  // Add numbers before and after
  for (let i = -5; i <= 5; i++) {
    const brother = num + i;
    if (brother >= 0 && brother <= max) {
      results.push(brother.toString().padStart(length, '0'));
    }
  }
  
  return results;
}

// 8. TWIN PATTERN (အမွှာ) - Repeated digits
export function generateTwin(is3D: boolean): string[] {
  const results: string[] = [];
  
  if (is3D) {
    for (let i = 0; i <= 9; i++) {
      results.push(`${i}${i}${i}`);
    }
  } else {
    for (let i = 0; i <= 9; i++) {
      results.push(`${i}${i}`);
    }
  }
  
  return results;
}

// 9. NATKHAT BODY PATTERN (နပ်ခတ်ကိုယ်) - X_Y format
export function generateNatkhatBody(head: string, tail: string): string[] {
  const results: string[] = [];
  
  for (let i = 0; i <= 9; i++) {
    results.push(`${head}${i}${tail}`);
  }
  
  return results;
}

// 10. BODY PATTERN (ကိုယ်) - Contains digit
export function generateBody(digit: string, is3D: boolean): string[] {
  return generatePower2(digit); // Same as Power-2 for 2D
}

// 11. HEAD PATTERN (ခေါင်း) - First digit
export function generateHead(digit: string, is3D: boolean): string[] {
  return generateApone(digit, is3D);
}

// 12. NAKAR PATTERN (နာကာ) - Corner numbers
export function generateNakar(input: string): string[] {
  const num = parseInt(input);
  const results: string[] = [];
  
  // Add surrounding numbers in a 3x3 grid
  for (let i = -1; i <= 1; i++) {
    const neighbor = num + i;
    if (neighbor >= 0 && neighbor <= 99) {
      results.push(neighbor.toString().padStart(2, '0'));
    }
  }
  
  return results;
}

// PATTERN LABEL MAPPING
export function getPatternLabel(type: PatternType): { en: string; mm: string } {
  const labels: Record<PatternType, { en: string; mm: string }> = {
    'manual': { en: 'Manual Entry', mm: 'ကိုယ်တိုင်ထည့်' },
    'power-2': { en: 'Power-2', mm: 'ပါ၀ါ-၂' },
    'power-3': { en: 'Power-3', mm: 'ပါ၀ါ-၃' },
    'break-2': { en: 'Break-2', mm: 'ထိုးခွဲ-၂' },
    'break-3': { en: 'Break-3', mm: 'ထိုးခွဲ-၃' },
    'round': { en: 'Round', mm: 'ပတ်ခွဲ' },
    'khwe': { en: 'Khwe', mm: 'ခွေ' },
    'apone': { en: 'Apone', mm: 'အပုံး' },
    'apout': { en: 'Apout', mm: 'အပေါက်' },
    'brothers': { en: 'Brothers', mm: 'ညီအစ်ကို' },
    'twin': { en: 'Twin', mm: 'အမွှာ' },
    'natkhat-body': { en: 'Natkhat Body', mm: 'နပ်ခတ်ကိုယ်' },
    'body': { en: 'Body', mm: 'ကိုယ်' },
    'head': { en: 'Head', mm: 'ခေါင်း' },
    'nakar': { en: 'Nakar', mm: 'နာကာ' },
    'reverse': { en: 'Reverse', mm: 'ပြောင်းပြန်' }
  };
  
  return labels[type];
}

// MAIN GENERATION FUNCTION
export function generatePattern(
  type: PatternType,
  input: string,
  is3D: boolean,
  input2?: string
): string[] {
  switch (type) {
    case 'power-2': return generatePower2(input);
    case 'power-3': return generatePower3(input);
    case 'break-2': return generateBreak2(input);
    case 'break-3': return generateBreak3(input);
    case 'round': return generateRound(input);
    case 'khwe': return generateKhwe(input);
    case 'apone': return generateApone(input, is3D);
    case 'apout': return generateApout(input, is3D);
    case 'brothers': return generateBrothers(input, is3D);
    case 'twin': return generateTwin(is3D);
    case 'natkhat-body': return generateNatkhatBody(input, input2 || '');
    case 'body': return generateBody(input, is3D);
    case 'head': return generateHead(input, is3D);
    case 'nakar': return generateNakar(input);
    case 'reverse': return generateKhwe(input);
    default: return [];
  }
}
PART 2: Enhance NewBetScreen Component
File: /src/app/components/NewBetScreen.tsx
Improvements needed:

A. Add Quick Add Pattern Buttons
After the pattern selector grid, add a horizontal scrollable quick pattern section:

{/* Quick Add Patterns - Horizontal Scroll */}
<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
  <div className="flex justify-between items-center mb-3">
    <h3 className="text-sm font-semibold text-gray-600">
      Quick Patterns
      <span className="ml-2 text-xs myanmar-font">အမြန်ပုံစံများ</span>
    </h3>
    <span className="text-xs text-gray-400">Swipe →</span>
  </div>
  
  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
    {quickPatterns.map(pattern => (
      <button
        key={pattern.id}
        onClick={() => handleQuickPattern(pattern)}
        className={`flex-shrink-0 px-5 py-3 rounded-xl font-bold text-sm
                   ${pattern.color} text-white hover:opacity-90 
                   active:scale-95 transition-all shadow-md myanmar-font
                   whitespace-nowrap`}
      >
        {pattern.labelMM}
      </button>
    ))}
  </div>
</div>

{/* Quick Patterns Data */}
const quickPatterns = [
  { id: 'power-2', labelMM: 'ပါ၀ါ-၂', color: 'bg-blue-500', requiresInput: true },
  { id: 'break-2', labelMM: 'ထိုးခွဲ-၂', color: 'bg-purple-500', requiresInput: true },
  { id: 'round', labelMM: 'ပတ်ခွဲ', color: 'bg-orange-500', requiresInput: true },
  { id: 'khwe', labelMM: 'ခွေ', color: 'bg-green-500', requiresInput: true },
  { id: 'apone', labelMM: 'အပုံး', color: 'bg-teal-500', requiresInput: true },
  { id: 'brothers', labelMM: 'ညီအစ်ကို', color: 'bg-indigo-500', requiresInput: true },
  { id: 'twin', labelMM: 'အမွှာ', color: 'bg-pink-500', requiresInput: false },
  { id: 'natkhat-body', labelMM: 'နပ်ခတ်ကိုယ်', color: 'bg-red-500', requiresInput: true }
];

const handleQuickPattern = (pattern: any) => {
  setPatternType(pattern.id);
  // Scroll to pattern input section
  setTimeout(() => {
    document.getElementById('pattern-input')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    });
  }, 100);
};
B. Improve Generated Numbers Display
Replace the current generated numbers preview with a better design:

{generatedNumbers.length > 0 && (
  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 border-2 border-blue-200">
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
        <span className="text-sm font-semibold text-gray-700">
          {t('generatedNumbers')} ({generatedNumbers.length})
        </span>
      </div>
      <button
        onClick={() => setGeneratedNumbers([])}
        className="text-xs text-red-600 hover:text-red-700 font-semibold"
      >
        {t('clear')}
      </button>
    </div>
    
    <div className="max-h-64 overflow-y-auto">
      <div className="grid grid-cols-5 gap-2">
        {generatedNumbers.slice(0, 50).map((num, idx) => {
          const isBlocked = checkBlockedNumber(num, gameMode);
          return (
            <div
              key={idx}
              className={`
                px-3 py-2 rounded-lg text-center font-bold text-sm
                ${isBlocked 
                  ? 'bg-red-100 text-red-600 line-through' 
                  : 'bg-white text-gray-800 shadow-sm'
                }
              `}
            >
              {num}
            </div>
          );
        })}
      </div>
      
      {generatedNumbers.length > 50 && (
        <div className="mt-3 text-center">
          <span className="text-xs text-gray-600 bg-white px-3 py-1 rounded-full">
            +{generatedNumbers.length - 50} more numbers
          </span>
        </div>
      )}
      
      {generatedNumbers.some(n => checkBlockedNumber(n, gameMode)) && (
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2">
          <p className="text-xs text-amber-700">
            ⚠️ {t('blockedNumbersWillBeSkipped')}
          </p>
        </div>
      )}
    </div>
  </div>
)}
C. Add Custom Numeric Keypad (Optional Enhancement)
For mobile users, add a custom keypad for number entry:

{showKeypad && (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 z-40">
    <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
      {[1, 2, 3, 'ADD', 4, 5, 6, 'DEL', 7, 8, 9, '✓', 'CLR', 0, '00', '000'].map((key) => (
        <button
          key={key}
          onClick={() => handleKeypadPress(key)}
          className={`
            py-4 rounded-xl font-bold text-lg transition-all
            ${typeof key === 'number' || key === '00' || key === '000'
              ? 'bg-white shadow-md text-gray-800 active:scale-95'
              : key === 'ADD' || key === '✓'
              ? 'bg-green-500 text-white shadow-lg active:scale-95'
              : key === 'DEL' || key === 'CLR'
              ? 'bg-red-500 text-white shadow-lg active:scale-95'
              : 'bg-gray-200 text-gray-600'
            }
          `}
        >
          {key}
        </button>
      ))}
    </div>
  </div>
)}

const handleKeypadPress = (key: string | number) => {
  if (typeof key === 'number' || key === '00' || key === '000') {
    // Append to current input
    setManualNumber(prev => (prev + key).slice(0, gameMode === '2D' ? 2 : 3));
  } else if (key === 'DEL') {
    // Delete last digit
    setManualNumber(prev => prev.slice(0, -1));
  } else if (key === 'CLR') {
    // Clear all
    setManualNumber('');
  } else if (key === '✓') {
    // Confirm and focus amount
    document.getElementById('amount-input')?.focus();
  } else if (key === 'ADD') {
    // Add to cart
    handleAddManualBet();
  }
};
D. Enhance Balance Warning UI
Improve the insufficient balance warning:

{cartTotal > balance && (
  <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-4 mb-4 shadow-lg">
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <h4 className="text-white font-bold text-lg mb-1">
          {t('insufficientBalance')}
        </h4>
        <p className="text-white/90 text-sm mb-2">
          {language === 'mm' 
            ? 'သင့်အကောင့်တွင် ငွေလက်ကျန်မလုံလောက်ပါ' 
            : 'Your balance is insufficient to place these bets'
          }
        </p>
        <div className="flex items-center gap-4 text-sm text-white/80">
          <div>
            <span className="opacity-70">{t('needed')}:</span>
            <span className="font-bold ml-1">{cartTotal.toLocaleString()} MMK</span>
          </div>
          <div>
            <span className="opacity-70">{t('shortage')}:</span>
            <span className="font-bold ml-1 text-yellow-300">
              {(cartTotal - balance).toLocaleString()} MMK
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
PART 3: Enhance Cart Modal
File: /src/app/components/NewBetScreen.tsx (Cart Modal Section)
Improve the cart modal with grouping and better actions:

{showCart && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
    <div className="bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] w-full max-w-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="border-b px-5 py-4 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-5 h-5 text-white" />
          <h2 className="text-xl font-bold text-white">
            {t('cart')} ({cart.length})
          </h2>
        </div>
        <button
          onClick={() => setShowCart(false)}
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 
                     flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>
      
      {/* Cart Summary Stats */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 border-b">
        <div className="text-center">
          <p className="text-xs text-gray-600">{t('totalBets')}</p>
          <p className="text-lg font-bold text-blue-600">{cart.length}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">{t('totalAmount')}</p>
          <p className="text-lg font-bold text-green-600">
            {cartTotal.toLocaleString()} <span className="text-sm">MMK</span>
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">{t('afterBalance')}</p>
          <p className={`text-lg font-bold ${
            balance - cartTotal >= 0 ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {(balance - cartTotal).toLocaleString()} <span className="text-sm">MMK</span>
          </p>
        </div>
      </div>
      
      {/* Cart Items - Grouped by Pattern */}
      <div className="flex-1 overflow-y-auto p-5">
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('cartEmpty')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Group by pattern type */}
            {Object.entries(groupCartByPattern(cart)).map(([patternType, items]) => (
              <div key={patternType} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="font-semibold text-sm myanmar-font">
                      {getPatternLabel(patternType as PatternType).mm}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({items.length} {t('numbers')})
                    </span>
                  </div>
                  <button
                    onClick={() => removePatternFromCart(patternType)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    {t('removeAll')}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {items.map(item => {
                    const blocked = checkBlockedNumber(item.number, item.gameMode);
                    return (
                      <div
                        key={item.id}
                        className={`
                          flex items-center justify-between p-2.5 rounded-lg
                          ${blocked 
                            ? 'bg-red-50 border-2 border-red-300' 
                            : 'bg-white border border-gray-200'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-12 h-12 rounded-lg flex items-center justify-center
                            font-bold text-lg
                            ${blocked 
                              ? 'bg-red-100 text-red-600' 
                              : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                            }
                          `}>
                            {item.number}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">
                              {item.amount.toLocaleString()} MMK
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.gameMode} • {
                                language === 'mm' 
                                  ? item.pattern?.labelMM 
                                  : item.pattern?.label
                              }
                            </p>
                            {blocked && (
                              <p className="text-xs text-red-600 font-semibold mt-0.5">
                                🚫 {t('blocked')}: {blocked.reason}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer Actions */}
      <div className="border-t p-5 bg-white">
        {hasBlockedNumbersInCart() && (
          <button
            onClick={removeBlockedFromCart}
            className="w-full mb-3 py-2.5 bg-red-50 border-2 border-red-300 
                       text-red-700 rounded-xl font-semibold hover:bg-red-100 
                       transition-colors"
          >
            🗑️ {t('removeBlockedNumbers')}
          </button>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={clearCart}
            disabled={cart.length === 0}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl 
                       font-semibold hover:bg-gray-200 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('clearCart')}
          </button>
          <button
            onClick={() => {
              setShowCart(false);
              handleConfirmBets();
            }}
            disabled={cart.length === 0 || cartTotal > balance}
            className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 
                       text-white rounded-xl font-semibold hover:shadow-lg 
                       transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('confirmBets')} →
          </button>
        </div>
      </div>
    </div>
  </div>
)}

// Helper function to group cart items by pattern
const groupCartByPattern = (items: CartItem[]) => {
  return items.reduce((acc, item) => {
    const patternType = item.pattern?.type || 'manual';
    if (!acc[patternType]) acc[patternType] = [];
    acc[patternType].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);
};

const removePatternFromCart = (patternType: string) => {
  const itemsToRemove = cart.filter(item => item.pattern?.type === patternType);
  itemsToRemove.forEach(item => removeFromCart(item.id));
  toast.success(`Removed ${itemsToRemove.length} ${patternType} bets`);
};
PART 4: Add Toast Notifications
Install and Configure Sonner:
# If not already installed
npm install sonner
In your main App.tsx or layout:
import { Toaster, toast } from 'sonner';

function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      {/* Rest of your app */}
    </>
  );
}
Usage in NewBetScreen:
import { toast } from 'sonner';

// Success
toast.success('Added to cart', {
  description: `${manualNumber} - ${manualAmount} MMK`
});

// Error
toast.error('Number is blocked', {
  description: blocked.reason
});

// Warning
toast.warning(`${blockedCount} numbers were blocked`, {
  description: 'Blocked numbers were skipped'
});

// Info
toast.info('Generated 10 numbers', {
  description: 'Review and add to cart'
});
PART 5: Add Myanmar Font Support
File: /src/styles/fonts.css
/* Myanmar Font Imports */
@import url('https://fonts.googleapis.com/css2?family=Padauk:wght@400;700&family=Noto+Sans+Myanmar:wght@400;500;600;700&display=swap');

/* Myanmar Font Classes */
.myanmar-font {
  font-family: 'Padauk', 'Noto Sans Myanmar', 'Myanmar Text', sans-serif;
}

/* Apply to all elements with Myanmar text */
[lang="mm"],
.lang-mm {
  font-family: 'Padauk', 'Noto Sans Myanmar', 'Myanmar Text', sans-serif;
}
Apply to Pattern Buttons:
<button 
  className="... myanmar-font"
  style={{ fontFamily: 'Padauk, Noto Sans Myanmar, Myanmar Text' }}
>
  {getPatternLabel(pattern).mm}
</button>
PART 6: Add Animations
Install Motion (if not already installed):
npm install motion
Add Entry Animations:
import { motion } from 'motion/react';

// Animate cart items
{cart.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.2, delay: index * 0.05 }}
  >
    {/* Cart item content */}
  </motion.div>
))}

// Animate generated numbers
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.3 }}
>

  {/* Generated numbers grid */}
</motion.div>
SUMMARY OF CHANGES:
✅ Complete all pattern generation functions
Add missing patterns: Body, Head, Nakar, Reverse
Ensure all generators work correctly for 2D and 3D
✅ Add Quick Add Pattern buttons
Horizontal scrollable section
Color-coded buttons with Myanmar labels
One-tap pattern activation
✅ Improve generated numbers display
Grid layout for better visibility
Show blocked numbers with strikethrough
Limit display to 50 with "show more" indicator
✅ Enhance cart modal
Group items by pattern type
Show statistics (total bets, amount, balance)
Quick remove by pattern group
Better blocked number warnings
✅ Add custom numeric keypad (optional)
Mobile-friendly input method
Quick amount buttons (00, 000)
Instant add to cart
✅ Improve balance warnings
Prominent red gradient alert
Show shortage amount
Disable submit when insufficient
✅ Add toast notifications
Success/error feedback
Myanmar language support
Rich descriptions
✅ Add animations
Smooth cart item additions
Pattern generation reveal
Modal transitions
✅ Ensure Myanmar fonts everywhere
All pattern labels in Myanmar
Proper font-family stack
Consistent typography
TESTING CHECKLIST:
 All patterns generate correct numbers
 Blocked numbers are detected and flagged
 Balance validation works correctly
 Cart can add/remove items
 Quick patterns work on one click
 Myanmar text displays correctly
 Toast notifications appear
 Animations are smooth
 Mobile responsive layout works
 Bet submission completes successfully