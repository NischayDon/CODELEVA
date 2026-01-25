import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';
import { PCComponent } from '@/store/gameStore';

interface SnapAnimationProps {
  component: PCComponent;
  startPosition: [number, number, number];
  endPosition: [number, number, number];
  isActive: boolean;
  onComplete: () => void;
  upgradeLevel: number;
}

export default function SnapAnimation({ 
  component, 
  startPosition, 
  endPosition, 
  isActive, 
  onComplete,
  upgradeLevel
}: SnapAnimationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    if (isActive && !isAnimating) {
      setIsAnimating(true);
      setProgress(0);
    }
  }, [isActive, isAnimating]);

  useFrame((state, delta) => {
    if (!isAnimating || !groupRef.current) return;

    // Easing function for snap effect (overshoot then settle)
    const easeOutBack = (t: number): number => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    };

    // Update progress
    const newProgress = Math.min(progress + delta * 3, 1);
    setProgress(newProgress);

    // Calculate position with easing
    const eased = easeOutBack(newProgress);
    const x = startPosition[0] + (endPosition[0] - startPosition[0]) * eased;
    const y = startPosition[1] + (endPosition[1] - startPosition[1]) * eased;
    const z = startPosition[2] + (endPosition[2] - startPosition[2]) * eased;

    groupRef.current.position.set(x, y, z);

    // Scale bounce effect
    const scaleProgress = Math.min(newProgress * 1.5, 1);
    const scaleBounce = 1 + Math.sin(scaleProgress * Math.PI) * 0.3;
    groupRef.current.scale.setScalar(scaleBounce);

    // Rotation wobble
    const wobble = Math.sin(newProgress * Math.PI * 4) * (1 - newProgress) * 0.1;
    groupRef.current.rotation.z = wobble;

    // Flash on landing
    if (newProgress >= 0.9 && !showFlash) {
      setShowFlash(true);
    }

    // Complete animation
    if (newProgress >= 1) {
      setIsAnimating(false);
      groupRef.current.scale.setScalar(1);
      groupRef.current.rotation.z = 0;
      onComplete();
    }
  });

  if (!isActive && !isAnimating) return null;

  return (
    <group ref={groupRef} position={startPosition}>
      {/* Simplified component visual during animation */}
      <RoundedBox args={[1, 0.5, 0.5]} radius={0.05}>
        <meshStandardMaterial 
          color={component.color} 
          metalness={0.7} 
          roughness={0.3}
          emissive={component.color}
          emissiveIntensity={showFlash ? 0.8 : 0.2}
        />
      </RoundedBox>

      {/* Trailing glow */}
      <mesh position={[0, 0, -0.3]} scale={[1.2, 0.7, 0.3]}>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshBasicMaterial
          color={component.color}
          transparent
          opacity={0.3 * (1 - progress)}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Motion trail */}
      {Array.from({ length: 5 }).map((_, i) => {
        const trailProgress = Math.max(0, progress - i * 0.05);
        const opacity = 0.2 * (1 - i / 5) * (1 - progress);
        return (
          <mesh 
            key={i} 
            position={[0, 0, -0.2 * (i + 1)]}
            scale={[1 - i * 0.1, 0.5 - i * 0.05, 0.1]}
          >
            <boxGeometry />
            <meshBasicMaterial
              color={component.color}
              transparent
              opacity={opacity}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}

      {/* Installation label */}
      <Html position={[0, 0.8, 0]} center>
        <div className="text-xs font-mono text-primary bg-background/90 px-2 py-1 rounded-full animate-pulse whitespace-nowrap border border-primary/30">
          ⚡ Installing {component.name}
        </div>
      </Html>

      {/* Point light for glow effect */}
      <pointLight 
        color={component.color} 
        intensity={2 + Math.sin(progress * Math.PI * 4)} 
        distance={4} 
      />
    </group>
  );
}
