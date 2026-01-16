import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Text, Torus, Sphere, Cone, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';
import { Phase } from '../types';
import { AudioManager } from '../utils/audio';
import gsap from 'gsap';

// Wind effect particles for blowing animation
const BlowParticles: React.FC<{ active: boolean }> = ({ active }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const COUNT = 100;

  const [positions] = useState(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT * 3; i += 3) {
      arr[i] = (Math.random() - 0.5) * 0.2; // Small area around candles
      arr[i + 1] = (Math.random() - 0.5) * 0.2;
      arr[i + 2] = (Math.random() - 0.5) * 0.2;
    }
    return arr;
  });

  const [velocities] = useState(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT * 3; i += 3) {
      arr[i] = (Math.random() - 0.5) * 0.05;
      arr[i + 1] = Math.random() * 0.1 + 0.05; // Move upward
      arr[i + 2] = (Math.random() - 0.5) * 0.05;
    }
    return arr;
  });

  useFrame(() => {
    if (!active || !pointsRef.current) return;

    const posAttr = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < COUNT; i++) {
      const idx = i * 3;
      positions[idx] += velocities[idx];
      positions[idx + 1] += velocities[idx + 1];
      positions[idx + 2] += velocities[idx + 2];

      // Reset when moved too far
      if (positions[idx + 1] > 2) {
        positions[idx] = (Math.random() - 0.5) * 0.2;
        positions[idx + 1] = (Math.random() - 0.5) * 0.2;
        positions[idx + 2] = (Math.random() - 0.5) * 0.2;
      }

      posAttr.setXYZ(i, positions[idx], positions[idx + 1], positions[idx + 2]);
    }
    posAttr.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={pointsRef} position={[0, 1.5, 0.5]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
};

// Fireworks effect
const Fireworks: React.FC<{ active: boolean }> = ({ active }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [fireworkPositions] = useState(() => {
    const positions = [];
    for (let i = 0; i < 5; i++) {
      positions.push({
        x: (Math.random() - 0.5) * 10,
        y: 5 + Math.random() * 5,
        z: -5 - Math.random() * 5,
        colors: [
          new THREE.Color(`hsl(${Math.random() * 360}, 100%, 60%)`),
          new THREE.Color(`hsl(${Math.random() * 360}, 100%, 60%)`),
          new THREE.Color(`hsl(${Math.random() * 360}, 100%, 60%)`)
        ]
      });
    }
    return positions;
  });

  if (!active) return null;

  return (
    <group ref={groupRef}>
      {fireworkPositions.map((pos, idx) => (
        <group key={idx} position={[pos.x, pos.y, pos.z]}>
          {Array.from({ length: 50 }).map((_, i) => {
            const angle = (i / 50) * Math.PI * 2;
            const radius = 0.5 + Math.random() * 1.5;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const z = (Math.random() - 0.5) * 0.5;
            const color = pos.colors[Math.floor(Math.random() * pos.colors.length)];

            return (
              <Sphere key={i} position={[x, y, z]} args={[0.05, 8, 8]}>
                <meshBasicMaterial color={color} />
              </Sphere>
            );
          })}
        </group>
      ))}
    </group>
  );
};

// Confetti effect
const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const COUNT = 300;

  const [positions] = useState(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT * 3; i += 3) {
      arr[i] = (Math.random() - 0.5) * 20;
      arr[i + 1] = 10 + Math.random() * 10;
      arr[i + 2] = -5 - Math.random() * 10;
    }
    return arr;
  });

  const [velocities] = useState(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT * 3; i += 3) {
      arr[i] = (Math.random() - 0.5) * 0.2;
      arr[i + 1] = -0.1 - Math.random() * 0.15;
      arr[i + 2] = (Math.random() - 0.5) * 0.1;
    }
    return arr;
  });

  const [colors] = useState(() => {
    const arr = new Float32Array(COUNT * 3);
    const palette = [
      new THREE.Color('#FFD700'), // Gold
      new THREE.Color('#FF6B9D'), // Pink
      new THREE.Color('#7BA05B'), // Matcha Green
      new THREE.Color('#87CEEB'), // Sky Blue
      new THREE.Color('#DDA0DD'), // Plum
      new THREE.Color('#FF8C00'), // Orange
    ];
    for (let i = 0; i < COUNT; i++) {
      const color = palette[Math.floor(Math.random() * palette.length)];
      arr[i * 3] = color.r;
      arr[i * 3 + 1] = color.g;
      arr[i * 3 + 2] = color.b;
    }
    return arr;
  });

  useFrame(() => {
    if (!active || !pointsRef.current) return;

    const posAttr = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < COUNT; i++) {
      const idx = i * 3;
      positions[idx] += velocities[idx];
      positions[idx + 1] += velocities[idx + 1];
      positions[idx + 2] += velocities[idx + 2];

      // Reset when fallen
      if (positions[idx + 1] < -5) {
        positions[idx] = (Math.random() - 0.5) * 20;
        positions[idx + 1] = 10 + Math.random() * 10;
        positions[idx + 2] = -5 - Math.random() * 10;
      }

      posAttr.setXYZ(i, positions[idx], positions[idx + 1], positions[idx + 2]);
    }
    posAttr.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={COUNT}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// Balloons
const Balloons: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;

  const balloonColors = ["#FF6B6B", "#4ECDC4", "#FFD93D", "#6C5CE7", "#FF9FF3"];
  const name = "ARUM";

  return (
    <group>
      {name.split('').map((char, i) => (
        <Float key={i} speed={2} rotationIntensity={0.2} floatIntensity={1.5} position={[(i - 1.5) * 2, 8, -8]}>
          <group>
            <Sphere args={[0.7, 32, 32]}>
              <meshStandardMaterial color={balloonColors[i % balloonColors.length]} metalness={0.1} roughness={0.2} />
            </Sphere>
            <Text position={[0, 0, 0.72]} fontSize={0.7} color="white" anchorX="center" anchorY="middle">
              {char}
            </Text>
            <mesh position={[0, -1.2, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 1.5]} />
              <meshBasicMaterial color="white" transparent opacity={0.6} />
            </mesh>
          </group>
        </Float>
      ))}
    </group>
  );
};

