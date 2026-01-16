import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';
import { Phase } from '../types';

// Configuration
const PARTICLE_COUNT = 30000;

const LONG_TEXT = `SELAMAT ULANG TAHUN
ARUM

Keberhasilan - Karir
Ambisi - Cinta

Semoga semua terwujud
di usia 26 ini.

Teruslah Bersinar!`;

// 1. Robust Text to Points Generator
const createTextPoints = (text: string, fontSize: number): number[][] => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // Use a large canvas to ensure text fits
  const width = 1024;
  const height = 1024;
  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lines = text.split('\n');
  const lineHeight = fontSize * 1.4;
  const totalTextHeight = lines.length * lineHeight;
  const startY = (height - totalTextHeight) / 2 + lineHeight / 2;

  lines.forEach((line, i) => {
    ctx.fillText(line.trim(), width / 2, startY + i * lineHeight);
  });

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const points: number[][] = [];
  
  // Dense sampling for clear text
  const sampleRate = 2; 

  for (let y = 0; y < height; y += sampleRate) {
    for (let x = 0; x < width; x += sampleRate) {
      const i = (y * width + x) * 4;
      // Check red channel for white pixel
      if (data[i] > 128) {
        // Center coordinates (0,0) based on canvas center
        const px = (x - width / 2) * 0.012; // Adjust scale to fit camera
        const py = -(y - height / 2) * 0.012;
        points.push([px, py, 0]);
      }
    }
  }
  return points;
};

// 2. Generate Cake Points
const createCakePoints = (): { positions: number[], colors: number[] } => {
  const positions: number[] = [];
  const colors: number[] = [];
  
  const matchaColor = new THREE.Color("#7BA05B");
  const spongeColor = new THREE.Color("#8DAF6E");
  const creamColor = new THREE.Color("#FFFAF0");
  const strawberryColor = new THREE.Color("#D32F2F");

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.sqrt(Math.random()) * 1.5;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    let y = (Math.random() * 1.0) - 0.5;
    let col = spongeColor;

    const layer = Math.random();
    if (layer < 0.35) { y = -0.5 + Math.random() * 0.3; col = spongeColor; }
    else if (layer < 0.5) { y = -0.2 + Math.random() * 0.2; col = creamColor; }
    else if (layer < 0.85) { y = 0.0 + Math.random() * 0.3; col = spongeColor; }
    else { 
        y = 0.3 + Math.random() * 0.05; col = matchaColor; 
        if (Math.random() < 0.05) { y += 0.1; col = strawberryColor; }
    }

    positions.push(x, y - 0.2, z);
    colors.push(col.r, col.g, col.b);
  }
  return { positions, colors };
};

