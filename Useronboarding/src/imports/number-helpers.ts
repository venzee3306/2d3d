/**
 * Myanmar Lottery Pattern Generators
 * Complete implementation of all pattern generation logic
 */

export const PATTERN_GENERATORS = {
  // အုပ်စု - Power: All numbers containing digit
  power: (digit: string, is3D: boolean): string[] => {
    const results = new Set<string>();
    const max = is3D ? 999 : 99;
    const len = is3D ? 3 : 2;
    
    for (let i = 0; i <= max; i++) {
      const str = i.toString().padStart(len, '0');
      if (str.includes(digit)) results.add(str);
    }
    return Array.from(results).sort();
  },

  // ထိပ် - Head: Numbers starting with digit
  head: (digit: string, is3D: boolean): string[] => {
    const results: string[] = [];
    const max = is3D ? 99 : 9;
    const len = is3D ? 3 : 2;
    
    for (let i = 0; i <= max; i++) {
      results.push(`${digit}${i.toString().padStart(len - 1, '0')}`);
    }
    return results;
  },

  // ဘြိတ် - Break: All permutations
  break: (input: string, is3D: boolean): string[] => {
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
  },

  // အောက် - Tail: Numbers ending with digit
  tail: (digit: string, is3D: boolean): string[] => {
    const results: string[] = [];
    const max = is3D ? 99 : 9;
    const len = is3D ? 3 : 2;
    
    for (let i = 0; i <= max; i++) {
      results.push(`${i.toString().padStart(len - 1, '0')}${digit}`);
    }
    return results;
  },

  // ပါတ် - Round: Same sum family
  round: (input: string): string[] => {
    const sum = input.split('').reduce((a, b) => a + parseInt(b), 0);
    const results: string[] = [];
    const max = input.length === 2 ? 99 : 999;
    
    for (let i = 0; i <= max; i++) {
      const str = i.toString().padStart(input.length, '0');
      const strSum = str.split('').reduce((a, b) => a + parseInt(b), 0);
      if (strSum === sum) results.push(str);
    }
    return results;
  },

  // R - Reverse
  reverse: (input: string): string[] => {
    const reversed = input.split('').reverse().join('');
    return input === reversed ? [input] : [input, reversed];
  },

  // နောက် - Nakar: Corner numbers (±1)
  nakar: (input: string): string[] => {
    const num = parseInt(input);
    const len = input.length;
    const max = len === 2 ? 99 : 999;
    
    return [-1, 0, 1]
      .map(i => num + i)
      .filter(n => n >= 0 && n <= max)
      .map(n => n.toString().padStart(len, '0'));
  },

  // ခွေ - Khwe: Last digit multiples
  khwe: (digit: string): string[] => {
    return Array.from({length: 10}, (_, i) => `${i}${digit}`);
  },

  // ညီအစ်ကို - Brothers: Sequential numbers
  brothers: (is3D: boolean): string[] => {
    const results: string[] = [];
    if (is3D) {
      // 3D: 012, 123, 234, ..., 789
      for (let i = 0; i <= 7; i++) {
        results.push(`${i}${i+1}${i+2}`);
      }
    } else {
      // 2D: 01, 12, 23, 34, ..., 89
      for (let i = 0; i <= 8; i++) {
        results.push(`${i}${i+1}`);
      }
    }
    return results;
  },

  // အမွှာ - Twins: Repeated digits
  twins: (is3D: boolean): string[] => {
    return Array.from({length: 10}, (_, i) => 
      is3D ? `${i}${i}${i}` : `${i}${i}`
    );
  },

  // ကိုယ် - Body: All positions containing digit (same as power)
  body: (digit: string, is3D: boolean): string[] => {
    return PATTERN_GENERATORS.power(digit, is3D);
  },

  // ထိပ်စီး - First Position: First digit only
  firstPos: (digit: string, is3D: boolean): string[] => {
    return PATTERN_GENERATORS.head(digit, is3D);
  },

  // အလယ် - Middle Position: Middle digit only (3D only)
  midPos: (digit: string): string[] => {
    const results: string[] = [];
    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j <= 9; j++) {
        results.push(`${i}${digit}${j}`);
      }
    }
    return results;
  },

  // နောက်ဆုံး - Last Position: Last digit only
  lastPos: (digit: string, is3D: boolean): string[] => {
    return PATTERN_GENERATORS.tail(digit, is3D);
  },

  // နပ်ခတ်ကိုယ် - Natkhat Body: 3D pattern X_Y format
  natkhatBody: (head: string, tail: string): string[] => {
    const results: string[] = [];
    for (let i = 0; i <= 9; i++) {
      results.push(`${head}${i}${tail}`);
    }
    return results;
  },

  // ပါ၀ါ-၂ - Power-2: Enhanced power pattern (2D)
  power2: (digit: string): string[] => {
    return PATTERN_GENERATORS.power(digit, false);
  },

  // ပါ၀ါ-၃ - Power-3: Enhanced power pattern (3D)
  power3: (digit: string): string[] => {
    return PATTERN_GENERATORS.power(digit, true);
  },

  // အုပ်စု (၃လုံး) - 3D Power
  power3D: (digit: string): string[] => {
    return PATTERN_GENERATORS.power(digit, true);
  },

  // ထိုးခွဲ (၃လုံး) - 3D Break
  break3D: (input: string): string[] => {
    return PATTERN_GENERATORS.break(input, true);
  },

  // ပတ် (၃လုံး) - 3D Round
  round3D: (input: string): string[] => {
    return PATTERN_GENERATORS.round(input);
  },

  // အပုံး - Apone: Numbers that sum to input
  apone: (input: string): string[] => {
    return PATTERN_GENERATORS.round(input);
  },

  // အပေါက် - Apout: Reverse + original
  apout: (input: string): string[] => {
    return PATTERN_GENERATORS.reverse(input);
  },

  // ပူပြင်း - Hot Numbers: Common/frequent (placeholder - needs actual data)
  hot: (is3D: boolean): string[] => {
    // This would typically come from historical data
    // Placeholder implementation
    const len = is3D ? 3 : 2;
    const sampleHot = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];
    if (is3D) {
      return ['000', '111', '222', '333', '444', '555', '666', '777', '888', '999'];
    }
    return sampleHot;
  },

  // အေးခဲ - Cold Numbers: Rare/infrequent (placeholder - needs actual data)
  cold: (is3D: boolean): string[] => {
    // This would typically come from historical data
    // Placeholder implementation
    const len = is3D ? 3 : 2;
    if (is3D) {
      return ['123', '234', '345', '456', '567', '678', '789'];
    }
    return ['12', '23', '34', '45', '56', '67', '78', '89'];
  },

  // ကံကောင်း - Lucky Set: User favorites (placeholder)
  lucky: (is3D: boolean): string[] => {
    // This would come from user's saved favorites
    // Placeholder implementation
    return [];
  }
};

