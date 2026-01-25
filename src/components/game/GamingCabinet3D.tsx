import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';

interface ComponentSlot {
  id: string;
  type: string;
  position: [number, number, number];
  size: [number, number, number];
  label: string;
  isOccupied: boolean;
}

interface GamingCabinet3DProps {
  slots: ComponentSlot[];
  onSlotHover: (slotId: string | null) => void;
  onSlotClick: (slotId: string) => void;
  hoveredSlot: string | null;
  installedComponents: string[];
}

// RGB color cycling hook
function useRGBColor(speed: number = 60) {
  const [hue, setHue] = useState(0);
  
  useFrame((state) => {
    setHue((state.clock.elapsedTime * speed) % 360);
  });
  
  return `hsl(${hue}, 100%, 60%)`;
}

// Individual slot component
function ComponentSlotMesh({ 
  slot, 
  isHovered, 
  isOccupied,
  onHover, 
  onClick 
}: { 
  slot: ComponentSlot;
  isHovered: boolean;
  isOccupied: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && !isOccupied) {
      // Pulse effect when hovered
      const pulse = isHovered ? 0.5 + Math.sin(state.clock.elapsedTime * 5) * 0.3 : 0.3;
      (meshRef.current.material as THREE.MeshStandardMaterial).opacity = pulse;
    }
    if (glowRef.current && isHovered) {
      glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.1);
    }
  });

  if (isOccupied) return null;

  return (
    <group position={slot.position}>
      {/* Slot outline */}
      <mesh 
        ref={meshRef}
        onPointerOver={() => onHover(true)}
        onPointerOut={() => onHover(false)}
        onClick={onClick}
      >
        <boxGeometry args={slot.size} />
        <meshStandardMaterial 
          color={isHovered ? '#00d4ff' : '#1a1a2e'}
          transparent
          opacity={0.3}
          wireframe={!isHovered}
        />
      </mesh>
      
      {/* Glow effect when hovered */}
      {isHovered && (
        <mesh ref={glowRef}>
          <boxGeometry args={[slot.size[0] + 0.1, slot.size[1] + 0.1, slot.size[2] + 0.1]} />
          <meshStandardMaterial 
            color="#00d4ff"
            transparent
            opacity={0.2}
            emissive="#00d4ff"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
      
      {/* Slot label */}
      <Html position={[0, slot.size[1] / 2 + 0.15, 0]} center>
        <div className={`text-xs font-mono px-2 py-0.5 rounded whitespace-nowrap transition-all ${
          isHovered 
            ? 'bg-primary text-primary-foreground scale-110' 
            : 'bg-background/80 text-muted-foreground'
        }`}>
          {slot.label}
        </div>
      </Html>
      
      {/* Corner brackets */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, y], i) => (
        <mesh key={i} position={[x * slot.size[0] / 2, y * slot.size[1] / 2, slot.size[2] / 2 + 0.01]}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshBasicMaterial color={isHovered ? '#00d4ff' : '#333'} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

export default function GamingCabinet3D({ 
  slots, 
  onSlotHover, 
  onSlotClick,
  hoveredSlot,
  installedComponents
}: GamingCabinet3DProps) {
  const rgbColor = useRGBColor();
  const fanRefs = useRef<THREE.Group[]>([]);
  
  useFrame((state, delta) => {
    fanRefs.current.forEach((fan, i) => {
      if (fan) {
        fan.rotation.z += delta * (2 + i * 0.5);
      }
    });
  });

  return (
    <group>
      {/* Main cabinet frame */}
      <group>
        {/* Back panel - lighter for visibility */}
        <RoundedBox args={[5, 6, 0.1]} position={[0, 0, -2]} radius={0.05}>
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </RoundedBox>
        
        {/* Left side panel - lighter interior */}
        <RoundedBox args={[0.1, 6, 4]} position={[-2.5, 0, 0]} radius={0.05}>
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </RoundedBox>
        
        {/* Right side panel (tempered glass) - more transparent */}
        <mesh position={[2.5, 0, 0]}>
          <boxGeometry args={[0.08, 5.8, 3.8]} />
          <meshStandardMaterial 
            color="#ffffff" 
            metalness={0.1} 
            roughness={0.05} 
            transparent 
            opacity={0.08} 
          />
        </mesh>
        
        {/* Top panel with vent holes */}
        <RoundedBox args={[5, 0.1, 4]} position={[0, 3, 0]} radius={0.05}>
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </RoundedBox>
        
        {/* Bottom panel */}
        <RoundedBox args={[5, 0.1, 4]} position={[0, -3, 0]} radius={0.05}>
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </RoundedBox>
        
        {/* Front panel with mesh */}
        <group position={[0, 0, 2]}>
          {/* Mesh panel frame */}
          <RoundedBox args={[5, 6, 0.08]} radius={0.05}>
            <meshStandardMaterial color="#0a0a12" metalness={0.95} roughness={0.1} />
          </RoundedBox>
          
          {/* Mesh holes */}
          {Array.from({ length: 20 }).map((_, row) => (
            Array.from({ length: 15 }).map((_, col) => (
              <mesh key={`${row}-${col}`} position={[-1.8 + col * 0.25, -2.5 + row * 0.28, 0.05]}>
                <circleGeometry args={[0.06, 6]} />
                <meshStandardMaterial color="#000" transparent opacity={0.8} />
              </mesh>
            ))
          ))}
          
          {/* Power button */}
          <mesh position={[0, 2.7, 0.06]}>
            <cylinderGeometry args={[0.1, 0.1, 0.03, 16]} />
            <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 2.7, 0.08]}>
            <torusGeometry args={[0.08, 0.015, 8, 24]} />
            <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={2} />
          </mesh>
          
          {/* USB ports */}
          {[-0.4, -0.2, 0.2].map((x, i) => (
            <mesh key={i} position={[x, 2.5, 0.05]}>
              <boxGeometry args={[0.12, 0.04, 0.02]} />
              <meshStandardMaterial color={i === 2 ? '#0066ff' : '#333'} />
            </mesh>
          ))}
          
          {/* Audio jacks */}
          {[0.4, 0.55].map((x, i) => (
            <mesh key={i} position={[x, 2.5, 0.05]}>
              <cylinderGeometry args={[0.025, 0.025, 0.02, 8]} />
              <meshStandardMaterial color={i === 0 ? '#00ff00' : '#ff00ff'} />
            </mesh>
          ))}
        </group>
        
        {/* RGB Edge Strips */}
        {/* Vertical edges */}
        <mesh position={[-2.45, 0, 1.95]}>
          <boxGeometry args={[0.04, 5.8, 0.04]} />
          <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={3} />
        </mesh>
        <mesh position={[2.45, 0, 1.95]}>
          <boxGeometry args={[0.04, 5.8, 0.04]} />
          <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={3} />
        </mesh>
        
        {/* Horizontal edges */}
        <mesh position={[0, 2.95, 1.95]}>
          <boxGeometry args={[4.8, 0.04, 0.04]} />
          <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={3} />
        </mesh>
        <mesh position={[0, -2.95, 1.95]}>
          <boxGeometry args={[4.8, 0.04, 0.04]} />
          <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={3} />
        </mesh>
        
        {/* Internal cable management */}
        <mesh position={[1.5, 0, -0.5]}>
          <boxGeometry args={[0.05, 5, 0.05]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Interior LED strips - vertical back corners */}
        <mesh position={[-2.35, 0, -1.9]}>
          <boxGeometry args={[0.03, 5.6, 0.03]} />
          <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={4} />
        </mesh>
        <mesh position={[2.35, 0, -1.9]}>
          <boxGeometry args={[0.03, 5.6, 0.03]} />
          <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={4} />
        </mesh>
        
        {/* Interior LED strips - horizontal back edges */}
        <mesh position={[0, 2.85, -1.9]}>
          <boxGeometry args={[4.6, 0.03, 0.03]} />
          <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={4} />
        </mesh>
        <mesh position={[0, -1.75, -1.9]}>
          <boxGeometry args={[4.6, 0.03, 0.03]} />
          <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={4} />
        </mesh>
        
        {/* Interior LED strips - side edges (left panel interior) */}
        <mesh position={[-2.35, 2.85, 0]}>
          <boxGeometry args={[0.03, 0.03, 3.6]} />
          <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={4} />
        </mesh>
        <mesh position={[-2.35, -1.75, 0]}>
          <boxGeometry args={[0.03, 0.03, 3.6]} />
          <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={4} />
        </mesh>
        
        {/* Interior LED strips - glass side edges */}
        <mesh position={[2.35, 2.85, 0]}>
          <boxGeometry args={[0.03, 0.03, 3.6]} />
          <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={4} />
        </mesh>
        <mesh position={[2.35, -1.75, 0]}>
          <boxGeometry args={[0.03, 0.03, 3.6]} />
          <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={4} />
        </mesh>
        
        {/* PSU shroud top LED strip */}
        <mesh position={[0, -1.78, 0.5]}>
          <boxGeometry args={[4.5, 0.04, 0.04]} />
          <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={3} />
        </mesh>
        
        {/* PSU shroud */}
        <RoundedBox args={[4.8, 1.2, 3.8]} position={[0, -2.4, 0]} radius={0.03}>
          <meshStandardMaterial color="#0f0f18" metalness={0.8} roughness={0.2} />
        </RoundedBox>
        
        {/* Front intake fans */}
        {[1.5, 0, -1.5].map((y, i) => (
          <group 
            key={i} 
            position={[-2.2, y, 0.5]} 
            ref={(ref) => { if (ref) fanRefs.current[i] = ref; }}
          >
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <cylinderGeometry args={[0.5, 0.5, 0.08, 24]} />
              <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
            </mesh>
            {Array.from({ length: 9 }).map((_, j) => (
              <mesh key={j} rotation={[0, Math.PI / 2, (j / 9) * Math.PI * 2]}>
                <boxGeometry args={[0.02, 0.4, 0.1]} />
                <meshStandardMaterial 
                  color={rgbColor} 
                  emissive={rgbColor}
                  emissiveIntensity={0.5}
                  transparent 
                  opacity={0.8} 
                />
              </mesh>
            ))}
            {/* Fan RGB ring */}
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.48, 0.02, 8, 32]} />
              <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={2} />
            </mesh>
          </group>
        ))}
      </group>
      
      {/* Component Slots */}
      {slots.map((slot) => (
        <ComponentSlotMesh
          key={slot.id}
          slot={slot}
          isHovered={hoveredSlot === slot.id}
          isOccupied={installedComponents.includes(slot.type)}
          onHover={(hovered) => onSlotHover(hovered ? slot.id : null)}
          onClick={() => onSlotClick(slot.id)}
        />
      ))}
      
      {/* Enhanced interior lighting */}
      <pointLight position={[0, 0, 0]} color="#ffffff" intensity={1.5} distance={8} />
      <pointLight position={[0, 1.5, 0.5]} color="#ffffff" intensity={1} distance={6} />
      <pointLight position={[0, -1, 0.5]} color="#ffffff" intensity={0.8} distance={5} />
      <pointLight position={[-1.5, 0, 0]} color={rgbColor} intensity={0.6} distance={4} />
      <pointLight position={[1.5, 0, 0]} color={rgbColor} intensity={0.6} distance={4} />
      
      {/* Fill light from glass side */}
      <rectAreaLight 
        position={[3, 0, 0]} 
        rotation={[0, -Math.PI / 2, 0]} 
        width={5} 
        height={5} 
        intensity={2} 
        color="#ffffff" 
      />
    </group>
  );
}
