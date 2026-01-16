import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Plane, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';
import { Phase } from '../types';
import gsap from 'gsap';

// Confetti Particle System
const ConfettiParticles: React.FC<{ active: boolean }> = ({ active }) => {
    const pointsRef = useRef<THREE.Points>(null);
    const COUNT = 500;

    const [positions] = useState(() => {
        const arr = new Float32Array(COUNT * 3);
        for (let i = 0; i < COUNT * 3; i += 3) {
            arr[i] = (Math.random() - 0.5) * 6;
            arr[i + 1] = Math.random() * 8 + 3;
            arr[i + 2] = (Math.random() - 0.5) * 3;
        }
        return arr;
    });

    const [velocities] = useState(() => {
        const arr = new Float32Array(COUNT * 3);
        for (let i = 0; i < COUNT * 3; i += 3) {
            arr[i] = (Math.random() - 0.5) * 0.05;
            arr[i + 1] = -Math.random() * 0.08 - 0.02;
            arr[i + 2] = (Math.random() - 0.5) * 0.02;
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
            if (positions[idx + 1] < -3) {
                positions[idx] = (Math.random() - 0.5) * 6;
                positions[idx + 1] = 8;
                positions[idx + 2] = (Math.random() - 0.5) * 3;
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
                size={0.12}
                vertexColors
                transparent
                opacity={0.9}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
};

export const Envelope: React.FC = () => {
    const phase = useStore(state => state.phase);
    const setPhase = useStore(state => state.setPhase);

    const groupRef = useRef<THREE.Group>(null);
    const flapRef = useRef<THREE.Group>(null);
    const letterRef = useRef<THREE.Group>(null);

    const [isOpening, setIsOpening] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const isDragging = useRef(false);
    const startY = useRef(0);

    // Slide away animation when appreciation starts
    useEffect(() => {
        if (phase === Phase.Appreciation && groupRef.current) {
            gsap.to(groupRef.current.position, {
                y: -10,
                duration: 2,
                ease: "power2.in",
                delay: 0.5
            });
        }
    }, [phase]);

    // Floating animation
    useFrame((state) => {
        if (groupRef.current && phase === Phase.Envelope && !isOpening && !isDragging.current) {
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
        }
    });

    const handlePointerDown = (e: THREE.Event) => {
        if (phase !== Phase.Envelope || isOpening) return;
        e.stopPropagation();
        isDragging.current = true;
        startY.current = e.point.y;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    };

    const handlePointerMove = (e: THREE.Event) => {
        if (!isDragging.current || isOpening) return;
        e.stopPropagation();
        
        const delta = e.point.y - startY.current;
        // Limit drag to moving up (opening)
        const newOffset = Math.max(0, Math.min(1.5, delta * 2)); // Amplify movement
        setDragOffset(newOffset);

        if (flapRef.current) {
             // Map offset to rotation: 0 -> 0, 1.5 -> -PI*0.75
             const progress = newOffset / 1.5;
             flapRef.current.rotation.x = -Math.PI * 0.75 * progress;
        }

        // Trigger open if dragged enough
        if (newOffset > 1.2) {
            openEnvelope();
        }
    };

    const handlePointerUp = (e: THREE.Event) => {
        if (!isDragging.current) return;
        isDragging.current = false;
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);

        if (dragOffset > 1.2) {
            openEnvelope();
        } else {
            // Reset if not dragged enough
            gsap.to(flapRef.current!.rotation, { x: 0, duration: 0.5, ease: "back.out(1.7)" });
            setDragOffset(0);
        }
    };

    const openEnvelope = () => {
        if (isOpening) return;
        setIsOpening(true);
        isDragging.current = false;

        // Animate flap fully opening
        if (flapRef.current) {
            gsap.to(flapRef.current.rotation, {
                x: -Math.PI * 0.75,
                duration: 0.4,
                ease: "power2.out",
                onComplete: () => {
                    setShowConfetti(true);
                    animateLetter();
                }
            });
        }
    };

    const animateLetter = () => {
        if (letterRef.current) {
            gsap.to(letterRef.current.position, {
                y: 2,
                z: 0.5,
                duration: 1,
                ease: "power2.out",
            });
            gsap.to(letterRef.current.rotation, {
                x: 0,
                y: 0,
                z: 0,
                duration: 1,
                ease: "power2.out",
                onComplete: () => {
                    setTimeout(() => {
                        setPhase(Phase.Appreciation);
                    }, 2000);
                }
            });
        }
    };

    if (phase !== Phase.Envelope && phase !== Phase.Appreciation) return null;

    // Pastel / Soft Colors
    const envelopeColor = "#F5E6D3"; // Soft Cream/Beige
    const flapColor = "#E6D0B3"; // Slightly darker beige for flap
    const letterColor = "#FFFAF0"; // Floral White
    const sealColor = "#B76E79"; // Rose Gold/Muted Pink Seal

    return (
        <>
            <ConfettiParticles active={showConfetti} />

            <group
                ref={groupRef}
                position={[0, 0, 0]}
                visible={phase === Phase.Envelope || (phase === Phase.Appreciation && isOpening)}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                {/* Envelope Body */}
                <Box args={[3, 2, 0.1]} position={[0, 0, 0]}>
                    <meshStandardMaterial color={envelopeColor} roughness={0.4} metalness={0.1} />
                </Box>

                {/* Envelope Back Panel */}
                <Box args={[2.9, 1.9, 0.05]} position={[0, 0, -0.08]}>
                    <meshStandardMaterial color={envelopeColor} roughness={0.5} />
                </Box>

                {/* Top Flap */}
                <group ref={flapRef} position={[0, 1, 0.05]} rotation={[0, 0, 0]}>
                    <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
                        <bufferGeometry>
                            <bufferAttribute
                                attach="attributes-position"
                                count={3}
                                array={new Float32Array([
                                    -1.5, 0, 0,
                                    1.5, 0, 0,
                                    0, -1.2, 0.02,
                                ])}
                                itemSize={3}
                            />
                        </bufferGeometry>
                        <meshStandardMaterial color={flapColor} side={THREE.DoubleSide} roughness={0.4} />
                    </mesh>

                    {/* Wax Seal */}
                    <mesh position={[0, -0.6, 0.03]}>
                        <cylinderGeometry args={[0.25, 0.25, 0.05, 32]} rotation={[Math.PI / 2, 0, 0]} />
                        <meshStandardMaterial color={sealColor} roughness={0.3} metalness={0.6} />
                    </mesh>
                    
                    {/* Hint Text */}
                     {!isOpening && (
                        <Text
                            position={[0, -0.9, 0.1]}
                            fontSize={0.15}
                            color="#8d6e63"
                            anchorX="center"
                            anchorY="middle"
                        >
                            Geser ke atas
                        </Text>
                    )}
                </group>

                {/* Letter inside */}
                <group ref={letterRef} position={[0, 0, 0.06]} rotation={[0.1, 0, 0]}>
                    <Box args={[2.6, 1.6, 0.02]}>
                        <meshStandardMaterial color={letterColor} roughness={0.6} />
                    </Box>

                    {/* Letter lines decoration */}
                    {[-0.4, -0.1, 0.2, 0.5].map((y, i) => (
                        <Box key={i} args={[2, 0.04, 0.025]} position={[0, y, 0.02]}>
                            <meshStandardMaterial color="#E0C097" roughness={0.5} />
                        </Box>
                    ))}
                    
                     <Text
                        position={[0, 0, 0.03]}
                        fontSize={0.2}
                        color="#5D4037"
                        anchorX="center"
                        anchorY="middle"
                    >
                        Untuk Arum
                    </Text>
                </group>

                {/* Glow effect around envelope */}
                <pointLight position={[0, 0, 2]} intensity={0.3} color="#FFF5E0" distance={5} />
            </group>

            {/* Ambient lighting for envelope */}
            <ambientLight intensity={0.6} />
            <spotLight position={[5, 5, 5]} intensity={0.5} angle={0.3} penumbra={0.5} />
        </>
    );
};
