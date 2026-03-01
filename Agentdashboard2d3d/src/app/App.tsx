import { useState, useEffect } from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import { AgentSidebar } from './components/AgentSidebar';
import { DashboardView } from './views/DashboardView';
import { BetEntryView } from './views/BetEntryView';
import { PlayersView } from './views/PlayersView';
import { MobileView } from './views/MobileView';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './views/AdminDashboard';
import { AdminMastersView } from './views/AdminMastersView';
import { MasterDashboard } from './views/MasterDashboard';
import { MasterAgentsView } from './views/MasterAgentsView';
import { MasterDepositsView } from './views/MasterDepositsView';
import { UnitsManagement } from './views/UnitsManagement';
import { UnitsManagementV2 } from './views/UnitsManagementV2';
import { TransactionsView } from './views/TransactionsView';
import type { Transaction } from './components/TransactionHistoryView';
import { DepositsView } from './views/DepositsView';
import { WithdrawalsView } from './views/WithdrawalsView';
import { PlayerBetEntryModal } from './components/PlayerBetEntryModal';
import type { UnitBalance, UnitTransfer, DepositRequest, WithdrawalRequest, UnitDepositRequest } from './types/units';
import { RequestManagementView } from './views/RequestManagementView';
import { Toaster } from 'sonner';
import { getAuthToken, setAuthToken, agentApi } from './api/client';

// Lottery Agent Management System - Main Application

type UserRole = 'admin' | 'master' | 'agent';

interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: UserRole;
  parentId?: string; // For master/agent hierarchy
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
  agentId?: string; // Link player to agent
}

