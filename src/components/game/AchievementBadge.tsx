import { motion } from 'framer-motion';
import { Achievement } from '@/store/gameStore';
import { Lock } from 'lucide-react';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

const categoryColors = {
  basics: 'from-emerald-500 to-teal-600',
  intermediate: 'from-blue-500 to-indigo-600',
  advanced: 'from-purple-500 to-pink-600',
  special: 'from-amber-500 to-orange-600'
};

const categoryLabels = {
  basics: 'Basics',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  special: 'Special'
};

export const AchievementBadge = ({ 
  achievement, 
  size = 'md',
  showDetails = true 
}: AchievementBadgeProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl'
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
        achievement.unlocked 
          ? 'bg-card/50 border border-primary/30' 
          : 'bg-muted/30 border border-border/30'
      }`}
    >
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${
            achievement.unlocked
              ? `bg-gradient-to-br ${categoryColors[achievement.category]} shadow-lg`
              : 'bg-muted/50'
          }`}
        >
          {achievement.unlocked ? (
            <span className="drop-shadow-lg">{achievement.icon}</span>
          ) : (
            <Lock className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        
        {achievement.unlocked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center"
          >
            <span className="text-xs">✓</span>
          </motion.div>
        )}
      </div>

      {showDetails && (
        <div className="text-center">
          <h4 className={`font-semibold text-sm ${
            achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
          }`}>
            {achievement.name}
          </h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-[120px]">
            {achievement.description}
          </p>
          <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${
            achievement.unlocked
              ? `bg-gradient-to-r ${categoryColors[achievement.category]} text-white`
              : 'bg-muted text-muted-foreground'
          }`}>
            {categoryLabels[achievement.category]}
          </span>
        </div>
      )}
    </motion.div>
  );
};
