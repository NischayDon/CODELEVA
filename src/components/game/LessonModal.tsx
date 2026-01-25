import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, PCComponent, Lesson } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft, CheckCircle, Play, Copy, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  component: PCComponent | null;
}

export default function LessonModal({ isOpen, onClose, component }: LessonModalProps) {
  const { currentLanguage, completeLesson, addXP, addCodeGems, installComponent, setTutorDialogue } = useGameStore();
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [showCode, setShowCode] = useState(true);

  if (!component) return null;

  const lesson = component.lessons[currentLessonIndex];
  const code = currentLanguage === 'python' ? lesson.pythonCode : lesson.cppCode;

  const handleComplete = () => {
    completeLesson(component.id, lesson.id);
    addXP(50);
    addCodeGems(10);
    installComponent(component.id);
    setTutorDialogue(`Excellent work! You've mastered this lesson and earned 50 XP and 10 Code Gems! 🎉`);
    toast.success('Lesson Completed!', {
      description: '+50 XP, +10 Code Gems',
    });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const nextLesson = () => {
    if (currentLessonIndex < component.lessons.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
    }
  };

  const prevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(prev => prev - 1);
    }
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
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-card rounded-2xl border border-primary/30 shadow-[0_0_60px_hsl(185_100%_50%_/_0.2)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-4">
                <div 
                  className="text-2xl w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${component.color}20` }}
                >
                  {component.icon}
                </div>
                <div>
                  <h2 className="font-display font-semibold text-lg text-foreground">
                    {lesson.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {component.name} • Lesson {currentLessonIndex + 1} of {component.lessons.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {lesson.completed && (
                  <span className="flex items-center gap-1 text-accent text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Completed
                  </span>
                )}
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left: Explanation */}
              <div className="w-1/2 p-6 overflow-y-auto border-r border-border">
                <div className="space-y-6">
                  {/* Topic badge */}
                  <div 
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                    style={{ 
                      backgroundColor: `${component.color}20`,
                      color: component.color
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                    {component.topic}
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      What You'll Learn
                    </h3>
                    <p className="text-muted-foreground">
                      {lesson.description}
                    </p>
                  </div>

                  {/* Language-specific explanation */}
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${currentLanguage === 'python' ? 'bg-neon-cyan' : 'bg-neon-purple'}`} />
                      <span className="font-mono text-sm font-semibold">
                        {currentLanguage === 'python' ? 'Python' : 'C++'} Approach
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentLanguage === 'python' ? component.pythonConcept : component.cppConcept}
                    </p>
                  </div>

                  {/* Challenge */}
                  {lesson.challenge && (
                    <div className="p-4 rounded-xl bg-warning/10 border border-warning/30">
                      <h4 className="font-semibold text-warning mb-2 flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Challenge
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {lesson.challenge}
                      </p>
                    </div>
                  )}

                  {/* Real-world analogy */}
                  <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/30">
                    <h4 className="font-semibold text-secondary mb-2">
                      💡 Real-World Connection
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {component.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Code Editor */}
              <div className="w-1/2 flex flex-col bg-[#0d0d15]">
                {/* Code header */}
                <div className="flex items-center justify-between p-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <div className="w-3 h-3 rounded-full bg-warning" />
                      <div className="w-3 h-3 rounded-full bg-accent" />
                    </div>
                    <span className="font-mono text-xs text-muted-foreground ml-2">
                      {currentLanguage === 'python' ? 'main.py' : 'main.cpp'}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={copyCode}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>

                {/* Code content */}
                <div className="flex-1 p-4 overflow-auto">
                  <pre className="font-mono text-sm leading-relaxed">
                    <code className="text-foreground">
                      {code.split('\n').map((line, i) => (
                        <div key={i} className="flex">
                          <span className="w-8 text-muted-foreground/50 select-none text-right pr-4">
                            {i + 1}
                          </span>
                          <span className="flex-1">
                            {line.startsWith('#') || line.startsWith('//') ? (
                              <span className="text-muted-foreground">{line}</span>
                            ) : line.includes('def ') || line.includes('int ') || line.includes('void ') || line.includes('class ') ? (
                              <span>
                                <span className="text-secondary">{line.split(' ')[0]}</span>
                                <span className="text-foreground">{' ' + line.split(' ').slice(1).join(' ')}</span>
                              </span>
                            ) : line.includes('print') || line.includes('cout') ? (
                              <span className="text-accent">{line}</span>
                            ) : line.includes('=') ? (
                              <span>
                                <span className="text-primary">{line.split('=')[0]}</span>
                                <span className="text-foreground">=</span>
                                <span className="text-warning">{line.split('=').slice(1).join('=')}</span>
                              </span>
                            ) : (
                              <span className="text-foreground">{line}</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </code>
                  </pre>
                </div>

                {/* Run button */}
                <div className="p-4 border-t border-border">
                  <Button variant="success" className="w-full" onClick={handleComplete}>
                    <Play className="h-4 w-4 mr-2" />
                    Run Code & Complete Lesson
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer navigation */}
            <div className="flex items-center justify-between p-4 border-t border-border">
              <Button 
                variant="ghost" 
                onClick={prevLesson}
                disabled={currentLessonIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              {/* Progress dots */}
              <div className="flex gap-2">
                {component.lessons.map((l, i) => (
                  <button
                    key={l.id}
                    onClick={() => setCurrentLessonIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === currentLessonIndex 
                        ? 'bg-primary scale-125' 
                        : l.completed 
                          ? 'bg-accent' 
                          : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>

              <Button 
                variant="ghost" 
                onClick={nextLesson}
                disabled={currentLessonIndex === component.lessons.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
