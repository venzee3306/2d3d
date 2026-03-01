I need to implement all Myanmar lottery Quick Add Pattern keys with their exact logic and powers. Each pattern should work correctly for both 2D and 3D game modes.

COMPLETE PATTERN KEYS REFERENCE
File: /src/app/utils/quickPatterns.ts
/**
 * COMPLETE MYANMAR LOTTERY PATTERN GENERATORS
 * All 25+ traditional betting patterns with exact logic
 */

export type QuickPatternType = 
  | 'power-group'      // အုပ်စု
  | 'head'             // ထိပ်
  | 'break'            // ဘြိတ်
  | 'nakar'            // နောက်
  | 'round'            // ပါတ်
  | 'reverse'          // R
  | 'khwe'             // ခွေ
  | 'khwe-pu'          // ခွေပူး
  | 'a-pu'             // အပူး
  | 'even-pu'          // စုံပူး
  | 'odd-pu'           // မပူး
  | 'power'            // ပါဝါ
  | 'nakha'            // နက္ခ
  | 'bro-asc'          // ညီကို (ascending)
  | 'bro-desc'         // ကိုညီ (descending)
  | 'bro-reverse'      // ညီကိုR
  | 'even-odd'         // စုံမ
  | 'odd-even'         // မစုံ
  | 'even-odd-r'       // စုံမR
  | 'even-even'        // စုံစုံ
  | 'odd-odd'          // မမ
  | 'even-adj'         // စုံကပ်
  | 'even-adj-r'       // စုံကပ်R
  | 'odd-adj'          // မကပ်
  | 'odd-adj-r';       // မကပ်R

// ========================================
// 1. အုပ်စု - POWER GROUP
// ========================================
// Logic: Generate all numbers containing the input digit
// Example: "5" → 05, 15, 25, 35, 45, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 65, 75, 85, 95
export function generatePowerGroup(digit: string, is3D: boolean = false): string[] {
  const results = new Set<string>();
  const max = is3D ? 999 : 99;
  const length = is3D ? 3 : 2;
  
  for (let i = 0; i <= max; i++) {
    const numStr = i.toString().padStart(length, '0');
    if (numStr.includes(digit)) {
      results.add(numStr);
    }
  }
  
  return Array.from(results).sort();
}

// ========================================
// 2. ထိပ် - HEAD
// ========================================
// Logic: All numbers starting with the input digit
// Example: "5" → 50, 51, 52, 53, 54, 55, 56, 57, 58, 59
export function generateHead(digit: string, is3D: boolean = false): string[] {
  const results: string[] = [];
  const range = is3D ? 100 : 10; // 5XX for 3D, 5X for 2D
  const length = is3D ? 3 : 2;
  
  for (let i = 0; i < range; i++) {
    results.push(digit + i.toString().padStart(length - 1, '0'));
  }
  
  return results;
}

// ========================================
// 3. ဘြိတ် - BREAK
// ========================================
// Logic: All permutations of input number
// Example: "23" → 23, 32
// Example: "123" → 123, 132, 213, 231, 312, 321
export function generateBreak(input: string): string[] {
  if (input.length < 2) return [input];
  
  const permute = (str: string): string[] => {
    if (str.length <= 1) return [str];
    const results: string[] = [];
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const remaining = str.slice(0, i) + str.slice(i + 1);
      const perms = permute(remaining);
      
      for (const perm of perms) {
        results.push(char + perm);
      }
    }
    
    return results;
  };
  
  return Array.from(new Set(permute(input))).sort();
}

// ========================================
// 4. နောက် - NAKAR (Corner/Neighbor)
// ========================================
// Logic: Input number ± 1
// Example: "45" → 44, 45, 46
export function generateNakar(input: string, is3D: boolean = false): string[] {
  const num = parseInt(input);
  const max = is3D ? 999 : 99;
  const length = is3D ? 3 : 2;
  const results: string[] = [];
  
  for (let offset = -1; offset <= 1; offset++) {
    const neighbor = num + offset;
    if (neighbor >= 0 && neighbor <= max) {
      results.push(neighbor.toString().padStart(length, '0'));
    }
  }
  
  return results;
}

