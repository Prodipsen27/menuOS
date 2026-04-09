"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Preload, OrbitControls, Stage } from "@react-three/drei";
import { cn } from "@/lib/utils";

interface ThreeCanvasProps {
  children: React.ReactNode;
  className?: string;
  shadows?: boolean;
  camera?: any;
  controls?: boolean;
}

export const ThreeCanvas = ({
  children,
  className,
  shadows = true,
  camera = { position: [0, 0, 5], fov: 45 },
  controls = false,
}: ThreeCanvasProps) => {
  return (
    <div className={cn("w-full h-full", className)}>
      <Canvas
        shadows={shadows}
        camera={camera}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Stage
            intensity={0.5}
            environment="city"
            shadows={shadows}
            adjustCamera={false}
          >
            {children}
          </Stage>
          {controls && <OrbitControls makeDefault />}
        </Suspense>
        <Preload all />
      </Canvas>
    </div>
  );
};
