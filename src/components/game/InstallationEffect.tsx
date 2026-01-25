import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface InstallationEffectProps {
  position: [number, number, number];
  color: string;
  isActive: boolean;
  onComplete: () => void;
}

// Particle system for installation celebration
function Particles({ position, color, count = 30 }: { position: [number, number, number]; color: string; count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const particlesRef = useRef<{ velocity: THREE.Vector3; life: number }[]>([]);
  
  useEffect(() => {
    particlesRef.current = Array.from({ length: count }).map(() => ({
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        Math.random() * 2 + 1,
        (Math.random() - 0.5) * 3
      ),
      life: 1
    }));
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const positions = pointsRef.current.geometry.attributes.position;
    
    for (let i = 0; i < count; i++) {
      const particle = particlesRef.current[i];
      if (!particle) continue;
      
      // Apply gravity and velocity
      particle.velocity.y -= delta * 3;
      particle.life -= delta * 0.8;
      
      positions.setXYZ(
        i,
        positions.getX(i) + particle.velocity.x * delta,
        positions.getY(i) + particle.velocity.y * delta,
        positions.getZ(i) + particle.velocity.z * delta
      );
    }
    positions.needsUpdate = true;
  });

  const particlePositions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    particlePositions[i * 3] = position[0];
    particlePositions[i * 3 + 1] = position[1];
    particlePositions[i * 3 + 2] = position[2];
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particlePositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Expanding ring effect
function ShockwaveRing({ position, color }: { position: [number, number, number]; color: string }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const [scale, setScale] = useState(0.1);
  const [opacity, setOpacity] = useState(1);

  useFrame((state, delta) => {
    setScale(prev => Math.min(prev + delta * 4, 3));
    setOpacity(prev => Math.max(prev - delta * 1.5, 0));
  });

  return (
    <mesh ref={ringRef} position={position} rotation={[-Math.PI / 2, 0, 0]} scale={scale}>
      <ringGeometry args={[0.8, 1, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Glow sphere effect
function GlowSphere({ position, color }: { position: [number, number, number]; color: string }) {
  const sphereRef = useRef<THREE.Mesh>(null);
  const [scale, setScale] = useState(0.5);
  const [intensity, setIntensity] = useState(2);

  useFrame((state, delta) => {
    // Pulse then fade
    const time = state.clock.elapsedTime;
    const pulse = 1 + Math.sin(time * 10) * 0.2;
    setScale(prev => Math.min(prev * pulse, 2));
    setIntensity(prev => Math.max(prev - delta * 2, 0));
  });

  return (
    <group position={position}>
      <mesh ref={sphereRef} scale={scale}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={intensity * 0.5}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <pointLight color={color} intensity={intensity * 2} distance={5} />
    </group>
  );
}

// Spark lines shooting outward
function Sparks({ position, color, count = 12 }: { position: [number, number, number]; color: string; count?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const [progress, setProgress] = useState(0);

  useFrame((state, delta) => {
    setProgress(prev => Math.min(prev + delta * 2, 1));
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 2;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const length = progress * 1.5;
        const x = Math.cos(angle) * length;
        const z = Math.sin(angle) * length;
        
        return (
          <mesh key={i} position={[x / 2, 0, z / 2]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[length, 0.03, 0.03]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={1 - progress}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Main installation effect component
export default function InstallationEffect({ position, color, isActive, onComplete }: InstallationEffectProps) {
  const [showEffect, setShowEffect] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (isActive) {
      setShowEffect(true);
      setPhase(1);
      
      // Phase progression
      const timer1 = setTimeout(() => setPhase(2), 200);
      const timer2 = setTimeout(() => setPhase(3), 400);
      const timer3 = setTimeout(() => {
        setShowEffect(false);
        setPhase(0);
        onComplete();
      }, 1500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isActive, onComplete]);

  if (!showEffect) return null;

  return (
    <group>
      {/* Initial flash */}
      {phase >= 1 && <GlowSphere position={position} color={color} />}
      
      {/* Shockwave rings */}
      {phase >= 2 && (
        <>
          <ShockwaveRing position={position} color={color} />
          <ShockwaveRing position={[position[0], position[1] + 0.1, position[2]]} color="#ffffff" />
        </>
      )}
      
      {/* Particles and sparks */}
      {phase >= 3 && (
        <>
          <Particles position={position} color={color} count={40} />
          <Sparks position={position} color={color} />
        </>
      )}
    </group>
  );
}
