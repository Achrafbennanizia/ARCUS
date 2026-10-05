"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Center } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import type { Group } from "three";
import * as THREE from "three";
import { LampModel } from "./LampModel";
import { useActiveSection } from "@/lib/active-section";
import { useScrollProgress } from "@/lib/scroll-progress";

/**
 * AABB center at world 0; camera looks at the same height so the
 * full lamp rides the viewport vertical midline.
 */
const MID_Y = 0;
const LOOK = new THREE.Vector3(0, MID_Y, 0);

const FRAMES: Record<string, [number, number, number]> = {
  top: [4.9, MID_Y, 6.35],
  beam: [4.7, MID_Y, 6.1],
  finishes: [5.05, MID_Y, 6.3],
  shipping: [4.95, MID_Y, 6.5],
  waitlist: [4.8, MID_Y, 6.2],
};

function CameraRig() {
  const camera = useThree((s) => s.camera);
  const active = useActiveSection();
  const { reducedMotion } = useScrollProgress();
  const target = useRef(new THREE.Vector3(...FRAMES.top));

  useFrame((_, delta) => {
    const [x, , z] = FRAMES[active] ?? FRAMES.top;
    target.current.set(x, MID_Y, z);
    const damp = 1 - Math.exp(-(reducedMotion ? 16 : 4) * delta);
    camera.position.lerp(target.current, damp);
    camera.lookAt(LOOK);
    camera.layers.enable(1);
  });

  return null;
}

function DeskSurface() {
  const alpha = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const fade = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
    fade.addColorStop(0, "rgba(255,255,255,1)");
    fade.addColorStop(0.62, "rgba(255,255,255,0.9)");
    fade.addColorStop(0.84, "rgba(255,255,255,0.4)");
    fade.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.NoColorSpace;
    return tex;
  }, []);

  useEffect(() => {
    return () => {
      alpha?.dispose();
    };
  }, [alpha]);

  return (
    <mesh
      ref={(mesh) => {
        if (mesh) mesh.layers.set(1);
      }}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <circleGeometry args={[2.5, 72]} />
      <meshStandardMaterial
        color="#14110e"
        roughness={0.92}
        metalness={0.03}
        alphaMap={alpha}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function Ground({ foot }: { foot: RefObject<Group | null> }) {
  const group = useRef<Group>(null);
  const point = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!foot.current || !group.current) return;
    foot.current.getWorldPosition(point);
    group.current.position.copy(point);
  });

  return (
    <group ref={group}>
      <DeskSurface />
    </group>
  );
}

function SceneContents() {
  const active = useActiveSection();
  const foot = useRef<Group>(null);
  const dim =
    active === "beam"
      ? 0.42
      : active === "finishes" || active === "shipping"
        ? 0.88
        : 1;

  return (
    <>
      <CameraRig />

      {/* Soft key/fill so Poly Haven normals + ARM maps read clearly */}
      <ambientLight intensity={0.16 * dim} />
      <hemisphereLight
        intensity={0.28 * dim}
        color="#fff4e6"
        groundColor="#0a0c10"
      />
      <spotLight
        position={[4.0, 4.4, 2.6]}
        intensity={28 * dim}
        angle={0.32}
        penumbra={0.28}
        color="#fffaf0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
      />
      <spotLight
        position={[-1.8, 2.6, 3.4]}
        intensity={36 * dim}
        angle={0.5}
        penumbra={0.8}
        color="#dce6f4"
      />
      <spotLight
        position={[-2.8, 2.0, -1.4]}
        intensity={42 * dim}
        angle={0.45}
        penumbra={0.7}
        color="#f0a84b"
      />
      <directionalLight
        position={[-3.6, 1.6, -2.8]}
        intensity={5.2 * dim}
        color="#d0e2ff"
      />
      <directionalLight
        position={[3.4, 2.4, -2.0]}
        intensity={4.0 * dim}
        color="#ffe4b8"
      />
      <pointLight
        position={[2.6, 1.4, 3.8]}
        intensity={8 * dim}
        distance={10}
        decay={2}
        color="#ffffff"
      />

      <Center precise cacheKey="arcus-cantilever-v2">
        <group scale={1.02}>
          <LampModel foot={foot} />
        </group>
      </Center>

      <Ground foot={foot} />
    </>
  );
}

export function LampScene() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[1] h-[42dvh] md:inset-y-0 md:left-auto md:h-auto md:w-[52%]">
      <Canvas
        className="h-full w-full"
        camera={{ position: [4.9, MID_Y, 6.35], fov: 28, near: 0.1, far: 60 }}
        dpr={[1, 1.75]}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.25,
          powerPreference: "high-performance",
          preserveDrawingBuffer: true,
        }}
        onCreated={({ gl, camera }) => {
          gl.setClearColor(0x000000, 0);
          gl.localClippingEnabled = true;
          camera.position.set(4.9, MID_Y, 6.35);
          camera.lookAt(LOOK);
          camera.layers.enable(1);
        }}
        shadows
      >
        <Suspense fallback={null}>
          <SceneContents />
        </Suspense>
      </Canvas>
    </div>
  );
}
