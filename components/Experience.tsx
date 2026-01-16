import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Cake } from './Cake';
import { Envelope } from './Envelope';
import { Appreciation } from './Appreciation';
import { BeachWorld } from './BeachWorld';
import { useStore } from '../store';
import { Phase } from '../types';

const CameraRig = () => {
  const { camera, viewport } = useThree();
  const phase = useStore(state => state.phase);
  const isInteracting = useStore(state => state.isInteracting);

  // Simple mobile detection based on aspect ratio
  const isMobile = viewport.width < viewport.height;

  useFrame((state, delta) => {
    let targetPos: THREE.Vector3;
    let targetLookAt = new THREE.Vector3(0, 0, 0);

    // Distance multipliers for mobile
    const dist = isMobile ? 1.5 : 1.0; 
    const heightOffset = isMobile ? 0.5 : 0;

    switch (phase) {
      case Phase.Envelope:
        targetPos = new THREE.Vector3(0, 0, 5 * dist);
        break;
      case Phase.Appreciation:
        targetPos = new THREE.Vector3(0, 0, 6 * dist);
        break;
      case Phase.Cake:
      case Phase.Blowing:
        targetPos = new THREE.Vector3(0, 2 + heightOffset, 5 * dist);
        targetLookAt = new THREE.Vector3(0, 0, 0);
        break;
      case Phase.Beach:
        // Position camera to see the beach scene
        targetPos = new THREE.Vector3(0, 2, 8 * (isMobile ? 1.4 : 1.0));
        targetLookAt = new THREE.Vector3(0, 1, 0);
        break;
      default:
        targetPos = new THREE.Vector3(0, 0, 5 * dist);
    }

    if (!isInteracting && phase !== Phase.Beach) {
      // Only auto-move camera if NOT in beach mode (let user control beach cam)
      state.camera.position.lerp(targetPos, 2 * delta);
      state.camera.lookAt(targetLookAt);
    }
  });

  return null;
};

// Dynamic Background Color Transition
const BackgroundController: React.FC = () => {
    const phase = useStore(state => state.phase);
    const colorRef = useRef(new THREE.Color('#F5E6D3')); 

    useFrame((state) => {
        let targetHex = '#F5E6D3'; // Default Pastel

        if (phase === Phase.Cake || phase === Phase.Blowing || phase === Phase.Interruption) {
            targetHex = '#050505'; // Dark for cake
        } else if (phase === Phase.Beach) {
            targetHex = '#87CEEB'; // Sky Blue for Beach
        }
        
        const targetColor = new THREE.Color(targetHex);
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
        // Reset controls for Beach exploration
      if (phase === Phase.Beach) {
        controlsRef.current.target.set(0, 1, 0);
        controlsRef.current.maxPolarAngle = Math.PI / 2 - 0.1; // Don't go below ground
      } else if (phase === Phase.Cake) {
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
        return 0.6; 
      case Phase.Appreciation:
        return 0.5;
      case Phase.Cake:
        return 0.4;
      case Phase.Blowing:
      case Phase.Interruption:
        return 0.05;
      case Phase.Beach:
        return 0.8; // Bright sun
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

      {/* Stars only visible in dark cake phases */}
      {(phase === Phase.Cake || phase === Phase.Blowing || phase === Phase.Interruption) && (
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
        <BeachWorld />

        <Environment preset={phase === Phase.Beach ? "sunset" : (phase >= Phase.Cake ? "night" : "city")} />
      </Suspense>

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={phase === Phase.Cake || phase === Phase.Blowing || phase === Phase.Beach}
        minDistance={2}
        maxDistance={20}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 6}
        onStart={() => setIsInteracting(true)}
        onEnd={() => setIsInteracting(false)}
        enabled={phase === Phase.Cake || phase === Phase.Blowing || phase === Phase.Beach}
      />
    </Canvas>
  );
};