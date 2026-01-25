import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check, Sparkles, GripVertical, Move } from 'lucide-react';
import { PCComponent } from '@/store/gameStore';

// Import hardware images
import ram1gb from '@/assets/hardware/ram-1gb.png';
import ram2gb from '@/assets/hardware/ram-2gb.png';
import ram4gb from '@/assets/hardware/ram-4gb.png';
import ram16gbRgb from '@/assets/hardware/ram-16gb-rgb.png';

import cpuSingle from '@/assets/hardware/cpu-single.png';
import cpuDual from '@/assets/hardware/cpu-dual.png';
import cpuQuad from '@/assets/hardware/cpu-quad.png';
import cpuRgb from '@/assets/hardware/cpu-rgb.png';

import gpuGtx1050 from '@/assets/hardware/gpu-gtx1050.png';
import gpuRtx2060 from '@/assets/hardware/gpu-rtx2060.png';
import gpuRtx3070 from '@/assets/hardware/gpu-rtx3070.png';
import gpuRtx4090Rgb from '@/assets/hardware/gpu-rtx4090-rgb.png';

import mbBudget from '@/assets/hardware/mb-budget.png';
import mbGaming from '@/assets/hardware/mb-gaming.png';
import mbAtx from '@/assets/hardware/mb-atx.png';
import mbEatxRgb from '@/assets/hardware/mb-eatx-rgb.png';

import storageHdd from '@/assets/hardware/storage-hdd.png';
import storageSsd from '@/assets/hardware/storage-ssd.png';
import storageNvme from '@/assets/hardware/storage-nvme.png';
import storageNvmeRgb from '@/assets/hardware/storage-nvme-rgb.png';

import psuBasic from '@/assets/hardware/psu-basic.png';
import psuBronze from '@/assets/hardware/psu-bronze.png';
import psuGold from '@/assets/hardware/psu-gold.png';
import psuRgb from '@/assets/hardware/psu-rgb.png';

import coolingStock from '@/assets/hardware/cooling-stock.png';
import coolingTower from '@/assets/hardware/cooling-tower.png';
import coolingAio from '@/assets/hardware/cooling-aio.png';
import coolingCustomRgb from '@/assets/hardware/cooling-custom-rgb.png';

import caseBasic from '@/assets/hardware/case-basic.png';
import caseMid from '@/assets/hardware/case-mid.png';
import caseFull from '@/assets/hardware/case-full.png';
import caseRgb from '@/assets/hardware/case-rgb.png';

interface ComponentsPanelProps {
  components: PCComponent[];
  selectedComponent: PCComponent | null;
  onComponentSelect: (component: PCComponent) => void;
  getUpgradeLevel: (id: string) => number;
  onDragStart?: (component: PCComponent, event: React.MouseEvent | React.TouchEvent) => void;
  isDragging?: boolean;
  draggedComponentId?: string | null;
  isComponentUnlocked: (id: string) => boolean;
}

// Hardware image mapping by type and tier
const hardwareImages: Record<string, string[]> = {
  ram: [ram1gb, ram2gb, ram4gb, ram16gbRgb],
  cpu: [cpuSingle, cpuDual, cpuQuad, cpuRgb],
  gpu: [gpuGtx1050, gpuRtx2060, gpuRtx3070, gpuRtx4090Rgb],
  motherboard: [mbBudget, mbGaming, mbAtx, mbEatxRgb],
  storage: [storageHdd, storageSsd, storageNvme, storageNvmeRgb],
  psu: [psuBasic, psuBronze, psuGold, psuRgb],
  cooling: [coolingStock, coolingTower, coolingAio, coolingCustomRgb],
  case: [caseBasic, caseMid, caseFull, caseRgb],
};

// Component size ratios to represent actual hardware shapes
const componentSizes: Record<string, { width: string; height: string; aspectRatio: string }> = {
  ram: { width: '100%', height: 'auto', aspectRatio: '2/1' },
  cpu: { width: '80px', height: '80px', aspectRatio: '1/1' },
  gpu: { width: '100%', height: 'auto', aspectRatio: '2/1' },
  motherboard: { width: '100%', height: 'auto', aspectRatio: '1/1.1' },
  storage: { width: '90%', height: 'auto', aspectRatio: '2/1' },
  psu: { width: '80px', height: '80px', aspectRatio: '1/1' },
  cooling: { width: '80px', height: '80px', aspectRatio: '1/1' },
  case: { width: '70px', height: 'auto', aspectRatio: '4/5' },
};

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

