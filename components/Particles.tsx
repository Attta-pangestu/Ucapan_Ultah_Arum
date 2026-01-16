import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { useStore } from '../store';
import { Phase } from '../types';
import gsap from 'gsap';

// Configuration
const PARTICLE_COUNT = 12000; // Significantly increased for better legibility
const FONT_URL = 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json';

const SHORT_TEXT = "Happy 26th\nArum";
const LONG_TEXT = `Twenty-six:
A year to bloom,
to lead, and to inspire.

Semoga tahun ini menjadi
bab terbaik dalam hidupmu,
penuh dengan keberanian
dan kebahagiaan
yang tak terduga.

Bersinar terus, bintangku.`;

export const Particles: React.FC = () => {
  const phase = useStore(state => state.phase);
  const setPhase = useStore(state => state.setPhase);
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport, mouse } = useThree();

  // Buffers
  const positions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  const targetPositions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  const colors = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  const originalPositions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []); 

  const burstTriggered = useRef(false);

  useEffect(() => {
    const loader = new FontLoader();
    loader.load(FONT_URL, (font) => {
      
      const createTextPoints = (text: string, size: number, yOffset: number) => {
        const geometry = new TextGeometry(text, {
          font: font,
          size: size,
          height: 0, // Flat text is clearer for particles
          curveSegments: 8,
          bevelEnabled: false,
        });
        
        geometry.center();
        geometry.translate(0, yOffset, 0);

        const posAttr = geometry.attributes.position;
        const pts: number[] = [];
        
        // Populate points from geometry vertices
        for(let i=0; i < posAttr.count; i++) {
            pts.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
        }
        return pts;
      };

      // Create geometry points
      const shortPoints = createTextPoints(SHORT_TEXT, 1.2, 0);
      const longPoints = createTextPoints(LONG_TEXT, 0.55, 0); // Adjusted size

      // Helper to fill buffer with random sampling from source points if fewer points than particles
      const fillBuffer = (targetBuffer: Float32Array, sourcePoints: number[]) => {
        const numSourcePoints = sourcePoints.length / 3;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          // Random sampling provides more uniform density than modulo
          const randomIndex = Math.floor(Math.random() * numSourcePoints); 
          const srcIdx = randomIndex * 3;
          
          targetBuffer[i * 3] = sourcePoints[srcIdx];
          targetBuffer[i * 3 + 1] = sourcePoints[srcIdx + 1];
          targetBuffer[i * 3 + 2] = sourcePoints[srcIdx + 2];
        }
      };

      if (phase === Phase.Fireworks && !burstTriggered.current) {
        burstTriggered.current = true;
        
        // Start from bottom center
        for (let i = 0; i < PARTICLE_COUNT * 3; i+=3) {
            positions[i] = (Math.random() - 0.5) * 0.5;
            positions[i+1] = -3;
            positions[i+2] = (Math.random() - 0.5) * 0.5;
        }

        // Firework Explosion Targets (Sphere)
        for (let i = 0; i < PARTICLE_COUNT * 3; i+=3) {
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            const r = 4 + Math.random() * 2;
            targetPositions[i] = r * Math.sin(phi) * Math.cos(theta);
            targetPositions[i+1] = r * Math.sin(phi) * Math.sin(theta) + 1.0;
            targetPositions[i+2] = r * Math.cos(phi);
            
            // Random vibrant colors
            const color = new THREE.Color().setHSL(Math.random(), 1, 0.6);
            colors[i] = color.r;
            colors[i+1] = color.g;
            colors[i+2] = color.b;
        }

        const duration = 2;
        const tempPos = { t: 0 };
        
        gsap.to(tempPos, {
            t: 1,
            duration: duration,
            ease: "power2.out",
            onUpdate: () => {
                // Manual interpolation for "physics-like" movement
                for (let i = 0; i < PARTICLE_COUNT * 3; i+=3) {
                    positions[i] += (targetPositions[i] - positions[i]) * 0.08;
                    positions[i+1] += (targetPositions[i+1] - positions[i+1]) * 0.08;
                    positions[i+2] += (targetPositions[i+2] - positions[i+2]) * 0.08;
                }
                if(pointsRef.current) pointsRef.current.geometry.attributes.position.needsUpdate = true;
            },
            onComplete: () => {
                // Morph to Short Text
                fillBuffer(targetPositions, shortPoints);
                
                const gold = new THREE.Color("#FFD700");
                for(let i=0; i<PARTICLE_COUNT*3; i+=3) {
                    colors[i] = gold.r;
                    colors[i+1] = gold.g;
                    colors[i+2] = gold.b;
                }
                if(pointsRef.current) pointsRef.current.geometry.attributes.color.needsUpdate = true;

                gsap.to(positions, {
                    endArray: targetPositions,
                    duration: 2.5,
                    ease: "power3.inOut",
                    onUpdate: () => {
                        if(pointsRef.current) pointsRef.current.geometry.attributes.position.needsUpdate = true;
                    },
                    onComplete: () => {
                        setTimeout(() => setPhase(Phase.Message), 3500);
                    }
                });
            }
        });
      }

      if (phase === Phase.Message) {
         fillBuffer(targetPositions, longPoints);
         
         // Store copy for interaction
         for(let i=0; i<PARTICLE_COUNT*3; i++) {
             originalPositions[i] = targetPositions[i];
         }

         gsap.to(positions, {
            endArray: targetPositions,
            duration: 3,
            ease: "power2.out",
            onUpdate: () => {
                if(pointsRef.current) pointsRef.current.geometry.attributes.position.needsUpdate = true;
            }
         });
      }
    });
  }, [phase, setPhase, positions, targetPositions, colors, originalPositions]);

  // Interactive Repulsion
  useFrame(() => {
    if (phase === Phase.Message && pointsRef.current) {
        const mouseVec = new THREE.Vector3(mouse.x * viewport.width / 2, mouse.y * viewport.height / 2, 0);
        const positionAttr = pointsRef.current.geometry.attributes.position;
        
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const idx = i * 3;
            let px = positionAttr.getX(i);
            let py = positionAttr.getY(i);
            let pz = positionAttr.getZ(i);

            const ox = originalPositions[idx];
            const oy = originalPositions[idx+1];
            const oz = originalPositions[idx+2];

            // 2D Interaction plane check
            const dx = px - mouseVec.x;
            const dy = py - mouseVec.y;
            const distSq = dx*dx + dy*dy;
            const radius = 1.2;

            if (distSq < radius * radius) {
                const dist = Math.sqrt(distSq);
                const force = (radius - dist) / radius;
                const angle = Math.atan2(dy, dx);
                
                // Push away
                px += Math.cos(angle) * force * 0.2;
                py += Math.sin(angle) * force * 0.2;
                pz += force * 0.5; // Also push in Z for 3D effect
            } else {
                // Stronger return force for clearer text
                px += (ox - px) * 0.1;
                py += (oy - py) * 0.1;
                pz += (oz - pz) * 0.1;
            }

            positionAttr.setXYZ(i, px, py, pz);
        }
        positionAttr.needsUpdate = true;
    }
  });

  if (phase < Phase.Fireworks) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARTICLE_COUNT}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05} // Smaller size for sharper text with high count
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent
        opacity={0.9}
        sizeAttenuation={true}
      />
    </points>
  );
};