/**
 * Helper function to validate if a number string is valid for the game mode
 */
export const isValidNumber = (num: string, is3D: boolean): boolean => {
  const expectedLength = is3D ? 3 : 2;
  if (num.length !== expectedLength) return false;
  return /^\d+$/.test(num);
};

/**
 * Helper function to pad number to correct length
 */
export const padNumber = (num: string | number, is3D: boolean): string => {
  const len = is3D ? 3 : 2;
  return num.toString().padStart(len, '0');
};

/**
 * Helper function to calculate digit sum
 */
export const digitSum = (num: string): number => {
  return num.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
};

/**
 * Helper function to check if number is blocked
 */
export const isBlockedNumber = (
  num: string, 
  gameType: '2D' | '3D',
  blockedList: { number: string; gameType: '2D' | '3D' }[]
): boolean => {
  return blockedList.some(
    blocked => blocked.number === num && blocked.gameType === gameType
  );
};

/**
 * Helper function to filter out blocked numbers from a list
 */
export const filterBlockedNumbers = (
  numbers: string[],
  gameType: '2D' | '3D',
  blockedList: { number: string; gameType: '2D' | '3D' }[]
): { allowed: string[]; blocked: string[] } => {
  const allowed: string[] = [];
  const blocked: string[] = [];
  
  numbers.forEach(num => {
    if (isBlockedNumber(num, gameType, blockedList)) {
      blocked.push(num);
    } else {
      allowed.push(num);
    }
  });
  
  return { allowed, blocked };
};

/**
 * Helper function to generate all numbers for a game type
 */
export const getAllNumbers = (is3D: boolean): string[] => {
  const max = is3D ? 999 : 99;
  const len = is3D ? 3 : 2;
  const results: string[] = [];
  
  for (let i = 0; i <= max; i++) {
    results.push(i.toString().padStart(len, '0'));
  }
  
  return results;
};

/**
 * Export pattern type definitions for type safety
 */
export type PatternId = 
  | 'power' | 'head' | 'break' | 'tail' | 'round' | 'reverse'
  | 'nakar' | 'khwe' | 'brothers' | 'twins' 
  | 'body' | 'first-pos' | 'mid-pos' | 'last-pos' | 'natkhat'
  | 'power-2' | 'power-3' | 'break-3d' | 'round-3d' | 'power-3d'
  | 'apone' | 'apout' | 'hot' | 'cold' | 'lucky';

export interface PatternDefinition {
  id: PatternId;
  labelMM: string;
  labelEN: string;
  color: string;
  requiresInput: boolean;
  gameMode: '2D' | '3D' | 'both';
  description?: string;
}