// ========================================
// 5. ပါတ် - ROUND (Same sum family)
// ========================================
// Logic: All numbers with same digit sum
// Example: "23" (sum=5) → 05, 14, 23, 32, 41, 50
export function generateRound(input: string, is3D: boolean = false): string[] {
  const targetSum = input.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  const max = is3D ? 999 : 99;
  const length = is3D ? 3 : 2;
  const results: string[] = [];
  
  for (let i = 0; i <= max; i++) {
    const numStr = i.toString().padStart(length, '0');
    const digitSum = numStr.split('').reduce((sum, d) => sum + parseInt(d), 0);
    
    if (digitSum === targetSum) {
      results.push(numStr);
    }
  }
  
  return results;
}

// ========================================
// 6. R - REVERSE
// ========================================
// Logic: Original and reversed number
// Example: "23" → 23, 32
export function generateReverse(input: string): string[] {
  const reversed = input.split('').reverse().join('');
  return Array.from(new Set([input, reversed])).sort();
}

// ========================================
// 7. ခွေ - KHWE (Vertical line)
// ========================================
// Logic: All numbers ending with same digit
// Example: "5" → 05, 15, 25, 35, 45, 55, 65, 75, 85, 95
export function generateKhwe(digit: string, is3D: boolean = false): string[] {
  const results: string[] = [];
  const range = is3D ? 100 : 10;
  const length = is3D ? 3 : 2;
  
  for (let i = 0; i < range; i++) {
    results.push(i.toString().padStart(length - 1, '0') + digit);
  }
  
  return results;
}

// ========================================
// 8. ခွေပူး - KHWE PU (Khwe combinations)
// ========================================
// Logic: Combine two khwe lines
// Example: "5", "7" → All X5 and X7 numbers
export function generateKhwePu(digit1: string, digit2: string, is3D: boolean = false): string[] {
  const line1 = generateKhwe(digit1, is3D);
  const line2 = generateKhwe(digit2, is3D);
  return Array.from(new Set([...line1, ...line2])).sort();
}

// ========================================
// 9. အပူး - A PU (Head combinations)
// ========================================
// Logic: Combine two head lines
// Example: "5", "7" → All 5X and 7X numbers
export function generateAPu(digit1: string, digit2: string, is3D: boolean = false): string[] {
  const line1 = generateHead(digit1, is3D);
  const line2 = generateHead(digit2, is3D);
  return Array.from(new Set([...line1, ...line2])).sort();
}

// ========================================
// 10. စုံပူး - EVEN PU (Even combinations)
// ========================================
// Logic: All numbers where both digits are even
// Example: 00, 02, 04, 06, 08, 20, 22, 24, 26, 28, 40, 42...
export function generateEvenPu(is3D: boolean = false): string[] {
  const results: string[] = [];
  const max = is3D ? 999 : 99;
  const length = is3D ? 3 : 2;
  const evens = [0, 2, 4, 6, 8];
  
  if (is3D) {
    for (const a of evens) {
      for (const b of evens) {
        for (const c of evens) {
          results.push(`${a}${b}${c}`);
        }
      }
    }
  } else {
    for (const a of evens) {
      for (const b of evens) {
        results.push(`${a}${b}`.padStart(2, '0'));
      }
    }
  }
  
  return results;
}

// ========================================
// 11. မပူး - ODD PU (Odd combinations)
// ========================================
// Logic: All numbers where both digits are odd
// Example: 11, 13, 15, 17, 19, 31, 33, 35, 37, 39...
export function generateOddPu(is3D: boolean = false): string[] {
  const results: string[] = [];
  const odds = [1, 3, 5, 7, 9];
  
  if (is3D) {
    for (const a of odds) {
      for (const b of odds) {
        for (const c of odds) {
          results.push(`${a}${b}${c}`);
        }
      }
    }
  } else {
    for (const a of odds) {
      for (const b of odds) {
        results.push(`${a}${b}`);
      }
    }
  }
  
  return results;
}

// ========================================
// 12. ပါဝါ - POWER (Enhanced power)
// ========================================
// Logic: Power group + all permutations + neighbors
// Example: "5" → All numbers with 5, plus 45/54, 56/65, etc.
export function generatePower(digit: string, is3D: boolean = false): string[] {
  const powerGroup = generatePowerGroup(digit, is3D);
  const num = parseInt(digit);
  const results = new Set(powerGroup);
  
  // Add neighbors
  for (let i = -1; i <= 1; i++) {
    const neighbor = num + i;
    if (neighbor >= 0 && neighbor <= 9) {
      const neighborStr = neighbor.toString();
      const combos = generatePowerGroup(neighborStr, is3D);
      combos.forEach(c => results.add(c));
    }
  }
  
  return Array.from(results).sort();
}

