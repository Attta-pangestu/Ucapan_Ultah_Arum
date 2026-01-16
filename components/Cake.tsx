import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Text, Torus } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';
import { Phase } from '../types';
import { AudioManager } from '../utils/audio';
import gsap from 'gsap';

export const Cake: React.FC = () => {
  const phase = useStore(state => state.phase);
  const setPhase = useStore(state => state.setPhase);
  const groupRef = useRef<THREE.Group>(null);
  const flameRef1 = useRef<THREE.Mesh>(null);
  const flameRef2 = useRef<THREE.Mesh>(null);
  const lightRef1 = useRef<THREE.PointLight>(null);
  const lightRef2 = useRef<THREE.PointLight>(null);
  const [blown, setBlown] = useState(false);

  // Floating animation for the cake
  useFrame((state) => {
    if (groupRef.current && phase === Phase.Cake) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1 - 0.8;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }

    // Flicker flames
    if (!blown && phase <= Phase.Cake) {
      const flicker = 0.8 + Math.random() * 0.4;
      if (flameRef1.current) {
        flameRef1.current.scale.setScalar(flicker);
        flameRef1.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.1;
      }
      if (flameRef2.current) {
        flameRef2.current.scale.setScalar(flicker);
        flameRef2.current.rotation.z = Math.cos(state.clock.elapsedTime * 12) * 0.1;
      }
      if (lightRef1.current) lightRef1.current.intensity = flicker * 1.5;
      if (lightRef2.current) lightRef2.current.intensity = flicker * 1.5;
    }
  });

  const blowCandles = () => {
    if (phase !== Phase.Cake || blown) return;
    setBlown(true);
    setPhase(Phase.Blowing);
    AudioManager.stopMicrophone();
    AudioManager.fadeOutBgm();

    // Animate lights out
    if (lightRef1.current) gsap.to(lightRef1.current, { intensity: 0, duration: 0.5 });
    if (lightRef2.current) gsap.to(lightRef2.current, { intensity: 0, duration: 0.5 });
    if (flameRef1.current) gsap.to(flameRef1.current.scale, { x: 0, y: 0, z: 0, duration: 0.2 });
    if (flameRef2.current) gsap.to(flameRef2.current.scale, { x: 0, y: 0, z: 0, duration: 0.2 });

    // Wait for darkness then trigger fireworks
    setTimeout(() => {
      setPhase(Phase.Fireworks);
    }, 2000);
  };

  // Listen for external blow trigger if mic is used
  React.useEffect(() => {
    if (phase === Phase.Cake) {
      AudioManager.startMicrophoneDetection(blowCandles);
    }
    return () => AudioManager.stopMicrophone();
  }, [phase]);

  const matchaColor = "#7BA05B"; // Richer matcha green
  const spongeColor = "#8DAF6E"; // Slightly lighter texture
  const creamColor = "#FFFAF0"; // Warm white cream
  const plateColor = "#E0E0E0";
  const strawberryColor = "#D32F2F";

  // Decorative piping generator
  const pipingCount = 12;
  const pipingRadius = 1.35;
  const pipings = Array.from({ length: pipingCount }).map((_, i) => {
    const angle = (i / pipingCount) * Math.PI * 2;
    return {
      x: Math.cos(angle) * pipingRadius,
      z: Math.sin(angle) * pipingRadius,
    };
  });

  // Toppings generator (Strawberries)
  const strawberryPositions = [
      { x: 0.8, z: 0.8, r: -Math.PI/4 },
      { x: -0.8, z: 0.8, r: Math.PI/4 },
      { x: 0.8, z: -0.8, r: -Math.PI*0.75 },
      { x: -0.8, z: -0.8, r: Math.PI*0.75 },
  ];

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {/* Plate */}
      <Cylinder args={[2.2, 2, 0.1, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial color={plateColor} roughness={0.2} metalness={0.1} />
      </Cylinder>

      {/* --- Cake Base --- */}
      <group position={[0, 0.1, 0]}>
        {/* Bottom Sponge Layer */}
        <Cylinder args={[1.5, 1.5, 0.5, 64]} position={[0, 0.25, 0]}>
          <meshStandardMaterial color={spongeColor} roughness={0.8} />
        </Cylinder>
        
        {/* Cream Filling Layer */}
        <Cylinder args={[1.5, 1.5, 0.15, 64]} position={[0, 0.575, 0]}>
          <meshStandardMaterial color={creamColor} roughness={0.4} />
        </Cylinder>

        {/* Top Sponge Layer */}
        <Cylinder args={[1.5, 1.5, 0.5, 64]} position={[0, 0.9, 0]}>
          <meshStandardMaterial color={spongeColor} roughness={0.8} />
        </Cylinder>

        {/* Top Frosting */}
        <Cylinder args={[1.52, 1.52, 0.1, 64]} position={[0, 1.2, 0]}>
            <meshStandardMaterial color={matchaColor} roughness={0.5} />
        </Cylinder>
      </group>

      {/* --- Decorations --- */}
      <group position={[0, 1.3, 0]}>
        {/* Cream Piping Ring */}
        {pipings.map((pos, i) => (
           <mesh key={i} position={[pos.x, 0, pos.z]}>
             <sphereGeometry args={[0.15, 16, 16]} />
             <meshStandardMaterial color={creamColor} roughness={0.3} />
           </mesh>
        ))}

        {/* Strawberries */}
        {strawberryPositions.map((pos, i) => (
            <group key={`sb-${i}`} position={[pos.x, 0.1, pos.z]} rotation={[0, pos.r, 0]}>
                <mesh>
                    <coneGeometry args={[0.15, 0.35, 16]} />
                    <meshStandardMaterial color={strawberryColor} roughness={0.4} />
                </mesh>
                {/* Green leaf/stem detail */}
                <mesh position={[0, 0.15, 0]}>
                    <cylinderGeometry args={[0.08, 0.02, 0.1, 5]} />
                    <meshStandardMaterial color="green" />
                </mesh>
            </group>
        ))}
      </group>

      {/* --- Candles --- */}
      {/* Candle 1 (Left - '2') */}
      <group position={[-0.3, 1.35, 0.2]} rotation={[0, -0.1, 0]}>
        <Cylinder args={[0.06, 0.06, 0.8, 16]} position={[0, 0.4, 0]}>
          <meshStandardMaterial color="#FFFAF0" />
        </Cylinder>
        <Text
          position={[0, 0.5, 0.08]}
          fontSize={0.4}
          color="#FFD700"
          font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxM.woff"
          anchorX="center"
          anchorY="middle"
        >
          2
        </Text>
        <mesh ref={flameRef1} position={[0, 0.9, 0]}>
          <coneGeometry args={[0.06, 0.2, 8]} />
          <meshBasicMaterial color="#ffaa00" toneMapped={false} />
        </mesh>
        <pointLight ref={lightRef1} distance={4} decay={2} color="#ff6600" position={[0, 0.95, 0]} intensity={1.5} />
      </group>

      {/* Candle 2 (Right - '6') */}
      <group position={[0.3, 1.35, 0.2]} rotation={[0, 0.1, 0]}>
        <Cylinder args={[0.06, 0.06, 0.8, 16]} position={[0, 0.4, 0]}>
          <meshStandardMaterial color="#FFFAF0" />
        </Cylinder>
         <Text
          position={[0, 0.5, 0.08]}
          fontSize={0.4}
          color="#FFD700"
          font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxM.woff"
          anchorX="center"
          anchorY="middle"
        >
          6
        </Text>
        <mesh ref={flameRef2} position={[0, 0.9, 0]}>
          <coneGeometry args={[0.06, 0.2, 8]} />
          <meshBasicMaterial color="#ffaa00" toneMapped={false} />
        </mesh>
        <pointLight ref={lightRef2} distance={4} decay={2} color="#ff6600" position={[0, 0.95, 0]} intensity={1.5} />
      </group>

      {/* Interaction Zone */}
      {phase === Phase.Cake && (
        <mesh position={[0, 2, 0]} onClick={blowCandles} visible={false}>
          <boxGeometry args={[4, 4, 4]} />
        </mesh>
      )}
    </group>
  );
};