// Rainbow
const Rainbow: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;

  const segments = 20;
  const radius = 8;

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 3, -5]}>
      {Array.from({ length: 7 }).map((_, i) => {
        const color = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'][i];
        const innerRadius = radius + i * 0.3;

        return (
          <mesh key={i} rotation={[0, 0, 0]}>
            <ringGeometry args={[innerRadius, innerRadius + 0.25, segments, 1, 0, Math.PI]} />
            <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.7} />
          </mesh>
        );
      })}
    </group>
  );
};

export const Cake: React.FC = () => {
  const phase = useStore(state => state.phase);
  const setPhase = useStore(state => state.setPhase);
  const groupRef = useRef<THREE.Group>(null);
  const flameRef1 = useRef<THREE.Mesh>(null);
  const flameRef2 = useRef<THREE.Mesh>(null);
  const lightRef1 = useRef<THREE.PointLight>(null);
  const lightRef2 = useRef<THREE.PointLight>(null);
  const [blown, setBlown] = useState(false);
  const [showEffects, setShowEffects] = useState(false);

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
    setShowEffects(true);

    // Animate lights out
    if (lightRef1.current) gsap.to(lightRef1.current, { intensity: 0, duration: 0.5 });
    if (lightRef2.current) gsap.to(lightRef2.current, { intensity: 0, duration: 0.5 });
    if (flameRef1.current) gsap.to(flameRef1.current.scale, { x: 0, y: 0, z: 0, duration: 0.2 });
    if (flameRef2.current) gsap.to(flameRef2.current.scale, { x: 0, y: 0, z: 0, duration: 0.2 });

    // Transition sequence: Effects -> Bright Light -> Interruption -> Beach
    setTimeout(() => {
      // Turn on bright ambient light to make scene brighter
      setPhase(Phase.Interruption);

      // Show effects for a while before transitioning
      setTimeout(() => {
        setPhase(Phase.Beach);
      }, 4000);
    }, 2500);
  };

  if (phase < Phase.Cake) return null;

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {/* Ambient light adjustment for brightness transition */}
      {phase >= Phase.Blowing && <ambientLight intensity={1.5} color="#FFFFFF" />}

      {/* Directional light for brighter scene */}
      {phase >= Phase.Blowing && <directionalLight position={[10, 10, 5]} intensity={2} color="#FFFFFF" />}

      {/* Blow particles effect */}
      <BlowParticles active={blown} />

      {/* Fireworks effect */}
      <Fireworks active={showEffects} />

      {/* Confetti effect */}
      <Confetti active={showEffects} />

      {/* Balloons effect */}
      <Balloons active={showEffects} />

      {/* Rainbow effect */}
      <Rainbow active={showEffects} />

      {/* Plate */}
      <Cylinder args={[2.2, 2, 0.1, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#E0E0E0" roughness={0.2} metalness={0.1} />
      </Cylinder>

      {/* --- Cake Base --- */}
      <group position={[0, 0.1, 0]}>
        <Cylinder args={[1.5, 1.5, 0.5, 64]} position={[0, 0.25, 0]}>
          <meshStandardMaterial color="#8DAF6E" roughness={0.8} />
        </Cylinder>
        <Cylinder args={[1.5, 1.5, 0.15, 64]} position={[0, 0.575, 0]}>
          <meshStandardMaterial color="#FFFAF0" roughness={0.4} />
        </Cylinder>
        <Cylinder args={[1.5, 1.5, 0.5, 64]} position={[0, 0.9, 0]}>
          <meshStandardMaterial color="#8DAF6E" roughness={0.8} />
        </Cylinder>
        <Cylinder args={[1.52, 1.52, 0.1, 64]} position={[0, 1.2, 0]}>
          <meshStandardMaterial color="#7BA05B" roughness={0.5} />
        </Cylinder>

        {/* --- NAME ON CAKE --- */}
        <Text
            position={[0, 0.6, 1.51]}
            fontSize={0.35}
            color="#FFF"
            anchorX="center"
            anchorY="middle"
        >
            ARUM
        </Text>
      </group>

      {/* --- Decorations --- */}
      <group position={[0, 1.3, 0]}>
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i / 16) * Math.PI * 2;
          const x = Math.cos(angle) * 1.35;
          const z = Math.sin(angle) * 1.35;
          return (
            <mesh key={i} position={[x, 0, z]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color="#FFFAF0" roughness={0.3} />
            </mesh>
          );
        })}

        {[
          { x: 0.8, z: 0.8, r: -Math.PI / 4 },
          { x: -0.8, z: 0.8, r: Math.PI / 4 },
          { x: 0.8, z: -0.8, r: -Math.PI * 0.75 },
          { x: -0.8, z: -0.8, r: Math.PI * 0.75 },
        ].map((pos, i) => (
          <group key={`sb-${i}`} position={[pos.x, 0.1, pos.z]} rotation={[0, pos.r, 0]}>
            <mesh>
              <coneGeometry args={[0.15, 0.35, 16]} />
              <meshStandardMaterial color="#D32F2F" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.08, 0.02, 0.1, 5]} />
              <meshStandardMaterial color="green" />
            </mesh>
          </group>
        ))}
      </group>

      {/* --- Candles --- */}
      <group position={[-0.3, 1.35, 0.2]} rotation={[0, -0.1, 0]}>
        <Cylinder args={[0.06, 0.06, 0.8, 16]} position={[0, 0.4, 0]}>
          <meshStandardMaterial color="#FFFAF0" />
        </Cylinder>
        <Text position={[0, 0.5, 0.08]} fontSize={0.4} color="#FFD700" anchorX="center" anchorY="middle">2</Text>
        <mesh ref={flameRef1} position={[0, 0.9, 0]}>
          <coneGeometry args={[0.06, 0.2, 8]} />
          <meshBasicMaterial color="#ffaa00" toneMapped={false} />
        </mesh>
        <pointLight ref={lightRef1} distance={4} decay={2} color="#ff6600" position={[0, 0.95, 0]} intensity={1.5} />
      </group>

      <group position={[0.3, 1.35, 0.2]} rotation={[0, 0.1, 0]}>
        <Cylinder args={[0.06, 0.06, 0.8, 16]} position={[0, 0.4, 0]}>
          <meshStandardMaterial color="#FFFAF0" />
        </Cylinder>
        <Text position={[0, 0.5, 0.08]} fontSize={0.4} color="#FFD700" anchorX="center" anchorY="middle">6</Text>
        <mesh ref={flameRef2} position={[0, 0.9, 0]}>
          <coneGeometry args={[0.06, 0.2, 8]} />
          <meshBasicMaterial color="#ffaa00" toneMapped={false} />
        </mesh>
        <pointLight ref={lightRef2} distance={4} decay={2} color="#ff6600" position={[0, 0.95, 0]} intensity={1.5} />
      </group>

      {/* Interaction Zone */}
      {phase === Phase.Cake && (
        <mesh position={[0, 2, 0]} onClick={blowCandles}>
          <boxGeometry args={[4, 4, 4]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}
    </group>
  );
};