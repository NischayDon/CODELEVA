import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, PCComponent } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import PlayerStats from './PlayerStats';
import TutorAvatar from './TutorAvatar';
import CodePuzzleHUD from './CodePuzzleHUD';
import GamingCabinet3D from './GamingCabinet3D';
import DraggableComponent3D from './DraggableComponent3D';
import ModulesSidebar from './ModulesSidebar';
import ComponentsPanel from './ComponentsPanel';
import DragPreview from './DragPreview';
import DropZoneOverlay, { DropZoneOverlayRef } from './DropZoneOverlay';
import InstallationEffect from './InstallationEffect';
import SnapAnimation from './SnapAnimation';
import { useDragDrop } from '@/hooks/useDragDrop';

// Animation state for installation effects
interface InstallAnimation {
  componentId: string;
  component: PCComponent;
  startPos: [number, number, number];
  endPos: [number, number, number];
  isActive: boolean;
}

// Motherboard anchor position - all mobo-mounted components are relative to this
const MOTHERBOARD_POSITION: [number, number, number] = [0, 0.3, -1.5];

// Component positions relative to their parent containers
// Motherboard-mounted components use LOCAL coordinates (relative to motherboard center)
const SLOT_POSITIONS: Record<string, {
  position: [number, number, number];
  size: [number, number, number];
  label: string;
  parent?: 'motherboard' | 'case';
  localOffset?: [number, number, number]; // Offset from parent when installed
}> = {
  // Motherboard - mounted vertically on the back panel (motherboard tray)
  motherboard: {
    position: MOTHERBOARD_POSITION,
    size: [3.2, 4, 0.15],
    label: 'Motherboard'
  },
  // CPU - top-center of motherboard socket (LOCAL to motherboard)
  cpu: {
    position: [MOTHERBOARD_POSITION[0] - 0.4, MOTHERBOARD_POSITION[1] + 1.2, MOTHERBOARD_POSITION[2] + 0.15],
    size: [0.8, 0.8, 0.2],
    label: 'CPU Socket',
    parent: 'motherboard',
    localOffset: [-0.4, 1.2, 0.15]
  },
  // CPU Cooler - mounts directly onto CPU (LOCAL to motherboard, stacked on CPU)
  cooling: {
    position: [MOTHERBOARD_POSITION[0] - 0.4, MOTHERBOARD_POSITION[1] + 1.2, MOTHERBOARD_POSITION[2] + 0.6],
    size: [1.2, 1.2, 0.8],
    label: 'CPU Cooler',
    parent: 'motherboard',
    localOffset: [-0.4, 1.2, 0.6]
  },
  // RAM - DIMM slots to the right of CPU socket (LOCAL to motherboard)
  ram: {
    position: [MOTHERBOARD_POSITION[0] + 0.9, MOTHERBOARD_POSITION[1] + 1.0, MOTHERBOARD_POSITION[2] + 0.15],
    size: [0.5, 1.4, 0.15],
    label: 'RAM Slots',
    parent: 'motherboard',
    localOffset: [0.9, 1.0, 0.15]
  },
  // GPU - PCIe x16 slot below CPU (LOCAL to motherboard, extends outward)
  gpu: {
    position: [MOTHERBOARD_POSITION[0], MOTHERBOARD_POSITION[1] - 0.6, MOTHERBOARD_POSITION[2] + 0.8],
    size: [2.4, 0.5, 1.2],
    label: 'PCIe Slot',
    parent: 'motherboard',
    localOffset: [0, -0.6, 0.8]
  },
  // Storage - drive bay in case (bottom-left front area)
  storage: {
    position: [-1.6, -1.8, 0.2],
    size: [0.5, 0.8, 0.8],
    label: 'Storage Bay',
    parent: 'case'
  },
  // PSU - bottom of case in shroud (bottom-right)
  psu: {
    position: [0.6, -2.3, -0.6],
    size: [1.4, 0.8, 1.2],
    label: 'PSU Bay',
    parent: 'case'
  },
  // Case fans - left side front intake
  case: {
    position: [-2.1, 0.5, 0.3],
    size: [0.3, 2, 1.2],
    label: 'Case Fans',
    parent: 'case'
  },
};

