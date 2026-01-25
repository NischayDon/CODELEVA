import { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';
import { PCComponent } from '@/store/gameStore';

interface DraggableComponent3DProps {
  component: PCComponent;
  position: [number, number, number];
  targetSlot: [number, number, number] | null;
  onDragStart: () => void;
  onDragEnd: (droppedInSlot: boolean) => void;
  isDragging: boolean;
  isInstalled: boolean;
  upgradeLevel: number;
}

// RAM Stick - Realistic model
function RAMStick({ level, color }: { level: number; color: string }) {
  const hue = useMemo(() => Math.random() * 360, []);
  const [rgbHue, setRgbHue] = useState(hue);
  
  useFrame((state) => {
    if (level >= 4) {
      setRgbHue((state.clock.elapsedTime * 60) % 360);
    }
  });

  const rgbColor = `hsl(${rgbHue}, 100%, 60%)`;
  const chipCount = 4 + level * 2;
  const height = 0.8 + level * 0.1;

  return (
    <group rotation={[0, 0, 0]}>
      {/* PCB Board - Tall and thin */}
      <mesh>
        <boxGeometry args={[2, height, 0.06]} />
        <meshStandardMaterial 
          color={level >= 3 ? '#0a0a14' : '#0d4a1c'} 
          metalness={0.4} 
          roughness={0.6} 
        />
      </mesh>
      
      {/* Heat spreader for higher levels */}
      {level >= 2 && (
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[1.9, height * 0.85, 0.1]} />
          <meshStandardMaterial 
            color={level >= 4 ? '#1a1a2e' : level >= 3 ? '#333' : '#444'} 
            metalness={0.9} 
            roughness={0.1} 
          />
        </mesh>
      )}
      
      {/* RGB strip on top for level 4 */}
      {level >= 4 && (
        <mesh position={[0, height / 2 + 0.03, 0]}>
          <boxGeometry args={[1.8, 0.06, 0.08]} />
          <meshStandardMaterial 
            color={rgbColor} 
            emissive={rgbColor} 
            emissiveIntensity={2} 
          />
        </mesh>
      )}
      
      {/* Memory chips */}
      {Array.from({ length: chipCount }).map((_, i) => (
        <mesh key={i} position={[-0.8 + i * (1.6 / (chipCount - 1)), 0, 0.04]}>
          <boxGeometry args={[0.12, 0.18, 0.02]} />
          <meshStandardMaterial color="#111" metalness={0.95} roughness={0.1} />
        </mesh>
      ))}
      
      {/* Gold contact pins */}
      <group position={[0, -height / 2 - 0.03, 0]}>
        {Array.from({ length: 24 }).map((_, i) => (
          <mesh key={i} position={[-0.92 + i * 0.08, 0, 0]}>
            <boxGeometry args={[0.04, 0.06, 0.05]} />
            <meshStandardMaterial 
              color="#ffd700" 
              metalness={1} 
              roughness={0.2} 
              emissive="#ffd700"
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}
      </group>
      
      {/* Label */}
      <Html position={[0, height / 2 + 0.15, 0.1]} center>
        <div className="text-[10px] text-primary font-mono whitespace-nowrap bg-background/80 px-1 rounded">
          {level === 1 ? '1GB DDR3' : level === 2 ? '4GB DDR4' : level === 3 ? '8GB DDR4' : '16GB DDR5 RGB'}
        </div>
      </Html>
    </group>
  );
}

// CPU Chip - Realistic IHS and pins
function CPUChip({ level, color }: { level: number; color: string }) {
  const [rgbHue, setRgbHue] = useState(0);
  
  useFrame((state) => {
    if (level >= 4) {
      setRgbHue((state.clock.elapsedTime * 60) % 360);
    }
  });

  const rgbColor = `hsl(${rgbHue}, 100%, 60%)`;
  const size = 1 + level * 0.15;
  const coreCount = Math.pow(2, level);

  return (
    <group>
      {/* IHS (Integrated Heat Spreader) - Top metal plate */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[size, 0.08, size]} />
        <meshStandardMaterial 
          color={level >= 4 ? '#c0c0c0' : '#999'} 
          metalness={0.98} 
          roughness={0.05} 
        />
      </mesh>
      
      {/* CPU Substrate (green PCB) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[size * 1.1, 0.06, size * 1.1]} />
        <meshStandardMaterial color="#0d4a1c" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Capacitors around edges */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const r = size * 0.45;
        return (
          <mesh key={i} position={[Math.cos(angle) * r, 0.06, Math.sin(angle) * r]}>
            <boxGeometry args={[0.06, 0.04, 0.04]} />
            <meshStandardMaterial color="#2a2a2a" />
          </mesh>
        );
      })}
      
      {/* Core indicators on IHS */}
      {Array.from({ length: Math.min(coreCount, 16) }).map((_, i) => {
        const cols = Math.ceil(Math.sqrt(coreCount));
        const x = (i % cols - (cols - 1) / 2) * 0.18;
        const z = (Math.floor(i / cols) - (cols - 1) / 2) * 0.18;
        return (
          <mesh key={i} position={[x, 0.13, z]}>
            <boxGeometry args={[0.1, 0.02, 0.1]} />
            <meshStandardMaterial 
              color={level >= 4 ? rgbColor : '#00ff88'} 
              emissive={level >= 4 ? rgbColor : '#00ff88'} 
              emissiveIntensity={1} 
            />
          </mesh>
        );
      })}
      
      {/* Pin array on bottom */}
      <group position={[0, -0.04, 0]}>
        {Array.from({ length: 100 }).map((_, i) => {
          const cols = 10;
          const spacing = size * 0.08;
          const x = (i % cols - (cols - 1) / 2) * spacing;
          const z = (Math.floor(i / cols) - (cols - 1) / 2) * spacing;
          return (
            <mesh key={i} position={[x, 0, z]}>
              <cylinderGeometry args={[0.01, 0.01, 0.04, 6]} />
              <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.2} />
            </mesh>
          );
        })}
      </group>
      
      {/* Label */}
      <Html position={[0, 0.25, 0]} center>
        <div className="text-[10px] text-secondary font-mono whitespace-nowrap bg-background/80 px-1 rounded">
          {level === 1 ? 'Single Core' : level === 2 ? 'Dual Core' : level === 3 ? 'Quad Core' : 'Octa Core RGB'}
        </div>
      </Html>
    </group>
  );
}

