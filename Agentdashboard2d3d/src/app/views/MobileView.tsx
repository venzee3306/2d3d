import { useState, useEffect } from 'react';
import { MobileDashboard } from '../components/MobileDashboard';
import { MobileMasterDashboard } from '../components/MobileMasterDashboard';
import { MobileAdminDashboard } from '../components/MobileAdminDashboard';
import { MobileAdminMasters } from '../components/MobileAdminMasters';
import { MobileAdminUnits } from '../components/MobileAdminUnits';
import { MobileMasterUnits } from '../components/MobileMasterUnits';
import { MobileMasterAgents } from '../components/MobileMasterAgents';
import { MobileBetEntry } from '../components/MobileBetEntry';
import { MobileSettlement } from '../components/MobileSettlement';
import { MobileLedger } from '../components/MobileLedger';
import { MobileBettingRecordsView } from './MobileBettingRecordsView';
import { MobilePlayers } from '../components/MobilePlayers';
import { MobileDeposits } from '../components/MobileDeposits';
import { MobileMasterDeposits } from '../components/MobileMasterDeposits';
import { MobileWithdrawals } from '../components/MobileWithdrawals';
import { MobileTransactions } from '../components/MobileTransactions';
import { PlayerBetEntryModal } from '../components/PlayerBetEntryModal';
import type { WithdrawalRequest, UnitDepositRequest } from '../types/units';

interface DashboardBet {
  id: string;
  playerName: string;
  gameType: '2D' | '3D';
  betNumber: string;
  amount: number;
  round: string;
  time: string;
  status: 'Won' | 'Lost' | 'Pending';
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

interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'master' | 'agent';
  parentId?: string;
}

interface Player {
  id: string;
  name: string;
  password: string;
  phoneNumber: string;
  totalBets: number;
  totalAmount: number;
  winAmount: number;
  lossAmount: number;
  currentBalance: number;
  status: 'active' | 'inactive';
  createdAt: string;
  lastBetDate?: string;
}

interface DepositRequest {
  id: string;
  playerId: string;
  playerName: string;
  agentId: string;
  amount: number;
  transactionId: string;
  paymentMethod?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  note?: string;
}

interface Transaction {
  id: string;
  userId: string;
  type: 'transfer_in' | 'transfer_out' | 'deposit_approve' | 'deposit_request' | 'admin_create' | 'unit_deposit_approve' | 'withdrawal_approve';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  relatedUserId?: string;
  relatedUserName?: string;
  timestamp: string;
  note?: string;
}

interface MobileViewProps {
  bets: DashboardBet[];
  onSubmitBets: (items: CartItem[]) => void;
  savedRecords: SavedRecord[];
  onSaveRecord: (record: SavedRecord) => void;
  onDeleteRecord: (id: string) => void;
  players: Player[];
  onAddPlayer: (player: Omit<Player, 'id' | 'createdAt' | 'totalBets' | 'totalAmount' | 'winAmount' | 'lossAmount' | 'lastBetDate'>) => void;
  onEditPlayer: (id: string, player: Partial<Player>) => void;
  onDeletePlayer: (id: string) => void;
  onSelectPlayer: (player: Player) => void;
  currentUser: User;
  currentBalance?: number;
  depositRequests?: DepositRequest[];
  onApproveDeposit?: (id: string) => void;
  onRejectDeposit?: (id: string) => void;
  withdrawalRequests?: WithdrawalRequest[];
  onRequestWithdrawal?: (request: Omit<WithdrawalRequest, 'id' | 'requestedAt' | 'status' | 'userId' | 'userName' | 'userRole' | 'toUserId' | 'toUserName'>) => void;
  onApproveWithdrawal?: (id: string) => void;
  onRejectWithdrawal?: (id: string, reason: string) => void;
  // Unit deposit/withdrawal requests (for agents/masters requesting units from upstream)
  unitDepositRequests?: UnitDepositRequest[];
  onRequestUnitDeposit?: (request: {
    amount: number;
    paymentMethod: string;
    transactionId: string;
    paymentScreenshot?: string;
    note?: string;
  }) => void;
  onApproveUnitDeposit?: (requestId: string) => void;
  onRejectUnitDeposit?: (requestId: string, reason: string) => void;
  onLogout?: () => void;
  onDeleteBettingSession?: (playerName: string, sessionKey: string) => void;
  allUsers?: User[];
  allPlayers?: Player[];
  blockedNumbers?: { [agentId: string]: { '2D': string[], '3D': string[] } };
  onUpdateBlockedNumbers?: (agentId: string, gameType: '2D' | '3D', numbers: string[]) => void;
  transactions?: Transaction[];
  onAddUser?: (user: Omit<User, 'id'>) => void;
  onEditUser?: (id: string, user: Partial<User>) => void;
  onDeleteUser?: (id: string) => void;
  userBalances?: { [userId: string]: number };
  onCreateUnits?: (amount: number) => void;
  onTransfer?: (toUserId: string, amount: number, type: 'deposit' | 'withdraw', note?: string) => void;
}

