"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { meshBounds, Text, Float } from "@react-three/drei";
import * as THREE from "three";

export const HeroModel = () => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.5;
      meshRef.current.position.y = Math.sin(time) * 0.1;
    }
  });

  return (
    <group>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={meshRef} raycast={meshBounds}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial 
            color="#e5c487" 
            metalness={0.8} 
            roughness={0.2}
            emissive="#e5c487"
            emissiveIntensity={0.2}
          />
        </mesh>
      </Float>
      
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.2}
        color="#e5c487"
        font="https://fonts.gstatic.com/s/notoserif/v21/ga6Lawi_76Y6Y-0T7-F34nC_06_1.woff"
        anchorX="center"
        anchorY="middle"
      >
        Luxe Aura
      </Text>
    </group>
  );
};
