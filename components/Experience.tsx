import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Cake } from './Cake';
import { Particles } from './Particles';
import { useStore } from '../store';
import { Phase } from '../types';

const CameraRig = () => {
  const { camera } = useThree();
  const phase = useStore(state => state.phase);
  const isInteracting = useStore(state => state.isInteracting);

  useFrame((state, delta) => {
    // Auto-focus behavior during Message phase
    if (phase === Phase.Message && !isInteracting) {
      // Target position: Eye level, zoomed out enough to see full text
      const targetPos = new THREE.Vector3(0, 0, 7.5);
      const targetLookAt = new THREE.Vector3(0, 0, 0);

      // Smoothly interpolate current camera position to target
      state.camera.position.lerp(targetPos, 2 * delta);
      
      // We also want to ensure the controls look at the center
      // Since OrbitControls controls the camera, we can't easily tween lookAt directly without updating controls.target
      // But purely for camera position, the above works if OrbitControls isn't overriding it actively (which happens on drag).
      // A gentle drift back to center:
      state.camera.lookAt(targetLookAt);
    }
  });

  return null;
};

export const Experience: React.FC = () => {
  const phase = useStore(state => state.phase);
  const setIsInteracting = useStore(state => state.setIsInteracting);
  const controlsRef = useRef<any>(null);

  // Update controls target when phase changes to Message to ensure it centers on text
  useEffect(() => {
    if (phase === Phase.Message && controlsRef.current) {
        // Reset the orbit target to center so the text is the pivot
        controlsRef.current.target.set(0, 0, 0);
    }
  }, [phase]);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 2, 5], fov: 50 }}
      gl={{ toneMappingExposure: 1.2 }}
    >
      <color attach="background" args={['#050505']} />
      
      <CameraRig />

      {/* Dynamic Lighting */}
      <ambientLight intensity={phase === Phase.Blowing || phase >= Phase.Fireworks ? 0.05 : 0.2} />
      
      {/* Stars only visible when dark */}
      {phase >= Phase.Blowing && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}

      <Suspense fallback={null}>
        <group visible={phase <= Phase.Blowing}>
            <Cake />
        </group>
        <Particles />
        <Environment preset="night" />
      </Suspense>

      <OrbitControls 
        ref={controlsRef}
        enablePan={false} 
        enableZoom={true} 
        minDistance={2}
        maxDistance={15}
        maxPolarAngle={Math.PI / 1.5} 
        minPolarAngle={Math.PI / 6}
        onStart={() => setIsInteracting(true)}
        onEnd={() => setIsInteracting(false)}
      />
    </Canvas>
  );
};