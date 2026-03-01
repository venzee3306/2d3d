// Myanmar Lottery Pattern Generator Utilities

export type PatternType = 
  | 'manual'
  | 'power-2'
  | 'power-3'
  | 'break-2'
  | 'break-3'
  | 'round'
  | 'khwe'
  | 'apone'
  | 'apout'
  | 'brothers'
  | 'twin'
  | 'natkhat-body';

export interface Pattern {
  type: PatternType;
  input: string;
  label: string;
  labelMM: string;
}

// Power-2: Generate all 2-digit numbers containing the input digit(s)
export const generatePower2 = (input: string): string[] => {
  const digits = input.split('').filter(d => /\d/.test(d));
  const numbers = new Set<string>();
  
  digits.forEach(digit => {
    for (let i = 0; i <= 9; i++) {
      numbers.add(`${digit}${i}`);
      numbers.add(`${i}${digit}`);
    }
  });
  
  return Array.from(numbers).sort();
};

// Power-3: Generate all 3-digit numbers containing the input digit(s)
export const generatePower3 = (input: string): string[] => {
  const digits = input.split('').filter(d => /\d/.test(d));
  const numbers = new Set<string>();
  
  digits.forEach(digit => {
    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j <= 9; j++) {
        numbers.add(`${digit}${i}${j}`);
        numbers.add(`${i}${digit}${j}`);
        numbers.add(`${i}${j}${digit}`);
      }
    }
  });
  
  return Array.from(numbers).sort();
};

// Break-2: All permutations of 2 digits from input
export const generateBreak2 = (input: string): string[] => {
  const digits = input.split('').filter(d => /\d/.test(d));
  const numbers = new Set<string>();
  
  for (let i = 0; i < digits.length; i++) {
    for (let j = 0; j < digits.length; j++) {
      numbers.add(`${digits[i]}${digits[j]}`);
    }
  }
  
  return Array.from(numbers).sort();
};

// Break-3: All permutations of 3 digits from input
export const generateBreak3 = (input: string): string[] => {
  const digits = input.split('').filter(d => /\d/.test(d));
  const numbers = new Set<string>();
  
  for (let i = 0; i < digits.length; i++) {
    for (let j = 0; j < digits.length; j++) {
      for (let k = 0; k < digits.length; k++) {
        numbers.add(`${digits[i]}${digits[j]}${digits[k]}`);
      }
    }
  }
  
  return Array.from(numbers).sort();
};

// Round (ပတ်): All permutations of given digits
export const generateRound = (input: string): string[] => {
  const digits = input.split('').filter(d => /\d/.test(d));
  
  if (digits.length === 2) {
    return generateBreak2(input);
  } else if (digits.length === 3) {
    return generateBreak3(input);
  }
  
  return [];
};

// Khwe (ခွေ): Reverse number pairs for 2D
export const generateKhwe = (input: string): string[] => {
  if (input.length !== 2 || !/^\d{2}$/.test(input)) return [];
  
  const reversed = input.split('').reverse().join('');
  return [input, reversed].filter((v, i, a) => a.indexOf(v) === i).sort();
};

// Apone (အပုံး): All numbers starting with given digit
export const generateApone = (input: string, is3D: boolean = false): string[] => {
  const digit = input[0];
  if (!/\d/.test(digit)) return [];
  
  const numbers: string[] = [];
  
  if (is3D) {
    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j <= 9; j++) {
        numbers.push(`${digit}${i}${j}`);
      }
    }
  } else {
    for (let i = 0; i <= 9; i++) {
      numbers.push(`${digit}${i}`);
    }
  }
  
  return numbers;
};

// Apout (အပေါက်): All numbers ending with given digit
export const generateApout = (input: string, is3D: boolean = false): string[] => {
  const digit = input[0];
  if (!/\d/.test(digit)) return [];
  
  const numbers: string[] = [];
  
  if (is3D) {
    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j <= 9; j++) {
        numbers.push(`${i}${j}${digit}`);
      }
    }
  } else {
    for (let i = 0; i <= 9; i++) {
      numbers.push(`${i}${digit}`);
    }
  }
  
  return numbers;
};

// Brothers (ညီအစ်ကို): Sequential numbers
export const generateBrothers = (input: string, is3D: boolean = false): string[] => {
  const start = parseInt(input);
  if (isNaN(start)) return [];
  
  const numbers: string[] = [];
  const max = is3D ? 999 : 99;
  const padding = is3D ? 3 : 2;
  
  // Generate 5 sequential numbers before and after
  for (let i = -5; i <= 5; i++) {
    const num = start + i;
    if (num >= 0 && num <= max) {
      numbers.push(num.toString().padStart(padding, '0'));
    }
  }
  
  return numbers;
};

// Twin (အမွှာ): Identical digit numbers (11, 22, 33, etc.)
export const generateTwin = (is3D: boolean = false): string[] => {
  const numbers: string[] = [];
  
  if (is3D) {
    for (let i = 0; i <= 9; i++) {
      numbers.push(`${i}${i}${i}`);
    }
  } else {
    for (let i = 0; i <= 9; i++) {
      numbers.push(`${i}${i}`);
    }
  }
  
  return numbers;
};

// Natkhat Body (နပ်ခတ်ကိုယ်): All middle digits for given head and tail
export const generateNatkhatBody = (head: string, tail: string): string[] => {
  if (!/\d/.test(head) || !/\d/.test(tail)) return [];
  
  const numbers: string[] = [];
  
  for (let i = 0; i <= 9; i++) {
    numbers.push(`${head}${i}${tail}`);
  }
  
  return numbers;
};

// Main pattern generator function
export const generatePattern = (
  type: PatternType,
  input: string,
  is3D: boolean = false,
  extraInput?: string
): string[] => {
  switch (type) {
    case 'power-2':
      return generatePower2(input);
    case 'power-3':
      return generatePower3(input);
    case 'break-2':
      return generateBreak2(input);
    case 'break-3':
      return generateBreak3(input);
    case 'round':
      return generateRound(input);
    case 'khwe':
      return generateKhwe(input);
    case 'apone':
      return generateApone(input, is3D);
    case 'apout':
      return generateApout(input, is3D);
    case 'brothers':
      return generateBrothers(input, is3D);
    case 'twin':
      return generateTwin(is3D);
    case 'natkhat-body':
      return extraInput ? generateNatkhatBody(input, extraInput) : [];
    default:
      return [];
  }
};

// Get pattern label
export const getPatternLabel = (type: PatternType): { en: string; mm: string } => {
  const labels: Record<PatternType, { en: string; mm: string }> = {
    'manual': { en: 'Manual Entry', mm: 'ကိုယ်တိုင်ရိုက်' },
    'power-2': { en: 'Power-2', mm: 'ပါ၀ါ-၂' },
    'power-3': { en: 'Power-3', mm: 'ပါ၀ါ-၃' },
    'break-2': { en: 'Break-2', mm: 'ထီခွဲ-၂' },
    'break-3': { en: 'Break-3', mm: 'ထီခွဲ-၃' },
    'round': { en: 'Round', mm: 'ပတ်' },
    'khwe': { en: 'Reverse', mm: 'ခွေ' },
    'apone': { en: 'Leading', mm: 'အပုံး' },
    'apout': { en: 'Trailing', mm: 'အပေါက်' },
    'brothers': { en: 'Brothers', mm: 'ညီအစ်ကို' },
    'twin': { en: 'Twin', mm: 'အမွှာ' },
    'natkhat-body': { en: 'Body Numbers', mm: 'နပ်ခတ်ကိုယ်' }
  };
  
  return labels[type] || { en: type, mm: type };
};
