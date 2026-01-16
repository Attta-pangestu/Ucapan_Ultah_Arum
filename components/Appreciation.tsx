import React, { useEffect, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';
import { Phase } from '../types';
import gsap from 'gsap';

interface TextSlide {
    title: string;
    content: string;
    icon: string;
}

const slides: TextSlide[] = [
    {
        title: "Perjuangan",
        content: "Setiap langkahmu penuh perjuangan\nyang tak terlihat, tapi kau\ntetap melangkah maju",
        icon: "💪"
    },
    {
        title: "Keberanian",
        content: "Keberanianmu menghadapi dunia\nmenginspirasi semua orang\ndi sekitarmu",
        icon: "🦁"
    },
    {
        title: "Harapan",
        content: "Di usia 26, dunia menantimu\ndengan peluang tak terbatas\ndan mimpi yang menanti diraih",
        icon: "✨"
    },
    {
        title: "Kedewasaan",
        content: "Selamat memasuki fase baru\npenuh kedewasaan,\nkebijaksanaan, dan cinta",
        icon: "🌸"
    }
];

const AppreciationSlide: React.FC<{
    slide: TextSlide;
    visible: boolean;
    index: number;
    isMobile: boolean;
}> = ({ slide, visible, index, isMobile }) => {
    const groupRef = useRef<THREE.Group>(null);
    const [opacity, setOpacity] = useState(0);
    const opacityRef = useRef({ val: 0 });

    // Dynamic sizing based on screen width
    const titleSize = isMobile ? 0.4 : 0.5;
    const contentSize = isMobile ? 0.18 : 0.25;
    const contentWidth = isMobile ? 10 : 6; // Using fixed values since we can't access viewport here

    useEffect(() => {
        if (visible) {
            gsap.to(opacityRef.current, {
                val: 1,
                duration: 1,
                ease: "power2.out",
                onUpdate: () => {
                    setOpacity(opacityRef.current.val);
                }
            });
        } else {
            gsap.to(opacityRef.current, {
                val: 0,
                duration: 0.5,
                ease: "power2.in",
                onUpdate: () => {
                    setOpacity(opacityRef.current.val);
                }
            });
        }
    }, [visible]);

    useFrame((state) => {
        if (groupRef.current && visible) {
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
        }
    });

    if (opacity < 0.01) return null;

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            {/* Icon */}
            <Text
                position={[0, 1.5, 0]}
                fontSize={isMobile ? 0.6 : 0.8}
                color="#FFD700"
                anchorX="center"
                anchorY="middle"
                fillOpacity={opacity}
            >
                {slide.icon}
            </Text>

            {/* Title */}
            <Text
                position={[0, 0.7, 0]}
                fontSize={titleSize}
                color="#7BA05B"
                anchorX="center"
                anchorY="middle"
                letterSpacing={0.1}
                fillOpacity={opacity}
                maxWidth={isMobile ? 8 : 10}
            >
                {slide.title}
            </Text>

            {/* Content */}
            <Text
                position={[0, -0.2, 0]}
                fontSize={contentSize}
                color="#5D4037"
                anchorX="center"
                anchorY="middle"
                textAlign="center"
                maxWidth={isMobile ? 8 : 6}
                lineHeight={1.6}
                fillOpacity={opacity}
            >
                {slide.content}
            </Text>

            {/* Decorative line */}
            <mesh position={[0, -1, 0]}>
                <planeGeometry args={[isMobile ? 1.5 : 2, 0.01]} />
                <meshBasicMaterial color="#7BA05B" transparent opacity={opacity * 0.5} />
            </mesh>
        </group>
    );
};

// Floating particles background
const BackgroundParticles: React.FC = () => {
    const pointsRef = useRef<THREE.Points>(null);
    const COUNT = 200;

    const [positions] = useState(() => {
        const arr = new Float32Array(COUNT * 3);
        for (let i = 0; i < COUNT * 3; i += 3) {
            arr[i] = (Math.random() - 0.5) * 15;
            arr[i + 1] = (Math.random() - 0.5) * 10;
            arr[i + 2] = (Math.random() - 0.5) * 5 - 3;
        }
        return arr;
    });

    useFrame((state) => {
        if (!pointsRef.current) return;
        const posAttr = pointsRef.current.geometry.attributes.position;

        for (let i = 0; i < COUNT; i++) {
            const idx = i * 3;
            positions[idx + 1] += 0.005;

            if (positions[idx + 1] > 5) {
                positions[idx + 1] = -5;
            }

            posAttr.setXYZ(i,
                positions[idx] + Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.01,
                positions[idx + 1],
                positions[idx + 2]
            );
        }
        posAttr.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={COUNT}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.03}
                color="#7BA05B"
                transparent
                opacity={0.4}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
};

export const Appreciation: React.FC = () => {
    const phase = useStore(state => state.phase);
    const setPhase = useStore(state => state.setPhase);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check if we're in a browser environment
        if (typeof window !== 'undefined') {
            const checkIsMobile = () => {
                setIsMobile(window.innerWidth < window.innerHeight);
            };

            checkIsMobile();

            // Add resize listener
            window.addEventListener('resize', checkIsMobile);

            return () => {
                window.removeEventListener('resize', checkIsMobile);
            };
        }
    }, []);

    useEffect(() => {
        if (phase === Phase.Appreciation) {
            setIsActive(true);
            setCurrentSlide(0);

            // Auto-advance slides
            const intervals: NodeJS.Timeout[] = [];

            for (let i = 1; i <= slides.length; i++) {
                const timeout = setTimeout(() => {
                    if (i < slides.length) {
                        setCurrentSlide(i);
                    } else {
                        // All slides shown, transition to cake
                        setTimeout(() => {
                            setPhase(Phase.Cake);
                        }, 2500);
                    }
                }, i * 3500);
                intervals.push(timeout);
            }

            return () => {
                intervals.forEach(clearTimeout);
            };
        } else {
            setIsActive(false);
        }
    }, [phase, setPhase]);

    if (phase !== Phase.Appreciation) return null;

    return (
        <group>
            <BackgroundParticles />

            {slides.map((slide, index) => (
                <AppreciationSlide
                    key={index}
                    slide={slide}
                    visible={isActive && currentSlide === index}
                    index={index}
                    isMobile={isMobile}
                />
            ))}

            {/* Progress indicator */}
            <group position={[0, -2.5, 0]}>
                {slides.map((_, index) => (
                    <mesh
                        key={index}
                        position={[(index - (slides.length - 1) / 2) * 0.25, 0, 0]}
                    >
                        <circleGeometry args={[0.05, 16]} />
                        <meshBasicMaterial
                            color={index <= currentSlide ? "#7BA05B" : "#333"}
                            transparent
                            opacity={0.8}
                        />
                    </mesh>
                ))}
            </group>

            {/* Ambient glow */}
            <pointLight position={[0, 2, 3]} intensity={0.3} color="#7BA05B" distance={10} />
            <ambientLight intensity={0.2} />
        </group>
    );
};