// GPU Card - Full graphics card with fans
function GPUCard({ level, color }: { level: number; color: string }) {
  const fanRefs = useRef<THREE.Group[]>([]);
  const [rgbHue, setRgbHue] = useState(0);
  
  useFrame((state, delta) => {
    fanRefs.current.forEach(fan => {
      if (fan) fan.rotation.z += delta * (3 + level);
    });
    if (level >= 4) {
      setRgbHue((state.clock.elapsedTime * 60) % 360);
    }
  });

  const rgbColor = `hsl(${rgbHue}, 100%, 60%)`;
  const length = 2 + level * 0.4;
  const fanCount = Math.min(level + 1, 3);

  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {/* Main shroud/backplate */}
      <RoundedBox args={[length, 0.4, 1]} radius={0.03}>
        <meshStandardMaterial 
          color={level >= 3 ? '#1a1a2e' : '#2a2a2e'} 
          metalness={0.8} 
          roughness={0.2} 
        />
      </RoundedBox>
      
      {/* PCB visible from side */}
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[length - 0.1, 0.08, 0.9]} />
        <meshStandardMaterial color="#0d4a1c" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Fans */}
      {Array.from({ length: fanCount }).map((_, i) => {
        const xPos = -length / 2 + 0.5 + i * (length / fanCount);
        return (
          <group 
            key={i} 
            position={[xPos, 0.22, 0]} 
            ref={(ref) => { if (ref) fanRefs.current[i] = ref; }}
          >
            {/* Fan housing */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.35, 0.35, 0.05, 24]} />
              <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Fan blades */}
            {Array.from({ length: 9 }).map((_, j) => (
              <mesh key={j} rotation={[0, 0, (j / 9) * Math.PI * 2]}>
                <boxGeometry args={[0.28, 0.02, 0.08]} />
                <meshStandardMaterial 
                  color={level >= 4 ? rgbColor : '#333'} 
                  transparent 
                  opacity={0.8}
                />
              </mesh>
            ))}
          </group>
        );
      })}
      
      {/* RGB accent strip */}
      {level >= 3 && (
        <mesh position={[0, 0.21, 0.52]}>
          <boxGeometry args={[length - 0.3, 0.03, 0.03]} />
          <meshStandardMaterial 
            color={level >= 4 ? rgbColor : color} 
            emissive={level >= 4 ? rgbColor : color} 
            emissiveIntensity={2} 
          />
        </mesh>
      )}
      
      {/* Power connectors */}
      {Array.from({ length: level }).map((_, i) => (
        <mesh key={i} position={[length / 2 - 0.15, 0.1, -0.35 - i * 0.15]}>
          <boxGeometry args={[0.15, 0.08, 0.1]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))}
      
      {/* Display outputs */}
      <group position={[-length / 2 - 0.05, -0.1, 0]}>
        {Array.from({ length: 3 }).map((_, i) => (
          <mesh key={i} position={[0, 0, -0.25 + i * 0.25]}>
            <boxGeometry args={[0.04, 0.08, 0.12]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        ))}
      </group>
      
      {/* Label */}
      <Html position={[0, 0.35, 0.55]} center>
        <div className="text-[10px] text-accent font-mono whitespace-nowrap bg-background/80 px-1 rounded">
          {level === 1 ? 'GTX 1050' : level === 2 ? 'RTX 2060' : level === 3 ? 'RTX 3070' : 'RTX 4090 Ti'}
        </div>
      </Html>
    </group>
  );
}