// Scene with cabinet and components - uses hierarchical parent-child structure
function PCBuildScene({
  onSlotClick,
  hoveredSlot,
  setHoveredSlot,
  installedComponents,
  components,
  getComponentUpgradeLevel,
  highlightSlot,
  installAnimation,
  onInstallEffectComplete,
}: {
  onSlotClick: (type: string) => void;
  hoveredSlot: string | null;
  setHoveredSlot: (id: string | null) => void;
  installedComponents: string[];
  components: PCComponent[];
  getComponentUpgradeLevel: (id: string) => number;
  highlightSlot?: string | null;
  installAnimation: InstallAnimation | null;
  onInstallEffectComplete: () => void;
}) {
  const slots = Object.entries(SLOT_POSITIONS).map(([type, config]) => ({
    id: type,
    type,
    position: config.position,
    size: config.size,
    label: config.label,
    isOccupied: installedComponents.includes(type)
  }));

  // Separate components by hierarchy
  const motherboardInstalled = installedComponents.includes('motherboard');
  const moboMountedTypes = ['cpu', 'cooling', 'ram', 'gpu'];
  const caseMountedTypes = ['storage', 'psu', 'case'];

  return (
    <>
      {/* Enhanced lighting for interior visibility */}
      <ambientLight intensity={0.6} color="#ffffff" />
      <pointLight position={[0, 1.2, 0]} intensity={2.2} distance={5} decay={2} color="#ffffff" />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#00d4ff" />
      <pointLight position={[-5, 5, -5]} intensity={0.8} color="#a855f7" />
      <spotLight position={[0, 10, 5]} intensity={2} angle={0.5} penumbra={1} castShadow />
      {/* Fill light from viewing angle */}
      <pointLight position={[0, 0, 8]} intensity={1} color="#ffffff" distance={15} />

      {/* Gaming Cabinet with slots */}
      <GamingCabinet3D
        slots={slots}
        onSlotHover={setHoveredSlot}
        onSlotClick={(slotId) => onSlotClick(slotId)}
        hoveredSlot={hoveredSlot || highlightSlot}
        installedComponents={installedComponents}
      />

      {/* MOTHERBOARD GROUP - Parent container for CPU, RAM, GPU, Cooling */}
      <group position={MOTHERBOARD_POSITION}>
        {/* Render motherboard itself */}
        {components.filter(c => c.type === 'motherboard').map((component) => {
          const slotConfig = SLOT_POSITIONS[component.type];
          if (!slotConfig) return null;

          const isInstalled = installedComponents.includes(component.id);
          const upgradeLevel = getComponentUpgradeLevel(component.id);

          if (installAnimation?.componentId === component.id) return null;
          if (!isInstalled || upgradeLevel === 0) return null;

          return (
            <DraggableComponent3D
              key={component.id}
              component={component}
              position={[0, 0, 0]} // At motherboard origin
              targetSlot={[0, 0, 0]}
              onDragStart={() => { }}
              onDragEnd={() => { }}
              isDragging={false}
              isInstalled={isInstalled}
              upgradeLevel={upgradeLevel}
            />
          );
        })}

        {/* Motherboard-mounted components - only render if motherboard installed */}
        {motherboardInstalled && components.filter(c => moboMountedTypes.includes(c.type)).map((component) => {
          const slotConfig = SLOT_POSITIONS[component.type];
          if (!slotConfig || !slotConfig.localOffset) return null;

          const isInstalled = installedComponents.includes(component.id);
          const upgradeLevel = getComponentUpgradeLevel(component.id);

          if (installAnimation?.componentId === component.id) return null;
          if (!isInstalled || upgradeLevel === 0) return null;

          // Use local offset relative to motherboard
          const localPos: [number, number, number] = slotConfig.localOffset;

          return (
            <DraggableComponent3D
              key={component.id}
              component={component}
              position={localPos}
              targetSlot={localPos}
              onDragStart={() => { }}
              onDragEnd={() => { }}
              isDragging={false}
              isInstalled={isInstalled}
              upgradeLevel={upgradeLevel}
            />
          );
        })}
      </group>

      {/* Case-mounted components (Storage, PSU, Case fans) - world coordinates */}
      {components.filter(c => caseMountedTypes.includes(c.type)).map((component) => {
        const slotConfig = SLOT_POSITIONS[component.type];
        if (!slotConfig) return null;

        const isInstalled = installedComponents.includes(component.id);
        const upgradeLevel = getComponentUpgradeLevel(component.id);

        if (installAnimation?.componentId === component.id) return null;
        if (!isInstalled || upgradeLevel === 0) return null;

        return (
          <DraggableComponent3D
            key={component.id}
            component={component}
            position={slotConfig.position}
            targetSlot={slotConfig.position}
            onDragStart={() => { }}
            onDragEnd={() => { }}
            isDragging={false}
            isInstalled={isInstalled}
            upgradeLevel={upgradeLevel}
          />
        );
      })}

      {/* Snap Animation for installing component */}
      {installAnimation && (
        <SnapAnimation
          component={installAnimation.component}
          startPosition={installAnimation.startPos}
          endPosition={installAnimation.endPos}
          isActive={installAnimation.isActive}
          onComplete={onInstallEffectComplete}
          upgradeLevel={getComponentUpgradeLevel(installAnimation.component.id)}
        />
      )}

      {/* Installation celebration effect */}
      {installAnimation && (
        <InstallationEffect
          position={installAnimation.endPos}
          color={installAnimation.component.color}
          isActive={installAnimation.isActive}
          onComplete={() => { }}
        />
      )}

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={6}
        maxDistance={18}
        maxPolarAngle={Math.PI / 1.4}
        minPolarAngle={Math.PI / 6}
      />
    </>
  );
}

