import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import { Target, Check } from 'lucide-react';

interface DropZoneOverlayProps {
  slots: Array<{
    id: string;
    type: string;
    label: string;
    isOccupied: boolean;
  }>;
  hoveredSlot: string | null;
  isDragging: boolean;
  draggedComponentType: string | null;
  onRegisterZone: (id: string, type: string, element: HTMLElement | null) => void;
}

export interface DropZoneOverlayRef {
  updateBounds: () => void;
}

const DropZoneOverlay = forwardRef<DropZoneOverlayRef, DropZoneOverlayProps>(({ 
  slots, 
  hoveredSlot, 
  isDragging, 
  draggedComponentType,
  onRegisterZone,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const zoneRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Define slot positions as percentages of the container
  const slotPositions: Record<string, { top: string; left: string; width: string; height: string }> = {
    motherboard: { top: '45%', left: '50%', width: '35%', height: '15%' },
    cpu: { top: '35%', left: '40%', width: '15%', height: '12%' },
    cooling: { top: '22%', left: '40%', width: '14%', height: '12%' },
    ram: { top: '30%', left: '62%', width: '18%', height: '15%' },
    gpu: { top: '58%', left: '50%', width: '35%', height: '12%' },
    storage: { top: '72%', left: '70%', width: '15%', height: '8%' },
    psu: { top: '78%', left: '50%', width: '22%', height: '12%' },
    case: { top: '18%', left: '28%', width: '14%', height: '15%' },
  };

  useImperativeHandle(ref, () => ({
    updateBounds: () => {
      slots.forEach(slot => {
        const element = zoneRefs.current.get(slot.id);
        if (element) {
          onRegisterZone(slot.id, slot.type, element);
        }
      });
    },
  }));

  useEffect(() => {
    // Register all drop zones
    slots.forEach(slot => {
      const element = zoneRefs.current.get(slot.id);
      if (element) {
        onRegisterZone(slot.id, slot.type, element);
      }
    });

    return () => {
      slots.forEach(slot => {
        onRegisterZone(slot.id, slot.type, null);
      });
    };
  }, [slots, onRegisterZone]);

  if (!isDragging) return null;

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-30"
    >
      {slots.map(slot => {
        const position = slotPositions[slot.type];
        if (!position) return null;

        const isHovered = hoveredSlot === slot.id;
        const isMatchingType = draggedComponentType === slot.type;
        const canDrop = isMatchingType && !slot.isOccupied;

        return (
          <motion.div
            key={slot.id}
            ref={(el) => {
              if (el) {
                zoneRefs.current.set(slot.id, el);
              }
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: isHovered ? 1.05 : 1,
            }}
            style={{
              position: 'absolute',
              top: position.top,
              left: position.left,
              width: position.width,
              height: position.height,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'auto',
            }}
            className={`
              rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all duration-200
              ${slot.isOccupied 
                ? 'border-green-500/30 bg-green-500/5' 
                : canDrop
                  ? isHovered
                    ? 'border-primary bg-primary/20 shadow-lg shadow-primary/30'
                    : 'border-primary/50 bg-primary/10 animate-pulse'
                  : 'border-muted-foreground/30 bg-muted/10'
              }
            `}
          >
            {slot.isOccupied ? (
              <>
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-xs text-green-500 font-medium">Installed</span>
              </>
            ) : canDrop ? (
              <>
                <Target className={`h-6 w-6 ${isHovered ? 'text-primary animate-bounce' : 'text-primary/70'}`} />
                <span className={`text-xs font-medium ${isHovered ? 'text-primary' : 'text-primary/70'}`}>
                  {isHovered ? 'Release to install!' : `Drop ${slot.label}`}
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">{slot.label}</span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
});

DropZoneOverlay.displayName = 'DropZoneOverlay';

export default DropZoneOverlay;
