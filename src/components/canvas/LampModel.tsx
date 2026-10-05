"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useSpring } from "motion/react";
import type { Group } from "three";
import { FINISHES } from "@/lib/content";
import { useActiveSection } from "@/lib/active-section";
import { createHinge, snapHinge, stepHinge, type HingeConfig } from "@/lib/lamp-dynamics";
import {
  INITIAL_POSE,
  LIMITS,
  liftOffDesk,
  resolvePose,
  upperSwing,
} from "@/lib/lamp-kinematics";
import { useLampState } from "@/lib/lamp-state";
import { brushedShellMap } from "@/lib/materials";
import { useScrollProgress } from "@/lib/scroll-progress";
import { LampMechanism, type RigState } from "./LampMechanism";

type Finish = (typeof FINISHES)[number];

const LOWER: HingeConfig = {
  stiffness: 62,
  damping: 13.5,
  mass: 1.2,
  gravity: 6.2,
  min: LIMITS.lower.min,
  max: LIMITS.lower.max,
};
const UPPER: Omit<HingeConfig, "min" | "max"> = {
  stiffness: 54,
  damping: 11.5,
  mass: 0.9,
  gravity: 3.4,
};
const HEAD: HingeConfig = {
  stiffness: 80,
  damping: 9,
  mass: 0.4,
  gravity: 1.1,
  min: LIMITS.head.min,
  max: LIMITS.head.max,
};
const YAW: HingeConfig = {
  stiffness: 42,
  damping: 11,
  mass: 1,
  gravity: 0,
  min: LIMITS.yaw.min,
  max: LIMITS.yaw.max,
};

const OPTICAL = { stiffness: 120, damping: 20, mass: 0.9 } as const;

function LampStand({ finish }: { finish: Finish }) {
  const brush = useMemo(() => brushedShellMap(finish.hex), [finish.hex]);
  useEffect(() => {
    return () => {
      brush.dispose();
    };
  }, [brush]);

  const shell = {
    color: "#ffffff" as const,
    map: brush,
    metalness: finish.metalness,
    roughness: Math.max(0.14, finish.roughness - 0.04),
  };
  const accent = {
    color: finish.accent,
    metalness: Math.min(0.95, finish.metalness + 0.12),
    roughness: Math.max(0.12, finish.roughness - 0.14),
  };

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.022, 0]}>
        <cylinderGeometry args={[0.34, 0.36, 0.036, 64]} />
        <meshStandardMaterial {...shell} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.046, 0]}>
        <cylinderGeometry args={[0.12, 0.2, 0.016, 48]} />
        <meshStandardMaterial {...shell} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.014, 0.018, 0.28, 24]} />
        <meshStandardMaterial {...shell} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.348, 0]}>
        <sphereGeometry args={[0.028, 24, 16]} />
        <meshStandardMaterial {...accent} />
      </mesh>
    </group>
  );
}

export function LampModel({ foot }: { foot?: RefObject<Group | null> }) {
  const root = useRef<Group>(null);
  const { reducedMotion } = useScrollProgress();
  const active = useActiveSection();
  const { beam, finish } = useLampState();

  const yaw = useRef(createHinge(INITIAL_POSE.yaw));
  const lower = useRef(createHinge(INITIAL_POSE.lower));
  const upper = useRef(createHinge(INITIAL_POSE.upper));
  const head = useRef(createHinge(INITIAL_POSE.head));
  const rig = useRef<RigState>({ ...INITIAL_POSE, showBeam: false });

  const scaleSpring = useSpring(INITIAL_POSE.scale, OPTICAL);
  const coneSpring = useSpring(INITIAL_POSE.cone, OPTICAL);
  const penumbraSpring = useSpring(INITIAL_POSE.penumbra, OPTICAL);
  const intensitySpring = useSpring(INITIAL_POSE.intensity, OPTICAL);

  useEffect(() => {
    const t = resolvePose(active, beam);
    if (reducedMotion) {
      scaleSpring.jump(t.scale);
      coneSpring.jump(t.cone);
      penumbraSpring.jump(t.penumbra);
      intensitySpring.jump(t.intensity);
      return;
    }
    scaleSpring.set(t.scale);
    coneSpring.set(t.cone);
    penumbraSpring.set(t.penumbra);
    intensitySpring.set(t.intensity);
  }, [
    active,
    beam,
    reducedMotion,
    scaleSpring,
    coneSpring,
    penumbraSpring,
    intensitySpring,
  ]);

  useFrame((_, delta) => {
    const goal = resolvePose(active, beam);
    if (reducedMotion) {
      snapHinge(yaw.current, goal.yaw);
      snapHinge(lower.current, goal.lower);
      snapHinge(upper.current, goal.upper);
      snapHinge(head.current, goal.head);
    } else {
      yaw.current.target = goal.yaw;
      lower.current.target = goal.lower;
      upper.current.target = goal.upper;
      head.current.target = goal.head;

      const dt = Math.min(delta, 0.05);
      const steps = dt > 0.02 ? 2 : 1;
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        stepHinge(lower.current, h, LOWER);
        const swing = upperSwing(lower.current.angle);
        stepHinge(upper.current, h, { ...UPPER, min: swing.min, max: swing.max });
        stepHinge(head.current, h, HEAD);
        stepHinge(yaw.current, h, YAW);
      }

      const lifted = liftOffDesk({
        yaw: yaw.current.angle,
        lower: lower.current.angle,
        upper: upper.current.angle,
        head: head.current.angle,
      });
      if (lifted.lower !== lower.current.angle) {
        lower.current.angle = lifted.lower;
        lower.current.vel = 0;
      }
      if (lifted.upper > upper.current.angle) {
        if (upper.current.vel < 0) upper.current.vel = 0;
        upper.current.angle = lifted.upper;
      }
      if (lifted.head > head.current.angle) {
        if (head.current.vel < 0) head.current.vel = 0;
        head.current.angle = lifted.head;
      }
    }

    const showBeam = active === "beam";
    rig.current = {
      yaw: yaw.current.angle,
      lower: lower.current.angle,
      upper: upper.current.angle,
      head: head.current.angle,
      scale: scaleSpring.get(),
      cone: coneSpring.get(),
      penumbra: penumbraSpring.get(),
      intensity: intensitySpring.get(),
      emissive: goal.emissive,
      showBeam,
    };

    if (root.current) root.current.scale.setScalar(rig.current.scale);
  });

  return (
    <group ref={root} scale={INITIAL_POSE.scale}>
      {/* Bottom of the base disc. The desk locks to this, not the light cone. */}
      <group ref={foot} position={[0, 0.004, 0]} userData={{ isFoot: true }} />
      <LampStand finish={finish} />
      <LampMechanism pose={rig} finish={finish} />
    </group>
  );
}