export const Particles: React.FC = () => {
  const phase = useStore(state => state.phase);
  const setPhase = useStore(state => state.setPhase);
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport, mouse } = useThree();
  const [isReady, setIsReady] = useState(false);

  // Use refs for large arrays to avoid re-renders
  const particles = useMemo(() => {
    return {
        pos: new Float32Array(PARTICLE_COUNT * 3),
        col: new Float32Array(PARTICLE_COUNT * 3),
        target: new Float32Array(PARTICLE_COUNT * 3),
        vel: new Float32Array(PARTICLE_COUNT * 3)
    };
  }, []);

  const explosionTriggered = useRef(false);

  // Initialize
  useEffect(() => {
    const cake = createCakePoints();
    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
        particles.pos[i] = cake.positions[i];
        particles.col[i] = cake.colors[i];
        particles.vel[i] = 0;
    }
    setIsReady(true);
  }, []);

  // Handle Logic Transitions
  useEffect(() => {
    if (!isReady) return;

    if (phase === Phase.Blowing && !explosionTriggered.current) {
        explosionTriggered.current = true;
        
        // 1. Setup Explosion Physics
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const idx = i * 3;
            // Vector from center
            const dx = particles.pos[idx];
            const dy = particles.pos[idx+1] - (-0.5);
            const dz = particles.pos[idx+2];
            const len = Math.sqrt(dx*dx + dy*dy + dz*dz) + 0.001;
            const speed = 0.05 + Math.random() * 0.2; // Faster explosion

            particles.vel[idx] = (dx / len) * speed;
            particles.vel[idx+1] = (dy / len) * speed + 0.05;
            particles.vel[idx+2] = (dz / len) * speed;
        }

        // 2. Prepare Text Targets
        // Use larger font size for better readability
        const textPoints = createTextPoints(LONG_TEXT, 40); 
        const textColor = new THREE.Color("#FFFDF5");
        const starColor = new THREE.Color("#FFD700");

        // Map particles to text
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const idx = i * 3;
            
            if (i < textPoints.length) {
                // Determine particle is part of text
                const pt = textPoints[i];
                particles.target[idx] = pt[0];
                particles.target[idx+1] = pt[1] + 1.0; // Shift up
                particles.target[idx+2] = pt[2]; // Z = 0
            } else {
                // Excess particles become background stars/dust
                // Spread them around the text
                const theta = Math.random() * Math.PI * 2;
                const r = 3 + Math.random() * 4; // Radius around text
                particles.target[idx] = Math.cos(theta) * r;
                particles.target[idx+1] = (Math.random() - 0.5) * 6 + 1;
                particles.target[idx+2] = Math.sin(theta) * r - 2; // Behind text
            }
        }

        // 3. Schedule transition to Message
        setTimeout(() => {
             // Force color update to bright text color
             for(let i=0; i<PARTICLE_COUNT; i++) {
                 const idx = i*3;
                 let c = textColor;
                 
                 // If it's a background particle (index >= textPoints length), make it gold/dim
                 if (i >= textPoints.length) {
                     c = starColor;
                     // Randomly dim some stars
                     if(Math.random() > 0.5) c = new THREE.Color("#555");
                 }

                 particles.col[idx] = c.r;
                 particles.col[idx+1] = c.g;
                 particles.col[idx+2] = c.b;
             }
             if(pointsRef.current) pointsRef.current.geometry.attributes.color.needsUpdate = true;
             
             setPhase(Phase.Message);
        }, 1500);
    }
  }, [phase, isReady]);

  useFrame((state, delta) => {
      if (!pointsRef.current || !isReady) return;
      
      const posAttr = pointsRef.current.geometry.attributes.position;
      const { pos, vel, target } = particles;

      if (phase === Phase.Blowing) {
          // Explosion physics
          for(let i=0; i<PARTICLE_COUNT; i++) {
              const idx = i*3;
              pos[idx] += vel[idx];
              pos[idx+1] += vel[idx+1];
              pos[idx+2] += vel[idx+2];
              
              vel[idx] *= 0.94; // Drag
              vel[idx+1] -= 0.0015; // Gravity
          }
          posAttr.needsUpdate = true;
      }
      else if (phase === Phase.Message) {
          // Converge to text
          const speed = 2.0 * delta;
          
          // Mouse interaction vars
          const mouseVec = new THREE.Vector3(mouse.x * 5, mouse.y * 5, 0);
          
          for(let i=0; i<PARTICLE_COUNT; i++) {
              const idx = i*3;
              
              let tx = target[idx];
              let ty = target[idx+1];
              let tz = target[idx+2];

              // Simple mouse repulsion
              const dx = pos[idx] - mouseVec.x;
              const dy = pos[idx+1] - mouseVec.y;
              const distSq = dx*dx + dy*dy;
              
              if (distSq < 1.0) {
                  const force = (1.0 - distSq) * 0.5;
                  tx += dx * force;
                  ty += dy * force;
              }

              // Lerp
              pos[idx] += (tx - pos[idx]) * speed;
              pos[idx+1] += (ty - pos[idx+1]) * speed;
              pos[idx+2] += (tz - pos[idx+2]) * speed;
          }
          posAttr.needsUpdate = true;
      }
  });

  if (phase < Phase.Cake) return null;

  return (
    <group>
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={PARTICLE_COUNT}
                    array={particles.pos}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={PARTICLE_COUNT}
                    array={particles.col}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.035}
                vertexColors
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                transparent
                opacity={phase >= Phase.Blowing ? 1 : 0}
                sizeAttenuation={true}
            />
        </points>
        
        {/* Glow for text readability */}
        {phase === Phase.Message && (
            <pointLight position={[0, 1, 2]} intensity={0.5} color="#FFF" distance={10} />
        )}
    </group>
  );
};