// ========================================
// 13. နက္ခ - NAKHA (Zodiac pattern)
// ========================================
// Logic: Traditional Myanmar zodiac number groupings
// Example: "1" → 01, 10, 19, 28, 37, 46, 55, 64, 73, 82, 91
export function generateNakha(digit: string): string[] {
  const num = parseInt(digit);
  const results: string[] = [];
  
  // Add number and add 9 repeatedly
  for (let i = num; i <= 99; i += 9) {
    results.push(i.toString().padStart(2, '0'));
  }
  
  return results;
}

// ========================================
// 14. ညီကို - BRO ASC (Brothers ascending)
// ========================================
// Logic: Sequential ascending (12, 23, 34, 45, 56, 67, 78, 89)
export function generateBroAsc(is3D: boolean = false): string[] {
  const results: string[] = [];
  
  if (is3D) {
    for (let i = 0; i <= 9; i++) {
      for (let j = i; j <= 9; j++) {
        for (let k = j; k <= 9; k++) {
          results.push(`${i}${j}${k}`);
        }
      }
    }
  } else {
    for (let i = 0; i <= 8; i++) {
      results.push(`${i}${i + 1}`);
    }
  }
  
  return results;
}

// ========================================
// 15. ကိုညီ - BRO DESC (Brothers descending)
// ========================================
// Logic: Sequential descending (98, 87, 76, 65, 54, 43, 32, 21, 10)
export function generateBroDesc(is3D: boolean = false): string[] {
  const results: string[] = [];
  
  if (is3D) {
    for (let i = 9; i >= 0; i--) {
      for (let j = i; j >= 0; j--) {
        for (let k = j; k >= 0; k--) {
          results.push(`${i}${j}${k}`);
        }
      }
    }
  } else {
    for (let i = 9; i >= 1; i--) {
      results.push(`${i}${i - 1}`);
    }
  }
  
  return results;
}

// ========================================
// 16. ညီကိုR - BRO REVERSE
// ========================================
// Logic: Both ascending and descending brothers
export function generateBroReverse(is3D: boolean = false): string[] {
  const asc = generateBroAsc(is3D);
  const desc = generateBroDesc(is3D);
  return Array.from(new Set([...asc, ...desc])).sort();
}

// ========================================
// 17. စုံမ - EVEN-ODD
// ========================================
// Logic: First digit even, second digit odd
// Example: 01, 03, 05, 07, 09, 21, 23, 25...
export function generateEvenOdd(is3D: boolean = false): string[] {
  const results: string[] = [];
  const evens = [0, 2, 4, 6, 8];
  const odds = [1, 3, 5, 7, 9];
  
  if (is3D) {
    for (const a of evens) {
      for (const b of odds) {
        for (const c of evens) {
          results.push(`${a}${b}${c}`);
        }
      }
    }
  } else {
    for (const a of evens) {
      for (const b of odds) {
        results.push(`${a}${b}`.padStart(2, '0'));
      }
    }
  }
  
  return results;
}

// ========================================
// 18. မစုံ - ODD-EVEN
// ========================================
// Logic: First digit odd, second digit even
// Example: 10, 12, 14, 16, 18, 30, 32, 34...
export function generateOddEven(is3D: boolean = false): string[] {
  const results: string[] = [];
  const evens = [0, 2, 4, 6, 8];
  const odds = [1, 3, 5, 7, 9];
  
  if (is3D) {
    for (const a of odds) {
      for (const b of evens) {
        for (const c of odds) {
          results.push(`${a}${b}${c}`);
        }
      }
    }
  } else {
    for (const a of odds) {
      for (const b of evens) {
        results.push(`${a}${b}`);
      }
    }
  }
  
  return results;
}

// ========================================
// 19. စုံမR - EVEN-ODD REVERSE
// ========================================
// Logic: Both even-odd and odd-even
export function generateEvenOddReverse(is3D: boolean = false): string[] {
  const eo = generateEvenOdd(is3D);
  const oe = generateOddEven(is3D);
  return Array.from(new Set([...eo, ...oe])).sort();
}

