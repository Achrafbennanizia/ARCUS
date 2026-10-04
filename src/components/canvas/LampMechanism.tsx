"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh, MeshStandardMaterial, SpotLight as SpotLightType } from "three";
import * as THREE from "three";
import { FINISHES } from "@/lib/content";
import { INITIAL_POSE, LINK, type LampPose } from "@/lib/lamp-kinematics";
import { brushedShellMap } from "@/lib/materials";

export type RigState = LampPose & { showBeam: boolean };

type Finish = (typeof FINISHES)[number];

const AMBER = "#d4923a";

function chromeShell(finish: Finish, map: THREE.Texture) {
  return {
    color: "#ffffff" as const,
    map,
    metalness: Math.min(0.96, finish.metalness + 0.08),
    roughness: Math.max(0.12, finish.roughness * 0.65),
    clearcoat: 0.65,
    clearcoatRoughness: 0.16,
  };
}

/** Slim tube along local +Z, stopping short of the joint spheres. */
function LinkRod({
  length,
  radius,
  map,
  finish,
}: {
  length: number;
  radius: number;
  map: THREE.Texture;
  finish: Finish;
}) {
  const span = Math.max(0.08, length - 0.08);
  return (
    <mesh
      position={[0, 0, 0.04 + span / 2]}
      rotation={[Math.PI / 2, 0, 0]}
      castShadow
      receiveShadow
    >
      <cylinderGeometry args={[radius, radius, span, 24]} />
      <meshPhysicalMaterial {...chromeShell(finish, map)} />
    </mesh>
  );
}

function Knuckle({ finish }: { finish: Finish }) {
  return (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[0.02, 28, 18]} />
      <meshPhysicalMaterial
        color={finish.accent}
        metalness={0.94}
        roughness={0.14}
        clearcoat={0.55}
        clearcoatRoughness={0.18}
      />
    </mesh>
  );
}

/**
 * Cylindrical head, in the family of the ARTIUM3D cantilever lamp:
 * a slim metal tube with the beam leaving the open end.
 */
function HeadTube({
  finish,
  map,
  bulb,
}: {
  finish: Finish;
  map: THREE.Texture;
  bulb: RefObject<MeshStandardMaterial | null>;
}) {
  const len = LINK.shadeLen;
  const r = LINK.shadeRadius;
  return (
    <group>
      <mesh
        position={[0, 0, len * 0.5]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[r, r * 0.86, len, 40]} />
        <meshPhysicalMaterial {...chromeShell(finish, map)} />
      </mesh>
      <mesh position={[0, 0, len * 0.62]}>
        <circleGeometry args={[r * 0.62, 28]} />
        <meshStandardMaterial
          ref={bulb}
          color="#ffd7a0"
          emissive="#ffbf70"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0, len]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r * 0.92, 0.0035, 8, 32]} />
        <meshStandardMaterial color={AMBER} metalness={0.88} roughness={0.26} />
      </mesh>
    </group>
  );
}

function ThrowCone({ mesh }: { mesh: RefObject<Mesh | null> }) {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh
        ref={mesh}
        position={[0, -0.01, 0]}
        scale={0.02}
        renderOrder={2}
        frustumCulled={false}
      >
        <coneGeometry args={[1, 1, 36, 1, true]} />
        <meshBasicMaterial
          color="#ffd7a0"
          transparent
          opacity={0.08}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export function LampMechanism({
  pose,
  finish,
}: {
  pose: RefObject<RigState>;
  finish: Finish;
}) {
  const yaw = useRef<Group>(null);
  const lower = useRef<Group>(null);
  const lowerCounter = useRef<Group>(null);
  const upper = useRef<Group>(null);
  const upperCounter = useRef<Group>(null);
  const head = useRef<Group>(null);
  const throwMesh = useRef<Mesh>(null);
  const spot = useRef<SpotLightType>(null);
  const bulb = useRef<MeshStandardMaterial>(null);

  const brush = useMemo(() => brushedShellMap(finish.hex), [finish.hex]);

  useEffect(() => {
    return () => {
      brush.dispose();
    };
  }, [brush]);

  const seed = INITIAL_POSE;

  useFrame(() => {
    const p = pose.current;
    if (!p || !yaw.current || !lower.current || !lowerCounter.current) return;
    if (!upper.current || !upperCounter.current || !head.current) return;

    yaw.current.rotation.y = p.yaw;
    lower.current.rotation.x = -p.lower;
    lowerCounter.current.rotation.x = p.lower;
    upper.current.rotation.x = -p.upper;
    upperCounter.current.rotation.x = p.upper;
    head.current.rotation.x = -p.head;

    const cone = Math.max(0.08, p.cone);
    if (spot.current) {
      spot.current.angle = cone;
      spot.current.penumbra = p.penumbra;
      spot.current.intensity = 20 + p.intensity * 46;
    }
    if (bulb.current) {
      bulb.current.emissiveIntensity = 0.8 + p.emissive * 1.35;
    }
    if (throwMesh.current) {
      const len = 0.42 + cone * 0.5;
      const radius = Math.tan(cone) * len;
      throwMesh.current.scale.set(radius, len, radius);
      throwMesh.current.position.set(0, -0.5 * len, 0);
      const mat = throwMesh.current.material as THREE.MeshBasicMaterial;
      mat.opacity = p.showBeam ? 0.1 + p.intensity * 0.07 : 0.03 + p.intensity * 0.02;
    }
  });

  return (
    <group ref={yaw} rotation={[0, seed.yaw, 0]}>
      <group position={[0, LINK.collarY, 0]}>
        <Knuckle finish={finish} />

        <group ref={lower} rotation={[-seed.lower, 0, 0]}>
          <LinkRod length={LINK.l1} radius={0.007} map={brush} finish={finish} />
          <group position={[0, 0, LINK.l1]}>
            <group ref={lowerCounter} rotation={[seed.lower, 0, 0]}>
              <Knuckle finish={finish} />
              <group ref={upper} rotation={[-seed.upper, 0, 0]}>
                <LinkRod length={LINK.l2} radius={0.011} map={brush} finish={finish} />
                <group position={[0, 0, LINK.l2]}>
                  <group ref={upperCounter} rotation={[seed.upper, 0, 0]}>
                    <Knuckle finish={finish} />
                    <group ref={head} rotation={[-seed.head, 0, 0]}>
                      <HeadTube finish={finish} map={brush} bulb={bulb} />
                      <spotLight
                        ref={spot}
                        position={[0, 0, LINK.shadeLen * 0.55]}
                        angle={seed.cone}
                        penumbra={seed.penumbra}
                        intensity={40}
                        color="#ffe0a0"
                        castShadow
                        distance={8}
                        decay={1.45}
                        shadow-mapSize={[1024, 1024]}
                        shadow-bias={-0.0003}
                      >
                        <object3D attach="target" position={[0, 0, 1.8]} />
                      </spotLight>
                      <group position={[0, 0, LINK.shadeLen]}>
                        <ThrowCone mesh={throwMesh} />
                      </group>
                    </group>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
