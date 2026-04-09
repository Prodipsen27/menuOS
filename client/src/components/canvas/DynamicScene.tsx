"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, useTexture, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

const Bean = ({ color, ...props }: { color: string } & any) => {
  const ref = useRef<THREE.Group>(null!);
  const initialY = useMemo(() => props.position[1], [props.position]);
  const speed = useMemo(() => 0.02 + Math.random() * 0.05, []);
  const rotationSpeed = useMemo(() => (Math.random() - 0.5) * 0.5, []);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.y = initialY + Math.sin(time * 0.5 + offset) * 0.2;
      ref.current.position.x += Math.cos(time * 0.3 + offset) * 0.002;
      
      ref.current.rotation.x += rotationSpeed * 0.01;
      ref.current.rotation.y += rotationSpeed * 0.01;
    }
  });

  return (
    <group ref={ref} {...props}>
      <mesh scale={[0.1, 0.15, 0.1]}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshStandardMaterial 
          color="#d4af37" 
          roughness={0.1} 
          metalness={0.8} 
          emissive="#d4af37"
          emissiveIntensity={0.1}
        />
      </mesh>
    </group>
  );
};

const Leaf = ({ position, rotation, delay }: any) => {
  const [scale, setScale] = useState(0);
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (time > delay) {
      setScale(Math.min(0.15, scale + (0.15 - scale) * 0.02));
    }
  });

  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <sphereGeometry args={[1, 16, 8]} />
      <meshStandardMaterial 
        color="#c5a059" 
        roughness={0.2} 
        metalness={0.6}
        emissive="#c5a059"
        emissiveIntensity={0.05}
      />
    </mesh>
  );
};

const Flower = ({ position, delay }: any) => {
  const [scale, setScale] = useState(0);
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (time > delay) {
      setScale(Math.min(0.1, scale + (0.1 - scale) * 0.03));
    }
  });

  return (
    <group position={position} scale={scale}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI * 2) / 5]}>
          <boxGeometry args={[0.5, 0.1, 0.05]} />
          <meshStandardMaterial 
            color="#f0d5a0" 
            roughness={0.1}
            metalness={0.8}
            emissive="#f0d5a0" 
            emissiveIntensity={0.3} 
          />
        </mesh>
      ))}
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          color="#d4af37"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
};

const OrganicBranch = ({ position, rotation, delay = 0, scale = 1 }: any) => {
  const [progress, setProgress] = useState(0);
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (time > delay) {
      setProgress(Math.min(1, progress + (1 - progress) * 0.01));
    }
    if (meshRef.current) {
      meshRef.current.rotation.z = rotation[2] + Math.sin(time * 0.3) * 0.02;
    }
  });

  const points = useMemo(() => {
    const p = [];
    for (let i = 0; i < 15; i++) {
      p.push(new THREE.Vector3(
        Math.sin(i * 0.4) * 0.3,
        i * 0.8,
        Math.cos(i * 0.4) * 0.1
      ));
    }
    return p;
  }, []);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);

  return (
    <group position={position} rotation={rotation} scale={scale * progress}>
      <mesh ref={meshRef}>
        <tubeGeometry args={[curve, 30, 0.04, 8, false]} />
        <meshStandardMaterial 
          color="#8b6508" 
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      {points.slice(3, 12).map((p, i) => (
        <group key={i}>
          <Leaf 
            position={[p.x + 0.1, p.y, p.z]} 
            rotation={[Math.random(), Math.random(), Math.random()]} 
            delay={delay + i * 0.2} 
          />
          {i % 3 === 0 && (
            <Flower 
              position={[p.x - 0.1, p.y + 0.2, p.z]} 
              delay={delay + i * 0.3} 
            />
          )}
        </group>
      ))}
    </group>
  );
};

export const DynamicScene = () => {
  const { viewport } = useThree();
  
  const beans = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * viewport.width,
        (Math.random() - 0.5) * viewport.height * 0.8,
        (Math.random() - 0.5) * 2
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      color: "#d4af37" 
    }));
  }, [viewport]);

  return (
    <>
      <ambientLight intensity={1.2} />
      <pointLight position={[5, 5, 5]} intensity={5} color="#f0d5a0" />
      <spotLight position={[-5, 10, 2]} angle={0.3} penumbra={1} intensity={10} color="#d4af37" />
      <directionalLight position={[0, 5, 5]} intensity={2} color="#ffffff" />

      <OrganicBranch 
        position={[-viewport.width / 2, -viewport.height / 2, -1]} 
        rotation={[0, 0, -Math.PI / 4]} 
        delay={0.2} 
        scale={2.5} 
      />
      <OrganicBranch 
        position={[viewport.width / 2, -viewport.height / 2, -1.5]} 
        rotation={[0, 0, Math.PI / 6]} 
        delay={0.8} 
        scale={2.2} 
      />
      <OrganicBranch 
        position={[0, -viewport.height / 2 - 1, -2]} 
        rotation={[0, 0, 0]} 
        delay={1.5} 
        scale={2} 
      />

      <group>
        {beans.map((bean, i) => (
          <Bean key={i} {...bean} />
        ))}
      </group>

      <mesh position={[0, 0, -5]}>
        <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
        <meshStandardMaterial color="#0b0805" roughness={1} />
      </mesh>
    </>
  );
};


