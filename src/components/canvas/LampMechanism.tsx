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
        <cylinderGeometry args={[r, r * 0.86, len, 40, 1, true]} />
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
  const spotTarget = useRef<THREE.Object3D>(null);
  const bulb = useRef<MeshStandardMaterial>(null);
  const deskClip = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    [],
  );
  const aim = useMemo(
    () => ({
      origin: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      foot: new THREE.Vector3(),
      hit: new THREE.Vector3(),
    }),
    [],
  );

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
    head.current.updateWorldMatrix(true, false);
    aim.origin.set(0, 0, LINK.shadeLen).applyMatrix4(head.current.matrixWorld);
    aim.dir.set(0, 0, 1).transformDirection(head.current.matrixWorld);

    let groundY = aim.origin.y - 0.8;
    let root: THREE.Object3D | null = head.current;
    while (root.parent) root = root.parent;
    root.traverse((obj) => {
      if (obj.userData.isFoot) groundY = obj.getWorldPosition(aim.foot).y;
    });

    // End the beam where it meets the desk. If the head aims up, keep a short cone in the air.
    let len = 0.9;
    if (aim.dir.y < -0.12) {
      len = Math.min(2.6, Math.max(0.28, (groundY - aim.origin.y) / aim.dir.y));
    }

    // The base is a disc around the foot. Stop the beam before the cone enters it.
    const baseRadius = 0.5;
    const steps = 28;
    for (let i = 1; i <= steps; i++) {
      const t = (len * i) / steps;
      const y = aim.origin.y + aim.dir.y * t;
      if (y <= groundY + 0.015) break;
      const radial = Math.hypot(
        aim.origin.x + aim.dir.x * t - aim.foot.x,
        aim.origin.z + aim.dir.z * t - aim.foot.z,
      );
      const coneRadius = Math.tan(cone) * t;
      if (radial < baseRadius + coneRadius) {
        len = Math.max(0.12, ((i - 1) / steps) * len);
        break;
      }
    }

    aim.hit.copy(aim.origin).addScaledVector(aim.dir, len);

    if (spot.current && spotTarget.current) {
      if (spotTarget.current.parent !== root) root.add(spotTarget.current);
      spotTarget.current.position.copy(aim.hit);
      spotTarget.current.updateMatrixWorld();
      spot.current.target = spotTarget.current;
      spot.current.layers.set(1);
      spot.current.angle = cone;
      spot.current.penumbra = p.penumbra;
      spot.current.intensity = 500 + p.intensity * 900;
      spot.current.distance = 8;
    }
    if (bulb.current) {
      bulb.current.emissiveIntensity = 0.8 + p.emissive * 1.35;
    }
    if (throwMesh.current) {
      const radius = Math.tan(cone) * len;
      throwMesh.current.scale.set(radius, len, radius);
      throwMesh.current.position.set(0, -0.5 * len, 0);
      const mat = throwMesh.current.material as THREE.MeshBasicMaterial;
      // Cut the cone on the desktop so it cannot continue through the base or below the landing.
      deskClip.constant = -(groundY + 0.01);
      mat.clippingPlanes = [deskClip];
      mat.clipShadows = true;
      mat.opacity = p.showBeam ? 0.16 + p.intensity * 0.1 : 0.1 + p.intensity * 0.04;
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
                      <object3D ref={spotTarget} />
                      <spotLight
                        ref={spot}
                        position={[0, 0, LINK.shadeLen + 0.02]}
                        angle={seed.cone}
                        penumbra={seed.penumbra}
                        intensity={180}
                        color="#ffe0a0"
                        castShadow
                        decay={1.15}
                        shadow-mapSize={[1024, 1024]}
                        shadow-bias={-0.0004}
                      />
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