/**
 * All available patterns with metadata
 */
export const ALL_PATTERNS: PatternDefinition[] = [
  // Page 1 - Core Patterns
  { id: 'power', labelMM: 'အုပ်စု', labelEN: 'Power', color: 'bg-blue-500', requiresInput: true, gameMode: 'both' },
  { id: 'head', labelMM: 'ထိပ်', labelEN: 'Head', color: 'bg-purple-500', requiresInput: true, gameMode: 'both' },
  { id: 'break', labelMM: 'ဘြိတ်', labelEN: 'Break', color: 'bg-orange-500', requiresInput: true, gameMode: 'both' },
  { id: 'tail', labelMM: 'အောက်', labelEN: 'Tail', color: 'bg-green-500', requiresInput: true, gameMode: 'both' },
  { id: 'round', labelMM: 'ပါတ်', labelEN: 'Round', color: 'bg-teal-500', requiresInput: true, gameMode: 'both' },
  { id: 'reverse', labelMM: 'R', labelEN: 'Reverse', color: 'bg-purple-600', requiresInput: true, gameMode: 'both' },
  
  // Page 2 - Extended Patterns
  { id: 'nakar', labelMM: 'နောက်', labelEN: 'Nakar', color: 'bg-yellow-500', requiresInput: true, gameMode: '2D' },
  { id: 'khwe', labelMM: 'ခွေ', labelEN: 'Khwe', color: 'bg-indigo-500', requiresInput: true, gameMode: '2D' },
  { id: 'brothers', labelMM: 'ညီအစ်ကို', labelEN: 'Brothers', color: 'bg-pink-500', requiresInput: false, gameMode: 'both' },
  { id: 'twins', labelMM: 'အမွှာ', labelEN: 'Twins', color: 'bg-red-500', requiresInput: false, gameMode: 'both' },
  { id: 'power-2', labelMM: 'ပါ၀ါ-၂', labelEN: 'Power-2', color: 'bg-blue-600', requiresInput: true, gameMode: '2D' },
  { id: 'power-3', labelMM: 'ပါ၀ါ-၃', labelEN: 'Power-3', color: 'bg-blue-700', requiresInput: true, gameMode: '3D' },
  
  // Page 3 - Body/Position Patterns
  { id: 'body', labelMM: 'ကိုယ်', labelEN: 'Body', color: 'bg-cyan-500', requiresInput: true, gameMode: 'both' },
  { id: 'first-pos', labelMM: 'ထိပ်စီး', labelEN: 'First', color: 'bg-lime-500', requiresInput: true, gameMode: 'both' },
  { id: 'mid-pos', labelMM: 'အလယ်', labelEN: 'Middle', color: 'bg-amber-500', requiresInput: true, gameMode: '3D' },
  { id: 'last-pos', labelMM: 'နောက်ဆုံး', labelEN: 'Last', color: 'bg-emerald-500', requiresInput: true, gameMode: 'both' },
  { id: 'natkhat', labelMM: 'နပ်ခတ်ကိုယ်', labelEN: 'Natkhat', color: 'bg-red-600', requiresInput: true, gameMode: '3D' },
  
  // Page 4 - 3D Specific
  { id: 'break-3d', labelMM: 'ထိုးခွဲ (၃လုံး)', labelEN: '3D Break', color: 'bg-purple-500', requiresInput: true, gameMode: '3D' },
  { id: 'round-3d', labelMM: 'ပတ် (၃လုံး)', labelEN: '3D Round', color: 'bg-orange-500', requiresInput: true, gameMode: '3D' },
  { id: 'power-3d', labelMM: 'အုပ်စု (၃လုံး)', labelEN: '3D Power', color: 'bg-blue-500', requiresInput: true, gameMode: '3D' },
  
  // Page 5 - Special/Custom
  { id: 'apone', labelMM: 'အပုံး', labelEN: 'Apone', color: 'bg-teal-600', requiresInput: true, gameMode: 'both' },
  { id: 'apout', labelMM: 'အပေါက်', labelEN: 'Apout', color: 'bg-cyan-600', requiresInput: true, gameMode: 'both' },
  { id: 'hot', labelMM: 'ပူပြင်း', labelEN: 'Hot', color: 'bg-red-400', requiresInput: false, gameMode: 'both' },
  { id: 'cold', labelMM: 'အေးခဲ', labelEN: 'Cold', color: 'bg-blue-300', requiresInput: false, gameMode: 'both' },
  { id: 'lucky', labelMM: 'ကံကောင်း', labelEN: 'Lucky', color: 'bg-yellow-600', requiresInput: false, gameMode: 'both' }
];
