import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { AchievementBadge } from './AchievementBadge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Unlock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const AchievementsPanel = () => {
  const achievements = useGameStore((state) => state.achievements);
  const setScreen = useGameStore((state) => state.setScreen);
  const getCompletedLessonsCount = useGameStore((state) => state.getCompletedLessonsCount);
  const getTotalLessonsCount = useGameStore((state) => state.getTotalLessonsCount);
  
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalAchievements = achievements.length;
  const progressPercentage = (unlockedCount / totalAchievements) * 100;
  
  const completedLessons = getCompletedLessonsCount();
  const totalLessons = getTotalLessonsCount();

  const groupedAchievements = {
    basics: achievements.filter((a) => a.category === 'basics'),
    intermediate: achievements.filter((a) => a.category === 'intermediate'),
    advanced: achievements.filter((a) => a.category === 'advanced'),
    special: achievements.filter((a) => a.category === 'special')
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => setScreen('workshop')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Workshop
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-card/50 rounded-lg border border-primary/30">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="font-bold text-foreground">{unlockedCount}/{totalAchievements}</span>
            </div>
          </div>
        </motion.div>

        {/* Title & Progress */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-4">
            🏆 Achievements
          </h1>
          <p className="text-muted-foreground mb-6">
            Complete lessons to unlock badges and prove your programming mastery!
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {completedLessons}/{totalLessons} lessons completed
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 text-center">
            <div className="text-2xl mb-1">🌱</div>
            <div className="text-lg font-bold text-foreground">
              {groupedAchievements.basics.filter((a) => a.unlocked).length}/{groupedAchievements.basics.length}
            </div>
            <div className="text-xs text-muted-foreground">Basics</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/30 text-center">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-lg font-bold text-foreground">
              {groupedAchievements.intermediate.filter((a) => a.unlocked).length}/{groupedAchievements.intermediate.length}
            </div>
            <div className="text-xs text-muted-foreground">Intermediate</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 text-center">
            <div className="text-2xl mb-1">🔥</div>
            <div className="text-lg font-bold text-foreground">
              {groupedAchievements.advanced.filter((a) => a.unlocked).length}/{groupedAchievements.advanced.length}
            </div>
            <div className="text-xs text-muted-foreground">Advanced</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 text-center">
            <div className="text-2xl mb-1">⭐</div>
            <div className="text-lg font-bold text-foreground">
              {groupedAchievements.special.filter((a) => a.unlocked).length}/{groupedAchievements.special.length}
            </div>
            <div className="text-xs text-muted-foreground">Special</div>
          </div>
        </motion.div>

        {/* Achievement Categories */}
        <div className="space-y-8">
          {/* Basics */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-sm">
                🌱
              </span>
              Basics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {groupedAchievements.basics.map((achievement) => (
                <AchievementBadge key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </motion.section>

          {/* Intermediate */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-sm">
                ⚡
              </span>
              Intermediate
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {groupedAchievements.intermediate.map((achievement) => (
                <AchievementBadge key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </motion.section>

          {/* Advanced */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-sm">
                🔥
              </span>
              Advanced
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {groupedAchievements.advanced.map((achievement) => (
                <AchievementBadge key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </motion.section>

          {/* Special */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center text-sm">
                ⭐
              </span>
              Special
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {groupedAchievements.special.map((achievement) => (
                <AchievementBadge key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </motion.section>
        </div>

        {/* Recently Unlocked */}
        <AnimatePresence>
          {achievements.filter((a) => a.unlocked).length > 0 && (
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30"
            >
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Unlock className="w-5 h-5 text-primary" />
                Unlocked Achievements
              </h2>
              <div className="flex flex-wrap gap-4">
                {achievements
                  .filter((a) => a.unlocked)
                  .map((achievement) => (
                    <AchievementBadge 
                      key={achievement.id} 
                      achievement={achievement} 
                      size="sm"
                      showDetails={false}
                    />
                  ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
