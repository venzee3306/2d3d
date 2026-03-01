import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardStatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconColor: 'blue' | 'red' | 'green';
  trend: string;
  trendDirection: 'up' | 'down';
}

export function DashboardStatCard({ title, value, icon: Icon, iconColor, trend, trendDirection }: DashboardStatCardProps) {
  const colorMap = {
    blue: { bg: 'bg-blue-500', iconBg: 'bg-blue-100', text: 'text-blue-600' },
    red: { bg: 'bg-red-500', iconBg: 'bg-red-100', text: 'text-red-600' },
    green: { bg: 'bg-green-500', iconBg: 'bg-green-100', text: 'text-green-600' },
  };

  const colors = colorMap[iconColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold ${trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trendDirection === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {trend}
        </div>
      </div>
      <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </motion.div>
  );
}