// ========================================
// 20. စုံစုံ - EVEN-EVEN
// ========================================
// Logic: Both digits even
// Same as generateEvenPu
export function generateEvenEven(is3D: boolean = false): string[] {
  return generateEvenPu(is3D);
}

// ========================================
// 21. မမ - ODD-ODD
// ========================================
// Logic: Both digits odd
// Same as generateOddPu
export function generateOddOdd(is3D: boolean = false): string[] {
  return generateOddPu(is3D);
}

// ========================================
// 22. စုံကပ် - EVEN ADJACENT
// ========================================
// Logic: Sequential pairs starting with even (02, 24, 46, 68)
export function generateEvenAdj(is3D: boolean = false): string[] {
  const results: string[] = [];
  const evens = [0, 2, 4, 6, 8];
  
  if (is3D) {
    for (const e of evens) {
      if (e + 1 <= 9) {
        for (let k = 0; k <= 9; k++) {
          results.push(`${e}${e + 1}${k}`);
        }
      }
    }
  } else {
    for (const e of evens) {
      if (e + 1 <= 9) {
        results.push(`${e}${e + 1}`.padStart(2, '0'));
      }
    }
  }
  
  return results;
}

// ========================================
// 23. စုံကပ်R - EVEN ADJACENT REVERSE
// ========================================
// Logic: Sequential pairs in reverse (20, 42, 64, 86)
export function generateEvenAdjReverse(is3D: boolean = false): string[] {
  const results: string[] = [];
  const evens = [0, 2, 4, 6, 8];
  
  if (is3D) {
    for (const e of evens) {
      if (e + 1 <= 9) {
        for (let k = 0; k <= 9; k++) {
          results.push(`${e + 1}${e}${k}`);
        }
      }
    }
  } else {
    for (const e of evens) {
      if (e + 1 <= 9) {
        results.push(`${e + 1}${e}`.padStart(2, '0'));
      }
    }
  }
  
  return results;
}

// ========================================
// 24. မကပ် - ODD ADJACENT
// ========================================
// Logic: Sequential pairs starting with odd (13, 35, 57, 79)
export function generateOddAdj(is3D: boolean = false): string[] {
  const results: string[] = [];
  const odds = [1, 3, 5, 7, 9];
  
  if (is3D) {
    for (const o of odds) {
      if (o + 1 <= 9) {
        for (let k = 0; k <= 9; k++) {
          results.push(`${o}${o + 1}${k}`);
        }
      }
    }
  } else {
    for (const o of odds) {
      if (o + 1 <= 9) {
        results.push(`${o}${o + 1}`);
      }
    }
  }
  
  return results;
}

// ========================================
// 25. မကပ်R - ODD ADJACENT REVERSE
// ========================================
// Logic: Sequential pairs in reverse (31, 53, 75, 97)
export function generateOddAdjReverse(is3D: boolean = false): string[] {
  const results: string[] = [];
  const odds = [1, 3, 5, 7, 9];
  
  if (is3D) {
    for (const o of odds) {
      if (o + 1 <= 9) {
        for (let k = 0; k <= 9; k++) {
          results.push(`${o + 1}${o}${k}`);
        }
      }
    }
  } else {
    for (const o of odds) {
      if (o + 1 <= 9) {
        results.push(`${o + 1}${o}`);
      }
    }
  }
  
  return results;
}

// ========================================
// MASTER PATTERN GENERATOR
// ========================================
export function generateQuickPattern(
  type: QuickPatternType,
  input: string = '',
  input2: string = '',
  is3D: boolean = false
): string[] {
  switch (type) {
    case 'power-group': return generatePowerGroup(input, is3D);
    case 'head': return generateHead(input, is3D);
    case 'break': return generateBreak(input);
    case 'nakar': return generateNakar(input, is3D);
    case 'round': return generateRound(input, is3D);
    case 'reverse': return generateReverse(input);
    case 'khwe': return generateKhwe(input, is3D);
    case 'khwe-pu': return generateKhwePu(input, input2, is3D);
    case 'a-pu': return generateAPu(input, input2, is3D);
    case 'even-pu': return generateEvenPu(is3D);
    case 'odd-pu': return generateOddPu(is3D);
    case 'power': return generatePower(input, is3D);
    case 'nakha': return generateNakha(input);
    case 'bro-asc': return generateBroAsc(is3D);
    case 'bro-desc': return generateBroDesc(is3D);
    case 'bro-reverse': return generateBroReverse(is3D);
    case 'even-odd': return generateEvenOdd(is3D);
    case 'odd-even': return generateOddEven(is3D);
    case 'even-odd-r': return generateEvenOddReverse(is3D);
    case 'even-even': return generateEvenEven(is3D);
    case 'odd-odd': return generateOddOdd(is3D);
    case 'even-adj': return generateEvenAdj(is3D);
    case 'even-adj-r': return generateEvenAdjReverse(is3D);
    case 'odd-adj': return generateOddAdj(is3D);
    case 'odd-adj-r': return generateOddAdjReverse(is3D);
    default: return [];
  }
}
PATTERN DEFINITIONS WITH LABELS
// /src/app/data/patternDefinitions.ts

