import { motion } from 'framer-motion';
import { useGameStore, PCComponent } from '@/store/gameStore';
import { cn } from '@/lib/utils';

interface ComponentCardProps {
  component: PCComponent;
  onClick: () => void;
}

export default function ComponentCard({ component, onClick }: ComponentCardProps) {
  const { installedComponents, currentLanguage } = useGameStore();
  const isInstalled = installedComponents.includes(component.id);
  const completedLessons = component.lessons.filter(l => l.completed).length;
  const totalLessons = component.lessons.length;
  const progress = (completedLessons / totalLessons) * 100;

  const difficultyColors = {
    beginner: 'text-accent border-accent/30 bg-accent/10',
    intermediate: 'text-warning border-warning/30 bg-warning/10',
    advanced: 'text-destructive border-destructive/30 bg-destructive/10',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "component-card p-5 cursor-pointer relative group",
        isInstalled && "border-accent/50 shadow-[0_0_20px_hsl(140_100%_50%_/_0.2)]"
      )}
      style={{ 
        borderColor: isInstalled ? undefined : `${component.color}30`,
      }}
    >
      {/* Installed indicator */}
      {isInstalled && (
        <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-accent animate-pulse" />
      )}

      {/* Icon */}
      <div 
        className="text-4xl mb-3 w-14 h-14 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${component.color}20` }}
      >
        {component.icon}
      </div>

      {/* Name & Type */}
      <h3 className="font-display text-lg font-semibold text-foreground mb-1">
        {component.name}
      </h3>
      
      {/* Topic */}
      <p 
        className="text-sm font-medium mb-2"
        style={{ color: component.color }}
      >
        {component.topic}
      </p>

      {/* Description */}
      <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
        {component.description}
      </p>

      {/* Language-specific hint */}
      <p className="text-xs text-muted-foreground/80 mb-4 line-clamp-2 italic">
        {currentLanguage === 'python' ? component.pythonConcept : component.cppConcept}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Difficulty badge */}
        <span className={cn(
          "text-xs px-2 py-1 rounded-md border font-medium capitalize",
          difficultyColors[component.difficulty]
        )}>
          {component.difficulty}
        </span>

        {/* Progress */}
        <span className="text-xs text-muted-foreground">
          {completedLessons}/{totalLessons} lessons
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress-bar mt-3">
        <div 
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Hover glow effect */}
      <div 
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ 
          boxShadow: `0 0 30px ${component.color}30, inset 0 0 30px ${component.color}10` 
        }}
      />
    </motion.div>
  );
}
