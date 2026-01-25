import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { X, MessageCircle, Lightbulb, HelpCircle } from 'lucide-react';

export default function TutorAvatar() {
  const { showTutor, tutorDialogue, toggleTutor, currentLanguage } = useGameStore();

  return (
    <AnimatePresence>
      {showTutor && (
        <motion.div
          initial={{ opacity: 0, x: 100, y: 100 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 100, y: 100 }}
          className="fixed bottom-6 right-6 z-50 flex items-end gap-4"
        >
          {/* Dialogue bubble */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-sm bg-card/95 backdrop-blur-md rounded-2xl p-4 border border-primary/30 shadow-[0_0_30px_hsl(185_100%_50%_/_0.2)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-sm font-display text-primary">LEVA</span>
                <span className="text-xs text-muted-foreground font-mono">
                  [{currentLanguage.toUpperCase()} Mode]
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => toggleTutor(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Message */}
            <p className="text-sm text-foreground leading-relaxed mb-4">
              {tutorDialogue}
            </p>

            {/* Quick actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 text-xs">
                <HelpCircle className="h-3 w-3 mr-1" />
                Ask Help
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs">
                <Lightbulb className="h-3 w-3 mr-1" />
                Get Hint
              </Button>
            </div>
          </motion.div>

          {/* Avatar */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="relative"
          >
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full bg-primary/30 blur-md animate-pulse-glow" />
            
            {/* Avatar container */}
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary p-[2px] shadow-[0_0_20px_hsl(185_100%_50%_/_0.4)]">
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
            </div>

            {/* Status indicator */}
            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-accent border-2 border-card animate-pulse" />
          </motion.div>
        </motion.div>
      )}

      {/* Minimized button when hidden */}
      {!showTutor && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => toggleTutor(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_30px_hsl(185_100%_50%_/_0.4)] hover:shadow-[0_0_40px_hsl(185_100%_50%_/_0.6)] transition-shadow"
        >
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
