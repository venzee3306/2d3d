import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  accentColor: 'blue' | 'gold' | 'green' | 'purple';
}

export function StatCard({ title, value, icon: Icon, change, changeType = 'neutral', accentColor }: StatCardProps) {
  const accentColors = {
    blue: { border: '#00D1FF', glow: 'rgba(0, 209, 255, 0.2)', gradient: 'from-[#00D1FF]/10 to-transparent' },
    gold: { border: '#FFD700', glow: 'rgba(255, 215, 0, 0.2)', gradient: 'from-[#FFD700]/10 to-transparent' },
    green: { border: '#00FF87', glow: 'rgba(0, 255, 135, 0.2)', gradient: 'from-[#00FF87]/10 to-transparent' },
    purple: { border: '#9D4EDD', glow: 'rgba(157, 78, 221, 0.2)', gradient: 'from-[#9D4EDD]/10 to-transparent' },
  };

  const colors = accentColors[accentColor];

  const changeColors = {
    positive: 'text-[#00FF87]',
    negative: 'text-[#FF4757]',
    neutral: 'text-gray-400',
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ y: -4, boxShadow: `0 20px 40px ${colors.glow}` }}
      transition={{ duration: 0.3 }}
      className="relative rounded-xl p-6 backdrop-blur-xl border"
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)`,
        borderColor: colors.border,
        boxShadow: `0 8px 32px ${colors.glow}`,
      }}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} rounded-xl opacity-50`} />

      {/* Content */}
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-white">{value}</h3>
          </div>
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${colors.border}20 0%, ${colors.border}10 100%)`,
              border: `1px solid ${colors.border}40`,
            }}
          >
            <Icon className="w-6 h-6" style={{ color: colors.border }} />
          </div>
        </div>

        {change && (
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${changeColors[changeType]}`}>{change}</span>
            <span className="text-xs text-gray-500">vs last week</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