interface MilestoneImageProps {
  type: string;
  milestone: number; // 0-3 for each tier
  isUnlocked: boolean;
  isActive: boolean;
}

function MilestoneImage({ type, milestone, isUnlocked, isActive }: MilestoneImageProps) {
  const images = hardwareImages[type] || [];
  const image = images[milestone] || images[0];
  const sizes = componentSizes[type] || { width: '80px', height: '80px', aspectRatio: '1/1' };

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg transition-all duration-300
        ${isActive ? 'ring-2 ring-primary shadow-lg shadow-primary/30' : ''}
      `}
      style={{
        width: sizes.width,
        aspectRatio: sizes.aspectRatio,
        maxWidth: '120px',
      }}
    >
      <img
        src={image}
        alt={tierNames[type]?.[milestone] || 'Component'}
        className={`
          w-full h-full object-cover transition-all duration-300
          ${!isUnlocked
            ? 'grayscale opacity-40 blur-[1px]'
            : 'grayscale-0 opacity-100'
          }
        `}
      />
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Lock className="h-5 w-5 text-muted-foreground/70" />
        </div>
      )}
      {isUnlocked && isActive && (
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
      )}
    </div>
  );
}

function ComponentBox({
  component,
  isSelected,
  onSelect,
  upgradeLevel,
  onDragStart,
  isDragging,
  isBeingDragged,
}: {
  component: PCComponent;
  isSelected: boolean;
  onSelect: () => void;
  upgradeLevel: number;
  onDragStart?: (e: React.MouseEvent | React.TouchEvent) => void;
  isDragging?: boolean;
  isBeingDragged?: boolean;
}) {
  const completedLessons = component.lessons.filter(l => l.completed).length;
  const totalLessons = component.lessons.length;
  const progress = (completedLessons / totalLessons) * 100;
  const isComplete = completedLessons === totalLessons;
  const isUnlocked = upgradeLevel > 0 || completedLessons === 0;
  const canDrag = isUnlocked && upgradeLevel > 0;

  // Calculate current milestone (0-3 based on completed lessons)
  const currentMilestone = Math.min(upgradeLevel > 0 ? upgradeLevel - 1 : 0, 3);
  const currentTier = tierNames[component.type]?.[currentMilestone] || component.name;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (canDrag && onDragStart) {
      onDragStart(e);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (canDrag && onDragStart) {
      onDragStart(e);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: isBeingDragged ? 0.5 : 1,
        scale: isBeingDragged ? 0.95 : 1,
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={isUnlocked && !isDragging ? { scale: 1.02 } : {}}
      onClick={isUnlocked && !isDragging ? onSelect : undefined}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`
        relative p-4 rounded-xl border transition-all duration-200 select-none
        ${canDrag ? 'cursor-grab active:cursor-grabbing' : ''}
        ${isUnlocked
          ? isSelected
            ? 'bg-primary/15 border-primary shadow-lg shadow-primary/20'
            : 'bg-card/80 border-border hover:border-primary/50 hover:bg-card'
          : 'bg-muted/20 border-border/30 opacity-45 cursor-not-allowed'
        }
        ${isBeingDragged ? 'ring-2 ring-primary/50' : ''}
      `}
    >
      {/* Draggable indicator */}
      {canDrag && (
        <div className="absolute top-2 right-2 flex items-center gap-1 text-muted-foreground">
          <Move className="h-3 w-3" />
          <GripVertical className="h-4 w-4" />
        </div>
      )}

      {/* Drag hint for upgradable but not yet draggable */}
      {isUnlocked && upgradeLevel === 0 && (
        <div className="absolute top-2 right-2">
          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
            Complete to drag
          </span>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Component image */}
        <MilestoneImage
          type={component.type}
          milestone={currentMilestone}
          isUnlocked={isUnlocked && upgradeLevel > 0}
          isActive={isSelected}
        />

        {/* Component info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm truncate">{component.name}</h4>
            {isComplete && (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{component.topic}</p>

          <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-xs text-primary font-mono">
            <Sparkles className="h-3 w-3" />
            {currentTier}
          </div>

          {/* Milestone indicators */}
          <div className="mt-2 flex items-center gap-1.5">
            {[0, 1, 2, 3].map((milestone) => {
              const isUnlockedMilestone = upgradeLevel > milestone;
              const isCurrentMilestone = upgradeLevel === milestone + 1;
              return (
                <div
                  key={milestone}
                  className={`
                    w-6 h-6 rounded-md border-2 transition-all duration-300 overflow-hidden
                    ${isUnlockedMilestone
                      ? 'border-primary bg-primary/20'
                      : 'border-border/50 bg-muted/30'
                    }
                    ${isCurrentMilestone ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
                  `}
                >
                  {hardwareImages[component.type]?.[milestone] && (
                    <img
                      src={hardwareImages[component.type][milestone]}
                      alt={`Tier ${milestone + 1}`}
                      className={`
                        w-full h-full object-cover
                        ${!isUnlockedMilestone ? 'grayscale opacity-30' : ''}
                      `}
                    />
                  )}
                </div>
              );
            })}
            <span className="text-xs text-muted-foreground font-mono ml-1">
              Lv.{upgradeLevel}/{component.maxUpgradeLevel}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${isComplete ? 'bg-green-500' : 'bg-gradient-to-r from-primary to-secondary'}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {completedLessons}/{totalLessons}
            </span>
          </div>
        </div>
      </div>

      {!isUnlocked && (
        <div className="mt-3 text-xs text-muted-foreground bg-muted/30 rounded p-2 flex items-center gap-2">
          <Lock className="h-3 w-3" />
          Complete previous modules to unlock
        </div>
      )}
    </motion.div>
  );
}

export default function ComponentsPanel({
  components,
  selectedComponent,
  onComponentSelect,
  getUpgradeLevel,
  onDragStart,
  isDragging,
  draggedComponentId,
  isComponentUnlocked
}: ComponentsPanelProps) {
  const unlockedComponents = components.filter(c => isComponentUnlocked(c.id));

  const lockedComponents = components.filter(c => !unlockedComponents.includes(c));

  return (
    <div className="h-full flex flex-col">
      {/* Drag instruction */}
      {unlockedComponents.some(c => getUpgradeLevel(c.id) > 0) && (
        <div className="mb-3 p-2 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-2 text-xs text-primary">
          <Move className="h-4 w-4" />
          <span>Drag upgraded components to the PC cabinet</span>
        </div>
      )}

      {/* Unlocked Components */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <h3 className="font-display text-sm font-bold text-foreground">
            UNLOCKED COMPONENTS
          </h3>
          <span className="text-xs text-muted-foreground">({unlockedComponents.length})</span>
        </div>

        <div className="grid gap-3">
          <AnimatePresence mode="popLayout">
            {unlockedComponents.map((component) => (
              <ComponentBox
                key={component.id}
                component={component}
                isSelected={selectedComponent?.id === component.id}
                onSelect={() => onComponentSelect(component)}
                upgradeLevel={getUpgradeLevel(component.id)}
                onDragStart={onDragStart ? (e) => onDragStart(component, e) : undefined}
                isDragging={isDragging}
                isBeingDragged={draggedComponentId === component.id}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Locked Components */}
      {lockedComponents.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lock className="h-3 w-3 text-muted-foreground" />
            <h3 className="font-display text-sm font-bold text-muted-foreground">
              LOCKED COMPONENTS
            </h3>
            <span className="text-xs text-muted-foreground">({lockedComponents.length})</span>
          </div>

          <div className="grid gap-3">
            <AnimatePresence mode="popLayout">
              {lockedComponents.map((component) => (
                <ComponentBox
                  key={component.id}
                  component={component}
                  isSelected={false}
                  onSelect={() => { }}
                  upgradeLevel={0}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