export default function Workshop() {
  const {
    setCurrentScreen,
    components,
    selectComponent,
    selectedComponent,
    setTutorDialogue,
    getComponentUpgradeLevel,
    installedComponents,
    installComponent,
    isComponentUnlocked,
  } = useGameStore();

  const [showPuzzle, setShowPuzzle] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [installAnimation, setInstallAnimation] = useState<InstallAnimation | null>(null);

  const dropZoneRef = useRef<DropZoneOverlayRef>(null);

  const {
    dragState,
    hoveredDropZone,
    startDrag,
    endDrag,
    registerDropZone,
  } = useDragDrop();

  // Build modules list from components
  const modules = components.map(c => ({
    id: c.id,
    label: c.name.replace(' (CPU)', '').replace(' (GPU)', '').replace(' (SSD/HDD)', '').replace(' (PSU)', ''),
    unlocked: isComponentUnlocked(c.id),
    icon: c.icon,
    completedLessons: c.lessons.filter(l => l.completed).length,
    totalLessons: c.lessons.length,
  }));

  const handleSlotClick = (type: string) => {
    const component = components.find(c => c.type === type);
    if (component) {
      selectComponent(component);
      setSelectedModule(component.id);
      const level = getComponentUpgradeLevel(component.id);
      const nextLesson = component.lessons.find(l => !l.completed);

      if (nextLesson) {
        setTutorDialogue(
          level === 0
            ? `Ready to learn ${component.topic}? Complete the coding puzzle to install your ${component.name}!`
            : `${component.name} Level ${level}/${component.maxUpgradeLevel}. Solve the next puzzle to upgrade!`
        );
      } else {
        setTutorDialogue(`${component.name} is fully upgraded! 🎉`);
      }
    }
  };

  const handleModuleSelect = (moduleId: string) => {
    setSelectedModule(moduleId);
    const component = components.find(c => c.id === moduleId);
    if (component) {
      selectComponent(component);
      setTutorDialogue(`Selected ${component.name}. Learn about ${component.topic}!`);
    }
  };

  const handleComponentSelect = (component: PCComponent) => {
    selectComponent(component);
    setSelectedModule(component.id);
    setShowPuzzle(true);
    setTutorDialogue(`Let's work on ${component.topic}! Solve the coding puzzle to upgrade your ${component.name}.`);
  };

  const handlePuzzleComplete = () => {
    setShowPuzzle(false);
  };

  // Handle installation animation complete
  const handleInstallEffectComplete = useCallback(() => {
    if (installAnimation) {
      installComponent(installAnimation.componentId);
      setTutorDialogue(`${installAnimation.component.name} installed! Great job! 🎉`);
      setInstallAnimation(null);
    }
  }, [installAnimation, installComponent, setTutorDialogue]);

  // Handle drag start from component panel
  const handleDragStart = useCallback((component: PCComponent, event: React.MouseEvent | React.TouchEvent) => {
    const upgradeLevel = getComponentUpgradeLevel(component.id);
    if (upgradeLevel > 0) {
      startDrag(component, event);
      setTutorDialogue(`Drag ${component.name} to the ${SLOT_POSITIONS[component.type]?.label || 'slot'}!`);
    }
  }, [startDrag, getComponentUpgradeLevel, setTutorDialogue]);

  // Handle drop on zone - trigger animation
  const handleDrop = useCallback(() => {
    const result = endDrag();
    if (result.success && result.component && result.dropZone) {
      // Check if component type matches slot
      if (result.component.type === result.dropZone) {
        const slotConfig = SLOT_POSITIONS[result.dropZone];
        if (slotConfig) {
          // Start installation animation instead of immediately installing
          setInstallAnimation({
            componentId: result.component.id,
            component: result.component,
            startPos: [0, 4, 3], // Start from above
            endPos: slotConfig.position,
            isActive: true,
          });
          setTutorDialogue(`Installing ${result.component.name}...`);
        }
      }
    }
    return result;
  }, [endDrag, setTutorDialogue]);

  // Slots for drop zone overlay
  const dropSlots = Object.entries(SLOT_POSITIONS).map(([type, config]) => ({
    id: type,
    type,
    label: config.label,
    isOccupied: installedComponents.includes(type),
  }));

  return (
    <div
      className="min-h-screen bg-background circuit-pattern relative overflow-hidden"
      onMouseUp={dragState.isDragging ? handleDrop : undefined}
      onTouchEnd={dragState.isDragging ? handleDrop : undefined}
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-20 p-4 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentScreen('menu')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-xl font-bold text-primary">PC BUILD WORKSHOP</h1>
            <p className="text-sm text-muted-foreground">Drag components • Solve puzzles • Build your gaming PC</p>
          </div>
        </div>
        <PlayerStats />
      </header>

      {/* Main content - 3 column layout */}
      <div className="relative z-10 flex h-[calc(100vh-73px)]">
        {/* Left sidebar - Modules */}
        <ModulesSidebar
          modules={modules}
          selectedModule={selectedModule}
          onModuleSelect={handleModuleSelect}
        />

        {/* Center - 3D Canvas */}
        <div className="flex-1 relative">
          <Canvas
            camera={{ position: [0, 2, 12], fov: 45 }}
            gl={{ toneMappingExposure: 1.25 }}
          >
            <Suspense fallback={null}>
              <PCBuildScene
                onSlotClick={handleSlotClick}
                hoveredSlot={hoveredSlot}
                setHoveredSlot={setHoveredSlot}
                installedComponents={installedComponents}
                components={components}
                getComponentUpgradeLevel={getComponentUpgradeLevel}
                highlightSlot={hoveredDropZone}
                installAnimation={installAnimation}
                onInstallEffectComplete={handleInstallEffectComplete}
              />
            </Suspense>
          </Canvas>

          {/* Drop Zone Overlay */}
          <DropZoneOverlay
            ref={dropZoneRef}
            slots={dropSlots}
            hoveredSlot={hoveredDropZone}
            isDragging={dragState.isDragging}
            draggedComponentType={dragState.draggedComponent?.type || null}
            onRegisterZone={registerDropZone}
          />

          {/* Selected component quick panel */}
          <AnimatePresence>
            {selectedComponent && !showPuzzle && !dragState.isDragging && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2"
              >
                <div className="bg-card/95 backdrop-blur-lg px-6 py-4 rounded-xl border border-primary/30 shadow-xl flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedComponent.icon}</span>
                    <div>
                      <h3 className="font-display font-bold text-primary">{selectedComponent.name}</h3>
                      <p className="text-xs text-muted-foreground">{selectedComponent.topic}</p>
                    </div>
                  </div>

                  {/* Quick progress */}
                  <div className="flex items-center gap-2 px-3 py-1 bg-muted/30 rounded-full">
                    <span className="text-xs text-muted-foreground">Lv.</span>
                    <span className="text-sm font-mono font-bold text-primary">
                      {getComponentUpgradeLevel(selectedComponent.id)}/{selectedComponent.maxUpgradeLevel}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleComponentSelect(selectedComponent)}
                      size="sm"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {getComponentUpgradeLevel(selectedComponent.id) === 0 ? 'Start Puzzle' : 'Continue'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => selectComponent(null)}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tutor */}
          <TutorAvatar />
        </div>

        {/* Right sidebar - Components Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-80 p-4 overflow-y-auto bg-card/30 backdrop-blur-sm border-l border-border"
        >
          <h2 className="font-display text-lg font-bold mb-4 text-primary flex items-center gap-2">
            <span className="text-xl">🖥️</span>
            COMPONENTS
          </h2>
          <ComponentsPanel
            components={components}
            selectedComponent={selectedComponent}
            onComponentSelect={handleComponentSelect}
            getUpgradeLevel={getComponentUpgradeLevel}
            onDragStart={handleDragStart}
            isDragging={dragState.isDragging}
            draggedComponentId={dragState.draggedComponent?.id || null}
            isComponentUnlocked={isComponentUnlocked}
          />
        </motion.div>
      </div>

      {/* Drag Preview */}
      <AnimatePresence>
        {dragState.isDragging && dragState.draggedComponent && (
          <DragPreview
            component={dragState.draggedComponent}
            position={dragState.dragPosition}
            upgradeLevel={getComponentUpgradeLevel(dragState.draggedComponent.id)}
          />
        )}
      </AnimatePresence>

      {/* Code Puzzle HUD */}
      <CodePuzzleHUD
        isOpen={showPuzzle}
        onClose={() => setShowPuzzle(false)}
        component={selectedComponent}
        onComplete={handlePuzzleComplete}
      />
    </div>
  );
}
