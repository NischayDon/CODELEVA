import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Gem, Star, Zap } from 'lucide-react';

export default function PlayerStats() {
  const { playerLevel, xp, xpToNextLevel, codeGems, currentLanguage, setLanguage } = useGameStore();
  const progressPercent = (xp / xpToNextLevel) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-6 p-4 bg-card/80 backdrop-blur-md rounded-xl border border-primary/20"
    >
      {/* Level */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_15px_hsl(185_100%_50%_/_0.4)]">
            <span className="font-display font-bold text-lg text-primary-foreground">
              {playerLevel}
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card border border-primary flex items-center justify-center">
            <Star className="h-3 w-3 text-primary fill-primary" />
          </div>
        </div>
        <div className="hidden sm:block">
          <p className="text-xs text-muted-foreground">Level</p>
          <p className="text-sm font-semibold text-foreground">Code Master</p>
        </div>
      </div>

      {/* XP Progress */}
      <div className="flex-1 max-w-xs hidden md:block">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>XP</span>
          <span>{xp} / {xpToNextLevel}</span>
        </div>
        <div className="progress-bar">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Code Gems */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/30">
        <Gem className="h-5 w-5 text-accent" />
        <span className="font-mono font-semibold text-accent">{codeGems}</span>
      </div>

      {/* Language Toggle */}
      <div className="flex rounded-lg overflow-hidden border border-primary/30">
        <button
          onClick={() => setLanguage('python')}
          className={`lang-toggle ${currentLanguage === 'python' ? 'active' : ''}`}
        >
          <Zap className="h-4 w-4 inline mr-1" />
          PY
        </button>
        <button
          onClick={() => setLanguage('cpp')}
          className={`lang-toggle ${currentLanguage === 'cpp' ? 'active' : ''}`}
        >
          <Zap className="h-4 w-4 inline mr-1" />
          C++
        </button>
      </div>
    </motion.div>
  );
}