interface DashboardBet {
  id: string;
  playerName: string;
  gameType: '2D' | '3D';
  betNumber: string;
  amount: number;
  round: string;
  time: string;
  status: 'Won' | 'Lost' | 'Pending';
  pattern?: {
    type: 'manual' | 'group' | 'head' | 'tail' | 'break' | 'round' | 'khwe' | 'khwe-puu' | 'nat-kyauk' | 'apone' | 'apout' | 'brothers' | 'power-2' | 'power-3' | 'break-2' | 'break-3' | 'opposite' | 'twin' | 'natkhat-body';
    input: string;
    label: string;
  };
  patternGroup?: string; // To group bets by pattern
}

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

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);
  const [forceMobile, setForceMobile] = useState(false);
  
  // Role Management
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedPlayerForBetting, setSelectedPlayerForBetting] = useState<Player | null>(null);
  const [users, setUsers] = useState<User[]>([
    { id: 'admin1', name: 'Ko Aung Aung', username: 'admin', password: 'admin123', role: 'admin' },
    { id: 'master1', name: 'Daw Mya Mya', username: 'master1', password: 'master123', role: 'master', parentId: 'admin1' },
    { id: 'master2', name: 'U Than Htun', username: 'master2', password: 'master123', role: 'master', parentId: 'admin1' },
    { id: 'agent1', name: 'Ma Su Su', username: 'agent1', password: 'agent123', role: 'agent', parentId: 'master1' },
    { id: 'agent2', name: 'Ko Zaw Zaw', username: 'agent2', password: 'agent123', role: 'agent', parentId: 'master1' },
    { id: 'agent3', name: 'Ma Hla Hla', username: 'agent3', password: 'agent123', role: 'agent', parentId: 'master2' },
  ]);
  
  // Blocked Numbers Management (Master sets these for agents)
  const [blockedNumbers, setBlockedNumbers] = useState<{ [agentId: string]: { '2D': string[], '3D': string[] } }>({});
  
  // Unit Transaction Management
  const [userBalances, setUserBalances] = useState<{ [userId: string]: number }>({
    'admin1': 10000000, // 10M MMK for admin
    'master1': 2500000, // 2.5M MMK
    'master2': 1800000, // 1.8M MMK
    'agent1': 500000,   // 500K MMK
    'agent2': 450000,   // 450K MMK
    'agent3': 380000,   // 380K MMK
    'p1': 55000,
    'p2': 37000,
    'p3': 75000,
    'p4': 12000,
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Players State Management
  const [players, setPlayers] = useState<Player[]>([
    {
      id: 'p1',
      name: 'Aye Aye',
      password: 'pass123',
      phoneNumber: '09123456789',
      totalBets: 15,
      totalAmount: 45000,
      winAmount: 20000,
      lossAmount: 10000,
      currentBalance: 55000,
      status: 'active',
      createdAt: '2024-02-10',
      lastBetDate: 'Feb 16, 2024',
      agentId: 'agent1'
    },
    {
      id: 'p2',
      name: 'Mg Mg',
      password: 'pass456',
      phoneNumber: '09987654321',
      totalBets: 8,
      totalAmount: 30000,
      winAmount: 15000,
      lossAmount: 8000,
      currentBalance: 37000,
      status: 'active',
      createdAt: '2024-02-12',
      lastBetDate: 'Feb 16, 2024',
      agentId: 'agent1'
    },
    {
      id: 'p3',
      name: 'Su Su',
      password: 'pass789',
      phoneNumber: '09111222333',
      totalBets: 20,
      totalAmount: 60000,
      winAmount: 30000,
      lossAmount: 15000,
      currentBalance: 75000,
      status: 'active',
      createdAt: '2024-02-08',
      lastBetDate: 'Feb 15, 2024',
      agentId: 'agent2'
    },
    {
      id: 'p4',
      name: 'Ko Ko',
      password: 'pass321',
      phoneNumber: '09444555666',
      totalBets: 5,
      totalAmount: 15000,
      winAmount: 5000,
      lossAmount: 8000,
      currentBalance: 12000,
      status: 'inactive',
      createdAt: '2024-02-14',
      lastBetDate: 'Feb 14, 2024',
      agentId: 'agent3'
    },
  ]);
  
  const [dashboardBets, setDashboardBets] = useState<DashboardBet[]>([]);

  // Shared state for betting records (မှတ်တမ်း)
  const [savedRecords, setSavedRecords] = useState<SavedRecord[]>([]);

  // Unit Balance Management
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
    type: 'transfer_in' | 'transfer_out' | 'deposit_approve' | 'deposit_request' | 'admin_create';
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    relatedUserId?: string;
    relatedUserName?: string;
    timestamp: string;
    note?: string;
  }

  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);

  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);

  const [unitDepositRequests, setUnitDepositRequests] = useState<UnitDepositRequest[]>([]);

  // Unit Management Functions - using userBalances as single source of truth
  const getUserBalance = (userId: string): number => {
    return userBalances[userId] || 0;
  };

  const handleCreateUnits = (amount: number, note: string) => {
    if (!currentUser) return;
    if (getAuthToken()) {
      agentApi.createUnits(currentUser.id, amount, note).then(() => refetchAgentData()).catch(() => {});
      return;
    }
    const currentBalance = getUserBalance(currentUser.id);
    const newBalance = currentBalance + amount;
    setUserBalances(prev => ({ ...prev, [currentUser.id]: newBalance }));
    const newTransaction: Transaction = {
      id: `tx${Date.now()}`,
      userId: currentUser.id,
      type: 'admin_create',
      amount,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      timestamp: new Date().toISOString(),
      note
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const handleTransferUnits = (fromUserId: string, toUserId: string, amount: number, note: string) => {
    const fromBalance = getUserBalance(fromUserId);
    const toBalance = getUserBalance(toUserId);
    
    if (fromBalance < amount) return;

    // Update balances
    setUserBalances(prev => ({
      ...prev,
      [fromUserId]: fromBalance - amount,
      [toUserId]: toBalance + amount
    }));

    const fromUser = users.find(u => u.id === fromUserId) || players.find(p => p.id === fromUserId);
    const toUser = users.find(u => u.id === toUserId) || players.find(p => p.id === toUserId);

    // Add transactions for both users
    const timestamp = new Date().toISOString();
    
    const fromTx: Transaction = {
      id: `tx${Date.now()}-from`,
      userId: fromUserId,
      type: 'transfer_out',
      amount,
      balanceBefore: fromBalance,
      balanceAfter: fromBalance - amount,
      relatedUserId: toUserId,
      relatedUserName: toUser?.name || 'Unknown',
      timestamp,
      note
    };

    const toTx: Transaction = {
      id: `tx${Date.now()}-to`,
      userId: toUserId,
      type: 'transfer_in',
      amount,
      balanceBefore: toBalance,
      balanceAfter: toBalance + amount,
      relatedUserId: fromUserId,
      relatedUserName: fromUser?.name || 'Unknown',
      timestamp,
      note
    };

    setTransactions([fromTx, toTx, ...transactions]);
  };

  const handleApproveDeposit = (requestId: string, amount?: number) => {
    const request = depositRequests.find(r => r.id === requestId);
    if (!request) return;
    const depositAmount = amount !== undefined ? amount : request.amount;
    if (getAuthToken()) {
      agentApi.approveDeposit(requestId).then(() => refetchAgentData()).catch(() => {});
      return;
    }
    const agentBalance = getUserBalance(request.agentId);
    if (agentBalance < depositAmount) return;
    setDepositRequests(depositRequests.map(r =>
      r.id === requestId ? { ...r, status: 'approved' as const } : r
    ));

    // Deduct from agent balance and add to player balance
    const newAgentBalance = agentBalance - depositAmount;
    
    const playerBalance = getUserBalance(request.playerId);
    const newPlayerBalance = playerBalance + depositAmount;
    
    // Update both balances in a single setState call
    setUserBalances(prev => ({
      ...prev,
      [request.agentId]: newAgentBalance,
      [request.playerId]: newPlayerBalance
    }));

    // Create transaction records
    const timestamp = new Date().toISOString();
    const agentTx: Transaction = {
      id: `tx${Date.now()}-agent`,
      userId: request.agentId,
      type: 'deposit_approve',
      amount,
      balanceBefore: agentBalance,
      balanceAfter: newAgentBalance,
      relatedUserId: request.playerId,
      relatedUserName: request.playerName,
      timestamp,
      note: `Deposit approved for ${request.playerName}`
    };

    const playerTx: Transaction = {
      id: `tx${Date.now()}-player`,
      userId: request.playerId,
      type: 'transfer_in',
      amount,
      balanceBefore: playerBalance,
      balanceAfter: newPlayerBalance,
      relatedUserId: request.agentId,
      relatedUserName: users.find(u => u.id === request.agentId)?.name || 'Agent',
      timestamp,
      note: 'Deposit approved'
    };

    setTransactions([agentTx, playerTx, ...transactions]);
  };

  const handleRejectDeposit = (requestId: string) => {
    if (getAuthToken()) {
      agentApi.rejectDeposit(requestId).then(() => refetchAgentData()).catch(() => {});
      return;
    }
    setDepositRequests(depositRequests.map(r =>
      r.id === requestId ? { ...r, status: 'rejected' as const } : r
    ));
  };

  // Withdrawal Management Functions
  const handleRequestWithdrawal = (
    requestData: Omit<WithdrawalRequest, 'id' | 'requestedAt' | 'status' | 'userId' | 'userName' | 'userRole' | 'toUserId' | 'toUserName'>
  ) => {
    if (!currentUser) return;

    // Determine who will process this request (master for agent, admin for master)
    let toUserId = '';
    let toUserName = '';
    
    if (currentUser.role === 'agent') {
      const master = users.find(u => u.id === currentUser.parentId);
      if (master) {
        toUserId = master.id;
        toUserName = master.name;
      }
    } else if (currentUser.role === 'master') {
      const admin = users.find(u => u.role === 'admin');
      if (admin) {
        toUserId = admin.id;
        toUserName = admin.name;
      }
    }

    const newRequest: WithdrawalRequest = {
      id: `with${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      toUserId,
      toUserName,
      ...requestData,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    setWithdrawalRequests([newRequest, ...withdrawalRequests]);
  };

  const handleApproveWithdrawal = (requestId: string) => {
    if (getAuthToken()) {
      agentApi.approveWithdrawal(requestId).then(() => refetchAgentData()).catch(() => {});
      return;
    }
    const request = withdrawalRequests.find(r => r.id === requestId);
    if (!request || !currentUser) return;

    // Check if processor has enough balance
    const processorBalance = getUserBalance(currentUser.id);
    if (processorBalance < request.amount) return;

    // Update withdrawal request status
    setWithdrawalRequests(withdrawalRequests.map(r =>
      r.id === requestId ? { 
        ...r, 
        status: 'approved' as const, 
        processedAt: new Date().toISOString(),
        processedBy: currentUser.id
      } : r
    ));

    // Deduct from processor (master/admin) balance and add to requester (agent/master) balance
    const newProcessorBalance = processorBalance - request.amount;
    
    const requesterBalance = getUserBalance(request.userId);
    const newRequesterBalance = requesterBalance + request.amount;
    
    // Update both balances in a single setState call
    setUserBalances(prev => ({
      ...prev,
      [currentUser.id]: newProcessorBalance,
      [request.userId]: newRequesterBalance
    }));

    // Create transaction records
    const timestamp = new Date().toISOString();
    const processorTx: Transaction = {
      id: `tx${Date.now()}-processor`,
      userId: currentUser.id,
      type: 'withdrawal_approve',
      amount: request.amount,
      balanceBefore: processorBalance,
      balanceAfter: newProcessorBalance,
      relatedUserId: request.userId,
      relatedUserName: request.userName,
      timestamp,
      note: `Withdrawal approved for ${request.userName} - ${request.paymentMethod}`
    };

    const requesterTx: Transaction = {
      id: `tx${Date.now()}-requester`,
      userId: request.userId,
      type: 'transfer_in',
      amount: request.amount,
      balanceBefore: requesterBalance,
      balanceAfter: newRequesterBalance,
      relatedUserId: currentUser.id,
      relatedUserName: currentUser.name,
      timestamp,
      note: `Withdrawal approved - ${request.paymentMethod}`
    };

    setTransactions([processorTx, requesterTx, ...transactions]);
  };

  const handleRejectWithdrawal = (requestId: string, reason: string) => {
    if (getAuthToken()) {
      agentApi.rejectWithdrawal(requestId).then(() => refetchAgentData()).catch(() => {});
      return;
    }
    setWithdrawalRequests(withdrawalRequests.map(r =>
      r.id === requestId ? { 
        ...r, 
        status: 'rejected' as const,
        processedAt: new Date().toISOString(),
        processedBy: currentUser?.id,
        rejectionReason: reason
      } : r
    ));
  };

  const getUserWithdrawalRequests = (userId: string): WithdrawalRequest[] => {
    // Get requests made by this user OR requests that need to be processed by this user
    return withdrawalRequests.filter(r => 
      r.userId === userId || r.toUserId === userId
    );
  };

  // Unit Deposit Request Handlers (Agent/Master requesting units from upstream)
  const handleRequestUnitDeposit = (
    requestData: Omit<UnitDepositRequest, 'id' | 'requestedAt' | 'status' | 'requesterId' | 'requesterName' | 'requesterRole' | 'approverId' | 'approverName'>
  ) => {
    if (!currentUser) return;

    // Determine who will approve this request
    let approverId = '';
    let approverName = '';
    
    if (currentUser.role === 'agent') {
      const master = users.find(u => u.id === currentUser.parentId);
      if (master) {
        approverId = master.id;
        approverName = master.name;
      }
    } else if (currentUser.role === 'master') {
      const admin = users.find(u => u.role === 'admin');
      if (admin) {
        approverId = admin.id;
        approverName = admin.name;
      }
    }

    const newRequest: UnitDepositRequest = {
      id: `unitdep${Date.now()}`,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterRole: currentUser.role,
      approverId,
      approverName,
      ...requestData,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    setUnitDepositRequests([newRequest, ...unitDepositRequests]);
  };

  const handleApproveUnitDeposit = (requestId: string) => {
    if (getAuthToken()) {
      agentApi.approveUnitDeposit(requestId).then(() => refetchAgentData()).catch(() => {});
      return;
    }
    const request = unitDepositRequests.find(r => r.id === requestId);
    if (!request || !currentUser) return;

    // Check if approver has enough balance
    const approverBalance = getUserBalance(currentUser.id);
    if (approverBalance < request.amount) return;

    // Update request status
    setUnitDepositRequests(unitDepositRequests.map(r =>
      r.id === requestId ? { 
        ...r, 
        status: 'approved' as const, 
        processedAt: new Date().toISOString(),
        processedBy: currentUser.id
      } : r
    ));

    // Deduct from approver (master/admin) balance and add to requester (agent/master) balance
    const newApproverBalance = approverBalance - request.amount;
    
    const requesterBalance = getUserBalance(request.requesterId);
    const newRequesterBalance = requesterBalance + request.amount;
    
    // Update both balances in a single setState call
    setUserBalances(prev => ({
      ...prev,
      [currentUser.id]: newApproverBalance,
      [request.requesterId]: newRequesterBalance
    }));

    // Create transaction records
    const timestamp = new Date().toISOString();
    const approverTx: Transaction = {
      id: `tx${Date.now()}-approver`,
      userId: currentUser.id,
      type: 'unit_deposit_approve',
      amount: request.amount,
      balanceBefore: approverBalance,
      balanceAfter: newApproverBalance,
      relatedUserId: request.requesterId,
      relatedUserName: request.requesterName,
      timestamp,
      note: `Unit deposit approved for ${request.requesterName} - ${request.paymentMethod}`
    };

    const requesterTx: Transaction = {
      id: `tx${Date.now()}-requester`,
      userId: request.requesterId,
      type: 'transfer_in',
      amount: request.amount,
      balanceBefore: requesterBalance,
      balanceAfter: newRequesterBalance,
      relatedUserId: currentUser.id,
      relatedUserName: currentUser.name,
      timestamp,
      note: `Unit deposit approved - ${request.paymentMethod}`
    };

    setTransactions([approverTx, requesterTx, ...transactions]);
  };

  const handleRejectUnitDeposit = (requestId: string, reason: string) => {
    if (getAuthToken()) {
      agentApi.rejectUnitDeposit(requestId).then(() => refetchAgentData()).catch(() => {});
      return;
    }
    setUnitDepositRequests(unitDepositRequests.map(r =>
      r.id === requestId ? { 
        ...r, 
        status: 'rejected' as const,
        processedAt: new Date().toISOString(),
        processedBy: currentUser?.id,
        rejectionReason: reason
      } : r
    ));
  };

  const getUserUnitDepositRequests = (userId: string): UnitDepositRequest[] => {
    // Get requests made by this user OR requests that need to be processed by this user
    return unitDepositRequests.filter(r => 
      r.requesterId === userId || r.approverId === userId
    );
  };

  const getUserTransactions = (userId: string): Transaction[] => {
    return transactions.filter(t => t.userId === userId);
  };

  const getAgentDepositRequests = (agentId: string): DepositRequest[] => {
    return depositRequests.filter(r => r.agentId === agentId);
  };

  // Role Management Functions
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // When logged in via API, load users, players, and balances from backend
  useEffect(() => {
    if (!currentUser || !getAuthToken()) return;
    let cancelled = false;
    (async () => {
      try {
        const [usersRes, playersRes, balanceRes] = await Promise.all([
          agentApi.getUsers(),
          agentApi.getPlayers(),
          agentApi.getMyBalance(),
        ]);
        if (cancelled) return;
        setUsers(usersRes.map(u => ({
          id: u.id,
          name: u.name,
          username: u.username,
          password: '',
          role: u.role,
          parentId: u.parent_id ?? undefined,
        })));
        setPlayers(playersRes.map(p => ({
          id: p.player_id,
          name: p.name,
          password: '',
          phoneNumber: p.phone_number ?? '',
          totalBets: p.total_bets,
          totalAmount: p.total_amount,
          winAmount: p.win_amount,
          lossAmount: p.loss_amount,
          currentBalance: p.current_balance,
          status: p.status === 'active' ? 'active' : 'inactive',
          createdAt: '',
          lastBetDate: p.last_bet_at ?? undefined,
          agentId: p.agent_id,
        })));
        const nextBalances: { [userId: string]: number } = { [balanceRes.user_id]: balanceRes.balance };
        const otherBalances = await Promise.all(
          usersRes.filter(u => u.id !== balanceRes.user_id).map(async u => {
            try {
              const b = await agentApi.getBalance(u.id);
              return [u.id, b.balance] as const;
            } catch {
              return [u.id, 0] as const;
            }
          })
        );
        otherBalances.forEach(([id, bal]) => { nextBalances[id] = bal; });
        playersRes.forEach(p => { nextBalances[p.player_id] = p.current_balance; });
        if (cancelled) return;
        setUserBalances(prev => ({ ...prev, ...nextBalances }));
        const [depRes, wdrawRes, unitRes] = await Promise.all([
          agentApi.getDepositRequests().catch(() => []),
          agentApi.getWithdrawalRequests().catch(() => []),
          agentApi.getUnitDepositRequests().catch(() => []),
        ]);
        if (cancelled) return;
        setDepositRequests((depRes as Array<{ id: string; player_id: string; player_name: string; agent_id: string; amount: number; transaction_id: string; payment_method: string | null; status: string; requested_at: string; note: string | null }>).map(r => ({
          id: r.id,
          playerId: r.player_id,
          playerName: r.player_name,
          agentId: r.agent_id,
          amount: r.amount,
          transactionId: r.transaction_id,
          paymentMethod: r.payment_method ?? undefined,
          status: r.status as 'pending' | 'approved' | 'rejected',
          requestedAt: r.requested_at,
          note: r.note ?? undefined,
        })));
        setWithdrawalRequests((wdrawRes as Array<{ id: string; user_id: string; user_name: string; to_user_id: string; amount: number; payment_method: string; account_number: string; account_name: string; status: string; requested_at: string; note: string | null }>).map(r => ({
          id: r.id,
          userId: r.user_id,
          userName: r.user_name,
          userRole: 'agent' as const,
          toUserId: r.to_user_id,
          toUserName: '',
          amount: r.amount,
          paymentMethod: r.payment_method,
          accountNumber: r.account_number,
          accountName: r.account_name,
          status: r.status as 'pending' | 'approved' | 'rejected',
          requestedAt: r.requested_at,
          note: r.note ?? undefined,
        })));
        setUnitDepositRequests((unitRes as Array<{ id: string; requester_id: string; requester_name: string; approver_id: string; amount: number; payment_method: string; transaction_id: string; status: string; requested_at: string; note: string | null }>).map(r => ({
          id: r.id,
          requesterId: r.requester_id,
          requesterName: r.requester_name,
          requesterRole: 'agent' as const,
          approverId: r.approver_id,
          approverName: '',
          amount: r.amount,
          paymentMethod: r.payment_method,
          transactionId: r.transaction_id,
          status: r.status as 'pending' | 'approved' | 'rejected',
          requestedAt: r.requested_at,
          note: r.note ?? undefined,
        })));
      } catch {
        if (!cancelled) {
          setAuthToken(null);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [currentUser?.id]);

  const refetchAgentData = async () => {
    if (!currentUser || !getAuthToken()) return;
    try {
      const [balanceRes, depRes, wdrawRes, unitRes] = await Promise.all([
        agentApi.getMyBalance(),
        agentApi.getDepositRequests().catch(() => []),
        agentApi.getWithdrawalRequests().catch(() => []),
        agentApi.getUnitDepositRequests().catch(() => []),
      ]);
      setUserBalances(prev => ({ ...prev, [balanceRes.user_id]: balanceRes.balance }));
      const usersRes = await agentApi.getUsers();
      const balanceByUser = await Promise.all(usersRes.map(async u => {
        try { const b = await agentApi.getBalance(u.id); return [u.id, b.balance] as const; } catch { return [u.id, 0] as const; }
      }));
      setUserBalances(prev => {
        const next = { ...prev };
        balanceByUser.forEach(([id, bal]) => { next[id] = bal; });
        return next;
      });
      setDepositRequests((depRes as Array<{ id: string; player_id: string; player_name: string; agent_id: string; amount: number; transaction_id: string; payment_method: string | null; status: string; requested_at: string; note: string | null }>).map(r => ({
        id: r.id, playerId: r.player_id, playerName: r.player_name, agentId: r.agent_id, amount: r.amount, transactionId: r.transaction_id, paymentMethod: r.payment_method ?? undefined, status: r.status as 'pending' | 'approved' | 'rejected', requestedAt: r.requested_at, note: r.note ?? undefined,
      })));
      setWithdrawalRequests((wdrawRes as Array<{ id: string; user_id: string; user_name: string; to_user_id: string; amount: number; payment_method: string; account_number: string; account_name: string; status: string; requested_at: string; note: string | null }>).map(r => ({
        id: r.id, userId: r.user_id, userName: r.user_name, userRole: 'agent' as const, toUserId: r.to_user_id, toUserName: '', amount: r.amount, paymentMethod: r.payment_method, accountNumber: r.account_number, accountName: r.account_name, status: r.status as 'pending' | 'approved' | 'rejected', requestedAt: r.requested_at, note: r.note ?? undefined,
      })));
      setUnitDepositRequests((unitRes as Array<{ id: string; requester_id: string; requester_name: string; approver_id: string; amount: number; payment_method: string; transaction_id: string; status: string; requested_at: string; note: string | null }>).map(r => ({
        id: r.id, requesterId: r.requester_id, requesterName: r.requester_name, requesterRole: 'agent' as const, approverId: r.approver_id, approverName: '', amount: r.amount, paymentMethod: r.payment_method, transactionId: r.transaction_id, status: r.status as 'pending' | 'approved' | 'rejected', requestedAt: r.requested_at, note: r.note ?? undefined,
      })));
    } catch (_) {}
  };

  // Transaction Management Functions
  const handleTransfer = (toUserId: string, amount: number, type: 'deposit' | 'withdraw', note?: string) => {
    if (!currentUser) return;

    if (getAuthToken() && type === 'deposit') {
      agentApi.transfer(toUserId, amount, note).then(() => refetchAgentData()).catch(() => {});
      return;
    }

    const fromUser = users.find(u => u.id === currentUser.id);
    const toUser = users.find(u => u.id === toUserId);
    if (!fromUser || !toUser) return;

    const newBalances = { ...userBalances };
    if (type === 'deposit') {
      newBalances[currentUser.id] = (newBalances[currentUser.id] || 0) - amount;
      newBalances[toUserId] = (newBalances[toUserId] || 0) + amount;
    } else {
      newBalances[toUserId] = (newBalances[toUserId] || 0) - amount;
      newBalances[currentUser.id] = (newBalances[currentUser.id] || 0) + amount;
    }
    setUserBalances(newBalances);

    const transaction = {
      id: `txn_${Date.now()}`,
      fromUserId: type === 'deposit' ? currentUser.id : toUserId,
      fromUserName: type === 'deposit' ? fromUser.name : toUser.name,
      toUserId: type === 'deposit' ? toUserId : currentUser.id,
      toUserName: type === 'deposit' ? toUser.name : fromUser.name,
      amount,
      type,
      timestamp: new Date().toISOString(),
      note,
      newBalance: type === 'deposit' ? newBalances[toUserId] : newBalances[currentUser.id]
    };

    setTransactions(prev => [transaction, ...prev]);
  };

  // User Management Functions (for Admin and Master)
  const handleAddUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `u${Date.now()}`
    };
    setUsers([...users, newUser]);
    
    // Initialize unit balance for new user
    setUserBalances(prev => ({
      ...prev,
      [newUser.id]: 0
    }));
  };

  const handleEditUser = (id: string, updatedData: Partial<User>) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, ...updatedData } : user
    ));
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
    // Also delete associated players if deleting an agent
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete?.role === 'agent') {
      setPlayers(players.filter(p => p.agentId !== id));
    }
    // Also delete blocked numbers for this agent
    if (userToDelete?.role === 'agent') {
      const newBlockedNumbers = { ...blockedNumbers };
      delete newBlockedNumbers[id];
      setBlockedNumbers(newBlockedNumbers);
    }
  };

  // Blocked Numbers Management
  const handleUpdateBlockedNumbers = (agentId: string, gameType: '2D' | '3D', numbers: string[]) => {
    setBlockedNumbers(prev => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        [gameType]: numbers
      }
    }));
  };

  // Get filtered data based on role
  const getFilteredPlayers = () => {
    if (!currentUser) return [];
    
    if (currentUser.role === 'admin') {
      return players; // Admin sees all players
    } else if (currentUser.role === 'master') {
      // Master sees players under their agents
      const masterAgents = users.filter(u => u.role === 'agent' && u.parentId === currentUser.id);
      const agentIds = masterAgents.map(a => a.id);
      return players.filter(p => p.agentId && agentIds.includes(p.agentId));
    } else {
      // Agent sees only their players
      return players.filter(p => p.agentId === currentUser.id);
    }
  };

  const getSubUsers = () => {
    if (!currentUser) return [];
    
    if (currentUser.role === 'admin') {
      return users.filter(u => u.role === 'master');
    } else if (currentUser.role === 'master') {
      return users.filter(u => u.role === 'agent' && u.parentId === currentUser.id);
    }
    return [];
  };

  // Player Management Functions
  const handleAddPlayer = (playerData: Omit<Player, 'id' | 'createdAt' | 'totalBets' | 'totalAmount' | 'winAmount' | 'lossAmount' | 'lastBetDate'>) => {
    const newPlayer: Player = {
      ...playerData,
      id: `p${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalBets: 0,
      totalAmount: 0,
      winAmount: 0,
      lossAmount: 0,
      phoneNumber: playerData.phoneNumber || '',
      currentBalance: playerData.currentBalance || 0,
      agentId: currentUser?.role === 'agent' ? currentUser.id : playerData.agentId,
    };
    setPlayers([newPlayer, ...players]);
    
    // Initialize unit balance for new player
    setUserBalances(prev => ({
      ...prev,
      [newPlayer.id]: newPlayer.currentBalance
    }));
  };

  const handleEditPlayer = (id: string, updatedData: Partial<Player>) => {
    setPlayers(players.map(player => 
      player.id === id ? { ...player, ...updatedData } : player
    ));
  };

  const handleDeletePlayer = (id: string) => {
    setPlayers(players.filter(player => player.id !== id));
  };

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmitBets = (items: CartItem[]) => {
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const newBets: DashboardBet[] = items.map((item) => ({
      id: item.id,
      playerName: item.playerName || 'Unknown',
      gameType: item.gameMode,
      betNumber: item.number,
      amount: item.amount,
      round: 'Morning',
      time: currentTime,
      status: 'Pending',
      pattern: item.pattern,
      patternGroup: item.patternGroup,
    }));

    setDashboardBets([...newBets, ...dashboardBets]);
  };

  const handleSaveRecord = (record: SavedRecord) => {
    setSavedRecords([record, ...savedRecords]);
  };

  const handleDeleteRecord = (id: string) => {
    setSavedRecords(savedRecords.filter(r => r.id !== id));
  };

  const handleDeleteBettingSession = (playerName: string, sessionKey: string) => {
    // Session key format: "round-time" e.g., "Morning-10:30 AM"
    const [round, time] = sessionKey.split('-');
    
    // Filter out all bets matching this player, round, and time
    setDashboardBets(dashboardBets.filter(bet => 
      !(bet.playerName === playerName && bet.round === round && bet.time === time)
    ));
  };

  // Determine if mobile view should be shown
  const showMobile = isMobile || forceMobile;

  // Show login page if no user is logged in
  if (!currentUser) {
    // Check if we're in demo mode
    if (window.location.hash === '#demo') {
      return (
        <>
          <RequestManagementView />
          <Toaster position="top-right" richColors closeButton />
        </>
      );
    }
    
    return (
      <LoginPage
        users={users}
        onLogin={handleLogin}
      />
    );
  }

  // Mobile View Rendering
  if (showMobile) {
    return (
      <div className="relative">
        {/* Toggle Button - Fixed */}
        <button
          onClick={() => setForceMobile(!forceMobile)}
          className="fixed top-4 right-4 z-50 p-3 bg-white rounded-full shadow-2xl border-2 border-gray-200 hover:bg-gray-50 transition-all"
          title={forceMobile ? 'Switch to Desktop' : 'Switch to Mobile'}
        >
          {forceMobile ? (
            <Monitor className="w-5 h-5 text-gray-700" />
          ) : (
            <Smartphone className="w-5 h-5 text-gray-700" />
          )}
        </button>

        <MobileView
          bets={dashboardBets}
          onSubmitBets={handleSubmitBets}
          savedRecords={savedRecords}
          onSaveRecord={handleSaveRecord}
          onDeleteRecord={handleDeleteRecord}
          players={getFilteredPlayers()}
          onAddPlayer={handleAddPlayer}
          onEditPlayer={handleEditPlayer}
          onDeletePlayer={handleDeletePlayer}
          onSelectPlayer={() => {}}
          currentUser={currentUser}
          currentBalance={getUserBalance(currentUser.id)}
          depositRequests={getAgentDepositRequests(currentUser.id)}
          onApproveDeposit={handleApproveDeposit}
          onRejectDeposit={handleRejectDeposit}
          withdrawalRequests={getUserWithdrawalRequests(currentUser.id)}
          onRequestWithdrawal={handleRequestWithdrawal}
          onApproveWithdrawal={handleApproveWithdrawal}
          onRejectWithdrawal={handleRejectWithdrawal}
          unitDepositRequests={getUserUnitDepositRequests(currentUser.id)}
          onRequestUnitDeposit={handleRequestUnitDeposit}
          onApproveUnitDeposit={handleApproveUnitDeposit}
          onRejectUnitDeposit={handleRejectUnitDeposit}
          onDeleteBettingSession={handleDeleteBettingSession}
          allUsers={users}
          allPlayers={players}
          blockedNumbers={blockedNumbers}
          onUpdateBlockedNumbers={handleUpdateBlockedNumbers}
          onLogout={handleLogout}
          transactions={transactions}
          userBalances={userBalances}
          onTransfer={handleTransfer}
          onAddUser={handleAddUser}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
        />
      </div>
    );
  }

  // Desktop View
  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative">
      {/* Toggle Button - Fixed */}
      <button
        onClick={() => setForceMobile(!forceMobile)}
        className="fixed top-4 right-4 z-50 p-3 bg-white rounded-full shadow-2xl border-2 border-gray-200 hover:bg-gray-50 transition-all"
        title="Switch to Mobile View"
      >
        <Smartphone className="w-5 h-5 text-gray-700" />
      </button>
      {/* Sidebar */}
      <AgentSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser}
        currentBalance={getUserBalance(currentUser.id)}
        onLogout={handleLogout}
        pendingRequestsCount={
          currentUser.role === 'admin' 
            ? unitDepositRequests.filter(r => r.status === 'pending' && r.requesterRole === 'master' && r.approverId === currentUser.id).length
            : 0
        }
      />

      {/* Main Content - Conditional Rendering Based on Role */}
      {currentUser.role === 'admin' && (
        <>
          {activeTab === 'dashboard' && (
            <AdminDashboard
              currentUser={currentUser}
              allUsers={users}
              allPlayers={players}
              unitDepositRequests={unitDepositRequests}
              onNavigateToWithdrawals={() => setActiveTab('withdrawals')}
              onApproveDeposit={handleApproveUnitDeposit}
              onRejectDeposit={handleRejectUnitDeposit}
              onAddUser={handleAddUser}
              userBalances={userBalances}
            />
          )}
          {activeTab === 'masters' && (
            <AdminMastersView
              currentUser={currentUser}
              allUsers={users}
              onAddUser={handleAddUser}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
            />
          )}
          {activeTab === 'units' && (
            <UnitsManagementV2
              currentUser={currentUser}
              allUsers={users}
              userBalances={userBalances}
              transactions={transactions}
              onTransfer={handleTransfer}
            />
          )}
          {activeTab === 'withdrawals' && (
            <WithdrawalsView
              currentUser={currentUser}
              currentBalance={getUserBalance(currentUser.id)}
              withdrawalRequests={getUserWithdrawalRequests(currentUser.id)}
              unitDepositRequests={getUserUnitDepositRequests(currentUser.id)}
              onApproveWithdrawal={handleApproveWithdrawal}
              onRejectWithdrawal={handleRejectWithdrawal}
              onApproveDeposit={handleApproveUnitDeposit}
              onRejectDeposit={handleRejectUnitDeposit}
            />
          )}
          {activeTab === 'transactions' && (
            <TransactionsView
              currentUser={currentUser}
              currentBalance={getUserBalance(currentUser.id)}
              transactions={getUserTransactions(currentUser.id)}
            />
          )}
        </>
      )}

      {currentUser.role === 'master' && (
        <>
          {activeTab === 'dashboard' && (
            <MasterDashboard
              currentUser={currentUser}
              allUsers={users}
              allPlayers={players}
              currentBalance={getUserBalance(currentUser.id)}
              userBalances={userBalances}
              pendingDepositRequests={unitDepositRequests.filter(r => r.approverId === currentUser.id && r.status === 'pending')}
              myUnitDepositRequests={unitDepositRequests.filter(r => r.requesterId === currentUser.id)}
              onApproveDeposit={handleApproveUnitDeposit}
              onRejectDeposit={handleRejectUnitDeposit}
              onRequestUnitDeposit={handleRequestUnitDeposit}
            />
          )}
          {activeTab === 'agents' && (
            <MasterAgentsView
              currentUser={currentUser}
              allUsers={users}
              allPlayers={players}
              onAddUser={handleAddUser}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
              blockedNumbers={blockedNumbers}
              onUpdateBlockedNumbers={handleUpdateBlockedNumbers}
              userBalances={userBalances}
            />
          )}
          {activeTab === 'deposits' && (
            <MasterDepositsView
              currentUser={currentUser}
              allUsers={users}
              depositRequests={unitDepositRequests}
              onApproveDeposit={handleApproveUnitDeposit}
              onRejectDeposit={handleRejectUnitDeposit}
            />
          )}
          {activeTab === 'units' && (
            <UnitsManagementV2
              currentUser={currentUser}
              allUsers={users}
              userBalances={userBalances}
              transactions={transactions}
              onTransfer={handleTransfer}
            />
          )}
          {activeTab === 'withdrawals' && (
            <WithdrawalsView
              currentUser={currentUser}
              currentBalance={getUserBalance(currentUser.id)}
              withdrawalRequests={getUserWithdrawalRequests(currentUser.id)}
              unitDepositRequests={getUserUnitDepositRequests(currentUser.id)}
              onRequestWithdrawal={handleRequestWithdrawal}
              onApproveWithdrawal={handleApproveWithdrawal}
              onRejectWithdrawal={handleRejectWithdrawal}
              onRequestDeposit={handleRequestUnitDeposit}
              onApproveDeposit={handleApproveUnitDeposit}
              onRejectDeposit={handleRejectUnitDeposit}
            />
          )}
          {activeTab === 'transactions' && (
            <TransactionsView
              currentUser={currentUser}
              currentBalance={getUserBalance(currentUser.id)}
              transactions={getUserTransactions(currentUser.id)}
            />
          )}
        </>
      )}

      {currentUser.role === 'agent' && (
        <>
          {activeTab === 'dashboard' && (
            <DashboardView 
              bets={dashboardBets} 
              currentUser={currentUser}
              currentBalance={getUserBalance(currentUser.id)}
              unitDepositRequests={unitDepositRequests.filter(r => r.requesterId === currentUser.id)}
              onRequestUnitDeposit={handleRequestUnitDeposit}
            />
          )}
          {activeTab === 'bet-entry' && (
            <BetEntryView
              onSubmitBets={handleSubmitBets}
              savedRecords={savedRecords}
              onSaveRecord={handleSaveRecord}
              onDeleteRecord={handleDeleteRecord}
              currentUser={currentUser}
            />
          )}
          {activeTab === 'players' && (
            <PlayersView
              players={getFilteredPlayers()}
              onAddPlayer={handleAddPlayer}
              onEditPlayer={handleEditPlayer}
              onDeletePlayer={handleDeletePlayer}
              onSelectPlayer={setSelectedPlayerForBetting}
              currentUser={currentUser}
              subUsers={getSubUsers()}
            />
          )}
          {activeTab === 'deposits' && (
            <DepositsView
              currentUser={currentUser}
              currentBalance={getUserBalance(currentUser.id)}
              depositRequests={getAgentDepositRequests(currentUser.id)}
              onApprove={handleApproveDeposit}
              onReject={handleRejectDeposit}
            />
          )}
          {activeTab === 'withdrawals' && (
            <WithdrawalsView
              currentUser={currentUser}
              currentBalance={getUserBalance(currentUser.id)}
              withdrawalRequests={getUserWithdrawalRequests(currentUser.id)}
              unitDepositRequests={getUserUnitDepositRequests(currentUser.id)}
              onRequestWithdrawal={handleRequestWithdrawal}
              onApproveWithdrawal={handleApproveWithdrawal}
              onRejectWithdrawal={handleRejectWithdrawal}
              onRequestDeposit={handleRequestUnitDeposit}
              onApproveDeposit={handleApproveUnitDeposit}
              onRejectDeposit={handleRejectUnitDeposit}
            />
          )}
          {activeTab === 'transactions' && (
            <TransactionsView
              currentUser={currentUser}
              currentBalance={getUserBalance(currentUser.id)}
              transactions={getUserTransactions(currentUser.id)}
            />
          )}
        </>
      )}

      {/* Player Bet Entry Modal */}
      {selectedPlayerForBetting && (
        <PlayerBetEntryModal
          player={selectedPlayerForBetting}
          onClose={() => setSelectedPlayerForBetting(null)}
          onSubmitBets={handleSubmitBets}
          dashboardBets={dashboardBets}
          onDeleteBettingSession={handleDeleteBettingSession}
          blockedNumbers={blockedNumbers}
          currentAgentId={currentUser.id}
        />
      )}
      
      {/* Toast Notifications */}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}