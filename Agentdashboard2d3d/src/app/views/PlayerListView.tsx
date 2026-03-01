import { PlayerStatsCard } from '../components/PlayerStatsCard';
import { PlayerListTable } from '../components/PlayerListTable';

export function PlayerListView() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-6 shadow-sm sticky top-0 z-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">My Player List</h1>
          <p className="text-sm text-gray-500">Manage and monitor your player base</p>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Top Row Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PlayerStatsCard title="TOTAL PLAYERS" value="3" icon="total" />
          <PlayerStatsCard title="ACTIVE PLAYERS" value="3" icon="active" />
          <PlayerStatsCard title="INACTIVE PLAYERS" value="0" icon="inactive" />
        </div>

        {/* Player List Table */}
        <PlayerListTable />
      </div>
    </div>
  );
}
