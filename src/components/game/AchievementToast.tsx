import { motion, AnimatePresence } from 'framer-motion';
import { Achievement } from '@/store/gameStore';

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementToast = ({ achievement, onClose }: AchievementToastProps) => {
  if (!achievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-4 right-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="relative p-4 bg-gradient-to-r from-primary/90 to-accent/90 rounded-xl shadow-2xl border border-primary/50 backdrop-blur-sm min-w-[300px]"
        >
          {/* Sparkle effects */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-2 -left-2 text-2xl"
          >
            ✨
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute -top-2 -right-2 text-2xl"
          >
            ⭐
          </motion.div>
          
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-14 h-14 rounded-full bg-background/20 flex items-center justify-center text-3xl"
            >
              {achievement.icon}
            </motion.div>
            
            <div className="flex-1">
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xs font-medium text-background/80 uppercase tracking-wider"
              >
                🎉 Achievement Unlocked!
              </motion.p>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg font-bold text-background"
              >
                {achievement.name}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-background/80"
              >
                {achievement.description}
              </motion.p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/20 flex items-center justify-center text-background hover:bg-background/30 transition-colors"
          >
            ×
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