export interface QuickPatternDefinition {
  id: QuickPatternType;
  labelMM: string;
  labelEN: string;
  color: string;
  requiresInput: boolean;
  requiresTwoInputs?: boolean;
  gameMode: '2D' | '3D' | 'both';
  description: string;
  example: string;
}

export const ALL_QUICK_PATTERNS: QuickPatternDefinition[] = [
  {
    id: 'power-group',
    labelMM: 'အုပ်စု',
    labelEN: 'Power Group',
    color: 'bg-blue-500',
    requiresInput: true,
    gameMode: 'both',
    description: 'All numbers containing the digit',
    example: '5 → 05, 15, 25, 35, 45, 50-59, 65, 75, 85, 95'
  },
  {
    id: 'head',
    labelMM: 'ထိပ်',
    labelEN: 'Head',
    color: 'bg-purple-500',
    requiresInput: true,
    gameMode: 'both',
    description: 'Numbers starting with digit',
    example: '5 → 50, 51, 52, 53, 54, 55, 56, 57, 58, 59'
  },
  {
    id: 'break',
    labelMM: 'ဘြိတ်',
    labelEN: 'Break',
    color: 'bg-orange-500',
    requiresInput: true,
    gameMode: 'both',
    description: 'All permutations',
    example: '23 → 23, 32 | 123 → 123, 132, 213, 231, 312, 321'
  },
  {
    id: 'nakar',
    labelMM: 'နောက်',
    labelEN: 'Nakar',
    color: 'bg-yellow-500',
    requiresInput: true,
    gameMode: 'both',
    description: 'Number ± 1',
    example: '45 → 44, 45, 46'
  },
  {
    id: 'round',
    labelMM: 'ပါတ်',
    labelEN: 'Round',
    color: 'bg-teal-500',
    requiresInput: true,
    gameMode: 'both',
    description: 'Same digit sum',
    example: '23 (sum=5) → 05, 14, 23, 32, 41, 50'
  },
  {
    id: 'reverse',
    labelMM: 'R',
    labelEN: 'Reverse',
    color: 'bg-purple-600',
    requiresInput: true,
    gameMode: 'both',
    description: 'Original and reversed',
    example: '23 → 23, 32'
  },
  {
    id: 'khwe',
    labelMM: 'ခွေ',
    labelEN: 'Khwe',
    color: 'bg-indigo-500',
    requiresInput: true,
    gameMode: 'both',
    description: 'Vertical line (ending with digit)',
    example: '5 → 05, 15, 25, 35, 45, 55, 65, 75, 85, 95'
  },
  {
    id: 'khwe-pu',
    labelMM: 'ခွေပူး',
    labelEN: 'Khwe Pu',
    color: 'bg-indigo-600',
    requiresInput: true,
    requiresTwoInputs: true,
    gameMode: 'both',
    description: 'Two khwe lines combined',
    example: '5, 7 → All X5 and X7 numbers'
  },
  {
    id: 'a-pu',
    labelMM: 'အပူး',
    labelEN: 'A Pu',
    color: 'bg-purple-400',
    requiresInput: true,
    requiresTwoInputs: true,
    gameMode: 'both',
    description: 'Two head lines combined',
    example: '5, 7 → All 5X and 7X numbers'
  },
  {
    id: 'even-pu',
    labelMM: 'စုံပူး',
    labelEN: 'Even Pu',
    color: 'bg-green-500',
    requiresInput: false,
    gameMode: 'both',
    description: 'All even-even combinations',
    example: '00, 02, 04, 06, 08, 20, 22, 24...'
  },
  {
    id: 'odd-pu',
    labelMM: 'မပူး',
    labelEN: 'Odd Pu',
    color: 'bg-red-500',
    requiresInput: false,
    gameMode: 'both',
    description: 'All odd-odd combinations',
    example: '11, 13, 15, 17, 19, 31, 33, 35...'
  },
  {
    id: 'power',
    labelMM: 'ပါဝါ',
    labelEN: 'Power',
    color: 'bg-blue-600',
    requiresInput: true,
    gameMode: 'both',
    description: 'Enhanced power with neighbors',
    example: '5 → Power group + adjacent numbers'
  },
  {
    id: 'nakha',
    labelMM: 'နက္ခ',
    labelEN: 'Nakha',
    color: 'bg-amber-500',
    requiresInput: true,
    gameMode: '2D',
    description: 'Zodiac pattern (+9 sequence)',
    example: '1 → 01, 10, 19, 28, 37, 46, 55, 64, 73, 82, 91'
  },
  {
    id: 'bro-asc',
    labelMM: 'ညီကို',
    labelEN: 'Brothers ↑',
    color: 'bg-pink-500',
    requiresInput: false,
    gameMode: 'both',
    description: 'Sequential ascending',
    example: '12, 23, 34, 45, 56, 67, 78, 89'
  },
  {
    id: 'bro-desc',
    labelMM: 'ကိုညီ',
    labelEN: 'Brothers ↓',
    color: 'bg-pink-600',
    requiresInput: false,
    gameMode: 'both',
    description: 'Sequential descending',
    example: '98, 87, 76, 65, 54, 43, 32, 21, 10'
  },
  {
    id: 'bro-reverse',
    labelMM: 'ညီကိုR',
    labelEN: 'Brothers R',
    color: 'bg-pink-700',
    requiresInput: false,
    gameMode: 'both',
    description: 'Both ascending and descending',
    example: 'All sequential pairs'
  },
  {
    id: 'even-odd',
    labelMM: 'စုံမ',
    labelEN: 'Even-Odd',
    color: 'bg-cyan-500',
    requiresInput: false,
    gameMode: 'both',
    description: 'First even, second odd',
    example: '01, 03, 05, 07, 09, 21, 23, 25...'
  },
  {
    id: 'odd-even',
    labelMM: 'မစုံ',
    labelEN: 'Odd-Even',
    color: 'bg-lime-500',
    requiresInput: false,
    gameMode: 'both',
    description: 'First odd, second even',
    example: '10, 12, 14, 16, 18, 30, 32, 34...'
  },
  {
    id: 'even-odd-r',
    labelMM: 'စုံမR',
    labelEN: 'Even-Odd R',
    color: 'bg-cyan-600',
    requiresInput: false,
    gameMode: 'both',
    description: 'Both even-odd and odd-even',
    example: 'Combined patterns'
  },
  {
    id: 'even-even',
    labelMM: 'စုံစုံ',
    labelEN: 'Even-Even',
    color: 'bg-emerald-500',
    requiresInput: false,
    gameMode: 'both',
    description: 'Both digits even',
    example: '00, 02, 04, 06, 08, 20, 22...'
  },
  {
    id: 'odd-odd',
    labelMM: 'မမ',
    labelEN: 'Odd-Odd',
    color: 'bg-rose-500',
    requiresInput: false,
    gameMode: 'both',
    description: 'Both digits odd',
    example: '11, 13, 15, 17, 19, 31, 33...'
  },
  {
    id: 'even-adj',
    labelMM: 'စုံကပ်',
    labelEN: 'Even Adj',
    color: 'bg-sky-500',
    requiresInput: false,
    gameMode: 'both',
    description: 'Sequential starting with even',
    example: '01, 23, 45, 67, 89'
  },
  {
    id: 'even-adj-r',
    labelMM: 'စုံကပ်R',
    labelEN: 'Even Adj R',
    color: 'bg-sky-600',
    requiresInput: false,
    gameMode: 'both',
    description: 'Reversed even adjacent',
    example: '10, 32, 54, 76, 98'
  },
  {
    id: 'odd-adj',
    labelMM: 'မကပ်',
    labelEN: 'Odd Adj',
    color: 'bg-orange-400',
    requiresInput: false,
    gameMode: 'both',
    description: 'Sequential starting with odd',
    example: '12, 34, 56, 78'
  },
  {
    id: 'odd-adj-r',
    labelMM: 'မကပ်R',
    labelEN: 'Odd Adj R',
    color: 'bg-orange-600',
    requiresInput: false,
    gameMode: 'both',
    description: 'Reversed odd adjacent',
    example: '21, 43, 65, 87'
  }
];
USAGE IN COMPONENT
// In your NewBetScreen.tsx or PlayerBetEntry.tsx