export function MobileView({ 
  bets, 
  onSubmitBets, 
  savedRecords, 
  onSaveRecord, 
  onDeleteRecord, 
  players, 
  onAddPlayer, 
  onEditPlayer, 
  onDeletePlayer, 
  onSelectPlayer,
  currentUser,
  currentBalance = 0,
  depositRequests = [],
  onApproveDeposit = () => {},
  onRejectDeposit = () => {},
  withdrawalRequests = [],
  onRequestWithdrawal = () => {},
  onApproveWithdrawal = () => {},
  onRejectWithdrawal = () => {},
  unitDepositRequests = [],
  onRequestUnitDeposit = () => {},
  onApproveUnitDeposit = () => {},
  onRejectUnitDeposit = () => {},
  onDeleteBettingSession = () => {},
  allUsers = [],
  allPlayers = [],
  blockedNumbers = {},
  onUpdateBlockedNumbers = () => {},
  onLogout = () => {},
  transactions = [],
  onAddUser = () => {},
  onEditUser = () => {},
  onDeleteUser = () => {},
  userBalances = {},
  onCreateUnits = () => {},
  onTransfer = () => {}
}: MobileViewProps) {
  const [activePage, setActivePage] = useState('dashboard');
  const [showLedger, setShowLedger] = useState(false);
  const [showBettingRecords, setShowBettingRecords] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  const [selectedPlayerForBetting, setSelectedPlayerForBetting] = useState<Player | null>(null);

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

  const handleBackFromRecords = () => {
    setShowLedger(false);
    setShowBettingRecords(false);
    setShowSettlement(false);
  };

  // Show Settlement View
  if (showSettlement) {
    // Calculate total amount from all saved records
    const totalAmount = savedRecords.reduce((sum, record) => sum + record.total, 0);
    
    return (
      <MobileSettlement
        onBack={handleBackFromRecords}
        agentName="Ko Aung Aung"
        winningNumber={undefined} // Shows ?? (pending)
        salesTotal={totalAmount}
        commission={0}
        winningBet={0}
        payout={0}
        netProfit={totalAmount}
      />
    );
  }

  // Show Ledger View
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
    
    // Convert map to array format for MobileLedger
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
      <MobileLedger
        onBack={handleBackFromRecords}
        agentName="Ko Aung Aung"
        gameMode={gameMode}
        bets={ledgerBets}
      />
    );
  }

  // Show Betting Records View
  if (showBettingRecords) {
    return <MobileBettingRecordsView records={savedRecords} onBack={handleBackFromRecords} onDeleteRecord={onDeleteRecord} />;
  }

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      {activePage === 'dashboard' && currentUser.role === 'admin' && (
        <MobileAdminDashboard
          onNavigate={setActivePage}
          currentUser={currentUser}
          allUsers={allUsers}
          allPlayers={allPlayers}
          unitDepositRequests={unitDepositRequests || []}
          onApproveDepositRequest={onApproveUnitDeposit || (() => {})}
          onRejectDepositRequest={onRejectUnitDeposit || (() => {})}
          adminTotalSupply={currentBalance || 0}
          onAddUser={onAddUser}
          onLogout={onLogout}
        />
      )}
      {activePage === 'masters' && currentUser.role === 'admin' && (
        <MobileAdminMasters
          onBack={() => setActivePage('dashboard')}
          currentUser={currentUser}
          allUsers={allUsers}
          allPlayers={allPlayers}
          onAddUser={onAddUser}
          onEditUser={onEditUser}
          onDeleteUser={onDeleteUser}
        />
      )}
      {activePage === 'units' && currentUser.role === 'admin' && (
        <MobileAdminUnits
          onBack={() => setActivePage('dashboard')}
          currentUser={currentUser}
          allUsers={allUsers}
          userBalances={userBalances}
          onCreateUnits={onCreateUnits}
        />
      )}
      {activePage === 'dashboard' && currentUser.role === 'master' && (
        <MobileMasterDashboard 
          onNavigate={setActivePage} 
          bets={bets} 
          currentUser={currentUser}
          allUsers={allUsers}
          allPlayers={allPlayers}
          currentBalance={currentBalance}
          userBalances={userBalances}
          pendingDepositRequests={unitDepositRequests?.filter(r => r.approverId === currentUser.id && r.status === 'pending') || []}
          myUnitDepositRequests={unitDepositRequests?.filter(r => r.requesterId === currentUser.id) || []}
          onApproveDeposit={onApproveUnitDeposit}
          onRejectDeposit={onRejectUnitDeposit}
          onRequestUnitDeposit={onRequestUnitDeposit}
          onLogout={onLogout}
        />
      )}
      {activePage === 'dashboard' && currentUser.role === 'agent' && (
        <MobileDashboard 
          onNavigate={setActivePage} 
          bets={bets} 
          currentUser={currentUser} 
          currentBalance={currentBalance}
          unitDepositRequests={unitDepositRequests?.filter(r => r.requesterId === currentUser.id) || []}
          onRequestUnitDeposit={onRequestUnitDeposit}
          onLogout={onLogout} 
        />
      )}
      {activePage === 'agents' && currentUser.role === 'master' && (
        <MobileMasterAgents
          onBack={() => setActivePage('dashboard')}
          currentUser={currentUser}
          allUsers={allUsers}
          allPlayers={allPlayers}
          blockedNumbers={blockedNumbers}
          onUpdateBlockedNumbers={onUpdateBlockedNumbers}
        />
      )}
      {activePage === 'bet-entry' && (
        <MobileBetEntry onBack={() => setActivePage('dashboard')} onSubmitBets={onSubmitBets} onSaveRecord={onSaveRecord} />
      )}
      {activePage === 'players' && (
        <MobilePlayers
          players={players}
          onBack={() => setActivePage('dashboard')}
          onAddPlayer={onAddPlayer}
          onEditPlayer={onEditPlayer}
          onDeletePlayer={onDeletePlayer}
          onSelectPlayer={(player) => {
            setSelectedPlayerForBetting(player);
          }}
          currentUser={currentUser}
          dashboardBets={bets}
          onDeleteBettingSession={onDeleteBettingSession}
        />
      )}
      {activePage === 'deposits' && currentUser.role === 'master' && (
        <MobileMasterDeposits
          onBack={() => setActivePage('dashboard')}
          currentUser={currentUser}
          allUsers={allUsers}
          unitDepositRequests={unitDepositRequests}
          onApproveDeposit={onApproveUnitDeposit}
          onRejectDeposit={onRejectUnitDeposit}
        />
      )}
      {activePage === 'deposits' && currentUser.role !== 'master' && (
        <MobileDeposits
          onBack={() => setActivePage('dashboard')}
          currentBalance={currentBalance}
          depositRequests={depositRequests}
          onApprove={onApproveDeposit}
          onReject={onRejectDeposit}
        />
      )}
      {activePage === 'withdrawals' && (
        <MobileWithdrawals
          onBack={() => setActivePage('dashboard')}
          currentBalance={currentBalance}
          withdrawalRequests={withdrawalRequests}
          onRequestWithdrawal={onRequestWithdrawal}
          onApprove={onApproveWithdrawal}
          onReject={onRejectWithdrawal}
          userRole={currentUser.role}
          currentUserId={currentUser.id}
        />
      )}

      {activePage === 'transactions' && (
        <MobileTransactions
          onBack={() => setActivePage('dashboard')}
          transactions={transactions}
          currentUserId={currentUser.id}
          userRole={currentUser.role}
        />
      )}

      {activePage === 'units' && currentUser.role === 'admin' && (
        <MobileAdminDashboard
          onNavigate={setActivePage}
          currentUser={currentUser}
          allUsers={allUsers}
          allPlayers={allPlayers}
          unitDepositRequests={unitDepositRequests || []}
          onApproveDepositRequest={onApproveUnitDeposit || (() => {})}
          onRejectDepositRequest={onRejectUnitDeposit || (() => {})}
          onLogout={onLogout}
          adminTotalSupply={currentBalance || 0}
        />
      )}

      {activePage === 'units' && currentUser.role === 'master' && (
        <MobileMasterUnits
          onBack={() => setActivePage('dashboard')}
          currentUser={currentUser}
          allUsers={allUsers}
          userBalances={userBalances}
          transactions={transactions as any}
          onTransfer={onTransfer}
        />
      )}

      {activePage === 'masters' && currentUser.role === 'admin' && (
        <MobileAdminDashboard
          onNavigate={setActivePage}
          currentUser={currentUser}
          allUsers={allUsers}
          allPlayers={allPlayers}
          unitDepositRequests={unitDepositRequests || []}
          onApproveDepositRequest={onApproveUnitDeposit || (() => {})}
          onRejectDepositRequest={onRejectUnitDeposit || (() => {})}
          onLogout={onLogout}
          adminTotalSupply={currentBalance || 0}
        />
      )}

      {/* Player Bet Entry Modal */}
      {selectedPlayerForBetting && (
        <PlayerBetEntryModal
          player={selectedPlayerForBetting}
          onClose={() => setSelectedPlayerForBetting(null)}
          onSubmitBets={onSubmitBets}
          dashboardBets={bets}
          onDeleteBettingSession={onDeleteBettingSession}
        />
      )}
    </div>
  );
}