import React, { useRef, useMemo } from 'react';
import { useStore } from '../store';
import { Phase } from '../types';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Sky, Cloud, Dodecahedron, Float, Sphere, RoundedBox, Cone, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

// --- Data ---
const messages = [
    { title: "Selamat Ulang Tahun", text: "Happy 26th Birthday Arum! Semoga tahun ini penuh tawa dan kebahagiaan." },
    { title: "Karir & Ambisi", text: "Teruslah mengejar mimpimu. Kerja kerasmu pasti akan membuahkan hasil yang manis." },
    { title: "Kesehatan", text: "Sehat selalu ya. Jangan lupa istirahat di tengah kesibukanmu mengejar dunia." },
    { title: "Cinta & Kasih", text: "Semoga dikelilingi orang-orang yang tulus mencintai dan mendukungmu." },
    { title: "Hope", text: "Jadilah cahaya bagi sekitarmu. Aurum Splendet in Aeternum!" },
];

// --- Sub-Components ---

const PalmTree: React.FC<{ position: [number, number, number], scale?: number, rotation?: [number, number, number] }> = ({ position, scale = 1, rotation = [0, 0, 0] }) => {
    return (
        <group position={position} scale={scale} rotation={rotation}>
            {/* Trunk */}
            <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.1, 0.15, 3, 7]} />
                <meshStandardMaterial color="#5D4037" roughness={0.9} />
            </mesh>
            {/* Leaves */}
            <group position={[0, 3, 0]}>
                {[0, 1, 2, 3, 4].map((i) => (
                    <mesh key={i} rotation={[0.5, i * (Math.PI * 2) / 5, 0]} position={[0, 0, 0]}>
                        <coneGeometry args={[0.5, 2, 3]} />
                        <meshStandardMaterial color="#2E7D32" roughness={0.8} />
                    </mesh>
                ))}
            </group>
        </group>
    );
};

const LifeguardTower: React.FC<{ position: [number, number, number], rotation?: [number, number, number] }> = ({ position, rotation = [0, 0, 0] }) => {
    return (
        <group position={position} rotation={rotation}>
            {/* Stilts */}
            <mesh position={[-0.8, 1.5, -0.8]} rotation={[0.1, 0, 0.1]}>
                <cylinderGeometry args={[0.05, 0.05, 3.5]} />
                <meshStandardMaterial color="white" />
            </mesh>
            <mesh position={[0.8, 1.5, -0.8]} rotation={[0.1, 0, -0.1]}>
                <cylinderGeometry args={[0.05, 0.05, 3.5]} />
                <meshStandardMaterial color="white" />
            </mesh>
            <mesh position={[-0.8, 1.5, 0.8]} rotation={[-0.1, 0, 0.1]}>
                <cylinderGeometry args={[0.05, 0.05, 3.5]} />
                <meshStandardMaterial color="white" />
            </mesh>
            <mesh position={[0.8, 1.5, 0.8]} rotation={[-0.1, 0, -0.1]}>
                <cylinderGeometry args={[0.05, 0.05, 3.5]} />
                <meshStandardMaterial color="white" />
            </mesh>

            {/* Cabin Floor */}
            <mesh position={[0, 3.2, 0]}>
                <boxGeometry args={[2, 0.1, 2]} />
                <meshStandardMaterial color="#EF5350" />
            </mesh>

            {/* Cabin Body */}
            <mesh position={[0, 4, 0]}>
                <boxGeometry args={[1.8, 1.5, 1.8]} />
                <meshStandardMaterial color="white" />
            </mesh>
            
            {/* Windows */}
            <mesh position={[0, 4.2, 0.91]}>
                <planeGeometry args={[1.2, 0.8]} />
                <meshStandardMaterial color="#81D4FA" />
            </mesh>

            {/* Roof */}
            <mesh position={[0, 5.2, 0]}>
                <coneGeometry args={[1.6, 1, 4]} />
                <meshStandardMaterial color="#EF5350" />
            </mesh>
        </group>
    );
};

const Balloon: React.FC<{ char: string, position: [number, number, number], color: string }> = ({ char, position, color }) => {
    return (
        <Float speed={3} rotationIntensity={0.2} floatIntensity={1.5} position={position}>
            <group>
                <Sphere args={[0.7, 32, 32]}>
                    <meshStandardMaterial color={color} metalness={0.1} roughness={0.2} />
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
    );
};