import { generateQuickPattern, QuickPatternType } from '@/utils/quickPatterns';
import { ALL_QUICK_PATTERNS } from '@/data/patternDefinitions';

const handleQuickPattern = (patternId: QuickPatternType) => {
  const pattern = ALL_QUICK_PATTERNS.find(p => p.id === patternId);
  
  if (!pattern) return;
  
  // If requires input, show input modal
  if (pattern.requiresInput) {
    setSelectedPattern(pattern);
    setShowPatternInputModal(true);
    return;
  }
  
  // Generate numbers immediately for no-input patterns
  const numbers = generateQuickPattern(patternId, '', '', gameMode === '3D');
  setGeneratedNumbers(numbers);
  toast.success(`Generated ${numbers.length} numbers using ${pattern.labelMM}`);
};

// When user submits input
const handlePatternInputSubmit = (input1: string, input2?: string) => {
  if (!selectedPattern) return;
  
  const numbers = generateQuickPattern(
    selectedPattern.id,
    input1,
    input2 || '',
    gameMode === '3D'
  );
  
  setGeneratedNumbers(numbers);
  setShowPatternInputModal(false);
  toast.success(`Generated ${numbers.length} numbers`);
};
PATTERN INPUT MODAL
// PatternInputModal.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

export const PatternInputModal: React.FC<{
  pattern: QuickPatternDefinition;
  onSubmit: (input1: string, input2?: string) => void;
  onClose: () => void;
}> = ({ pattern, onSubmit, onClose }) => {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');

  const handleSubmit = () => {
    if (!input1.trim()) {
      alert('Please enter a digit');
      return;
    }
    
    if (pattern.requiresTwoInputs && !input2.trim()) {
      alert('This pattern requires two digits');
      return;
    }
    
    onSubmit(input1, pattern.requiresTwoInputs ? input2 : undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold myanmar-font">{pattern.labelMM}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4">{pattern.description}</p>
        <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded mb-4">
          Example: {pattern.example}
        </p>

        {/* Input 1 */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">
            {pattern.requiresTwoInputs ? 'First Digit' : 'Enter Digit'}
          </label>
          <input
            type="text"
            value={input1}
            onChange={(e) => setInput1(e.target.value.slice(0, 1))}
            maxLength={1}
            placeholder="0-9"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl 
                     text-center text-2xl font-bold focus:border-blue-500"
          />
        </div>

        {/* Input 2 (if needed) */}
        {pattern.requiresTwoInputs && (
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Second Digit</label>
            <input
              type="text"
              value={input2}
              onChange={(e) => setInput2(e.target.value.slice(0, 1))}
              maxLength={1}
              placeholder="0-9"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl 
                       text-center text-2xl font-bold focus:border-blue-500"
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 
                   text-white font-bold rounded-xl hover:shadow-lg transition-all"
        >
          Generate Numbers
        </button>
      </div>
    </div>
  );
};
SUMMARY
✅ All 25+ Pattern Keys Implemented:
အုပ်စု - Power Group
ထိပ် - Head
ဘြိတ် - Break
နောက် - Nakar
ပါတ် - Round
R - Reverse
ခွေ - Khwe
ခွေပူး - Khwe Pu
အပူး - A Pu
စုံပူး - Even Pu
မပူး - Odd Pu
ပါဝါ - Power
နက္ခ - Nakha
ညီကို - Brothers Asc
ကိုညီ - Brothers Desc
ညီကိုR - Brothers Reverse
စုံမ - Even-Odd
မစုံ - Odd-Even
စုံမR - Even-Odd Reverse
စုံစုံ - Even-Even
မမ - Odd-Odd
စုံကပ် - Even Adjacent
စုံကပ်R - Even Adj Reverse
မကပ် - Odd Adjacent
မကပ်R - Odd Adj Reverse
✅ Each pattern has:
Exact generation logic
Myanmar and English labels
Color coding
Description and examples
Input requirements
2D/3D support