import { motion } from 'framer-motion';
import { Lock, Check, ChevronRight } from 'lucide-react';
import { PCComponent } from '@/store/gameStore';

interface Module {
  id: string;
  label: string;
  unlocked: boolean;
  icon: string;
  completedLessons: number;
  totalLessons: number;
}

interface ModulesSidebarProps {
  modules: Module[];
  selectedModule: string | null;
  onModuleSelect: (moduleId: string) => void;
}

export default function ModulesSidebar({ modules, selectedModule, onModuleSelect }: ModulesSidebarProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-64 h-full bg-card/50 backdrop-blur-lg border-r border-border p-4 flex flex-col"
    >
      <h2 className="font-display text-lg font-bold mb-4 text-primary flex items-center gap-2">
        <span className="text-xl">📚</span>
        MODULES
      </h2>
      
      <div className="space-y-2 flex-1 overflow-y-auto">
        {modules.map((module, index) => {
          const isSelected = selectedModule === module.id;
          const progress = module.totalLessons > 0 
            ? (module.completedLessons / module.totalLessons) * 100 
            : 0;
          const isComplete = module.completedLessons === module.totalLessons && module.totalLessons > 0;
          
          return (
            <motion.button
              key={module.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => module.unlocked && onModuleSelect(module.id)}
              disabled={!module.unlocked}
              className={`
                w-full p-3 rounded-lg text-left transition-all duration-200 relative overflow-hidden
                ${module.unlocked 
                  ? isSelected
                    ? 'bg-primary/20 border-2 border-primary shadow-lg shadow-primary/20'
                    : 'bg-muted/30 hover:bg-muted/50 border border-border hover:border-primary/30'
                  : 'bg-muted/10 opacity-45 cursor-not-allowed border border-border/30'
                }
              `}
            >
              {/* Progress bar background */}
              {module.unlocked && progress > 0 && (
                <div 
                  className="absolute inset-0 bg-primary/10 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              )}
              
              <div className="relative flex items-center gap-3">
                {/* Module icon */}
                <span className="text-2xl">{module.icon}</span>
                
                {/* Module info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium truncate ${
                      module.unlocked ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {module.label}
                    </span>
                    {isComplete && (
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  
                  {module.unlocked ? (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1.5 flex-1 bg-muted/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {module.completedLessons}/{module.totalLessons}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Complete previous module
                    </span>
                  )}
                </div>
                
                {/* Lock/Arrow icon */}
                <div className="flex-shrink-0">
                  {!module.unlocked ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : isSelected ? (
                    <ChevronRight className="h-4 w-4 text-primary" />
                  ) : null}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary/50" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="h-3 w-3 text-green-500" />
            <span>Complete</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
