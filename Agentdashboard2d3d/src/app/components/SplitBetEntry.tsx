import { Plus, RotateCw, BarChart3, Circle, ArrowLeft, Grid3x3, Repeat, ShoppingCart, X, Send, Check, FileText, Clock, List, Settings, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, User, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

interface CartItem {
  id: string;
  player: string;
  playerName: string;
  gameMode: '2D' | '3D';
  number: string;
  amount: number;
  pattern?: {
    type: 'manual' | 'group' | 'head' | 'tail' | 'break' | 'round' | 'khwe' | 'khwe-puu' | 'nat-kyauk' | 'apone' | 'apout' | 'brothers' | 'power-2' | 'power-3' | 'break-2' | 'break-3' | 'opposite' | 'twin' | 'natkhat-body';
    input: string;
    label: string;
  };
  patternGroup?: string;
}

interface BetItem {
  number: string;
  amount: number;
  pattern?: {
    type: 'manual' | 'group' | 'head' | 'tail' | 'break' | 'round' | 'khwe' | 'khwe-puu' | 'nat-kyauk' | 'apone' | 'apout' | 'brothers' | 'power-2' | 'power-3' | 'break-2' | 'break-3' | 'opposite' | 'twin' | 'natkhat-body';
    input: string;
    label: string;
  };
}

interface SavedRecord {
  id: string;
  session: string;
  timestamp: string;
  playerName: string;
  bets: BetItem[];
  total: number;
}

interface SplitBetEntryProps {
  onSubmitBets: (items: CartItem[]) => void;
  onSaveRecord?: (record: SavedRecord) => void;
  selectedPlayer?: string;
  selectedPlayerName?: string;
  selectedSession?: 'AM' | 'PM';
  blockedNumbers?: { '2D': string[], '3D': string[] };
}

export function SplitBetEntry({ onSubmitBets, onSaveRecord, selectedPlayer, selectedPlayerName, selectedSession, blockedNumbers }: SplitBetEntryProps) {
  const [playerName, setPlayerName] = useState(selectedPlayerName || '');
  const [selectedPlayerValue, setSelectedPlayerValue] = useState(selectedPlayer || '');
  const [session, setSession] = useState<'AM' | 'PM'>(selectedSession || 'AM');
  const [gameMode, setGameMode] = useState<'2D' | '3D'>('2D');
  const [betNumber, setBetNumber] = useState('');
  const [betAmount, setBetAmount] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [liveBetList, setLiveBetList] = useState<BetItem[]>([]);
  const [activeField, setActiveField] = useState<'player' | 'amount' | 'number' | 'group' | 'head' | 'tail' | 'break' | 'round' | 'khwe' | 'khwe-puu' | 'sone-kat' | 'sone-kat-r' | 'ma-kat' | 'ma-kat-r'>('player');
  const [patternPage, setPatternPage] = useState(0);
  const [groupMode, setGroupMode] = useState(false);
  const [groupNumbers, setGroupNumbers] = useState('');
  const [headMode, setHeadMode] = useState(false);
  const [headDigit, setHeadDigit] = useState('');
  const [tailMode, setTailMode] = useState(false);
  const [tailDigit, setTailDigit] = useState('');
  const [breakMode, setBreakMode] = useState(false);
  const [breakDigit, setBreakDigit] = useState('');
  const [roundMode, setRoundMode] = useState(false);
  const [roundDigit, setRoundDigit] = useState('');
  const [activeDoublePattern, setActiveDoublePattern] = useState<'even' | 'odd' | 'all' | null>(null);
  const [activeInstantPattern, setActiveInstantPattern] = useState<string | null>(null);
  const [khweMode, setKhweMode] = useState(false);
  const [khweDigits, setKhweDigits] = useState('');
  const [khwePuuMode, setKhwePuuMode] = useState(false);
  const [khwePuuDigits, setKhwePuuDigits] = useState('');
  const [soneKatMode, setSoneKatMode] = useState(false);
  const [soneKatDigit, setSoneKatDigit] = useState('');
  const [soneKatRMode, setSoneKatRMode] = useState(false);
  const [soneKatRDigit, setSoneKatRDigit] = useState('');
  const [maKatMode, setMaKatMode] = useState(false);
  const [maKatDigit, setMaKatDigit] = useState('');
  const [maKatRMode, setMaKatRMode] = useState(false);
  const [maKatRDigit, setMaKatRDigit] = useState('');
  const [seriesMode, setSeriesMode] = useState(false);
  const [seriesInput, setSeriesInput] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});
  
  // Confirm Dialog State
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingBetsToSubmit, setPendingBetsToSubmit] = useState<CartItem[] | null>(null);
  
  // Blocked Numbers Warning State
  const [showBlockedWarning, setShowBlockedWarning] = useState(false);
  const [blockedNumber, setBlockedNumber] = useState('');

  const maxDigits = gameMode === '2D' ? 2 : 3;

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  // Check if a number is blocked
  const isNumberBlocked = (number: string): boolean => {
    if (!blockedNumbers) return false;
    const numberList = gameMode === '2D' ? blockedNumbers['2D'] : blockedNumbers['3D'];
    return numberList?.includes(number) || false;
  };

  // Filter out blocked numbers from a list and show warning if any blocked
  const filterBlockedNumbers = (numbers: string[]): string[] => {
    if (!blockedNumbers) return numbers;
    const blocked = numbers.filter(num => isNumberBlocked(num));
    if (blocked.length > 0) {
      setBlockedNumber(blocked.join(', '));
      setShowBlockedWarning(true);
    }
    return numbers.filter(num => !isNumberBlocked(num));
  };

  // Group bets by pattern for display
  const groupBetsByPattern = () => {
    const groups: { [key: string]: { bets: BetItem[]; pattern: { type: string; input: string; label: string } | null; totalAmount: number } } = {};
    
    liveBetList.forEach((bet) => {
      const key = bet.pattern 
        ? `${bet.pattern.type}-${bet.pattern.input}-${bet.pattern.label}`
        : `manual-${bet.number}`;
      
      if (!groups[key]) {
        groups[key] = {
          bets: [],
          pattern: bet.pattern || null,
          totalAmount: 0
        };
      }
      
      groups[key].bets.push(bet);
      groups[key].totalAmount += bet.amount;
    });
    
    return Object.entries(groups).map(([key, data]) => ({
      key,
      ...data
    }));
  };

  const toggleGroupExpansion = (key: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const removeGroup = (key: string) => {
    const group = groupBetsByPattern().find(g => g.key === key);
    if (!group) return;
    
    // Remove all bets in this group
    const betNumbers = new Set(group.bets.map(b => b.number));
    const betPattern = group.pattern;
    
    setLiveBetList(liveBetList.filter(bet => {
      if (!betPattern) {
        // Manual entry - match by number
        return !betNumbers.has(bet.number);
      } else {
        // Pattern entry - match by pattern details
        return !(
          bet.pattern?.type === betPattern.type &&
          bet.pattern?.input === betPattern.input &&
          bet.pattern?.label === betPattern.label
        );
      }
    }));
  };

  // Pattern buttons for 2D mode
  const patternButtons2D = [
    { label: 'အုပ်စု', icon: Grid3x3, color: 'from-blue-500 to-blue-600', type: 'group' },
    { label: 'ထိပ်', icon: BarChart3, color: 'from-purple-500 to-purple-600', type: 'top' },
    { label: 'ဘြိတ်', icon: Circle, color: 'from-orange-500 to-orange-600', type: 'break' },
    { label: 'နောက်', icon: ArrowLeft, color: 'from-green-500 to-green-600', type: 'back' },
    { label: 'ပါတ်', icon: Repeat, color: 'from-teal-500 to-teal-600', type: 'power' },
    { label: 'R', icon: RotateCw, color: 'from-indigo-500 to-indigo-600', type: 'reverse' },
    { label: 'ခွေ', icon: null, color: 'from-pink-500 to-pink-600', type: 'khwe' },
    { label: 'ခွေပူး', icon: null, color: 'from-rose-500 to-rose-600', type: 'khwe-puu' },
    { label: 'အပူး', icon: null, color: 'from-red-500 to-red-600', type: 'a-puu' },
    { label: 'စုံပူး', icon: null, color: 'from-cyan-500 to-cyan-600', type: 'sone-puu' },
    { label: 'မပူး', icon: null, color: 'from-lime-500 to-lime-600', type: 'ma-puu' },
    { label: 'ပါဝါ', icon: null, color: 'from-emerald-500 to-emerald-600', type: 'pawa' },
    { label: 'နက္ခ', icon: null, color: 'from-sky-500 to-sky-600', type: 'natkha' },
    { label: 'ညီကို', icon: null, color: 'from-violet-500 to-violet-600', type: 'nyi-ko' },
    { label: 'ကိုညီ', icon: null, color: 'from-fuchsia-500 to-fuchsia-600', type: 'ko-nyi' },
    { label: 'ညီကိုR', icon: null, color: 'from-amber-500 to-amber-600', type: 'nyi-ko-r' },
    { label: 'စုံမ', icon: null, color: 'from-yellow-500 to-yellow-600', type: 'sone-ma' },
    { label: 'မစုံ', icon: null, color: 'from-orange-600 to-orange-700', type: 'ma-sone' },
    { label: 'စုံမR', icon: null, color: 'from-red-600 to-red-700', type: 'sone-ma-r' },
    { label: 'စုံစုံ', icon: null, color: 'from-blue-600 to-blue-700', type: 'sone-sone' },
    { label: 'မမ', icon: null, color: 'from-purple-600 to-purple-700', type: 'ma-ma' },
    { label: 'စုံကပ်', icon: null, color: 'from-teal-600 to-teal-700', type: 'sone-kat' },
    { label: 'စုံကပ်R', icon: null, color: 'from-cyan-600 to-cyan-700', type: 'sone-kat-r' },
    { label: 'မကပ်', icon: null, color: 'from-green-600 to-green-700', type: 'ma-kat' },
    { label: 'မကပ်R', icon: null, color: 'from-emerald-600 to-emerald-700', type: 'ma-kat-r' },
  ];

  // Pattern buttons for 3D mode
  const patternButtons3D = [
    { label: 'အပူး', icon: null, color: 'from-red-500 to-red-600', type: '3d-apuu' },
    { label: 'ရာပြည့်', icon: null, color: 'from-purple-500 to-purple-600', type: '3d-yapyi' },
    { label: 'စီးရီး', icon: null, color: 'from-blue-500 to-blue-600', type: '3d-series' },
    { label: 'ညီကို', icon: null, color: 'from-green-500 to-green-600', type: '3d-nyiko' },
    { label: 'ကိုညီ', icon: null, color: 'from-orange-500 to-orange-600', type: '3d-konyi' },
    { label: 'R', icon: RotateCw, color: 'from-indigo-500 to-indigo-600', type: '3d-reverse' },
  ];

  // Select pattern buttons based on game mode
  const patternButtons = gameMode === '2D' ? patternButtons2D : patternButtons3D;

  const buttonsPerPage = 6; // 3x2 grid
  const totalPages = Math.ceil(patternButtons.length / buttonsPerPage);
  const startIndex = patternPage * buttonsPerPage;
  const endIndex = startIndex + buttonsPerPage;
  const visiblePatterns = patternButtons.slice(startIndex, endIndex);

  const handlePatternPageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && patternPage > 0) {
      setPatternPage(patternPage - 1);
    } else if (direction === 'next' && patternPage < totalPages - 1) {
      setPatternPage(patternPage + 1);
    }
  };

  const handleKeypad = (value: string) => {
    if (activeField === 'player') {
      setPlayerName(playerName + value);
    } else if (activeField === 'group') {
      setGroupNumbers(groupNumbers + value);
    } else if (activeField === 'head') {
      // In head mode, only allow single digit
      if (headDigit.length === 0 && /^\d$/.test(value)) {
        setHeadDigit(value);
      }
    } else if (activeField === 'tail') {
      // In tail mode, only allow single digit
      if (tailDigit.length === 0 && /^\d$/.test(value)) {
        setTailDigit(value);
      }
    } else if (activeField === 'break') {
      // In break mode, only allow single digit
      if (breakDigit.length === 0 && /^\d$/.test(value)) {
        setBreakDigit(value);
      }
    } else if (activeField === 'round') {
      // In round mode, only allow single digit
      if (roundDigit.length === 0 && /^\d$/.test(value)) {
        setRoundDigit(value);
      }
    } else if (activeField === 'khwe') {
      // In khwe mode, always allow exactly 3 digits (input is always 3 digits)
      if (khweDigits.length < 3 && /^\d$/.test(value)) {
        const newDigits = khweDigits + value;
        setKhweDigits(newDigits);
        // Auto-generate when 3rd digit is entered
        if (newDigits.length === 3 && betAmount && playerName) {
          const numbers = generatePermutations(newDigits, gameMode);
          const filteredNumbers = filterBlockedNumbers(numbers);
          const amount = parseInt(betAmount);
          const newBets: BetItem[] = filteredNumbers.map(num => ({
            number: num,
            amount: amount,
            pattern: {
              type: 'khwe',
              input: newDigits,
              label: 'ခွေ'
            }
          }));
          setLiveBetList([...liveBetList, ...newBets]);
        }
      }
    } else if (activeField === 'khwe-puu') {
      // In khwe-puu mode, always allow exactly 3 digits (input is always 3 digits)
      if (khwePuuDigits.length < 3 && /^\d$/.test(value)) {
        const newDigits = khwePuuDigits + value;
        setKhwePuuDigits(newDigits);
        // Auto-generate when 3rd digit is entered
        if (newDigits.length === 3 && betAmount && playerName) {
          const numbers = generatePermutationsWithDoubles(newDigits, gameMode);
          const filteredNumbers = filterBlockedNumbers(numbers);
          const amount = parseInt(betAmount);
          const newBets: BetItem[] = filteredNumbers.map(num => ({
            number: num,
            amount: amount,
            pattern: {
              type: 'khwe-puu',
              input: newDigits,
              label: 'ခွေပူး'
            }
          }));
          setLiveBetList([...liveBetList, ...newBets]);
        }
      }
    } else if (activeField === 'sone-kat') {
      // In sone-kat mode, only allow single digit
      if (soneKatDigit.length === 0 && /^\d$/.test(value)) {
        setSoneKatDigit(value);
      }
    } else if (activeField === 'sone-kat-r') {
      // In sone-kat-r mode, only allow single digit
      if (soneKatRDigit.length === 0 && /^\d$/.test(value)) {
        setSoneKatRDigit(value);
      }
    } else if (activeField === 'ma-kat') {
      // In ma-kat mode, only allow single digit
      if (maKatDigit.length === 0 && /^\d$/.test(value)) {
        setMaKatDigit(value);
      }
    } else if (activeField === 'ma-kat-r') {
      // In ma-kat-r mode, only allow single digit
      if (maKatRDigit.length === 0 && /^\d$/.test(value)) {
        setMaKatRDigit(value);
      }
    } else if (activeField === 'amount') {
      setBetAmount(betAmount + value);
    } else if (activeField === 'number') {
      // Ensure the new number doesn't exceed maxDigits
      const newNumber = betNumber + value;
      if (newNumber.length <= maxDigits) {
        setBetNumber(newNumber);
      }
    }
  };

  const handleClear = () => {
    if (activeField === 'player') {
      setPlayerName('');
    } else if (activeField === 'amount') {
      setBetAmount('');
    } else if (activeField === 'number') {
      setBetNumber('');
    } else if (activeField === 'group') {
      setGroupNumbers('');
    } else if (activeField === 'head') {
      setHeadDigit('');
    } else if (activeField === 'tail') {
      setTailDigit('');
    } else if (activeField === 'break') {
      setBreakDigit('');
    } else if (activeField === 'round') {
      setRoundDigit('');
    } else if (activeField === 'khwe') {
      setKhweDigits('');
    } else if (activeField === 'khwe-puu') {
      setKhwePuuDigits('');
    } else if (activeField === 'sone-kat') {
      setSoneKatDigit('');
    } else if (activeField === 'sone-kat-r') {
      setSoneKatRDigit('');
    } else if (activeField === 'ma-kat') {
      setMaKatDigit('');
    } else if (activeField === 'ma-kat-r') {
      setMaKatRDigit('');
    }
  };

  const handleDelete = () => {
    if (activeField === 'player') {
      setPlayerName(playerName.slice(0, -1));
    } else if (activeField === 'amount') {
      setBetAmount(betAmount.slice(0, -1));
    } else if (activeField === 'number') {
      setBetNumber(betNumber.slice(0, -1));
    } else if (activeField === 'group') {
      setGroupNumbers(groupNumbers.slice(0, -1));
    } else if (activeField === 'head') {
      setHeadDigit('');
    } else if (activeField === 'tail') {
      setTailDigit('');
    } else if (activeField === 'break') {
      setBreakDigit('');
    } else if (activeField === 'round') {
      setRoundDigit('');
    } else if (activeField === 'khwe') {
      setKhweDigits(khweDigits.slice(0, -1));
    } else if (activeField === 'khwe-puu') {
      setKhwePuuDigits(khwePuuDigits.slice(0, -1));
    }
  };

  // Helper function to check if Checkmark button should be enabled
  const isCheckmarkEnabled = () => {
    if (!playerName || !betAmount) return false;
    
    if (groupMode && groupNumbers) return true;
    if (headMode && headDigit) return true;
    if (tailMode && tailDigit) return true;
    if (breakMode && breakDigit) return true;
    if (roundMode && roundDigit) return true;
    if (khweMode && khweDigits.length === 3) return true;
    if (khwePuuMode && khwePuuDigits.length === 3) return true;
    if (soneKatMode && soneKatDigit) return true;
    if (soneKatRMode && soneKatRDigit) return true;
    if (maKatMode && maKatDigit) return true;
    if (maKatRMode && maKatRDigit) return true;
    // In series mode, check if betNumber has wildcard and correct length
    if (seriesMode && betNumber.includes('?') && betNumber.length === maxDigits) return true;
    if (betNumber && betNumber.length === maxDigits) return true;
    
    return false;
  };

  const handleOK = () => {
    // Checkmark button: Add bet to live list
    if (!isCheckmarkEnabled()) return;

    if (groupMode && groupNumbers && betAmount && playerName) {
      // Process group numbers: split by dot and add each as separate bet
      const numbers = groupNumbers.split('.').filter(n => n.trim() !== '');
      const filteredNumbers = filterBlockedNumbers(numbers.map(n => n.trim()));
      const amount = parseInt(betAmount);
      
      const newBets: BetItem[] = filteredNumbers.map(num => ({
        number: num,
        amount: amount,
        pattern: {
          type: 'group',
          input: numbers.length.toString(),
          label: 'အုပ်စု'
        }
      }));
      
      setLiveBetList([...liveBetList, ...newBets]);
      setGroupNumbers(''); // Clear group numbers
      setGroupMode(false); // Close group mode
      setActiveField('number'); // Return to normal entry
    } else if (headMode && headDigit && betAmount && playerName) {
      // Process head mode: generate 10 numbers and add each as separate bet
      const numbers = generateHeadNumbers();
      const filteredNumbers = filterBlockedNumbers(numbers);
      const amount = parseInt(betAmount);
      
      const newBets: BetItem[] = filteredNumbers.map(num => ({
        number: num,
        amount: amount,
        pattern: {
          type: 'head',
          input: headDigit,
          label: 'ထိပ်'
        }
      }));
      
      setLiveBetList([...liveBetList, ...newBets]);
      setHeadDigit(''); // Clear head digit
      setHeadMode(false); // Close head mode
      setActiveField('number'); // Return to normal entry
    } else if (tailMode && tailDigit && betAmount && playerName) {
      // Process tail mode: generate 10 numbers and add each as separate bet
      const numbers = generateTailNumbers();
      const filteredNumbers = filterBlockedNumbers(numbers);
      const amount = parseInt(betAmount);
      
      const newBets: BetItem[] = filteredNumbers.map(num => ({
        number: num,
        amount: amount,
        pattern: {
          type: 'tail',
          input: tailDigit,
          label: 'နောက်'
        }
      }));
      
      setLiveBetList([...liveBetList, ...newBets]);
      setTailDigit(''); // Clear tail digit
      setTailMode(false); // Close tail mode
      setActiveField('number'); // Return to normal entry
    } else if (breakMode && breakDigit && betAmount && playerName) {
      // Process break mode: generate numbers where sum ends in digit
      const numbers = generateBreakNumbers();
      const filteredNumbers = filterBlockedNumbers(numbers);
      const amount = parseInt(betAmount);
      
      const newBets: BetItem[] = filteredNumbers.map(num => ({
        number: num,
        amount: amount,
        pattern: {
          type: 'break',
          input: breakDigit,
          label: 'ဘြိတ်'
        }
      }));
      
      setLiveBetList([...liveBetList, ...newBets]);
      setBreakDigit(''); // Clear break digit
      setBreakMode(false); // Close break mode
      setActiveField('number'); // Return to normal entry
    } else if (roundMode && roundDigit && betAmount && playerName) {
      // Process round mode: generate all numbers containing the digit
      const numbers = generateRoundNumbers();
      const filteredNumbers = filterBlockedNumbers(numbers);
      const amount = parseInt(betAmount);
      
      const newBets: BetItem[] = filteredNumbers.map(num => ({
        number: num,
        amount: amount,
        pattern: {
          type: 'round',
          input: roundDigit,
          label: 'ပါတ်'
        }
      }));
      
      setLiveBetList([...liveBetList, ...newBets]);
      setRoundDigit(''); // Clear round digit
      setRoundMode(false); // Close round mode
      setActiveField('number'); // Return to normal entry
    } else if (khweMode && khweDigits.length === 3 && betAmount && playerName) {
      // Process khwe mode: permutations already added in handleKeypad
      setKhweDigits(''); // Clear khwe digits
      setKhweMode(false); // Close khwe mode
      setActiveField('number'); // Return to normal entry
    } else if (khwePuuMode && khwePuuDigits.length === maxDigits && betAmount && playerName) {
      // Process khwe-puu mode: permutations with doubles already added in handleKeypad
      setKhwePuuDigits(''); // Clear khwe-puu digits
      setKhwePuuMode(false); // Close khwe-puu mode
      setActiveField('number'); // Return to normal entry
    } else if (soneKatMode && soneKatDigit && betAmount && playerName) {
      // Process sone-kat mode: generate digit + all even numbers
      const numbers = generateSoneKatNumbers();
      const filteredNumbers = filterBlockedNumbers(numbers);
      const amount = parseInt(betAmount);
      
      const newBets: BetItem[] = filteredNumbers.map(num => ({
        number: num,
        amount: amount,
        pattern: {
          type: 'sone-kat',
          input: soneKatDigit,
          label: 'စုံကပ်'
        }
      }));
      
      setLiveBetList([...liveBetList, ...newBets]);
      setSoneKatDigit(''); // Clear sone-kat digit
      setSoneKatMode(false); // Close sone-kat mode
      setActiveField('number'); // Return to normal entry
    } else if (soneKatRMode && soneKatRDigit && betAmount && playerName) {
      // Process sone-kat-r mode: generate even-attach + reverses
      const numbers = generateSoneKatRNumbers();
      const filteredNumbers = filterBlockedNumbers(numbers);
      const amount = parseInt(betAmount);
      
      const newBets: BetItem[] = filteredNumbers.map(num => ({
        number: num,
        amount: amount,
        pattern: {
          type: 'sone-kat-r',
          input: soneKatRDigit,
          label: 'စုံကပ်R'
        }
      }));
      
      setLiveBetList([...liveBetList, ...newBets]);
      setSoneKatRDigit(''); // Clear sone-kat-r digit
      setSoneKatRMode(false); // Close sone-kat-r mode
      setActiveField('number'); // Return to normal entry
    } else if (maKatMode && maKatDigit && betAmount && playerName) {
      // Process ma-kat mode: generate digit + all odd numbers
      const numbers = generateMaKatNumbers();
      const filteredNumbers = filterBlockedNumbers(numbers);
      const amount = parseInt(betAmount);
      
      const newBets: BetItem[] = filteredNumbers.map(num => ({
        number: num,
        amount: amount,
        pattern: {
          type: 'ma-kat',
          input: maKatDigit,
          label: 'မကပ်'
        }
      }));
      
      setLiveBetList([...liveBetList, ...newBets]);
      setMaKatDigit(''); // Clear ma-kat digit
      setMaKatMode(false); // Close ma-kat mode
      setActiveField('number'); // Return to normal entry
    } else if (maKatRMode && maKatRDigit && betAmount && playerName) {
      // Process ma-kat-r mode: generate odd-attach + reverses
      const numbers = generateMaKatRNumbers();
      const filteredNumbers = filterBlockedNumbers(numbers);
      const amount = parseInt(betAmount);
      
      const newBets: BetItem[] = filteredNumbers.map(num => ({
        number: num,
        amount: amount,
        pattern: {
          type: 'ma-kat-r',
          input: maKatRDigit,
          label: 'မကပ်R'
        }
      }));
      
      setLiveBetList([...liveBetList, ...newBets]);
      setMaKatRDigit(''); // Clear ma-kat-r digit
      setMaKatRMode(false); // Close ma-kat-r mode
      setActiveField('number'); // Return to normal entry
    } else if (betNumber && betAmount && playerName) {
      // Check if in series mode and betNumber contains wildcard
      if (seriesMode && betNumber.includes('?') && betNumber.length === maxDigits) {
        // Expand wildcard and add all numbers
        const numbers = generateSeriesNumbers(betNumber);
        const filteredNumbers = filterBlockedNumbers(numbers);
        const amount = parseInt(betAmount);
        const newBets: BetItem[] = filteredNumbers.map(num => ({
          number: num,
          amount: amount,
          pattern: {
            type: 'manual',
            input: betNumber,
            label: 'စီးရီး'
          }
        }));
        setLiveBetList([...liveBetList, ...newBets]);
        setBetNumber('');
        setActiveField('number');
      } else {
        // Regular bet without wildcard
        // Check if number is blocked
        if (isNumberBlocked(betNumber)) {
          setBlockedNumber(betNumber);
          setShowBlockedWarning(true);
          return; // Don't add the bet
        }
        
        const newBet: BetItem = {
          number: betNumber,
          amount: parseInt(betAmount),
        };
        setLiveBetList([...liveBetList, newBet]);
        setBetNumber(''); // Clear only the number
        // Keep betAmount so they can bet the same amount on multiple numbers
        setActiveField('number'); // Stay on number entry for next bet
      }
    }
  };

  const handleAddToCart = () => {
    // ADD button: Convert liveBetList to cartItems and submit
    if (liveBetList.length > 0 && playerName) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const session = `${dateStr}-morning`;
      
      // Convert liveBetList to CartItems
      const newCartItems: CartItem[] = liveBetList.map((bet) => ({
        id: `${Date.now()}-${Math.random()}`,
        player: selectedPlayerValue || '',
        playerName: playerName,
        gameMode: gameMode,
        number: bet.number,
        amount: bet.amount,
        pattern: bet.pattern,
        patternGroup: bet.pattern ? `${bet.pattern.label}-${bet.pattern.input}` : undefined,
      }));

      // Store pending bets and show confirmation dialog
      setPendingBetsToSubmit(newCartItems);
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmSubmit = () => {
    if (!pendingBetsToSubmit) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const session = `${dateStr}-morning`;

    // If we're in PlayerBetEntryModal context (selectedPlayer is provided), submit directly
    if (selectedPlayer && selectedPlayerName) {
      onSubmitBets(pendingBetsToSubmit);
    } else {
      // Otherwise, save to records for later review
      const total = liveBetList.reduce((sum, bet) => sum + bet.amount, 0);
      const savedRecord: SavedRecord = {
        id: `${Date.now()}-${Math.random()}`,
        session,
        timestamp: timeStr,
        playerName,
        bets: liveBetList,
        total,
      };

      if (onSaveRecord) {
        onSaveRecord(savedRecord);
      }
    }

    // Clear everything including group mode and head mode
    setLiveBetList([]);
    setPlayerName('');
    setBetNumber('');
    setBetAmount('');
    setGroupNumbers('');
    setGroupMode(false); // Exit group mode
    setHeadDigit('');
    setHeadMode(false); // Exit head mode
    setTailDigit('');
    setTailMode(false); // Exit tail mode
    setBreakDigit('');
    setBreakMode(false); // Exit break mode
    setRoundDigit('');
    setRoundMode(false); // Exit round mode
    setActiveDoublePattern(null); // Clear double pattern
    setActiveInstantPattern(null); // Clear instant pattern
    setKhweDigits('');
    setKhweMode(false); // Exit khwe mode
    setKhwePuuDigits('');
    setKhwePuuMode(false); // Exit khwe-puu mode
    setSeriesMode(false); // Exit series mode
    setSeriesInput('');
    setExpandedGroups({}); // Clear expansion state
    setActiveField('player');
    
    // Close dialog and clear pending bets
    setShowConfirmDialog(false);
    setPendingBetsToSubmit(null);
  };

  const handleCancelSubmit = () => {
    setShowConfirmDialog(false);
    setPendingBetsToSubmit(null);
  };

  const handleRemoveItem = (index: number) => {
    setLiveBetList(liveBetList.filter((_, i) => i !== index));
  };

  const handleDiscardSession = () => {
    setLiveBetList([]);
    setBetNumber('');
    setBetAmount('');
    setExpandedGroups({}); // Clear expansion state
  };

  const handlePattern = (type: string) => {
    if (type === 'group') {
      // Toggle group mode
      setGroupMode(!groupMode);
      if (!groupMode) {
        // Entering group mode
        setGroupNumbers('');
        setActiveField('group');
      } else {
        // Exiting group mode
        setGroupNumbers('');
        setActiveField('number');
      }
    } else if (type === 'top') {
      // Toggle Head (ထိပ်) mode
      setHeadMode(!headMode);
      if (!headMode) {
        // Entering head mode
        setHeadDigit('');
        setActiveField('head');
      } else {
        // Exiting head mode
        setHeadDigit('');
        setActiveField('number');
      }
    } else if (type === 'back') {
      // Toggle Tail (နောက်) mode
      setTailMode(!tailMode);
      if (!tailMode) {
        // Entering tail mode
        setTailDigit('');
        setActiveField('tail');
      } else {
        // Exiting tail mode
        setTailDigit('');
        setActiveField('number');
      }
    } else if (type === 'break') {
      // Toggle Break (ဘရိတ်) mode
      setBreakMode(!breakMode);
      if (!breakMode) {
        // Entering break mode
        setBreakDigit('');
        setActiveField('break');
      } else {
        // Exiting break mode
        setBreakDigit('');
        setActiveField('number');
      }
    } else if (type === 'power') {
      // Toggle Round (ပါတ်) mode
      setRoundMode(!roundMode);
      if (!roundMode) {
        // Entering round mode
        setRoundDigit('');
        setActiveField('round');
      } else {
        // Exiting round mode
        setRoundDigit('');
        setActiveField('number');
      }
    } else if (type === 'khwe') {
      // Toggle Khwe (ခွေ) mode - Permutation
      setKhweMode(!khweMode);
      if (!khweMode) {
        // Entering khwe mode
        setKhweDigits('');
        setActiveField('khwe');
      } else {
        // Exiting khwe mode
        setKhweDigits('');
        setActiveField('number');
      }
    } else if (type === 'khwe-puu') {
      // Toggle Khwe-Puu (ခွေပူး) mode - Permutation with Doubles
      setKhwePuuMode(!khwePuuMode);
      if (!khwePuuMode) {
        // Entering khwe-puu mode
        setKhwePuuDigits('');
        setActiveField('khwe-puu');
      } else {
        // Exiting khwe-puu mode
        setKhwePuuDigits('');
        setActiveField('number');
      }
    } else if (type === 'sone-puu') {
      // Instant generation: Even Doubles (စုံပူး)
      if (activeDoublePattern === 'even') {
        // Toggle off: remove even doubles from this pattern only
        setLiveBetList(liveBetList.filter(bet => 
          !(bet.pattern?.type === 'power-3' && bet.pattern?.label === 'စုံပူး')
        ));
        setActiveDoublePattern(null);
      } else {
        // Generate and add even doubles
        if (betAmount && playerName) {
          const numbers = generateEvenDoubles();
          const amount = parseInt(betAmount);
          const newBets: BetItem[] = numbers.map(num => ({
            number: num,
            amount: amount,
            pattern: {
              type: 'power-3',
              input: numbers.length.toString(),
              label: 'စုံပူး'
            }
          }));
          // Add new bets without removing existing ones
          setLiveBetList([...liveBetList, ...newBets]);
          setActiveDoublePattern('even');
        }
      }
    } else if (type === 'ma-puu') {
      // Instant generation: Odd Doubles (မပူး)
      if (activeDoublePattern === 'odd') {
        // Toggle off: remove odd doubles from this pattern only
        setLiveBetList(liveBetList.filter(bet => 
          !(bet.pattern?.type === 'break-3' && bet.pattern?.label === 'မပူး')
        ));
        setActiveDoublePattern(null);
      } else {
        // Generate and add odd doubles
        if (betAmount && playerName) {
          const numbers = generateOddDoubles();
          const amount = parseInt(betAmount);
          const newBets: BetItem[] = numbers.map(num => ({
            number: num,
            amount: amount,
            pattern: {
              type: 'break-3',
              input: numbers.length.toString(),
              label: 'မပူး'
            }
          }));
          // Add new bets without removing existing ones
          setLiveBetList([...liveBetList, ...newBets]);
          setActiveDoublePattern('odd');
        }
      }
    } else if (type === 'a-puu') {
      // Instant generation: All Doubles (အပူး)
      if (activeDoublePattern === 'all') {
        // Toggle off: remove all doubles from this pattern only
        setLiveBetList(liveBetList.filter(bet => 
          !(bet.pattern?.type === 'natkhat-body' && bet.pattern?.label === 'အပူး')
        ));
        setActiveDoublePattern(null);
      } else {
        // Generate and add all doubles
        if (betAmount && playerName) {
          const numbers = generateAllDoubles();
          const amount = parseInt(betAmount);
          const newBets: BetItem[] = numbers.map(num => ({
            number: num,
            amount: amount,
            pattern: {
              type: 'natkhat-body',
              input: numbers.length.toString(),
              label: 'အပူး'
            }
          }));
          // Add new bets without removing existing ones
          setLiveBetList([...liveBetList, ...newBets]);
          setActiveDoublePattern('all');
        }
      }
    } else if (type === 'reverse') {
      // R (Reverse): If user has entered a number, generate number + its reverse
      if (betNumber && betAmount && playerName) {
        const reversed = betNumber.split('').reverse().join('');
        const numbers = betNumber !== reversed ? [betNumber, reversed] : [betNumber];
        const amount = parseInt(betAmount);
        const newBets: BetItem[] = numbers.map(num => ({
          number: num,
          amount: amount,
        }));
        setLiveBetList([...liveBetList, ...newBets]);
        setBetNumber('');
        setActiveField('number');
      }
    } else if (type === 'pawa') {
      // ပါဝါ (Pawa/Power): Generate all power numbers
      if (betAmount && playerName) {
        const numbers = generatePawaNumbers();
        const amount = parseInt(betAmount);
        const newBets: BetItem[] = numbers.map(num => ({
          number: num,
          amount: amount,
          pattern: {
            type: 'power-2',
            input: numbers.length.toString(),
            label: 'ပါဝါ'
          }
        }));
        setLiveBetList([...liveBetList, ...newBets]);
        setActiveInstantPattern('pawa');
      }
    } else if (type === 'natkha') {
      // နက္ခ (Natkha/Astrology): Generate astrology numbers
      if (betAmount && playerName) {
        const numbers = generateNatkhaNumbers();
        const amount = parseInt(betAmount);
        const newBets: BetItem[] = numbers.map(num => ({
          number: num,
          amount: amount,
          pattern: {
            type: 'nat-kyauk',
            input: numbers.length.toString(),
            label: 'နက္ခ'
          }
        }));
        setLiveBetList([...liveBetList, ...newBets]);
        setActiveInstantPattern('natkha');
      }
    } else if (type === 'nyi-ko') {
      // ညီကို (Nyi-Ko/Brother): First digit is second digit minus 1
      if (betAmount && playerName) {
        const numbers = generateNyiKoNumbers();
        const amount = parseInt(betAmount);
        const newBets: BetItem[] = numbers.map(num => ({
          number: num,
          amount: amount,
          pattern: {
            type: 'brothers',
            input: numbers.length.toString(),
            label: 'ညီကို'
          }
        }));
        setLiveBetList([...liveBetList, ...newBets]);
        setActiveInstantPattern('nyi-ko');
      }
    } else if (type === 'ko-nyi') {
      // ကိုညီ (Ko-Nyi/Brother reverse): Second digit is first digit minus 1
      if (betAmount && playerName) {
        const numbers = generateKoNyiNumbers();
        const amount = parseInt(betAmount);
        const newBets: BetItem[] = numbers.map(num => ({
          number: num,
          amount: amount,
          pattern: {
            type: 'opposite',
            input: numbers.length.toString(),
            label: 'ကိုညီ'
          }
        }));
        setLiveBetList([...liveBetList, ...newBets]);
        setActiveInstantPattern('ko-nyi');
      }
    } else if (type === 'nyi-ko-r') {
      // ညီကိုR (Nyi-Ko-R): Nyi-Ko with Ko-Nyi combined
      if (betAmount && playerName) {
        const numbers = generateNyiKoRNumbers();
        const amount = parseInt(betAmount);
        const newBets: BetItem[] = numbers.map(num => ({
          number: num,
          amount: amount,
          pattern: {
            type: 'twin',
            input: numbers.length.toString(),
            label: 'ညီကိုR'
          }
        }));
        setLiveBetList([...liveBetList, ...newBets]);
        setActiveInstantPattern('nyi-ko-r');
      }
    } else if (type === 'sone-ma') {
      // စုံမ (Sone-Ma): Even first digit, odd second digit
      if (betAmount && playerName) {
        const numbers = generateSoneMaNumbers();
        const amount = parseInt(betAmount);
        const newBets: BetItem[] = numbers.map(num => ({
          number: num,
          amount: amount,
          pattern: {
            type: 'apone',
            input: numbers.length.toString(),
            label: 'စုံမ'
          }
        }));
        setLiveBetList([...liveBetList, ...newBets]);
        setActiveInstantPattern('sone-ma');
      }
    } else if (type === 'ma-sone') {
      // မစုံ (Ma-Sone): Odd first digit, even second digit
      if (betAmount && playerName) {
        const numbers = generateMaSoneNumbers();
        const amount = parseInt(betAmount);
        const newBets: BetItem[] = numbers.map(num => ({
          number: num,
          amount: amount,
          pattern: {
            type: 'apout',
            input: numbers.length.toString(),
            label: 'မစုံ'
          }
        }));
        setLiveBetList([...liveBetList, ...newBets]);
        setActiveInstantPattern('ma-sone');
      }
    } else if (type === 'sone-ma-r') {
      // စုံမR (Sone-Ma-R): Even-Odd with Odd-Even combined (50 numbers total)
      if (betAmount && playerName) {
        const numbers = generateSoneMaRNumbers();
        const amount = parseInt(betAmount);
        const newBets: BetItem[] = numbers.map(num => ({
          number: num,
          amount: amount,
          pattern: {
            type: 'break-2',
            input: numbers.length.toString(),
            label: 'စုံမR'
          }
        }));
        setLiveBetList([...liveBetList, ...newBets]);
        setActiveInstantPattern('sone-ma-r');
      }
    } else if (type === 'sone-sone') {
      // Instant generation: Even-Even (စုံစုံ) - Both digits even
      if (activeInstantPattern === 'sone-sone') {
        // Toggle off: remove even-even numbers from live list
        const evenEven = generateSoneSoneNumbers();
        setLiveBetList(liveBetList.filter(bet => !evenEven.includes(bet.number)));
        setActiveInstantPattern(null);
      } else {
        // Generate and add even-even numbers
        if (betAmount && playerName) {
          const numbers = generateSoneSoneNumbers();
          const amount = parseInt(betAmount);
          const newBets: BetItem[] = numbers.map(num => ({
            number: num,
            amount: amount,
            pattern: {
              type: 'power-3',
              input: numbers.length.toString(),
              label: 'စုံစုံ'
            }
          }));
          // Remove any existing even-even numbers first, then add new ones
          const evenEven = generateSoneSoneNumbers();
          const filteredList = liveBetList.filter(bet => !evenEven.includes(bet.number));
          setLiveBetList([...filteredList, ...newBets]);
          setActiveInstantPattern('sone-sone');
        }
      }
    } else if (type === 'ma-ma') {
      // Instant generation: Odd-Odd (မမ) - Both digits odd
      if (activeInstantPattern === 'ma-ma') {
        // Toggle off: remove odd-odd numbers from live list
        const oddOdd = generateMaMaNumbers();
        setLiveBetList(liveBetList.filter(bet => !oddOdd.includes(bet.number)));
        setActiveInstantPattern(null);
      } else {
        // Generate and add odd-odd numbers
        if (betAmount && playerName) {
          const numbers = generateMaMaNumbers();
          const amount = parseInt(betAmount);
          const newBets: BetItem[] = numbers.map(num => ({
            number: num,
            amount: amount,
            pattern: {
              type: 'break-3',
              input: numbers.length.toString(),
              label: 'မမ'
            }
          }));
          // Remove any existing odd-odd numbers first, then add new ones
          const oddOdd = generateMaMaNumbers();
          const filteredList = liveBetList.filter(bet => !oddOdd.includes(bet.number));
          setLiveBetList([...filteredList, ...newBets]);
          setActiveInstantPattern('ma-ma');
        }
      }
    } else if (type === 'sone-kat') {
      // Toggle Even-Attach (စုံကပ်) mode
      setSoneKatMode(!soneKatMode);
      if (!soneKatMode) {
        // Entering sone-kat mode
        setSoneKatDigit('');
        setActiveField('sone-kat');
      } else {
        // Exiting sone-kat mode
        setSoneKatDigit('');
        setActiveField('number');
      }
    } else if (type === 'sone-kat-r') {
      // Toggle Even-Attach Round (စုံကပ်R) mode
      setSoneKatRMode(!soneKatRMode);
      if (!soneKatRMode) {
        // Entering sone-kat-r mode
        setSoneKatRDigit('');
        setActiveField('sone-kat-r');
      } else {
        // Exiting sone-kat-r mode
        setSoneKatRDigit('');
        setActiveField('number');
      }
    } else if (type === 'ma-kat') {
      // Toggle Odd-Attach (မကပ်) mode
      setMaKatMode(!maKatMode);
      if (!maKatMode) {
        // Entering ma-kat mode
        setMaKatDigit('');
        setActiveField('ma-kat');
      } else {
        // Exiting ma-kat mode
        setMaKatDigit('');
        setActiveField('number');
      }
    } else if (type === 'ma-kat-r') {
      // Toggle Odd-Attach Round (မကပ်R) mode
      setMaKatRMode(!maKatRMode);
      if (!maKatRMode) {
        // Entering ma-kat-r mode
        setMaKatRDigit('');
        setActiveField('ma-kat-r');
      } else {
        // Exiting ma-kat-r mode
        setMaKatRDigit('');
        setActiveField('number');
      }
    } else if (type === '3d-apuu') {
      // 3D အပူး (Triples): 000, 111, 222, ..., 999
      if (betAmount && playerName) {
        const numbers = generate3DTriples();
        const amount = parseInt(betAmount);
        const newBets: BetItem[] = numbers.map(num => ({
          number: num,
          amount: amount,
          pattern: {
            type: 'manual',
            input: '3D Triples',
            label: 'အပူး'
          }
        }));
        setLiveBetList([...liveBetList, ...newBets]);
        setActiveInstantPattern('3d-apuu');
      }
    } else if (type === '3d-yapyi') {
      // 3D ရာပြည့် (Hundreds): 100, 200, 300, ..., 900
      if (betAmount && playerName) {
        const numbers = generate3DHundreds();
        const amount = parseInt(betAmount);
        const newBets: BetItem[] = numbers.map(num => ({
          number: num,
          amount: amount,
          pattern: {
            type: 'manual',
            input: '3D Hundreds',
            label: 'ရာပြည့်'
          }
        }));
        setLiveBetList([...liveBetList, ...newBets]);
        setActiveInstantPattern('3d-yapyi');
      }
    } else if (type === '3d-series') {
      // 3D စီးရီး (Wildcard Series) - Toggle mode
      setSeriesMode(!seriesMode);
      if (!seriesMode) {
        // Entering series mode
        setSeriesInput('');
        setActiveField('number');
      } else {
        // Exiting series mode
        setSeriesInput('');
        setBetNumber('');
        setActiveField('number');
      }
    } else if (type === '3d-nyiko') {
      // 3D ညီကို (Ascending Sequential): 012, 123, 234, ..., 890, 901
      if (betAmount && playerName) {
        const numbers = generate3DNyiKo();
        const amount = parseInt(betAmount);
        const newBets: BetItem[] = numbers.map(num => ({
          number: num,
          amount: amount,
          pattern: {
            type: 'manual',
            input: '3D Ascending',
            label: 'ညီကို'
          }
        }));
        setLiveBetList([...liveBetList, ...newBets]);
        setActiveInstantPattern('3d-nyiko');
      }
    } else if (type === '3d-konyi') {
      // 3D ကိုညီ (Descending Sequential): 987, 876, 765, ..., 109, 098
      if (betAmount && playerName) {
        const numbers = generate3DKoNyi();
        const amount = parseInt(betAmount);
        const newBets: BetItem[] = numbers.map(num => ({
          number: num,
          amount: amount,
          pattern: {
            type: 'manual',
            input: '3D Descending',
            label: 'ကိုညီ'
          }
        }));
        setLiveBetList([...liveBetList, ...newBets]);
        setActiveInstantPattern('3d-konyi');
      }
    } else if (type === '3d-reverse') {
      // 3D R (Permutations): Generate all permutations of entered number
      if (betNumber && betAmount && playerName && betNumber.length === 3) {
        const numbers = generatePermutations(betNumber);
        const amount = parseInt(betAmount);
        const newBets: BetItem[] = numbers.map(num => ({
          number: num,
          amount: amount,
          pattern: {
            type: 'manual',
            input: betNumber,
            label: 'R'
          }
        }));
        setLiveBetList([...liveBetList, ...newBets]);
        setBetNumber('');
        setActiveField('number');
      }
    }
  };

  const generateHeadNumbers = () => {
    if (!headDigit) return [];
    const numbers = [];
    for (let i = 0; i <= 9; i++) {
      numbers.push(`${headDigit}${i}`);
    }
    return numbers;
  };

  const generateTailNumbers = () => {
    if (!tailDigit) return [];
    const numbers = [];
    for (let i = 0; i <= 9; i++) {
      numbers.push(`${i}${tailDigit}`);
    }
    return numbers;
  };

  const generateBreakNumbers = () => {
    if (!breakDigit) return [];
    const digit = parseInt(breakDigit);
    const numbers: string[] = [];
    
    // Generate all 2D numbers where sum of digits ends in the chosen digit
    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j <= 9; j++) {
        const sum = i + j;
        const sumLastDigit = sum % 10;
        if (sumLastDigit === digit) {
          const num = `${i}${j}`;
          numbers.push(num.padStart(2, '0'));
        }
      }
    }
    
    // Remove duplicates and sort
    return Array.from(new Set(numbers)).sort();
  };

  const generateRoundNumbers = () => {
    if (!roundDigit) return [];
    const numbers: string[] = [];
    
    // Generate all numbers containing the digit (in first or second position)
    for (let i = 0; i <= 9; i++) {
      // First position
      numbers.push(`${roundDigit}${i}`);
      // Second position (avoid duplicates)
      if (i.toString() !== roundDigit) {
        numbers.push(`${i}${roundDigit}`);
      }
    }
    
    return numbers.sort();
  };

  const generateEvenDoubles = () => {
    return ['00', '22', '44', '66', '88'];
  };

  const generateOddDoubles = () => {
    return ['11', '33', '55', '77', '99'];
  };

  const generateAllDoubles = () => {
    return ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];
  };

  // Generate permutations from 3 digits
  // In 2D mode: generates 2-digit combinations (picks 2 from 3 input digits)
  // In 3D mode: generates 3-digit permutations (all arrangements of 3 digits)
  const generatePermutations = (digits: string, gameMode: '2D' | '3D') => {
    if (digits.length === 3) {
      if (gameMode === '2D') {
        // 2D mode: Generate all 2-digit combinations from 3 digits (without doubles)
        const result: string[] = [];
        const d = digits.split('');
        
        // Generate all pairs (i, j) where i ≠ j
        for (let i = 0; i < d.length; i++) {
          for (let j = 0; j < d.length; j++) {
            if (i !== j) {
              const pair = d[i] + d[j];
              if (!result.includes(pair)) {
                result.push(pair);
              }
            }
          }
        }
        return result; // Should return 6 numbers (3P2 = 6)
      } else {
        // 3D mode: Generate all 3-digit permutations (without repeats)
        const result: string[] = [];
        const d = digits.split('');
        
        // Generate all 3-digit permutations
        for (let i = 0; i < d.length; i++) {
          for (let j = 0; j < d.length; j++) {
            for (let k = 0; k < d.length; k++) {
              if (i !== j && j !== k && i !== k) {
                const perm = d[i] + d[j] + d[k];
                if (!result.includes(perm)) {
                  result.push(perm);
                }
              }
            }
          }
        }
        return result; // Should return 6 numbers (3! = 6)
      }
    }
    return [];
  };

  // Generate permutations with doubles
  // In 2D mode: generates 2-digit combinations including doubles (picks 2 from 3, with replacement)
  // In 3D mode: generates 3-digit permutations including doubles
  const generatePermutationsWithDoubles = (digits: string, gameMode: '2D' | '3D') => {
    if (digits.length === 3) {
      if (gameMode === '2D') {
        // 2D mode: Generate all 2-digit combinations WITH doubles
        const result: string[] = [];
        const d = digits.split('');
        
        // Generate all pairs (i, j) including when i = j (doubles)
        for (let i = 0; i < d.length; i++) {
          for (let j = 0; j < d.length; j++) {
            const pair = d[i] + d[j];
            if (!result.includes(pair)) {
              result.push(pair);
            }
          }
        }
        return result; // Should return 9 numbers (3² = 9)
      } else {
        // 3D mode: Generate permutations + doubles
        const permutations = generatePermutations(digits, gameMode);
        const doubles = digits.split('').map(d => d + d + d); // Triple digits for 3D
        return [...permutations, ...doubles];
      }
    }
    return [];
  };

  // Generate Pawa/Power numbers - Specific pattern
  const generatePawaNumbers = () => {
    return ['05', '50', '16', '61', '27', '72', '38', '83', '49', '94'];
  };

  // Generate Natkha numbers - Specific pattern  
  const generateNatkhaNumbers = () => {
    return ['07', '70', '18', '81', '24', '42', '35', '53', '69', '96'];
  };

  // Generate Nyi-Ko numbers (brother pattern: first digit = second digit - 1)
  const generateNyiKoNumbers = () => {
    return ['01', '12', '23', '34', '45', '56', '67', '78', '89', '90'];
  };

  // Generate Ko-Nyi numbers (reverse brother pattern: second digit = first digit - 1)
  const generateKoNyiNumbers = () => {
    return ['10', '21', '32', '43', '54', '65', '76', '87', '98', '09'];
  };

  // Generate Nyi-Ko-R numbers (brother pattern with reverses)
  const generateNyiKoRNumbers = () => {
    const nyiKo = generateNyiKoNumbers();
    const koNyi = generateKoNyiNumbers();
    return [...nyiKo, ...koNyi];
  };

  // Generate Sone-Ma numbers (even first digit, odd second digit)
  const generateSoneMaNumbers = () => {
    const numbers: string[] = [];
    for (let i = 0; i <= 9; i += 2) { // Even first digits: 0, 2, 4, 6, 8
      for (let j = 1; j <= 9; j += 2) { // Odd second digits: 1, 3, 5, 7, 9
        numbers.push(`${i}${j}`);
      }
    }
    return numbers;
  };

  // Generate Ma-Sone numbers (odd first digit, even second digit)
  const generateMaSoneNumbers = () => {
    const numbers: string[] = [];
    for (let i = 1; i <= 9; i += 2) { // Odd first digits: 1, 3, 5, 7, 9
      for (let j = 0; j <= 9; j += 2) { // Even second digits: 0, 2, 4, 6, 8
        numbers.push(`${i}${j}`);
      }
    }
    return numbers;
  };

  // Generate Sone-Ma-R numbers (even-odd with reverses = all mixed parity)
  const generateSoneMaRNumbers = () => {
    const soneMa = generateSoneMaNumbers();
    const maSone = generateMaSoneNumbers();
    return [...soneMa, ...maSone];
  };

  // Generate Sone-Sone numbers (both digits even)
  const generateSoneSoneNumbers = () => {
    const numbers: string[] = [];
    for (let i = 0; i <= 9; i += 2) { // Even first digits
      for (let j = 0; j <= 9; j += 2) { // Even second digits
        numbers.push(`${i}${j}`);
      }
    }
    return numbers;
  };

  // Generate Ma-Ma numbers (both digits odd)
  const generateMaMaNumbers = () => {
    const numbers: string[] = [];
    for (let i = 1; i <= 9; i += 2) { // Odd first digits
      for (let j = 1; j <= 9; j += 2) { // Odd second digits
        numbers.push(`${i}${j}`);
      }
    }
    return numbers;
  };

  // Generate Sone-Kat numbers (even-attach: digit + all even numbers)
  const generateSoneKatNumbers = () => {
    if (!soneKatDigit) return [];
    const numbers: string[] = [];
    const evenDigits = [0, 2, 4, 6, 8];
    for (const even of evenDigits) {
      numbers.push(`${soneKatDigit}${even}`);
    }
    return numbers;
  };

  // Generate Sone-Kat-R numbers (even-attach + reverses)
  const generateSoneKatRNumbers = () => {
    if (!soneKatRDigit) return [];
    const numbers: string[] = [];
    const evenDigits = [0, 2, 4, 6, 8];
    for (const even of evenDigits) {
      numbers.push(`${soneKatRDigit}${even}`);
      // Add reverse if different
      const reverse = `${even}${soneKatRDigit}`;
      if (reverse !== `${soneKatRDigit}${even}`) {
        numbers.push(reverse);
      }
    }
    return numbers;
  };

  // Generate Ma-Kat numbers (odd-attach: digit + all odd numbers)
  const generateMaKatNumbers = () => {
    if (!maKatDigit) return [];
    const numbers: string[] = [];
    const oddDigits = [1, 3, 5, 7, 9];
    for (const odd of oddDigits) {
      numbers.push(`${maKatDigit}${odd}`);
    }
    return numbers;
  };

  // Generate Ma-Kat-R numbers (odd-attach + reverses)
  const generateMaKatRNumbers = () => {
    if (!maKatRDigit) return [];
    const numbers: string[] = [];
    const oddDigits = [1, 3, 5, 7, 9];
    for (const odd of oddDigits) {
      numbers.push(`${maKatRDigit}${odd}`);
      // Add reverse if different
      const reverse = `${odd}${maKatRDigit}`;
      if (reverse !== `${maKatRDigit}${odd}`) {
        numbers.push(reverse);
      }
    }
    return numbers;
  };


  // === 3D Pattern Generators ===
  
  // Generate 3D Triples (အပ��း): 000, 111, 222, ..., 999
  const generate3DTriples = () => {
    const numbers: string[] = [];
    for (let i = 0; i <= 9; i++) {
      numbers.push(`${i}${i}${i}`);
    }
    return numbers;
  };

  // Generate 3D Hundreds (ရာပြည့်): 100, 200, 300, ..., 900
  const generate3DHundreds = () => {
    const numbers: string[] = [];
    for (let i = 1; i <= 9; i++) {
      numbers.push(`${i}00`);
    }
    return numbers;
  };

  // Generate 3D Nyi-Ko (ညီကို - Ascending): 012, 123, 234, ..., 890, 901
  const generate3DNyiKo = () => {
    const numbers: string[] = [];
    for (let i = 0; i <= 9; i++) {
      const second = (i + 1) % 10;
      const third = (i + 2) % 10;
      numbers.push(`${i}${second}${third}`);
    }
    return numbers;
  };

  // Generate 3D Ko-Nyi (ကိုညီ - Descending): 987, 876, 765, ..., 109, 098
  const generate3DKoNyi = () => {
    const numbers: string[] = [];
    for (let i = 9; i >= 0; i--) {
      const second = i === 0 ? 9 : i - 1;
      const third = i <= 1 ? (i === 0 ? 8 : 9) : i - 2;
      numbers.push(`${i}${second}${third}`);
    }
    return numbers;
  };

  // Generate wildcard numbers based on series input (with ?)
  const generateSeriesNumbers = (input: string) => {
    const numbers: string[] = [];
    const questionMarkIndex = input.indexOf('?');
    
    if (questionMarkIndex === -1) return [];
    
    // Generate numbers by replacing ? with 0-9
    for (let i = 0; i <= 9; i++) {
      const number = input.replace('?', i.toString());
      numbers.push(number);
    }
    
    return numbers;
  };

  const handleSubmit = () => {
    if (cartItems.length > 0) {
      onSubmitBets(cartItems);
      setCartItems([]);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.amount, 0);
  const commission = subtotal * 0.15;
  const total = subtotal + commission;

  return (
    <div className="flex-1 flex overflow-hidden bg-gray-100">
      {/* Main Entry Section (Full Width) */}
      <div className="w-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-3 sm:py-4 shadow-lg flex-shrink-0">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Bet Entry</h1>
          <p className="text-xs sm:text-sm text-blue-100">Create and manage your lottery bets</p>
        </div>

        {/* Main Content - Improved Spacing */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 hide-scrollbar">
          <div className="max-w-2xl mx-auto flex flex-col">
            {/* Top Bar - Player Name with 24px top spacing */}
            {!selectedPlayerName && (
              <div className="flex-shrink-0 mb-4 mt-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Player Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onFocus={() => setActiveField('player')}
                    placeholder="Enter player name"
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-xl bg-white text-gray-800 font-medium focus:outline-none transition-all shadow-sm ${
                      activeField === 'player' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                    }`}
                  />
                  {playerName && (
                    <button
                      onClick={() => setPlayerName('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Icons Row with 16px spacing */}
            <div className="flex-shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.dispatchEvent(new CustomEvent('openLedger'))}
                className="flex flex-col items-center justify-center p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all shadow-sm"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-1 sm:mb-2">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-700" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                  လေဂျာ
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.dispatchEvent(new CustomEvent('openBettingRecords'))}
                className="flex flex-col items-center justify-center p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50 transition-all shadow-sm"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-1 sm:mb-2">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-700" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                  မှတ်တမ်း
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.dispatchEvent(new CustomEvent('openSettlement'))}
                className="flex flex-col items-center justify-center p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl border-2 border-gray-300 hover:border-green-400 hover:bg-green-50 transition-all shadow-sm"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-1 sm:mb-2">
                  <List className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-700" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                  ရှင်းတမ်း
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center justify-center p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all shadow-sm"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mb-1 sm:mb-2">
                  <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-700">Settings</span>
              </motion.button>
            </div>

            {/* Game Mode Toggle with responsive spacing */}
            <div className="flex-shrink-0 mb-4">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">Game Mode</label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setGameMode('2D');
                    setBetNumber('');
                    setActiveField('number'); // Activate number entry
                  }}
                  className={`py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all shadow-sm ${
                    gameMode === '2D'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 border-2 border-gray-300'
                  }`}
                >
                  2D Mode
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setGameMode('3D');
                    setBetNumber('');
                    setActiveField('number'); // Activate number entry
                  }}
                  className={`py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all shadow-sm ${
                    gameMode === '3D'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 border-2 border-gray-300'
                  }`}
                >
                  3D Mode
                </motion.button>
              </div>
            </div>

            {/* Group Mode Input Box - Shows when group mode is active */}
            <AnimatePresence>
              {groupMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex-shrink-0 mb-4"
                >
                  <label className="block text-sm font-bold text-gray-700 mb-2" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    အုပ်စု Mode
                  </label>
                  <input
                    type="text"
                    value={groupNumbers}
                    onChange={(e) => setGroupNumbers(e.target.value)}
                    onFocus={() => setActiveField('group')}
                    placeholder="2D ဂဏန်းများရေးပါ... (e.g., 21.23.46.98)"
                    className={`w-full px-4 py-3 border-2 rounded-xl bg-white text-gray-900 font-semibold focus:outline-none transition-all shadow-sm ${
                      activeField === 'group' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-400'
                    }`}
                    style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Head Mode Input Box - Shows when head mode is active */}
            <AnimatePresence>
              {headMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex-shrink-0 mb-4"
                >
                  <label className="block text-sm font-bold text-gray-700 mb-2" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    ထိပ်ဂဏန်း Mode
                  </label>
                  <input
                    type="text"
                    value={headDigit}
                    onClick={() => setActiveField('head')}
                    onFocus={() => setActiveField('head')}
                    readOnly
                    placeholder="ထိပ်ဂဏန်း ၁ လုံးရေးပါ..."
                    className={`w-full px-4 py-3 border-2 rounded-xl bg-white text-gray-900 font-semibold focus:outline-none transition-all shadow-sm ${
                      activeField === 'head' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-400'
                    }`}
                    style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tail Mode Input Box - Shows when tail mode is active */}
            <AnimatePresence>
              {tailMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex-shrink-0 mb-4"
                >
                  <label className="block text-sm font-bold text-gray-700 mb-2" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    နောက်ဂဏန်း Mode
                  </label>
                  <input
                    type="text"
                    value={tailDigit}
                    onClick={() => setActiveField('tail')}
                    onFocus={() => setActiveField('tail')}
                    readOnly
                    placeholder="နောက်ဂဏန်း ၁ လုံးရေးပါ..."
                    className={`w-full px-4 py-3 border-2 rounded-xl bg-white text-gray-900 font-semibold focus:outline-none transition-all shadow-sm ${
                      activeField === 'tail' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-400'
                    }`}
                    style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Break Mode Input Box - Shows when break mode is active */}
            <AnimatePresence>
              {breakMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex-shrink-0 mb-4"
                >
                  <label className="block text-sm font-bold text-gray-700 mb-2" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    ဘရိတ်ဂဏန်း Mode
                  </label>
                  <input
                    type="text"
                    value={breakDigit}
                    onClick={() => setActiveField('break')}
                    onFocus={() => setActiveField('break')}
                    readOnly
                    placeholder="ဘရိတ် ဂဏန်း ၁ လုံးရေးပါ..."
                    className={`w-full px-4 py-3 border-2 rounded-xl bg-white text-gray-900 font-semibold focus:outline-none transition-all shadow-sm ${
                      activeField === 'break' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-400'
                    }`}
                    style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Round Mode Input Box - Shows when round mode is active */}
            <AnimatePresence>
              {roundMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex-shrink-0 mb-4"
                >
                  <label className="block text-sm font-bold text-gray-700 mb-2" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    ပါတ်ဂဏန်း Mode
                  </label>
                  <input
                    type="text"
                    value={roundDigit}
                    onClick={() => setActiveField('round')}
                    onFocus={() => setActiveField('round')}
                    readOnly
                    placeholder="ပါတ်ဂဏန်း ၁ လုံးရေးပါ..."
                    className={`w-full px-4 py-3 border-2 rounded-xl bg-white text-gray-900 font-semibold focus:outline-none transition-all shadow-sm ${
                      activeField === 'round' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-400'
                    }`}
                    style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Khwe Mode Input Box - Shows when khwe mode is active */}
            <AnimatePresence>
              {khweMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex-shrink-0 mb-4"
                >
                  <label className="block text-sm font-bold text-gray-700 mb-2" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    ခွေဂဏန်း Mode
                  </label>
                  <input
                    type="text"
                    value={khweDigits}
                    onClick={() => setActiveField('khwe')}
                    onFocus={() => setActiveField('khwe')}
                    readOnly
                    placeholder="ခွေဂဏန်း ၃ လုံးရေးပါ..."
                    className={`w-full px-4 py-3 border-2 rounded-xl bg-white text-gray-900 font-semibold focus:outline-none transition-all shadow-sm ${
                      activeField === 'khwe' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-400'
                    }`}
                    style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Khwe-Puu Mode Input Box - Shows when khwe-puu mode is active */}
            <AnimatePresence>
              {khwePuuMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex-shrink-0 mb-4"
                >
                  <label className="block text-sm font-bold text-gray-700 mb-2" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    ခွေပူး Mode
                  </label>
                  <input
                    type="text"
                    value={khwePuuDigits}
                    onClick={() => setActiveField('khwe-puu')}
                    onFocus={() => setActiveField('khwe-puu')}
                    readOnly
                    placeholder="ခွေပူး ဂဏန်း ၃ လုံးရေးပါ..."
                    className={`w-full px-4 py-3 border-2 rounded-xl bg-white text-gray-900 font-semibold focus:outline-none transition-all shadow-sm ${
                      activeField === 'khwe-puu' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-400'
                    }`}
                    style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sone-Kat Mode Input Box - Shows when sone-kat mode is active */}
            <AnimatePresence>
              {soneKatMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex-shrink-0 mb-4"
                >
                  <label className="block text-sm font-bold text-gray-700 mb-2" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    စုံကပ် Mode
                  </label>
                  <input
                    type="text"
                    value={soneKatDigit}
                    onClick={() => setActiveField('sone-kat')}
                    onFocus={() => setActiveField('sone-kat')}
                    readOnly
                    placeholder="စုံကပ်ဂဏန်း ၁ လုံးရေးပါ..."
                    className={`w-full px-4 py-3 border-2 rounded-xl bg-white text-gray-900 font-semibold focus:outline-none transition-all shadow-sm ${
                      activeField === 'sone-kat' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-teal-400'
                    }`}
                    style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sone-Kat-R Mode Input Box - Shows when sone-kat-r mode is active */}
            <AnimatePresence>
              {soneKatRMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex-shrink-0 mb-4"
                >
                  <label className="block text-sm font-bold text-gray-700 mb-2" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    စုံကပ်R Mode
                  </label>
                  <input
                    type="text"
                    value={soneKatRDigit}
                    onClick={() => setActiveField('sone-kat-r')}
                    onFocus={() => setActiveField('sone-kat-r')}
                    readOnly
                    placeholder="စုံကပ်R ဂဏန်း ၁ လုံးရေးပါ..."
                    className={`w-full px-4 py-3 border-2 rounded-xl bg-white text-gray-900 font-semibold focus:outline-none transition-all shadow-sm ${
                      activeField === 'sone-kat-r' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-cyan-400'
                    }`}
                    style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ma-Kat Mode Input Box - Shows when ma-kat mode is active */}
            <AnimatePresence>
              {maKatMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex-shrink-0 mb-4"
                >
                  <label className="block text-sm font-bold text-gray-700 mb-2" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    မကပ် Mode
                  </label>
                  <input
                    type="text"
                    value={maKatDigit}
                    onClick={() => setActiveField('ma-kat')}
                    onFocus={() => setActiveField('ma-kat')}
                    readOnly
                    placeholder="မကပ်ဂဏန်း ၁ လုံးရေးပါ..."
                    className={`w-full px-4 py-3 border-2 rounded-xl bg-white text-gray-900 font-semibold focus:outline-none transition-all shadow-sm ${
                      activeField === 'ma-kat' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-green-400'
                    }`}
                    style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ma-Kat-R Mode Input Box - Shows when ma-kat-r mode is active */}
            <AnimatePresence>
              {maKatRMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex-shrink-0 mb-4"
                >
                  <label className="block text-sm font-bold text-gray-700 mb-2" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    မကပ်R Mode
                  </label>
                  <input
                    type="text"
                    value={maKatRDigit}
                    onClick={() => setActiveField('ma-kat-r')}
                    onFocus={() => setActiveField('ma-kat-r')}
                    readOnly
                    placeholder="မကပ်R ဂဏန်း ၁ လုံးရေးပါ..."
                    className={`w-full px-4 py-3 border-2 rounded-xl bg-white text-gray-900 font-semibold focus:outline-none transition-all shadow-sm ${
                      activeField === 'ma-kat-r' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-emerald-400'
                    }`}
                    style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Series Mode Input Box - Shows when series mode is active (3D only) */}
            <AnimatePresence>
              {seriesMode && gameMode === '3D' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex-shrink-0 mb-4"
                >
                  <label className="block text-sm font-bold text-gray-700 mb-2" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    စီးရီး Mode (Wildcard)
                  </label>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-300">
                    <div className="text-sm font-medium text-gray-700 mb-3" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                      အသုံးပြုပုံ: ? ကို wildcard အဖြစ် သုံးပါ
                    </div>
                    <ul className="text-xs text-gray-600 space-y-1 mb-3" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                      <li>• ?45 → 045, 145, 245, ..., 945 (10 bets)</li>
                      <li>• 1?3 → 103, 113, 123, ..., 193 (10 bets)</li>
                      <li>• 12? → 120, 121, 122, ..., 129 (10 bets)</li>
                    </ul>
                    {betNumber.includes('?') && betNumber.length === 3 && (
                      <div className="mt-3 p-3 bg-white rounded-xl border border-blue-200">
                        <div className="text-xs font-bold text-gray-700 mb-2" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                          ပါဝင���သော အကွက်များ ({generateSeriesNumbers(betNumber).length} bets):
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {generateSeriesNumbers(betNumber).map((num) => (
                            <div key={num} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg px-2 py-1.5 text-center">
                              <span className="text-sm font-bold text-gray-900">{num}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Number Display (When No Bets) - Interactive */}
            {liveBetList.length === 0 && (
              <div className="flex-shrink-0 mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Live Entry Preview</label>
                <div className="w-full bg-white border-2 border-blue-400 rounded-xl shadow-md overflow-hidden">
                  {/* Bet Amount Input Row */}
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                    <label className="block text-xs font-bold text-gray-600 mb-2">Bet Amount (MMK)</label>
                    <input
                      type="text"
                      value={betAmount}
                      onClick={() => setActiveField('amount')}
                      onFocus={() => setActiveField('amount')}
                      readOnly
                      placeholder="Click to enter amount..."
                      className={`w-full px-4 py-3 border-2 rounded-xl bg-white text-gray-900 font-bold text-xl focus:outline-none cursor-pointer transition-all shadow-sm ${
                        activeField === 'amount' ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-300'
                      }`}
                    />
                    {betAmount && (
                      <div className="mt-2 text-right">
                        <span className="text-sm font-bold text-green-600">
                          {formatNumber(parseInt(betAmount))} ks
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Number Display Row - High Contrast */}
                  <div
                    onClick={() => setActiveField('number')}
                    className={`px-6 py-5 bg-gradient-to-br from-blue-50 to-indigo-50 text-center cursor-pointer transition-all ${
                      activeField === 'number' ? 'ring-2 ring-blue-300' : ''
                    }`}
                  >
                    <div className="text-xs font-semibold text-gray-600 mb-2">
                      Numbers ({gameMode}):
                    </div>
                    <div className={`text-3xl sm:text-4xl lg:text-6xl font-black transition-all duration-200 ${
                      betNumber ? 'text-gray-900 scale-105' : 'text-gray-300'
                    }`} style={{ letterSpacing: '0.2em', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      {betNumber ? (
                        <span className="inline-block animate-pulse-subtle">
                          {betNumber.split('').join(' ')}
                        </span>
                      ) : (
                        <span>
                          {gameMode === '2D' ? '- -' : '- - -'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ready Indicator */}
                  {betNumber && betAmount && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-yellow-100 to-amber-100 border-t border-yellow-300"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        <span className="text-xs sm:text-sm font-bold text-gray-700">
                          Ready to add! Click the checkmark (✓)
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* Live Bet Box (When There Are Bets) */}
            <AnimatePresence>
              {liveBetList.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex-shrink-0 mb-4"
                >
                  <label className="block text-sm font-bold text-gray-700 mb-2">Live Bet Slip</label>
                  <div className="w-full bg-white border-2 border-blue-400 rounded-xl shadow-lg overflow-hidden">
                    {/* Header with Player Name and Close Button */}
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-white">
                            {playerName || 'No Player'}
                          </span>
                          <span className="text-xs text-blue-100 font-medium">
                            {gameMode} Mode
                          </span>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleDiscardSession}
                        className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-white" />
                      </motion.button>
                    </div>

                    {/* Scrollable Bet List */}
                    <div className="px-4 py-3 max-h-48 overflow-y-auto bg-gray-50 hide-scrollbar">
                      <div className="space-y-2">
                        {groupBetsByPattern().map((group, groupIndex) => {
                          const isExpanded = expandedGroups[group.key] || false;
                          
                          // Create compact display label based on pattern type
                          let displayLabel = '';
                          if (group.pattern) {
                            // List of instant patterns that should not show input
                            const instantPatterns = ['အပူး', 'စုံပူး', 'မပူး', 'ပါဝါ', 'နက္ခ', 'ညီကို', 'ကိုညီ', 'ညီကိုR', 'စုံမ', 'မစုံ', 'စုံမR', 'စုံစုံ', 'မမ'];
                            
                            if (group.pattern.input && !instantPatterns.includes(group.pattern.label)) {
                              // Patterns with input that should show it (e.g., "1 ထိပ်", "5 နောက်")
                              displayLabel = `${group.pattern.input} ${group.pattern.label}`;
                            } else {
                              // Patterns without input or instant patterns (e.g., "မပူး", "စုံပူး")
                              displayLabel = group.pattern.label;
                            }
                          } else {
                            // Manual bet
                            displayLabel = group.bets[0].number;
                          }
                          
                          // For manual bets (no pattern), show individual entries
                          if (!group.pattern) {
                            return (
                              <div key={group.key} className="flex items-center justify-between py-2.5 px-3 bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-blue-600">
                                      {groupIndex + 1}
                                    </span>
                                  </div>
                                  <span className="text-base font-semibold text-gray-800">
                                    <span className="text-2xl font-black text-gray-900" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>{group.bets[0].number}</span>
                                    <span className="mx-2 text-gray-400">=</span>
                                    <span className="text-lg font-bold text-gray-700">{formatNumber(group.bets[0].amount)} ks</span>
                                  </span>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => removeGroup(group.key)}
                                  className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </motion.button>
                              </div>
                            );
                          }
                          
                          // For pattern bets, show grouped with expand/collapse
                          return (
                            <div key={group.key} className="bg-white rounded-lg shadow-sm border border-gray-200">
                              {/* Group Header - Collapsed View */}
                              <div className="flex items-center justify-between py-2.5 px-3">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-blue-600">
                                      {groupIndex + 1}
                                    </span>
                                  </div>
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                                      {displayLabel}:
                                    </span>
                                    <span className="text-base font-bold text-gray-700">
                                      {formatNumber(group.totalAmount)}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {/* Expand/Collapse Button */}
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => toggleGroupExpansion(group.key)}
                                    className="p-1.5 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="w-4 h-4 text-orange-500" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-orange-500" />
                                    )}
                                  </motion.button>
                                  
                                  {/* Delete Group Button */}
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeGroup(group.key);
                                    }}
                                    className="p-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </motion.button>
                                </div>
                              </div>
                              
                              {/* Expanded Individual Numbers */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="border-t border-gray-200 px-3 pb-2 overflow-hidden"
                                  >
                                    <div className="space-y-1 pt-2">
                                      {group.bets.map((bet, betIndex) => (
                                        <div
                                          key={betIndex}
                                          className="flex items-center justify-between py-1.5 text-sm"
                                        >
                                          <span className="text-gray-700">
                                            <span className="font-bold">{bet.number}</span>
                                            <span className="mx-1 text-gray-400">=</span>
                                            <span className="font-semibold">{formatNumber(bet.amount)} ks</span>
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Current Input Preview (if entering new bet) - Shows real-time typing */}
                    {(betNumber || betAmount) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="px-4 py-2.5 bg-gradient-to-r from-yellow-100 to-amber-100 border-t border-yellow-300"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-yellow-800">Next Entry:</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span 
                              onClick={() => setActiveField('number')}
                              className="text-xl font-black text-gray-900 cursor-pointer hover:text-blue-600 transition-colors" 
                              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                            >
                              {betNumber || '__'}
                            </span>
                            <span className="mx-2 text-gray-500">=</span>
                            <span 
                              onClick={() => setActiveField('amount')}
                              className="text-base font-bold text-gray-700 cursor-pointer hover:text-green-600 transition-colors px-2 py-1 rounded hover:bg-white"
                            >
                              {betAmount ? `${formatNumber(parseInt(betAmount))} ks` : '__ ks'}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Footer with Total */}
                    <div className="px-4 py-3 border-t-2 border-dashed border-gray-300 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-500">Total Bets</span>
                          <span className="text-sm font-bold text-gray-700">
                            {liveBetList.length} {liveBetList.length === 1 ? 'bet' : 'bets'}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-medium text-gray-500">Total Amount</span>
                          <span className="text-xl font-bold text-blue-600">
                            {formatNumber(liveBetList.reduce((sum, bet) => sum + bet.amount, 0))} ks
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Numeric Keypad - 4 Column Responsive Layout - TOP LAYER */}
            <div className="flex-shrink-0 mb-4 relative z-50" style={{ pointerEvents: 'auto' }}>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">Keypad</label>
              <div className="grid grid-cols-4 gap-2 sm:gap-2.5 lg:gap-3">
                {/* Row 1: 1, 2, 3, ADD (Yellow) */}
                {[1, 2, 3].map((num) => (
                  <motion.button
                    key={num}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleKeypad(num.toString())}
                    className="py-2 sm:py-2.5 lg:py-3 bg-white hover:bg-blue-50 border-2 border-gray-300 hover:border-blue-400 rounded-lg text-lg sm:text-xl font-bold text-gray-700 hover:text-blue-600 transition-all shadow-sm"
                  >
                    {num}
                  </motion.button>
                ))}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddToCart}
                  disabled={liveBetList.length === 0 || !playerName}
                  className="py-2 sm:py-2.5 lg:py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 rounded-lg text-xs sm:text-sm font-bold text-white transition-all shadow-md disabled:cursor-not-allowed"
                >
                  ADD
                </motion.button>

                {/* Row 2: 4, 5, 6, Del (Red) */}
                {[4, 5, 6].map((num) => (
                  <motion.button
                    key={num}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleKeypad(num.toString())}
                    className="py-2 sm:py-2.5 lg:py-3 bg-white hover:bg-blue-50 border-2 border-gray-300 hover:border-blue-400 rounded-lg text-lg sm:text-xl font-bold text-gray-700 hover:text-blue-600 transition-all shadow-sm"
                  >
                    {num}
                  </motion.button>
                ))}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  className="py-2 sm:py-2.5 lg:py-3 bg-red-500 hover:bg-red-600 rounded-lg text-xs sm:text-sm font-bold text-white transition-all shadow-md"
                >
                  Del
                </motion.button>

                {/* Row 3: 7, 8, 9, OK (Blue with Checkmark) */}
                {[7, 8, 9].map((num) => (
                  <motion.button
                    key={num}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleKeypad(num.toString())}
                    className="py-2 sm:py-2.5 lg:py-3 bg-white hover:bg-blue-50 border-2 border-gray-300 hover:border-blue-400 rounded-lg text-lg sm:text-xl font-bold text-gray-700 hover:text-blue-600 transition-all shadow-sm"
                  >
                    {num}
                  </motion.button>
                ))}
                <motion.button
                  whileHover={{ scale: isCheckmarkEnabled() ? 1.05 : 1.0 }}
                  whileTap={{ scale: isCheckmarkEnabled() ? 0.95 : 1.0 }}
                  onClick={handleOK}
                  disabled={!isCheckmarkEnabled()}
                  className={`py-2 sm:py-2.5 lg:py-3 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center relative z-50 ${
                    isCheckmarkEnabled()
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>

                {/* Row 4: CLR (Red), 0, 00, 000 */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClear}
                  className="py-2 sm:py-2.5 lg:py-3 bg-red-500 hover:bg-red-600 rounded-lg text-xs sm:text-sm font-bold text-white transition-all shadow-md"
                >
                  CLR
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleKeypad('0')}
                  className="py-2 sm:py-2.5 lg:py-3 bg-white hover:bg-blue-50 border-2 border-gray-300 hover:border-blue-400 rounded-lg text-lg sm:text-xl font-bold text-gray-700 hover:text-blue-600 transition-all shadow-sm"
                >
                  0
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleKeypad('00')}
                  className="py-2 sm:py-2.5 lg:py-3 bg-white hover:bg-blue-50 border-2 border-gray-300 hover:border-blue-400 rounded-lg text-base sm:text-lg font-bold text-gray-700 hover:text-blue-600 transition-all shadow-sm"
                >
                  00
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleKeypad(
                    seriesMode ? '?' : 
                    (groupMode && activeField === 'group' ? '.' : '000')
                  )}
                  className="py-2 bg-white hover:bg-blue-50 border-2 border-gray-300 hover:border-blue-400 rounded-lg text-lg font-bold text-gray-700 hover:text-blue-600 transition-all shadow-sm"
                >
                  {seriesMode ? '?' : (groupMode && activeField === 'group' ? '.' : '000')}
                </motion.button>
              </div>
            </div>

            {/* Quick Add Patterns - Responsive Grid */}
            <div className="flex-shrink-0">
              <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-3 sm:p-4 lg:p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-xs sm:text-sm font-bold text-gray-700">Quick Add Patterns</span>
                  <span className="text-xs text-gray-500 font-medium">
                    {patternPage + 1}/{totalPages}
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                  {/* Left Navigation Arrow */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePatternPageChange('prev')}
                    disabled={patternPage === 0}
                    className={`w-8 sm:w-10 lg:w-12 h-20 sm:h-24 lg:h-28 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl flex items-center justify-center border-2 shadow-sm flex-shrink-0 transition-all ${
                      patternPage === 0
                        ? 'border-gray-200 opacity-40 cursor-not-allowed'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <ChevronLeft className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${patternPage === 0 ? 'text-gray-400' : 'text-gray-700'}`} />
                  </motion.button>

                  {/* Responsive Grid of Pattern Buttons */}
                  <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-2.5 lg:gap-3">
                    {visiblePatterns.map((pattern) => (
                      <motion.button
                        key={pattern.type}
                        whileHover={{ scale: 1.03, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handlePattern(pattern.type)}
                        className={`py-2.5 sm:py-3 lg:py-4 px-1 sm:px-2 bg-gradient-to-r ${pattern.color} hover:brightness-110 rounded-lg sm:rounded-xl text-white font-bold shadow-md transition-all text-xs sm:text-sm lg:text-base leading-tight ${
                          pattern.type === 'group' && groupMode ? 'ring-2 sm:ring-4 ring-blue-300 ring-offset-1 sm:ring-offset-2' : ''
                        } ${
                          pattern.type === 'top' && headMode ? 'ring-2 sm:ring-4 ring-purple-300 ring-offset-1 sm:ring-offset-2' : ''
                        } ${
                          pattern.type === 'back' && tailMode ? 'ring-2 sm:ring-4 ring-green-300 ring-offset-1 sm:ring-offset-2' : ''
                        } ${
                          pattern.type === 'break' && breakMode ? 'ring-2 sm:ring-4 ring-orange-300 ring-offset-1 sm:ring-offset-2' : ''
                        } ${
                          pattern.type === 'power' && roundMode ? 'ring-2 sm:ring-4 ring-teal-300 ring-offset-1 sm:ring-offset-2' : ''
                        } ${
                          pattern.type === 'khwe' && khweMode ? 'ring-2 sm:ring-4 ring-pink-300 ring-offset-1 sm:ring-offset-2' : ''
                        } ${
                          pattern.type === 'khwe-puu' && khwePuuMode ? 'ring-2 sm:ring-4 ring-rose-300 ring-offset-1 sm:ring-offset-2' : ''
                        } ${
                          pattern.type === 'sone-puu' && activeDoublePattern === 'even' ? 'ring-2 sm:ring-4 ring-pink-300 ring-offset-1 sm:ring-offset-2 border-2 sm:border-4 border-white' : ''
                        } ${
                          pattern.type === 'ma-puu' && activeDoublePattern === 'odd' ? 'ring-2 sm:ring-4 ring-yellow-300 ring-offset-1 sm:ring-offset-2 border-2 sm:border-4 border-white' : ''
                        } ${
                          pattern.type === 'a-puu' && activeDoublePattern === 'all' ? 'ring-2 sm:ring-4 ring-indigo-300 ring-offset-1 sm:ring-offset-2 border-2 sm:border-4 border-white' : ''
                        } ${
                          pattern.type === 'pawa' && activeInstantPattern === 'pawa' ? 'ring-2 sm:ring-4 ring-orange-400 ring-offset-1 sm:ring-offset-2 border-2 sm:border-4 border-white' : ''
                        } ${
                          pattern.type === 'natkha' && activeInstantPattern === 'natkha' ? 'ring-2 sm:ring-4 ring-blue-400 ring-offset-1 sm:ring-offset-2 border-2 sm:border-4 border-white' : ''
                        } ${
                          pattern.type === 'nyi-ko' && activeInstantPattern === 'nyi-ko' ? 'ring-2 sm:ring-4 ring-violet-400 ring-offset-1 sm:ring-offset-2 border-2 sm:border-4 border-white' : ''
                        } ${
                          pattern.type === 'ko-nyi' && activeInstantPattern === 'ko-nyi' ? 'ring-2 sm:ring-4 ring-fuchsia-400 ring-offset-1 sm:ring-offset-2 border-2 sm:border-4 border-white' : ''
                        } ${
                          pattern.type === 'nyi-ko-r' && activeInstantPattern === 'nyi-ko-r' ? 'ring-2 sm:ring-4 ring-amber-400 ring-offset-1 sm:ring-offset-2 border-2 sm:border-4 border-white' : ''
                        } ${
                          pattern.type === 'sone-ma' && activeInstantPattern === 'sone-ma' ? 'ring-2 sm:ring-4 ring-yellow-400 ring-offset-1 sm:ring-offset-2 border-2 sm:border-4 border-white' : ''
                        } ${
                          pattern.type === 'ma-sone' && activeInstantPattern === 'ma-sone' ? 'ring-2 sm:ring-4 ring-orange-500 ring-offset-1 sm:ring-offset-2 border-2 sm:border-4 border-white' : ''
                        } ${
                          pattern.type === 'sone-ma-r' && activeInstantPattern === 'sone-ma-r' ? 'ring-2 sm:ring-4 ring-red-400 ring-offset-1 sm:ring-offset-2 border-2 sm:border-4 border-white' : ''
                        } ${
                          pattern.type === 'sone-sone' && activeInstantPattern === 'sone-sone' ? 'ring-2 sm:ring-4 ring-blue-500 ring-offset-1 sm:ring-offset-2 border-2 sm:border-4 border-white' : ''
                        } ${
                          pattern.type === 'ma-ma' && activeInstantPattern === 'ma-ma' ? 'ring-2 sm:ring-4 ring-purple-500 ring-offset-1 sm:ring-offset-2 border-2 sm:border-4 border-white' : ''
                        } ${
                          pattern.type === '3d-series' && seriesMode ? 'ring-2 sm:ring-4 ring-blue-400 ring-offset-1 sm:ring-offset-2 border-2 sm:border-4 border-white' : ''
                        }`}
                        style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}
                      >
                        {pattern.label}
                      </motion.button>
                    ))}
                  </div>

                  {/* Right Navigation Arrow */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePatternPageChange('next')}
                    disabled={patternPage >= totalPages - 1}
                    className={`w-8 sm:w-10 lg:w-12 h-20 sm:h-24 lg:h-28 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl flex items-center justify-center border-2 shadow-sm flex-shrink-0 transition-all ${
                      patternPage >= totalPages - 1
                        ? 'border-gray-200 opacity-40 cursor-not-allowed'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${patternPage >= totalPages - 1 ? 'text-gray-400' : 'text-gray-700'}`} />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="အတည်ပြုမည်"
        message={`${gameMode} ဂဏန်း ${liveBetList.length}ခုကို ${liveBetList.reduce((sum, bet) => sum + bet.amount, 0).toLocaleString()} ကျပ်ဖြင့် ထည့်သွင်းမည်လား?

Do you want to submit ${liveBetList.length} bets with total amount ${liveBetList.reduce((sum, bet) => sum + bet.amount, 0).toLocaleString()} MMK?`}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
        confirmText="Yes"
        cancelText="No"
        type="info"
      />

      {/* Blocked Number Warning Dialog */}
      <ConfirmDialog
        isOpen={showBlockedWarning}
        title="ပိတ်ထားသောဂဏန်း - Blocked Number"
        message={`ဂဏန်း "${blockedNumber}" ကိုပိတ်ထားပါသည်။ ဤဂဏန်းကို ထိုးကွက်မရပါ။

The number "${blockedNumber}" has been blocked. You cannot bet on this number.`}
        onConfirm={() => setShowBlockedWarning(false)}
        onCancel={() => {}}
        confirmText="OK"
        cancelText=""
        type="warning"
      />

    </div>
  );
}
