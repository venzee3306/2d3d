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
  | 'bro-asc'          // ညီကို
  | 'bro-desc'         // ကိုညီ
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

// အုပ်စု - POWER GROUP
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

// ထိပ် - HEAD
export function generateHead(digit: string, is3D: boolean = false): string[] {
  const results: string[] = [];
  const range = is3D ? 100 : 10;
  const length = is3D ? 3 : 2;
  
  for (let i = 0; i < range; i++) {
    results.push(digit + i.toString().padStart(length - 1, '0'));
  }
  
  return results;
}

// ဘြိတ် - BREAK
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

// နောက် - NAKAR
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

// ပါတ် - ROUND
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

// R - REVERSE
export function generateReverse(input: string): string[] {
  const reversed = input.split('').reverse().join('');
  return Array.from(new Set([input, reversed])).sort();
}

// ခွေ - KHWE
export function generateKhwe(digit: string, is3D: boolean = false): string[] {
  const results: string[] = [];
  const range = is3D ? 100 : 10;
  const length = is3D ? 3 : 2;
  
  for (let i = 0; i < range; i++) {
    results.push(i.toString().padStart(length - 1, '0') + digit);
  }
  
  return results;
}

// ခွေပူး - KHWE PU
export function generateKhwePu(digit1: string, digit2: string, is3D: boolean = false): string[] {
  const line1 = generateKhwe(digit1, is3D);
  const line2 = generateKhwe(digit2, is3D);
  return Array.from(new Set([...line1, ...line2])).sort();
}

// အပူး - A PU
export function generateAPu(digit1: string, digit2: string, is3D: boolean = false): string[] {
  const line1 = generateHead(digit1, is3D);
  const line2 = generateHead(digit2, is3D);
  return Array.from(new Set([...line1, ...line2])).sort();
}

// စုံပူး - EVEN PU
export function generateEvenPu(is3D: boolean = false): string[] {
  const results: string[] = [];
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

// မပူး - ODD PU
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

// ပါဝါ - POWER
export function generatePower(digit: string, is3D: boolean = false): string[] {
  const powerGroup = generatePowerGroup(digit, is3D);
  const num = parseInt(digit);
  const results = new Set(powerGroup);
  
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

// နက္ခ - NAKHA
export function generateNakha(digit: string): string[] {
  const num = parseInt(digit);
  const results: string[] = [];
  
  for (let i = num; i <= 99; i += 9) {
    results.push(i.toString().padStart(2, '0'));
  }
  
  return results;
}

// ညီကို - BRO ASC
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

// ကိုညီ - BRO DESC
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

// ညီကိုR - BRO REVERSE
export function generateBroReverse(is3D: boolean = false): string[] {
  const asc = generateBroAsc(is3D);
  const desc = generateBroDesc(is3D);
  return Array.from(new Set([...asc, ...desc])).sort();
}

// စုံမ - EVEN-ODD
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

// မစုံ - ODD-EVEN
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

// စုံမR - EVEN-ODD REVERSE
export function generateEvenOddReverse(is3D: boolean = false): string[] {
  const eo = generateEvenOdd(is3D);
  const oe = generateOddEven(is3D);
  return Array.from(new Set([...eo, ...oe])).sort();
}

// စုံစုံ - EVEN-EVEN
export function generateEvenEven(is3D: boolean = false): string[] {
  return generateEvenPu(is3D);
}

// မမ - ODD-ODD
export function generateOddOdd(is3D: boolean = false): string[] {
  return generateOddPu(is3D);
}

// စုံကပ် - EVEN ADJACENT
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

// စုံကပ်R - EVEN ADJACENT REVERSE
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

// မကပ် - ODD ADJACENT
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

// မကပ်R - ODD ADJACENT REVERSE
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

// MASTER PATTERN GENERATOR
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