const AestheticMessageBoard: React.FC<{ position: [number, number, number], rotation: [number, number, number], title: string, text: string }> = ({ position, rotation, title, text }) => {
    return (
        <group position={position} rotation={rotation}>
            {/* Pole */}
            <mesh position={[0, 1.2, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 2.5, 8]} />
                <meshStandardMaterial color="#4E342E" roughness={1} />
            </mesh>
            
            {/* Main Wood Board (Rounded) */}
            <RoundedBox args={[2.6, 1.8, 0.15]} radius={0.1} smoothness={4} position={[0, 2.2, 0.05]}>
                <meshStandardMaterial color="#8D6E63" roughness={0.6} />
            </RoundedBox>

            {/* Paper Note (Pinned) */}
            <mesh position={[0, 2.2, 0.14]}>
                <planeGeometry args={[2.2, 1.4]} />
                <meshStandardMaterial color="#FFFDE7" roughness={0.9} />
            </mesh>

            {/* Gold Pin */}
            <mesh position={[0, 2.8, 0.15]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Text Content - Tightly Controlled */}
            <group position={[0, 2.2, 0.16]}>
                <Text
                    position={[0, 0.4, 0]}
                    fontSize={0.22}
                    color="#3E2723"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={2} // Strict width
                >
                    {title}
                </Text>
                
                <mesh position={[0, 0.25, 0]}>
                    <planeGeometry args={[1.5, 0.01]} />
                    <meshBasicMaterial color="#BCAAA4" />
                </mesh>

                <Text
                    position={[0, -0.1, 0]}
                    fontSize={0.14}
                    color="#5D4037"
                    anchorX="center"
                    anchorY="top"
                    textAlign="center"
                    maxWidth={1.9} // Strict width to prevent overflow
                    lineHeight={1.5}
                >
                    {text}
                </Text>
            </group>
        </group>
    );
};

const Rock: React.FC<{ position: [number, number, number], scale: number }> = ({ position, scale }) => {
    return (
        <Dodecahedron args={[1, 0]} position={position} scale={scale} rotation={[Math.random(), Math.random(), Math.random()]}>
            <meshStandardMaterial color="#90A4AE" roughness={0.9} />
        </Dodecahedron>
    );
};

// --- Main Scene ---

export const BeachWorld: React.FC = () => {
    const phase = useStore(state => state.phase);
    const groupRef = useRef<THREE.Group>(null);
    const { viewport } = useThree();
    const isMobile = viewport.width < viewport.height;

    if (phase !== Phase.Beach) return null;

    const balloonColors = ["#FF6B6B", "#4ECDC4", "#FFD93D", "#6C5CE7"];
    const name = "ARUM";

    return (
        <group ref={groupRef}>
            {/* Environment */}
            <ambientLight intensity={0.7} color="#FFF3E0" />
            <directionalLight position={[20, 20, 10]} intensity={1.3} color="#FFD54F" castShadow />
            <Sky sunPosition={[100, 20, -100]} turbidity={0.4} rayleigh={0.2} />
            
            {/* Clouds */}
            <Cloud position={[-10, 12, -25]} opacity={0.6} speed={0.1} width={25} segments={20} />
            <Cloud position={[10, 10, -20]} opacity={0.6} speed={0.15} width={20} segments={15} />

            {/* Ocean & Sand */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, -30]}>
                <planeGeometry args={[300, 150]} />
                <meshStandardMaterial color="#4FC3F7" roughness={0.1} metalness={0.3} transparent opacity={0.9} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 15]}>
                <planeGeometry args={[300, 100]} />
                <meshStandardMaterial color="#FFE0B2" roughness={1} />
            </mesh>

            {/* --- Props */}

            {/* Lifeguard Tower */}
            <LifeguardTower position={[12, -0.5, -5]} rotation={[0, -0.5, 0]} />

            {/* Palm Trees */}
            <PalmTree position={[-10, -0.5, -2]} scale={1.5} rotation={[0, 0.5, 0]} />
            <PalmTree position={[15, -0.5, 2]} scale={1.2} rotation={[0, -0.5, 0]} />

            {/* Rocks */}
            <Rock position={[-6, -0.2, -8]} scale={1.2} />
            <Rock position={[8, -0.1, -9]} scale={1.5} />
            <Rock position={[-12, -0.3, -4]} scale={0.8} />

            {/* Balloons */}
            {name.split('').map((char, i) => (
                <Balloon
                    key={i}
                    char={char}
                    position={[(i - 1.5) * 1.8, 5, -8]}
                    color={balloonColors[i % balloonColors.length]}
                />
            ))}

            {/* Banner */}
            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
                <Text
                    position={[0, 8, -18]}
                    fontSize={isMobile ? 1.2 : 2}
                    color="#FFF"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.08}
                    outlineColor="#FFB300"
                >
                    SELAMAT ULANG TAHUN
                </Text>
            </Float>

            {/* Message Boards - Optimized Layout */}
            {messages.map((msg, index) => {
                // Tighter curve for mobile to keep visible
                const spreadFactor = isMobile ? 0.3 : 0.45;
                const angle = (index - (messages.length - 1) / 2) * spreadFactor; 
                
                // Adjust radius based on screen
                const radius = isMobile ? 7.5 : 9;
                
                // Positions
                const x = Math.sin(angle) * radius;
                const z = -Math.cos(angle) * radius + (isMobile ? 2 : 3); 

                // Look at center (camera start)
                const lookAngle = Math.atan2(0 - x, 8 - z);

                return (
                    <AestheticMessageBoard
                        key={index}
                        position={[x, -0.5, z]} 
                        rotation={[0, lookAngle, 0]}
                        title={msg.title}
                        text={msg.text}
                    />
                );
            })}
        </group>
    );
};