// Motherboard
function Motherboard({ level, color }: { level: number; color: string }) {
  const [rgbHue, setRgbHue] = useState(0);
  
  useFrame((state) => {
    if (level >= 4) {
      setRgbHue((state.clock.elapsedTime * 60) % 360);
    }
  });

  const rgbColor = `hsl(${rgbHue}, 100%, 60%)`;
  const size = 2.5;

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {/* Main PCB */}
      <mesh>
        <boxGeometry args={[size, 0.08, size * 0.8]} />
        <meshStandardMaterial 
          color={level >= 3 ? '#0a0a14' : '#0d4a1c'} 
          metalness={0.4} 
          roughness={0.6} 
        />
      </mesh>
      
      {/* Circuit traces */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} position={[-size/2 + 0.1 + (i * 0.12), 0.045, (i % 2) * 0.3 - 0.15]}>
          <boxGeometry args={[0.02, 0.01, size * 0.4]} />
          <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.3} />
        </mesh>
      ))}
      
      {/* CPU Socket */}
      <mesh position={[-0.4, 0.05, 0]}>
        <boxGeometry args={[0.6, 0.04, 0.6]} />
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* RAM slots */}
      {Array.from({ length: level + 1 }).map((_, i) => (
        <mesh key={i} position={[0.6, 0.06, -0.25 + i * 0.18]}>
          <boxGeometry args={[0.7, 0.06, 0.12]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))}
      
      {/* PCIe slots */}
      {Array.from({ length: Math.min(level, 3) }).map((_, i) => (
        <mesh key={i} position={[-0.2, 0.05, 0.5 + i * 0.2]}>
          <boxGeometry args={[1, 0.04, 0.08]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))}
      
      {/* Chipset heatsink */}
      {level >= 2 && (
        <RoundedBox args={[0.4, 0.2, 0.4]} position={[0.3, 0.14, -0.1]} radius={0.02}>
          <meshStandardMaterial color="#555" metalness={0.9} roughness={0.1} />
        </RoundedBox>
      )}
      
      {/* VRM heatsinks */}
      {level >= 3 && (
        <>
          <mesh position={[-0.4, 0.1, -0.55]}>
            <boxGeometry args={[0.8, 0.12, 0.15]} />
            <meshStandardMaterial color="#444" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[-0.9, 0.1, 0]}>
            <boxGeometry args={[0.15, 0.12, 0.6]} />
            <meshStandardMaterial color="#444" metalness={0.9} roughness={0.1} />
          </mesh>
        </>
      )}
      
      {/* RGB strips */}
      {level >= 4 && (
        <>
          <mesh position={[size/2 - 0.03, 0.05, 0]}>
            <boxGeometry args={[0.04, 0.04, size * 0.75]} />
            <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={2} />
          </mesh>
          <mesh position={[-size/2 + 0.03, 0.05, 0]}>
            <boxGeometry args={[0.04, 0.04, size * 0.75]} />
            <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={2} />
          </mesh>
        </>
      )}
    </group>
  );
}

