import { useState, useCallback, useRef, useEffect } from 'react';
import { PCComponent } from '@/store/gameStore';

export interface DragState {
  isDragging: boolean;
  draggedComponent: PCComponent | null;
  dragPosition: { x: number; y: number };
  dragOffset: { x: number; y: number };
}

export interface DropZone {
  id: string;
  type: string;
  element: HTMLElement | null;
  bounds: DOMRect | null;
}

export function useDragDrop() {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedComponent: null,
    dragPosition: { x: 0, y: 0 },
    dragOffset: { x: 0, y: 0 },
  });
  
  const [hoveredDropZone, setHoveredDropZone] = useState<string | null>(null);
  const dropZonesRef = useRef<Map<string, DropZone>>(new Map());
  
  const startDrag = useCallback((
    component: PCComponent, 
    event: React.MouseEvent | React.TouchEvent
  ) => {
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    setDragState({
      isDragging: true,
      draggedComponent: component,
      dragPosition: { x: clientX, y: clientY },
      dragOffset: { 
        x: clientX - rect.left - rect.width / 2, 
        y: clientY - rect.top - rect.height / 2 
      },
    });
    
    // Prevent text selection during drag
    event.preventDefault();
  }, []);
  
  const updateDrag = useCallback((event: MouseEvent | TouchEvent) => {
    if (!dragState.isDragging) return;
    
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    setDragState(prev => ({
      ...prev,
      dragPosition: { x: clientX, y: clientY },
    }));
    
    // Check if over any drop zone
    let foundZone: string | null = null;
    dropZonesRef.current.forEach((zone, id) => {
      if (zone.bounds) {
        if (
          clientX >= zone.bounds.left &&
          clientX <= zone.bounds.right &&
          clientY >= zone.bounds.top &&
          clientY <= zone.bounds.bottom
        ) {
          // Check if component type matches zone type
          if (dragState.draggedComponent?.type === zone.type) {
            foundZone = id;
          }
        }
      }
    });
    
    setHoveredDropZone(foundZone);
  }, [dragState.isDragging, dragState.draggedComponent]);
  
  const endDrag = useCallback(() => {
    const result = {
      component: dragState.draggedComponent,
      dropZone: hoveredDropZone,
      success: hoveredDropZone !== null,
    };
    
    setDragState({
      isDragging: false,
      draggedComponent: null,
      dragPosition: { x: 0, y: 0 },
      dragOffset: { x: 0, y: 0 },
    });
    setHoveredDropZone(null);
    
    return result;
  }, [dragState.draggedComponent, hoveredDropZone]);
  
  const registerDropZone = useCallback((id: string, type: string, element: HTMLElement | null) => {
    if (element) {
      dropZonesRef.current.set(id, {
        id,
        type,
        element,
        bounds: element.getBoundingClientRect(),
      });
    } else {
      dropZonesRef.current.delete(id);
    }
  }, []);
  
  const updateDropZoneBounds = useCallback(() => {
    dropZonesRef.current.forEach((zone, id) => {
      if (zone.element) {
        dropZonesRef.current.set(id, {
          ...zone,
          bounds: zone.element.getBoundingClientRect(),
        });
      }
    });
  }, []);
  
  // Add global event listeners for drag
  useEffect(() => {
    if (dragState.isDragging) {
      const handleMouseMove = (e: MouseEvent) => updateDrag(e);
      const handleTouchMove = (e: TouchEvent) => updateDrag(e);
      const handleMouseUp = () => endDrag();
      const handleTouchEnd = () => endDrag();
      
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleTouchEnd);
      
      // Update bounds on scroll/resize
      window.addEventListener('scroll', updateDropZoneBounds, true);
      window.addEventListener('resize', updateDropZoneBounds);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchend', handleTouchEnd);
        window.removeEventListener('scroll', updateDropZoneBounds, true);
        window.removeEventListener('resize', updateDropZoneBounds);
      };
    }
  }, [dragState.isDragging, updateDrag, endDrag, updateDropZoneBounds]);
  
  return {
    dragState,
    hoveredDropZone,
    startDrag,
    endDrag,
    registerDropZone,
    updateDropZoneBounds,
  };
}
