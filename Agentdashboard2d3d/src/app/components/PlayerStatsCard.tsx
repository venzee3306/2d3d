import { Users, UserCheck, UserX } from 'lucide-react';
import { motion } from 'motion/react';

interface PlayerStatsCardProps {
  title: string;
  value: string;
  icon: 'total' | 'active' | 'inactive';
}

export function PlayerStatsCard({ title, value, icon }: PlayerStatsCardProps) {
  const iconConfig = {
    total: { Icon: Users, bg: 'bg-blue-100', text: 'text-blue-600' },
    active: { Icon: UserCheck, bg: 'bg-green-100', text: 'text-green-600' },
    inactive: { Icon: UserX, bg: 'bg-red-100', text: 'text-red-600' },
  };

  const config = iconConfig[icon];
  const IconComponent = config.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all"
    >
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 ${config.bg} rounded-xl flex items-center justify-center`}>
          <IconComponent className={`w-7 h-7 ${config.text}`} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}
