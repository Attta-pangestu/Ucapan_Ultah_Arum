import React, { useRef } from 'react';
import { useStore } from '../store';
import { Phase } from '../types';
import { Text, Sky, Cloud, Dodecahedron } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const messages = [
    { title: "Selamat Ulang Tahun", text: "Selamat ulang tahun yang ke-26, Arum! Semoga tahun ini membawa kebahagiaan yang melimpah." },
    { title: "Karir & Impian", text: "Semoga karirmu terus menanjak, segala ambisi tercapai, dan kerja kerasmu membuahkan hasil manis." },
    { title: "Kesehatan", text: "Selalu diberikan kesehatan, kekuatan, dan semangat untuk menghadapi setiap tantangan." },
    { title: "Cinta", text: "Semoga dikelilingi oleh orang-orang yang tulus menyayangimu dan mendukung setiap langkahmu." },
    { title: "Harapan", text: "Teruslah bersinar dan menjadi inspirasi bagi orang-orang di sekitarmu. Dunia butuh cahayamu." },
];

const MessageBoard: React.FC<{ position: [number, number, number], rotation: [number, number, number], title: string, text: string }> = ({ position, rotation, title, text }) => {
    return (
        <group position={position} rotation={rotation}>
            {/* Pole */}
            <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
                <meshStandardMaterial color="#5D4037" roughness={0.9} />
            </mesh>
            
            {/* Board */}
            <mesh position={[0, 2.5, 0.1]}>
                <boxGeometry args={[2.2, 1.4, 0.1]} />
                <meshStandardMaterial color="#8D6E63" roughness={0.8} />
            </mesh>

            {/* Paper/Area Text */}
            <mesh position={[0, 2.5, 0.16]}>
                <planeGeometry args={[1.9, 1.1]} />
                <meshStandardMaterial color="#FFF8E1" roughness={0.9} />
            </mesh>

            {/* Title */}
            <Text
                position={[0, 2.8, 0.17]}
                fontSize={0.2}
                color="#3E2723"
                anchorX="center"
                anchorY="middle"
                maxWidth={1.8}
            >
                {title}
            </Text>

            {/* Message Body */}
            <Text
                position={[0, 2.3, 0.17]}
                fontSize={0.12}
                color="#5D4037"
                anchorX="center"
                anchorY="top"
                textAlign="center"
                maxWidth={1.7}
                lineHeight={1.4}
            >
                {text}
            </Text>
        </group>
    );
};

const Rock: React.FC<{ position: [number, number, number], scale: number }> = ({ position, scale }) => {
    return (
        <Dodecahedron args={[1, 0]} position={position} scale={scale} rotation={[Math.random(), Math.random(), Math.random()]}>
            <meshStandardMaterial color="#78909C" roughness={0.8} />
        </Dodecahedron>
    );
};

export const BeachWorld: React.FC = () => {
    const phase = useStore(state => state.phase);
    const groupRef = useRef<THREE.Group>(null);
    const { viewport } = useThree();
    const isMobile = viewport.width < viewport.height;

    useFrame((state) => {
        if (groupRef.current) {
            // Gentle floating for the whole scene or water animation if needed
        }
    });

    if (phase !== Phase.Beach) return null;

    return (
        <group ref={groupRef}>
            {/* Lighting for Beach */}
            <ambientLight intensity={0.6} color="#FFEDCC" />
            <directionalLight position={[10, 10, 5]} intensity={1.2} color="#FFD54F" castShadow />
            <pointLight position={[-10, 5, -10]} intensity={0.5} color="#00BFFF" />

            {/* Sky */}
            <Sky sunPosition={[100, 20, -100]} turbidity={0.2} rayleigh={0.1} />

            {/* Clouds */}
            <Cloud position={[-8, 10, -20]} opacity={0.6} speed={0.2} width={20} depth={2} segments={20} />
            <Cloud position={[8, 8, -15]} opacity={0.6} speed={0.15} width={15} depth={2} segments={15} />

            {/* Ocean */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, -20]}>
                <planeGeometry args={[200, 100]} />
                <meshStandardMaterial 
                    color="#29B6F6" 
                    roughness={0.1} 
                    metalness={0.5} 
                    transparent 
                    opacity={0.9} 
                />
            </mesh>

            {/* Sand */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 10]}>
                <planeGeometry args={[200, 100]} />
                <meshStandardMaterial color="#FFE0B2" roughness={1} />
            </mesh>

            {/* Rocks scattered near the water line */}
            <Rock position={[-8, -0.2, -5]} scale={1.2} />
            <Rock position={[-9, -0.3, -4]} scale={0.8} />
            <Rock position={[10, -0.1, -6]} scale={1.5} />
            <Rock position={[12, -0.3, -5]} scale={1.0} />
            <Rock position={[-2, -0.4, -7]} scale={0.5} />

            {/* Message Boards arranged in a semi-circle FACING the User (Camera starts at +Z) */}
            {messages.map((msg, index) => {
                // Tighter spread for mobile
                const spreadFactor = isMobile ? 0.35 : 0.5;
                const angle = (index - (messages.length - 1) / 2) * spreadFactor; 
                
                // Position them further back (near sea, negative Z)
                // Radius slightly tighter on mobile
                const radius = isMobile ? 8 : 9;
                const x = Math.sin(angle) * radius;
                const z = -Math.cos(angle) * radius + (isMobile ? 2.5 : 3); 

                // Rotate to face (0,0,5) (Camera direction approx)
                const targetX = 0;
                const targetZ = 8;
                const lookAngle = Math.atan2(targetX - x, targetZ - z);

                return (
                    <MessageBoard
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
