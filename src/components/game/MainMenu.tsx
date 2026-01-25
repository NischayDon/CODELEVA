import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Text3D, Center, RoundedBox, Sparkles } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Play, BookOpen, Settings, Trophy } from 'lucide-react';
import * as THREE from 'three';

function PCCase() {
  const meshRef = useRef<THREE.Group>(null);

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={meshRef}>
        {/* Main Case Body */}
        <RoundedBox args={[3, 4, 1.5]} radius={0.1} smoothness={4} position={[0, 0, 0]}>
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </RoundedBox>

        {/* Glass Panel */}
        <RoundedBox args={[2.8, 3.8, 0.05]} radius={0.05} position={[0, 0, 0.75]}>
          <meshStandardMaterial color="#00d4ff" transparent opacity={0.15} metalness={0.9} roughness={0.1} />
        </RoundedBox>

        {/* RGB Strips */}
        <mesh position={[-1.4, 0, 0.5]}>
          <boxGeometry args={[0.05, 3.5, 0.1]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={2} />
        </mesh>
        <mesh position={[1.4, 0, 0.5]}>
          <boxGeometry args={[0.05, 3.5, 0.1]} />
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2} />
        </mesh>

        {/* Component slots (glowing) */}
        {[1.2, 0.4, -0.4, -1.2].map((y, i) => (
          <mesh key={i} position={[0, y, 0.3]}>
            <boxGeometry args={[2.2, 0.5, 0.3]} />
            <meshStandardMaterial
              color={i === 0 ? '#22c55e' : i === 1 ? '#a855f7' : i === 2 ? '#f59e0b' : '#ec4899'}
              emissive={i === 0 ? '#22c55e' : i === 1 ? '#a855f7' : i === 2 ? '#f59e0b' : '#ec4899'}
              emissiveIntensity={0.5}
              transparent
              opacity={0.6}
            />
          </mesh>
        ))}

        {/* Fans */}
        <mesh position={[0, 1.5, -0.7]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={1} transparent opacity={0.7} />
        </mesh>
      </group>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00d4ff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
      <spotLight position={[0, 10, 5]} intensity={1} angle={0.3} penumbra={1} color="#ffffff" />

      <Sparkles count={100} scale={10} size={2} speed={0.5} color="#00d4ff" />

      <PCCase />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 3}
      />
    </>
  );
}

export default function MainMenu() {
  const { setCurrentScreen } = useGameStore();

  return (
    <div className="min-h-screen bg-background circuit-pattern relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-[100px]" />
      </div>

      {/* 3D Scene */}
      <div className="absolute inset-0 opacity-80">
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {/* Logo and Title */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{
              textShadow: [
                "0 0 20px hsl(185 100% 50% / 0.5)",
                "0 0 40px hsl(185 100% 50% / 0.8)",
                "0 0 20px hsl(185 100% 50% / 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <h1 className="text-6xl md:text-8xl font-display font-black text-primary tracking-wider mb-2">
              CODELEVA
            </h1>
          </motion.div>
          <h2 className="text-2xl md:text-4xl font-display text-secondary tracking-widest">
            QUEST
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-md mx-auto">
            Build a PC. Learn to code. Master Python & C++.
          </p>
        </motion.div>

        {/* Menu Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col gap-4 w-full max-w-xs"
        >
          <Button
            variant="neon"
            size="xl"
            onClick={() => setCurrentScreen('workshop')}
            className="w-full"
          >
            <Play className="mr-2 h-5 w-5" />
            Start Building
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => setCurrentScreen('workshop')}
            className="w-full"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            Continue Quest
          </Button>

          <div className="flex gap-4 mt-4">
            <Button variant="glass" size="lg" className="flex-1">
              <Trophy className="mr-2 h-5 w-5" />
              Leaderboard
            </Button>
            <Button variant="glass" size="lg" className="flex-1">
              <Settings className="mr-2 h-5 w-5" />
              Settings
            </Button>
          </div>
        </motion.div>

        {/* Language Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex gap-4 mt-12"
        >
          <div className="px-4 py-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan font-mono text-sm">
            Python 3.x
          </div>
          <div className="px-4 py-2 rounded-lg bg-neon-purple/10 border border-neon-purple/30 text-neon-purple font-mono text-sm">
            C++ 20
          </div>
        </motion.div>

        {/* Credits */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="absolute bottom-6 text-sm text-muted-foreground/60"
        >
          Inspired by CODELEVA: Personal Programming Tutor • Musaliar College of Engineering
        </motion.p>
      </div>
    </div>
  );
}
