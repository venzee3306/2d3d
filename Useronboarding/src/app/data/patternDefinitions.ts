import type { QuickPatternType } from '../utils/quickPatterns';

export interface QuickPatternDefinition {
  id: QuickPatternType;
  labelMM: string;
  labelEN: string;
  color: string;
  requiresInput: boolean;
  requiresTwoInputs?: boolean;
  gameMode: '2D' | '3D' | 'both';
  promptMM: string;
  promptEN: string;
  prompt2MM?: string;
  prompt2EN?: string;
}

export const ALL_QUICK_PATTERNS: QuickPatternDefinition[] = [
  {
    id: 'power-group',
    labelMM: 'အုပ်စု',
    labelEN: 'Power Group',
    color: 'bg-blue-500',
    requiresInput: true,
    gameMode: 'both',
    promptMM: 'ဂဏန်းတစ်လုံးထည့်ပါ (0-9)',
    promptEN: 'Enter a digit (0-9)'
  },
  {
    id: 'head',
    labelMM: 'ထိပ်',
    labelEN: 'Head',
    color: 'bg-purple-500',
    requiresInput: true,
    gameMode: 'both',
    promptMM: 'ထိပ်ဂဏန်းထည့်ပါ (0-9)',
    promptEN: 'Enter head digit (0-9)'
  },
  {
    id: 'break',
    labelMM: 'ဘြိတ်',
    labelEN: 'Break',
    color: 'bg-orange-500',
    requiresInput: true,
    gameMode: 'both',
    promptMM: '2D အတွက် 2 လုံး၊ 3D အတွက် 3 လုံး ထည့်ပါ',
    promptEN: 'Enter 2 digits for 2D or 3 digits for 3D'
  },
  {
    id: 'nakar',
    labelMM: 'နောက်',
    labelEN: 'Nakar',
    color: 'bg-yellow-500',
    requiresInput: true,
    gameMode: 'both',
    promptMM: '2D သို့မဟုတ် 3D ဂဏန်းထည့်ပါ',
    promptEN: 'Enter 2D or 3D number'
  },
  {
    id: 'round',
    labelMM: 'ပါတ်',
    labelEN: 'Round',
    color: 'bg-teal-500',
    requiresInput: true,
    gameMode: 'both',
    promptMM: '2D သို့မဟုတ် 3D ဂဏန်းထည့်ပါ',
    promptEN: 'Enter 2D or 3D number'
  },
  {
    id: 'reverse',
    labelMM: 'R',
    labelEN: 'Reverse',
    color: 'bg-purple-600',
    requiresInput: true,
    gameMode: 'both',
    promptMM: '2D သို့မဟုတ် 3D ဂဏန်းထည့်ပါ',
    promptEN: 'Enter 2D or 3D number'
  },
  {
    id: 'khwe',
    labelMM: 'ခွေ',
    labelEN: 'Khwe',
    color: 'bg-indigo-500',
    requiresInput: true,
    gameMode: 'both',
    promptMM: 'နောက်ဆုံးဂဏန်းထည့်ပါ (0-9)',
    promptEN: 'Enter last digit (0-9)'
  },
  {
    id: 'khwe-pu',
    labelMM: 'ခွေပူး',
    labelEN: 'Khwe Pu',
    color: 'bg-indigo-600',
    requiresInput: true,
    requiresTwoInputs: true,
    gameMode: 'both',
    promptMM: 'ပထမဂဏန်းထည့်ပါ (0-9)',
    promptEN: 'Enter first digit (0-9)',
    prompt2MM: 'ဒုတိယဂဏန်းထည့်ပါ (0-9)',
    prompt2EN: 'Enter second digit (0-9)'
  },
  {
    id: 'a-pu',
    labelMM: 'အပူး',
    labelEN: 'A Pu',
    color: 'bg-purple-400',
    requiresInput: true,
    requiresTwoInputs: true,
    gameMode: 'both',
    promptMM: 'ပထမထိပ်ဂဏန်းထည့်ပါ (0-9)',
    promptEN: 'Enter first head digit (0-9)',
    prompt2MM: 'ဒုတိယထိပ်ဂဏန်းထည့်ပါ (0-9)',
    prompt2EN: 'Enter second head digit (0-9)'
  },
  {
    id: 'even-pu',
    labelMM: 'စုံပူး',
    labelEN: 'Even Pu',
    color: 'bg-green-500',
    requiresInput: false,
    gameMode: 'both',
    promptMM: '',
    promptEN: ''
  },
  {
    id: 'odd-pu',
    labelMM: 'မပူး',
    labelEN: 'Odd Pu',
    color: 'bg-red-500',
    requiresInput: false,
    gameMode: 'both',
    promptMM: '',
    promptEN: ''
  },
  {
    id: 'power',
    labelMM: 'ပါဝါ',
    labelEN: 'Power',
    color: 'bg-blue-600',
    requiresInput: true,
    gameMode: 'both',
    promptMM: 'ဂဏန်းတစ်လုံးထည့်ပါ (0-9)',
    promptEN: 'Enter a digit (0-9)'
  },
  {
    id: 'nakha',
    labelMM: 'နက္ခ',
    labelEN: 'Nakha',
    color: 'bg-amber-500',
    requiresInput: true,
    gameMode: '2D',
    promptMM: 'ဂဏန်းတစ်လုံးထည့်ပါ (0-9)',
    promptEN: 'Enter a digit (0-9)'
  },
  {
    id: 'bro-asc',
    labelMM: 'ညီကို',
    labelEN: 'Bro ↑',
    color: 'bg-pink-500',
    requiresInput: false,
    gameMode: 'both',
    promptMM: '',
    promptEN: ''
  },
  {
    id: 'bro-desc',
    labelMM: 'ကိုညီ',
    labelEN: 'Bro ↓',
    color: 'bg-pink-600',
    requiresInput: false,
    gameMode: 'both',
    promptMM: '',
    promptEN: ''
  },
  {
    id: 'bro-reverse',
    labelMM: 'ညီကိုR',
    labelEN: 'Bro R',
    color: 'bg-pink-700',
    requiresInput: false,
    gameMode: 'both',
    promptMM: '',
    promptEN: ''
  },
  {
    id: 'even-odd',
    labelMM: 'စုံမ',
    labelEN: 'Even-Odd',
    color: 'bg-cyan-500',
    requiresInput: false,
    gameMode: 'both',
    promptMM: '',
    promptEN: ''
  },
  {
    id: 'odd-even',
    labelMM: 'မစုံ',
    labelEN: 'Odd-Even',
    color: 'bg-lime-500',
    requiresInput: false,
    gameMode: 'both',
    promptMM: '',
    promptEN: ''
  },
  {
    id: 'even-odd-r',
    labelMM: 'စုံမR',
    labelEN: 'E-O R',
    color: 'bg-cyan-600',
    requiresInput: false,
    gameMode: 'both',
    promptMM: '',
    promptEN: ''
  },
  {
    id: 'even-even',
    labelMM: 'စုံစုံ',
    labelEN: 'Even',
    color: 'bg-emerald-500',
    requiresInput: false,
    gameMode: 'both',
    promptMM: '',
    promptEN: ''
  },
  {
    id: 'odd-odd',
    labelMM: 'မမ',
    labelEN: 'Odd',
    color: 'bg-rose-500',
    requiresInput: false,
    gameMode: 'both',
    promptMM: '',
    promptEN: ''
  },
  {
    id: 'even-adj',
    labelMM: 'စုံကပ်',
    labelEN: 'E-Adj',
    color: 'bg-sky-500',
    requiresInput: false,
    gameMode: 'both',
    promptMM: '',
    promptEN: ''
  },
  {
    id: 'even-adj-r',
    labelMM: 'စုံကပ်R',
    labelEN: 'E-Adj R',
    color: 'bg-sky-600',
    requiresInput: false,
    gameMode: 'both',
    promptMM: '',
    promptEN: ''
  },
  {
    id: 'odd-adj',
    labelMM: 'မကပ်',
    labelEN: 'O-Adj',
    color: 'bg-orange-400',
    requiresInput: false,
    gameMode: 'both',
    promptMM: '',
    promptEN: ''
  },
  {
    id: 'odd-adj-r',
    labelMM: 'မကပ်R',
    labelEN: 'O-Adj R',
    color: 'bg-orange-600',
    requiresInput: false,
    gameMode: 'both',
    promptMM: '',
    promptEN: ''
  }
];
