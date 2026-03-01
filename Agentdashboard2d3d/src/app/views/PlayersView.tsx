import { DesktopPlayers } from '../components/DesktopPlayers';

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

interface PlayersViewProps {
  players: Player[];
  onAddPlayer: (player: Omit<Player, 'id' | 'createdAt' | 'totalBets' | 'totalAmount' | 'winAmount' | 'lossAmount' | 'lastBetDate'>) => void;
  onEditPlayer: (id: string, player: Partial<Player>) => void;
  onDeletePlayer: (id: string) => void;
  onSelectPlayer: (player: Player) => void;
  currentUser: User;
  subUsers: User[];
}

export function PlayersView({ players, onAddPlayer, onEditPlayer, onDeletePlayer, onSelectPlayer, currentUser, subUsers }: PlayersViewProps) {
  return (
    <DesktopPlayers
      players={players}
      onAddPlayer={onAddPlayer}
      onEditPlayer={onEditPlayer}
      onDeletePlayer={onDeletePlayer}
      onSelectPlayer={onSelectPlayer}
      currentUser={currentUser}
      subUsers={subUsers}
    />
  );
}