// Storage Drive
function StorageDrive({ level, color }: { level: number; color: string }) {
  const [rgbHue, setRgbHue] = useState(0);
  const [ledBlink, setLedBlink] = useState(0);
  
  useFrame((state) => {
    if (level >= 4) {
      setRgbHue((state.clock.elapsedTime * 60) % 360);
    }
    setLedBlink(Math.sin(state.clock.elapsedTime * 10) > 0 ? 1 : 0.3);
  });

  const rgbColor = `hsl(${rgbHue}, 100%, 60%)`;
  const isNVMe = level >= 3;

  if (isNVMe) {
    // NVMe M.2 SSD
    return (
      <group rotation={[0, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.2, 0.04, 0.28]} />
          <meshStandardMaterial color={level >= 4 ? '#1a1a2e' : '#0d4a1c'} metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Controller chip */}
        <mesh position={[0.3, 0.025, 0]}>
          <boxGeometry args={[0.18, 0.02, 0.18]} />
          <meshStandardMaterial color="#111" metalness={0.95} roughness={0.1} />
        </mesh>
        
        {/* NAND chips */}
        {Array.from({ length: 4 }).map((_, i) => (
          <mesh key={i} position={[-0.35 + i * 0.2, 0.025, 0]}>
            <boxGeometry args={[0.12, 0.015, 0.14]} />
            <meshStandardMaterial color="#222" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
        
        {/* M.2 connector notch */}
        <mesh position={[-0.6, 0, 0]}>
          <boxGeometry args={[0.05, 0.03, 0.22]} />
          <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.2} />
        </mesh>
        
        {/* RGB for level 4 */}
        {level >= 4 && (
          <mesh position={[0, 0.03, 0.15]}>
            <boxGeometry args={[1.1, 0.015, 0.02]} />
            <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={2} />
          </mesh>
        )}
        
        {/* Activity LED */}
        <mesh position={[0.55, 0.03, 0]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial 
            color="#00ff00" 
            emissive="#00ff00" 
            emissiveIntensity={ledBlink * 3} 
          />
        </mesh>
      </group>
    );
  }

  // 2.5" SSD or 3.5" HDD
  const is25 = level === 2;
  const height = is25 ? 0.08 : 0.25;
  const width = is25 ? 0.7 : 1;
  const depth = is25 ? 1 : 1.4;

  return (
    <group>
      <RoundedBox args={[width, height, depth]} radius={0.02}>
        <meshStandardMaterial color={is25 ? '#1a1a2e' : '#555'} metalness={0.7} roughness={0.3} />
      </RoundedBox>
      
      {/* Label sticker */}
      <mesh position={[0, height / 2 + 0.005, 0]}>
        <boxGeometry args={[width * 0.8, 0.005, depth * 0.6]} />
        <meshStandardMaterial color="#eee" />
      </mesh>
      
      {/* SATA connectors */}
      <mesh position={[-width / 2 - 0.02, 0, 0.2]}>
        <boxGeometry args={[0.04, 0.06, 0.2]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-width / 2 - 0.02, 0, -0.15]}>
        <boxGeometry args={[0.04, 0.06, 0.12]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      
      {/* Activity LED */}
      <mesh position={[width / 2 - 0.1, height / 2, depth / 2 - 0.1]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={ledBlink * 2} />
      </mesh>
    </group>
  );
}

// Power Supply
function PowerSupply({ level, color }: { level: number; color: string }) {
  const [rgbHue, setRgbHue] = useState(0);
  const fanRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (fanRef.current) {
      fanRef.current.rotation.z += delta * 2;
    }
    if (level >= 4) {
      setRgbHue((state.clock.elapsedTime * 60) % 360);
    }
  });

  const rgbColor = `hsl(${rgbHue}, 100%, 60%)`;
  const wattage = [450, 650, 850, 1200][level - 1];

  return (
    <group>
      {/* Main body */}
      <RoundedBox args={[1.5, 0.86, 1.4]} radius={0.03}>
        <meshStandardMaterial 
          color={level >= 3 ? '#1a1a2e' : '#2a2a2e'} 
          metalness={0.8} 
          roughness={0.2} 
        />
      </RoundedBox>
      
      {/* Fan grille */}
      <group position={[0, 0.44, 0]} ref={fanRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.02, 24]} />
          <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
        </mesh>
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={i} rotation={[0, 0, (i / 9) * Math.PI * 2]}>
            <boxGeometry args={[0.4, 0.01, 0.1]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        ))}
      </group>
      
      {/* Grille mesh pattern */}
      <group position={[0, 0.435, 0]}>
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i} position={[0, 0, -0.35 + i * 0.12]} rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[1, 0.02, 0.02]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        ))}
      </group>
      
      {/* Efficiency badge */}
      <mesh position={[0.6, 0, 0.71]}>
        <boxGeometry args={[0.25, 0.12, 0.01]} />
        <meshStandardMaterial 
          color={level === 4 ? '#e5e4e2' : level === 3 ? '#ffd700' : level === 2 ? '#cd7f32' : '#888'} 
          metalness={1} 
          roughness={0.1} 
        />
      </mesh>
      
      {/* Modular cable ports */}
      {level >= 2 && (
        <group position={[-0.76, 0, 0]}>
          {Array.from({ length: level + 2 }).map((_, i) => (
            <mesh key={i} position={[0, 0.2 - i * 0.15, 0]}>
              <boxGeometry args={[0.04, 0.08, 0.15]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Power switch */}
      <mesh position={[-0.76, -0.3, 0.5]}>
        <boxGeometry args={[0.02, 0.1, 0.08]} />
        <meshStandardMaterial color="#c00" />
      </mesh>
      
      {/* RGB accent */}
      {level >= 4 && (
        <mesh position={[0, -0.44, 0.6]}>
          <boxGeometry args={[1.3, 0.03, 0.03]} />
          <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={2} />
        </mesh>
      )}
      
      {/* Label */}
      <Html position={[0, 0, 0.75]} center>
        <div className="text-[10px] text-destructive font-mono whitespace-nowrap bg-background/80 px-1 rounded">
          {wattage}W {level >= 3 ? 'Gold' : level >= 2 ? 'Bronze' : ''}
        </div>
      </Html>
    </group>
  );
}

// CPU Cooler
function CPUCooler({ level, color }: { level: number; color: string }) {
  const fanRef = useRef<THREE.Group>(null);
  const [rgbHue, setRgbHue] = useState(0);
  
  useFrame((state, delta) => {
    if (fanRef.current) {
      fanRef.current.rotation.y += delta * (3 + level);
    }
    if (level >= 4) {
      setRgbHue((state.clock.elapsedTime * 60) % 360);
    }
  });

  const rgbColor = `hsl(${rgbHue}, 100%, 60%)`;
  const isAIO = level >= 3;

  if (isAIO) {
    // AIO Liquid Cooler
    return (
      <group>
        {/* Pump head */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.15, 24]} />
          <meshStandardMaterial color={level >= 4 ? '#1a1a2e' : '#222'} metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* RGB ring on pump */}
        <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.3, 0.03, 8, 32]} />
          <meshStandardMaterial 
            color={level >= 4 ? rgbColor : color} 
            emissive={level >= 4 ? rgbColor : color} 
            emissiveIntensity={2} 
          />
        </mesh>
        
        {/* Tubing */}
        {[-0.2, 0.2].map((x, i) => (
          <mesh key={i} position={[x, 0.3, 0]} rotation={[0, 0, i === 0 ? -0.4 : 0.4]}>
            <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        ))}
        
        {/* Radiator hint */}
        <RoundedBox args={[0.8, 0.15, 0.1]} position={[0, 0.6, 0]} radius={0.02}>
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
        </RoundedBox>
      </group>
    );
  }

  // Tower Air Cooler
  const towerHeight = 0.6 + level * 0.15;
  const finCount = 8 + level * 4;

  return (
    <group>
      {/* Heatsink fins */}
      {Array.from({ length: finCount }).map((_, i) => (
        <mesh key={i} position={[-0.4 + i * (0.8 / finCount), towerHeight / 2, 0]}>
          <boxGeometry args={[0.015, towerHeight, 0.6]} />
          <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      
      {/* Heat pipes */}
      {Array.from({ length: level + 2 }).map((_, i) => (
        <mesh key={i} position={[-0.15 + i * 0.1, towerHeight / 3, 0]}>
          <cylinderGeometry args={[0.025, 0.025, towerHeight * 0.9, 8]} />
          <meshStandardMaterial color="#cd7f32" metalness={0.95} roughness={0.1} />
        </mesh>
      ))}
      
      {/* Base plate */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.06, 0.5]} />
        <meshStandardMaterial color="#cd7f32" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Fan */}
      <group position={[0.5, towerHeight / 2, 0]} ref={fanRef}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.35, 0.35, 0.08, 24]} />
          <meshStandardMaterial color={level >= 4 ? '#1a1a2e' : '#333'} />
        </mesh>
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={i} rotation={[0, (i / 9) * Math.PI * 2, 0]}>
            <boxGeometry args={[0.02, 0.28, 0.08]} />
            <meshStandardMaterial 
              color={level >= 4 ? rgbColor : '#555'} 
              transparent 
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// PC Case (simplified representation)
function PCCase({ level, color }: { level: number; color: string }) {
  const [rgbHue, setRgbHue] = useState(0);
  
  useFrame((state) => {
    if (level >= 4) {
      setRgbHue((state.clock.elapsedTime * 60) % 360);
    }
  });

  const rgbColor = `hsl(${rgbHue}, 100%, 60%)`;

  return (
    <group>
      {/* Mini case frame representation */}
      <RoundedBox args={[1.2, 1.4, 0.8]} radius={0.05}>
        <meshStandardMaterial 
          color={level >= 3 ? '#1a1a2e' : '#2a2a2e'} 
          metalness={0.8} 
          roughness={0.2} 
          transparent
          opacity={0.8}
        />
      </RoundedBox>
      
      {/* Glass panel */}
      <mesh position={[0, 0, 0.41]}>
        <boxGeometry args={[1, 1.2, 0.02]} />
        <meshStandardMaterial color="#111" transparent opacity={0.3} metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Mesh front panel */}
      <group position={[0, 0, -0.41]}>
        {Array.from({ length: 15 }).map((_, i) => (
          <mesh key={i} position={[0, -0.5 + i * 0.07, 0]}>
            <boxGeometry args={[0.9, 0.02, 0.02]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        ))}
      </group>
      
      {/* RGB strips */}
      {level >= 3 && (
        <>
          <mesh position={[-0.59, 0, 0.35]}>
            <boxGeometry args={[0.03, 1.3, 0.03]} />
            <meshStandardMaterial 
              color={level >= 4 ? rgbColor : color} 
              emissive={level >= 4 ? rgbColor : color} 
              emissiveIntensity={2} 
            />
          </mesh>
          <mesh position={[0.59, 0, 0.35]}>
            <boxGeometry args={[0.03, 1.3, 0.03]} />
            <meshStandardMaterial 
              color={level >= 4 ? rgbColor : color} 
              emissive={level >= 4 ? rgbColor : color} 
              emissiveIntensity={2} 
            />
          </mesh>
        </>
      )}
    </group>
  );
}

