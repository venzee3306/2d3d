import { useState, useEffect } from 'react';
import { SplitBetEntry } from '../components/SplitBetEntry';
import { DesktopSettlement } from '../components/DesktopSettlement';
import { DesktopLedger } from '../components/DesktopLedger';
import { DesktopBettingRecordsView } from './DesktopBettingRecordsView';

interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'master' | 'agent';
  parentId?: string;
}

interface CartItem {
  id: string;
  player: string;
  playerName: string;
  gameMode: '2D' | '3D';
  number: string;
  amount: number;
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

interface BetEntryViewProps {
  onSubmitBets: (items: CartItem[]) => void;
  savedRecords: SavedRecord[];
  onSaveRecord: (record: SavedRecord) => void;
  onDeleteRecord: (id: string) => void;
  currentUser: User;
}

export function BetEntryView({ onSubmitBets, savedRecords, onSaveRecord, onDeleteRecord, currentUser }: BetEntryViewProps) {
  const [showLedger, setShowLedger] = useState(false);
  const [showBettingRecords, setShowBettingRecords] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);

  useEffect(() => {
    const handleOpenLedger = () => {
      setShowLedger(true);
      setShowBettingRecords(false);
      setShowSettlement(false);
    };
    const handleOpenBettingRecords = () => {
      setShowBettingRecords(true);
      setShowLedger(false);
      setShowSettlement(false);
    };
    const handleOpenSettlement = () => {
      setShowSettlement(true);
      setShowLedger(false);
      setShowBettingRecords(false);
    };
    
    window.addEventListener('openLedger', handleOpenLedger);
    window.addEventListener('openBettingRecords', handleOpenBettingRecords);
    window.addEventListener('openSettlement', handleOpenSettlement);
    
    return () => {
      window.removeEventListener('openLedger', handleOpenLedger);
      window.removeEventListener('openBettingRecords', handleOpenBettingRecords);
      window.removeEventListener('openSettlement', handleOpenSettlement);
    };
  }, []);

  if (showSettlement) {
    // Calculate total amount from all saved records
    const totalAmount = savedRecords.reduce((sum, record) => sum + record.total, 0);
    
    return (
      <DesktopSettlement
        onBack={() => setShowSettlement(false)}
        agentName="Ko Aung Aung"
        winningNumber={undefined}
        salesTotal={totalAmount}
        commission={0}
        winningBet={0}
        payout={0}
        netProfit={totalAmount}
      />
    );
  }

  if (showLedger) {
    // Process savedRecords to extract all bets and group by number
    const betMap = new Map<string, { amount: number; details: string[] }>();
    
    savedRecords.forEach(record => {
      record.bets.forEach(bet => {
        const number = bet.number;
        const amount = bet.amount;
        
        if (betMap.has(number)) {
          const existing = betMap.get(number)!;
          existing.amount += amount;
          existing.details.push(amount.toString());
        } else {
          betMap.set(number, {
            amount: amount,
            details: [amount.toString()]
          });
        }
      });
    });
    
    // Convert map to array format for DesktopLedger
    const ledgerBets = Array.from(betMap.entries()).map(([number, data]) => ({
      number: number,
      amount: data.amount,
      details: data.details
    }));
    
    // Determine game mode from the first record (or default to 2D)
    const gameMode: '2D' | '3D' = savedRecords.length > 0 && savedRecords[0].bets.length > 0
      ? (savedRecords[0].bets[0].number.length === 3 ? '3D' : '2D')
      : '2D';
    
    return (
      <DesktopLedger
        onBack={() => setShowLedger(false)}
        agentName="Ko Aung Aung"
        gameMode={gameMode}
        bets={ledgerBets}
      />
    );
  }

  if (showBettingRecords) {
    return <DesktopBettingRecordsView records={savedRecords} onBack={() => setShowBettingRecords(false)} onDeleteRecord={onDeleteRecord} />;
  }

  return <SplitBetEntry onSubmitBets={onSubmitBets} onSaveRecord={onSaveRecord} />;
}
