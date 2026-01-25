import { motion } from 'framer-motion';
import { PCComponent } from '@/store/gameStore';
import { Sparkles } from 'lucide-react';

interface DragPreviewProps {
  component: PCComponent;
  position: { x: number; y: number };
  upgradeLevel: number;
}

export default function DragPreview({ component, position, upgradeLevel }: DragPreviewProps) {
  const tierNames: Record<string, string[]> = {
    ram: ['1GB DDR3', '2GB DDR3', '4GB DDR4', '16GB DDR5 RGB'],
    cpu: ['Single Core', 'Dual Core', 'Quad Core', 'RGB Gaming CPU'],
    gpu: ['GTX 1050', 'RTX 2060', 'RTX 3070', 'RTX 4090 RGB'],
    motherboard: ['Budget Board', 'Gaming Board', 'ATX Board', 'RGB E-ATX'],
    storage: ['256GB HDD', '512GB SSD', '1TB NVMe', '2TB RGB NVMe'],
    psu: ['450W Basic', '650W Bronze', '850W Gold', '1200W RGB Platinum'],
    cooling: ['Stock Cooler', 'Tower Cooler', 'AIO Cooler', 'Custom Loop RGB'],
    case: ['Basic Tower', 'Mid Tower', 'Full Tower', 'RGB Gaming Case'],
  };
  
  const currentTier = tierNames[component.type]?.[upgradeLevel - 1] || component.name;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      className="bg-card/95 backdrop-blur-lg p-4 rounded-xl border-2 border-primary shadow-2xl shadow-primary/30"
    >
      <div className="flex items-center gap-3">
        <div className="text-4xl p-2 bg-primary/20 rounded-lg animate-pulse">
          {component.icon}
        </div>
        <div>
          <h4 className="font-bold text-sm text-foreground">{component.name}</h4>
          <div className="flex items-center gap-1 text-xs text-primary font-mono">
            <Sparkles className="h-3 w-3" />
            {currentTier}
          </div>
        </div>
      </div>
      
      {/* Drop hint */}
      <div className="mt-2 text-center text-xs text-muted-foreground bg-muted/30 rounded p-1">
        Drop on matching slot
      </div>
      
      {/* Glowing trail effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl -z-10" />
    </motion.div>
  );
}
