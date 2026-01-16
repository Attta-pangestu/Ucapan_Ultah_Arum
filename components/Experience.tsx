import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Cake } from './Cake';
import { Envelope } from './Envelope';
import { Appreciation } from './Appreciation';
import { Particles } from './Particles';
import { useStore } from '../store';
import { Phase } from '../types';

const CameraRig = () => {
  const { camera } = useThree();
  const phase = useStore(state => state.phase);
  const isInteracting = useStore(state => state.isInteracting);

  useFrame((state, delta) => {
    let targetPos: THREE.Vector3;
    let targetLookAt = new THREE.Vector3(0, 0, 0);

    switch (phase) {
      case Phase.Envelope:
        targetPos = new THREE.Vector3(0, 0, 5);
        break;
      case Phase.Appreciation:
        targetPos = new THREE.Vector3(0, 0, 6);
        break;
      case Phase.Cake:
      case Phase.Blowing:
        targetPos = new THREE.Vector3(0, 2, 5);
        targetLookAt = new THREE.Vector3(0, 0, 0);
        break;
      case Phase.Fireworks:
      case Phase.Message:
        targetPos = new THREE.Vector3(0, 1, 8);
        break;
      default:
        targetPos = new THREE.Vector3(0, 0, 5);
    }

    if (!isInteracting) {
      state.camera.position.lerp(targetPos, 2 * delta);
      state.camera.lookAt(targetLookAt);
    }
  });

  return null;
};

// Dynamic Background Color Transition
const BackgroundController: React.FC = () => {
    const phase = useStore(state => state.phase);
    const colorRef = useRef(new THREE.Color('#F5E6D3')); // Start Pastel

    useFrame((state) => {
        // Switch to dark when blowing candles or later
        const targetHex = (phase >= Phase.Blowing) ? '#050505' : '#F5E6D3';
        const targetColor = new THREE.Color(targetHex);
        
        // Smooth lerp
        colorRef.current.lerp(targetColor, 0.05);
        state.scene.background = colorRef.current;
    });

    return null;
};

export const Experience: React.FC = () => {
  const phase = useStore(state => state.phase);
  const setIsInteracting = useStore(state => state.setIsInteracting);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (controlsRef.current) {
      if (phase === Phase.Cake || phase === Phase.Blowing) {
        controlsRef.current.target.set(0, 0.5, 0);
      } else {
        controlsRef.current.target.set(0, 0, 0);
      }
    }
  }, [phase]);

  const getAmbientIntensity = () => {
    switch (phase) {
      case Phase.Intro:
        return 0.1;
      case Phase.Envelope:
        return 0.6; // Brighter for pastel
      case Phase.Appreciation:
        return 0.5;
      case Phase.Cake:
        return 0.4;
      case Phase.Blowing:
        return 0.05;
      case Phase.Fireworks:
      case Phase.Message:
        return 0.1;
      default:
        return 0.2;
    }
  };

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{ toneMappingExposure: 1.2 }}
    >
      <BackgroundController />
      <CameraRig />

      <ambientLight intensity={getAmbientIntensity()} />

      {/* Stars only visible in dark phases */}
      {(phase >= Phase.Blowing) && (
        <Stars
          radius={100}
          depth={50}
          count={3000}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />
      )}

      <Suspense fallback={null}>
        <Envelope />
        <Appreciation />
        <Cake />
        <Particles />

        <Environment preset={phase >= Phase.Blowing ? "night" : "city"} />
      </Suspense>

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={phase === Phase.Cake || phase === Phase.Blowing}
        minDistance={2}
        maxDistance={15}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 6}
        onStart={() => setIsInteracting(true)}
        onEnd={() => setIsInteracting(false)}
        enabled={phase === Phase.Cake || phase === Phase.Blowing}
      />
    </Canvas>
  );
};