// Main component that selects the right 3D model
export default function DraggableComponent3D({
  component,
  position,
  targetSlot,
  onDragStart,
  onDragEnd,
  isDragging,
  isInstalled,
  upgradeLevel
}: DraggableComponent3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Hover animation
    if (hovered && !isDragging) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
    
    // Installation animation
    if (isInstalled && targetSlot) {
      const t = 0.1;
      groupRef.current.position.x += (targetSlot[0] - groupRef.current.position.x) * t;
      groupRef.current.position.y += (targetSlot[1] - groupRef.current.position.y) * t;
      groupRef.current.position.z += (targetSlot[2] - groupRef.current.position.z) * t;
    }
  });

  const renderComponent = () => {
    const level = Math.max(1, upgradeLevel);
    switch (component.type) {
      case 'ram':
        return <RAMStick level={level} color={component.color} />;
      case 'cpu':
        return <CPUChip level={level} color={component.color} />;
      case 'gpu':
        return <GPUCard level={level} color={component.color} />;
      case 'motherboard':
        return <Motherboard level={level} color={component.color} />;
      case 'storage':
        return <StorageDrive level={level} color={component.color} />;
      case 'psu':
        return <PowerSupply level={level} color={component.color} />;
      case 'cooling':
        return <CPUCooler level={level} color={component.color} />;
      case 'case':
        return <PCCase level={level} color={component.color} />;
      default:
        return (
          <RoundedBox args={[1, 0.5, 0.5]} radius={0.05}>
            <meshStandardMaterial color={component.color} metalness={0.7} roughness={0.3} />
          </RoundedBox>
        );
    }
  };

  const scale = isDragging ? 1.2 : hovered ? 1.1 : 1;

  return (
    <group 
      ref={groupRef} 
      position={position}
      scale={scale}
      onPointerOver={() => { setHovered(true); gl.domElement.style.cursor = 'grab'; }}
      onPointerOut={() => { setHovered(false); gl.domElement.style.cursor = 'auto'; }}
      onPointerDown={() => { onDragStart(); gl.domElement.style.cursor = 'grabbing'; }}
      onPointerUp={() => { onDragEnd(false); gl.domElement.style.cursor = 'grab'; }}
    >
      {renderComponent()}
      <pointLight 
        color={component.color} 
        intensity={hovered || isDragging ? 1 : 0.3} 
        distance={3} 
      />
    </group>
  );
}
