import React, { useRef } from 'react';
import { useStore } from '../store';
import { Phase } from '../types';
import { Text, Sky, Cloud } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
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

export const BeachWorld: React.FC = () => {
    const phase = useStore(state => state.phase);
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            // Gentle floating for the whole scene or water animation if needed
        }
    });

    if (phase !== Phase.Beach) return null;

    return (
        <group ref={groupRef}>
            {/* Lighting for Beach */}
            <ambientLight intensity={0.8} color="#FFEDCC" />
            <directionalLight position={[10, 10, 5]} intensity={1.5} color="#FFD54F" castShadow />

            {/* Sky */}
            <Sky sunPosition={[10, 10, -10]} turbidity={0.5} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />

            {/* Clouds */}
            <Cloud position={[-4, 8, -10]} opacity={0.5} speed={0.4} width={10} depth={1.5} segments={20} />
            <Cloud position={[4, 6, -5]} opacity={0.5} speed={0.3} width={10} depth={1.5} segments={20} />

            {/* Ocean (Simple Blue Plane) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -20]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#4FC3F7" roughness={0.2} metalness={0.1} transparent opacity={0.8} />
            </mesh>

            {/* Sand */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#FFE0B2" roughness={1} />
            </mesh>

            {/* Message Boards arranged in a semi-circle */}
            {messages.map((msg, index) => {
                const angle = (index - (messages.length - 1) / 2) * 0.6; // Spread angle
                const radius = 6;
                const x = Math.sin(angle) * radius;
                const z = Math.cos(angle) * radius - 2;
                
                return (
                    <MessageBoard
                        key={index}
                        position={[x, -0.4, z]} // Start from ground
                        rotation={[0, angle, 0]} // Face center
                        title={msg.title}
                        text={msg.text}
                    />
                );
            })}
        </group>
    );
};
