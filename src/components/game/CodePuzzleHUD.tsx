import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, PCComponent } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import {
  X,
  Play,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Copy,
  RotateCcw,
  Sparkles,
  Trophy
} from 'lucide-react';
import { toast } from 'sonner';
import { BackendService, CodePuzzle } from '@/services/BackendService';

interface CodePuzzleHUDProps {
  isOpen: boolean;
  onClose: () => void;
  component: PCComponent | null;
  onComplete: () => void;
}

export default function CodePuzzleHUD({ isOpen, onClose, component, onComplete }: CodePuzzleHUDProps) {
  const { currentLanguage, submitPuzzleAttempt, setTutorDialogue } = useGameStore();
  const [code, setCode] = useState('');
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);

  // Find current lesson index
  const currentLessonIndex = component?.lessons.findIndex(l => !l.completed) ?? 0;
  const currentLesson = component?.lessons[currentLessonIndex];

  const [puzzle, setPuzzle] = useState<CodePuzzle | null>(null);

  // Load puzzle from backend
  useEffect(() => {
    if (component && isOpen) {
      BackendService.getPuzzle(component.type, currentLessonIndex, currentLanguage).then(p => {
        if (p) {
          setPuzzle(p);
          setCode(p.template);
          setIsCorrect(null);
          setShowHint(false);
          setCurrentHintIndex(0);
          setAttempts(0);
        } else {
          // Failure to load (Backend down or network error)
          toast.error("Connection Failed", {
            description: "Could not load puzzle. Is the backend server running?",
          });
          onClose(); // Close the HUD so it doesn't get stuck blank
        }
      });
    }
  }, [component?.id, isOpen, currentLanguage, currentLessonIndex, onClose]);

  if (!component || !puzzle || !currentLesson) return null;

  const handleRun = async () => {
    if (!puzzle || !component) return;

    setAttempts(prev => prev + 1);

    // Call backend service via store
    const result = await submitPuzzleAttempt(component.id, code, currentHintIndex);

    setIsCorrect(result.success);

    if (result.success) {
      setTutorDialogue(`🎉 Excellent! You've completed "${currentLesson.title}"! Your ${component.name} has been upgraded!`);
      toast.success('Puzzle Solved!', {
        description: `Great job!`,
      });
      setTimeout(() => {
        onComplete();
      }, 1500);
    } else {
      setTutorDialogue("Not quite right. Check the hints or try again!");
      if (attempts >= 2 && currentHintIndex < puzzle.hints.length - 1) {
        setShowHint(true);
      }
    }
  };

  const handleHint = () => {
    setShowHint(true);
    if (currentHintIndex < puzzle.hints.length - 1) {
      setCurrentHintIndex(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setCode(puzzle.template);
    setIsCorrect(null);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied!');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/90 backdrop-blur-md z-50"
          />

          {/* HUD Panel */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed inset-4 md:inset-8 z-50 flex flex-col"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between p-4 bg-card/90 backdrop-blur border-b border-primary/30 rounded-t-2xl">
              <div className="flex items-center gap-4">
                <div
                  className="text-3xl w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${component.color}20` }}
                >
                  {component.icon}
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-foreground">
                    {currentLesson.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {component.topic} • Lesson {currentLessonIndex + 1} of {component.lessons.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {component.lessons.map((l, i) => (
                    <div
                      key={l.id}
                      className={`w-3 h-3 rounded-full ${l.completed ? 'bg-accent' : i === currentLessonIndex ? 'bg-primary animate-pulse' : 'bg-muted'
                        }`}
                    />
                  ))}
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex bg-[#0a0a14]/95 backdrop-blur">
              {/* Left: Instructions */}
              <div className="w-1/3 p-6 border-r border-border overflow-y-auto">
                <div className="space-y-6">
                  {/* Puzzle instruction */}
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h3 className="font-display font-semibold text-primary">Coding Puzzle</h3>
                    </div>
                    <p className="text-foreground">{puzzle.instruction}</p>
                  </div>

                  {/* Hint section */}
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleHint}
                      className="w-full"
                      disabled={currentHintIndex >= puzzle.hints.length - 1}
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Get Hint ({puzzle.hints.length - currentHintIndex - 1} left)
                    </Button>

                    <AnimatePresence>
                      {showHint && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-3 rounded-lg bg-warning/10 border border-warning/30"
                        >
                          <p className="text-sm text-warning">
                            💡 {puzzle.hints[currentHintIndex]}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Concept reminder */}
                  <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/30">
                    <h4 className="font-semibold text-secondary mb-2 flex items-center gap-2">
                      <span className="text-lg">{component.icon}</span>
                      {currentLanguage === 'python' ? 'Python' : 'C++'} Tip
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {currentLanguage === 'python' ? component.pythonConcept : component.cppConcept}
                    </p>
                  </div>

                  {/* Real-world analogy */}
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <h4 className="font-semibold text-foreground mb-2">🔌 Real Connection</h4>
                    <p className="text-sm text-muted-foreground">{component.description}</p>
                  </div>
                </div>
              </div>

              {/* Right: Code editor */}
              <div className="flex-1 flex flex-col">
                {/* Editor header */}
                <div className="flex items-center justify-between p-3 border-b border-border bg-[#0d0d18]">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <div className="w-3 h-3 rounded-full bg-warning" />
                      <div className="w-3 h-3 rounded-full bg-accent" />
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      puzzle.{currentLanguage === 'python' ? 'py' : 'cpp'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={handleReset}>
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                    <Button variant="ghost" size="sm" onClick={copyCode}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>

                {/* Code textarea */}
                <div className="flex-1 p-4 relative">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full bg-transparent font-mono text-base text-foreground resize-none focus:outline-none leading-relaxed"
                    spellCheck={false}
                    placeholder="Write your code here..."
                  />

                  {/* Result overlay */}
                  <AnimatePresence>
                    {isCorrect !== null && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={`absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg ${isCorrect
                          ? 'bg-accent/20 text-accent border border-accent/30'
                          : 'bg-destructive/20 text-destructive border border-destructive/30'
                          }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-semibold">Correct!</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-semibold">Try again</span>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Run button */}
                <div className="p-4 border-t border-border bg-[#0d0d18]">
                  <Button
                    onClick={handleRun}
                    className="w-full h-12 text-lg font-display"
                    style={{
                      background: `linear-gradient(135deg, ${component.color}, ${component.color}aa)`,
                    }}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Run Code
                  </Button>
                </div>
              </div>
            </div>

            {/* Success celebration */}
            <AnimatePresence>
              {isCorrect && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    className="flex flex-col items-center gap-4"
                  >
                    <Trophy className="h-24 w-24 text-warning" />
                    <span className="text-4xl font-display font-bold text-primary text-glow-cyan">
                      COMPONENT UPGRADED!
                    </span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
