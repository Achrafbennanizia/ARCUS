import { BEAMS, type BeamMode } from "@/lib/content";
import type { SectionId } from "@/lib/sections";

/**
 * ARCUS lamp linkage
 * ------------------
 * Two slim links in the arm plane (after base yaw): a thin stay, then the long arm.
 *
 * Angles are measured from horizontal forward (+Z), positive up:
 *   elbow = (z: L1 cos lower, y: L1 sin lower)
 *   head  = elbow + (z: L2 cos upper, y: L2 sin upper)
 *
 * Elbow-up IK keeps the middle joint above the shoulder-to-head chord.
 * Joint plates stay parallel to the shoulder (they do not accumulate tilt);
 * head pitch is a separate hinge on the distal plate. Negative head pitch
 * aims the shade down toward the desk.
 *
 * Hinge transforms use rotation.x = -angle so Three.js's X rotation
 * matches this convention.
 */

const DEG = Math.PI / 180;

export const LINK = {
  l1: 0.68,
  l2: 0.62,
  collarY: 0.378,
  /** Rod sits on the link axis. Radius is the tube, used for desk clearance. */
  barGap: 0,
  barRadius: 0.012,
  shadeLen: 0.2,
  shadeRadius: 0.032,
  /** Clearance used when authoring a target pose. */
  targetClearance: 0.055,
  /** Hard floor while the arm is in motion (gravity may sag onto this). */
  hardClearance: 0.028,
} as const;

export const LIMITS = {
  lower: { min: 16 * DEG, max: 148 * DEG },
  /** lower − upper. Keeps the bars from folding straight or crossing. */
  separation: { min: 28 * DEG, max: 155 * DEG },
  upper: { min: -70 * DEG, max: 132 * DEG },
  /** Negative aims the shade at the desk. */
  head: { min: -50 * DEG, max: 32 * DEG },
  yaw: { min: -2.2, max: 2.2 },
} as const;

export type JointAngles = {
  yaw: number;
  lower: number;
  upper: number;
  head: number;
};

export type LampPose = JointAngles & {
  scale: number;
  cone: number;
  penumbra: number;
  intensity: number;
  emissive: number;
};

type HeadTarget = {
  /** Head hinge relative to the shoulder. y up, z forward. */
  y: number;
  z: number;
  head: number;
  yaw: number;
  scale: number;
};

const SECTION_TARGETS: Record<SectionId, HeadTarget> = {
  top: { y: 0.46, z: 0.86, head: -16 * DEG, yaw: -0.42, scale: 1 },
  beam: { y: 0.22, z: 0.9, head: -24 * DEG, yaw: -0.2, scale: 1.02 },
  finishes: { y: 0.4, z: 0.74, head: -10 * DEG, yaw: -1.05, scale: 1.06 },
  shipping: { y: 0.78, z: 0.22, head: -8 * DEG, yaw: -0.15, scale: 0.9 },
  waitlist: { y: 0.42, z: 0.82, head: -14 * DEG, yaw: -0.55, scale: 1.04 },
};

/** Beam modes place the head. Cone width comes from content. */
const BEAM_TARGETS: Record<BeamMode, HeadTarget> = {
  focus: { y: -0.06, z: 0.9, head: -46 * DEG, yaw: -0.22, scale: 1.02 },
  flood: { y: 0.2, z: 1.02, head: -24 * DEG, yaw: 0.2, scale: 1.02 },
  ambient: { y: 0.74, z: 0.42, head: 26 * DEG, yaw: -0.9, scale: 1.02 },
};

const PENUMBRA: Record<BeamMode, number> = {
  focus: 0.16,
  flood: 0.5,
  ambient: 0.94,
};

const EMISSIVE: Record<BeamMode, number> = {
  focus: 2.4,
  flood: 1.7,
  ambient: 1.05,
};

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/** Point on a link. `lateral` is the arm-plane offset (bar gap). */
export function linkPoint(angle: number, along: number, lateral: number) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return {
    y: lateral * c + along * s,
    z: -lateral * s + along * c,
  };
}

export function solveArm(y: number, z: number): { lower: number; upper: number } {
  const { l1, l2 } = LINK;
  let py = y;
  let pz = z;
  let r = Math.hypot(py, pz);
  const minR = Math.abs(l1 - l2) + 0.03;
  const maxR = l1 + l2 - 0.03;
  const reach = clamp(r, minR, maxR);
  if (r < 1e-5) {
    py = 0;
    pz = reach;
    r = reach;
  } else if (Math.abs(reach - r) > 1e-6) {
    const s = reach / r;
    py *= s;
    pz *= s;
    r = reach;
  }

  const phi = Math.atan2(py, pz);
  const cosBeta = (r * r + l1 * l1 - l2 * l2) / (2 * r * l1);
  const beta = Math.acos(clamp(cosBeta, -1, 1));
  const lower = phi + beta;
  const ey = l1 * Math.sin(lower);
  const ez = l1 * Math.cos(lower);
  const upper = Math.atan2(py - ey, pz - ez);
  return { lower, upper };
}

/** Swing range of the upper link so the bars cannot fold flat or cross. */
export function upperSwing(lower: number) {
  return {
    min: Math.max(LIMITS.upper.min, lower - LIMITS.separation.max),
    max: Math.min(LIMITS.upper.max, lower - LIMITS.separation.min),
  };
}

export function clampJoints(j: JointAngles): JointAngles {
  let lower = clamp(j.lower, LIMITS.lower.min, LIMITS.lower.max);
  let upper = clamp(j.upper, LIMITS.upper.min, LIMITS.upper.max);
  let sep = clamp(lower - upper, LIMITS.separation.min, LIMITS.separation.max);
  upper = clamp(lower - sep, LIMITS.upper.min, LIMITS.upper.max);
  sep = lower - upper;
  if (sep < LIMITS.separation.min) {
    lower = clamp(upper + LIMITS.separation.min, LIMITS.lower.min, LIMITS.lower.max);
  } else if (sep > LIMITS.separation.max) {
    lower = clamp(upper + LIMITS.separation.max, LIMITS.lower.min, LIMITS.lower.max);
  }
  sep = clamp(lower - upper, LIMITS.separation.min, LIMITS.separation.max);
  upper = lower - sep;
  return {
    lower,
    upper,
    head: clamp(j.head, LIMITS.head.min, LIMITS.head.max),
    yaw: clamp(j.yaw, LIMITS.yaw.min, LIMITS.yaw.max),
  };
}

function lowestOnLink(originY: number, angle: number, length: number) {
  let min = Infinity;
  for (let i = 0; i <= 4; i++) {
    const p = linkPoint(angle, (length * i) / 4, -LINK.barGap);
    min = Math.min(min, originY + p.y - LINK.barRadius);
  }
  return min;
}

/** Lowest world-Y of the bars and the shade rim. Ground is y = 0. */
export function lowestPoint(lower: number, upper: number, head: number) {
  const elbow = linkPoint(lower, LINK.l1, 0);
  const elbowY = LINK.collarY + elbow.y;
  const bars = Math.min(
    lowestOnLink(LINK.collarY, lower, LINK.l1),
    lowestOnLink(elbowY, upper, LINK.l2),
  );
  const tip = linkPoint(upper, LINK.l2, 0);
  const hingeY = elbowY + tip.y;
  const rim =
    hingeY +
    LINK.shadeLen * Math.sin(head) -
    LINK.shadeRadius * Math.abs(Math.cos(head));
  const neck = hingeY - LINK.shadeRadius * 0.28;
  return Math.min(bars, rim, neck);
}

/**
 * Push a pose up off the desk. Used while integrating so a spring
 * overshoot or the gravity sag cannot carry the shade through the top.
 */
export function liftOffDesk(j: JointAngles, clearance: number = LINK.hardClearance): JointAngles {
  let { lower, upper, head } = j;
  const { yaw } = j;
  for (let i = 0; i < 10; i++) {
    if (lowestPoint(lower, upper, head) >= clearance) {
      return { lower, upper, head, yaw };
    }
    const lifted = clampJoints({
      lower,
      upper: upper + 0.04,
      head,
      yaw,
    });
    const stuck = Math.abs(lifted.upper - upper) < 1e-4;
    lower = lifted.lower;
    upper = lifted.upper;
    if (stuck) head = Math.min(LIMITS.head.max, head + 0.05);
  }
  return clampJoints({ lower, upper, head, yaw });
}

function optics(beam: BeamMode, onBeam: boolean) {
  const spec = BEAMS.find((b) => b.id === beam) ?? BEAMS[0];
  const live = onBeam ? 1 : 0.82;
  return {
    cone: spec.angle,
    penumbra: PENUMBRA[beam],
    intensity: spec.intensity * live,
    emissive: EMISSIVE[beam] * (onBeam ? 1 : 0.75),
  };
}

export function resolvePose(section: SectionId, beam: BeamMode): LampPose {
  const spec = section === "beam" ? BEAM_TARGETS[beam] : SECTION_TARGETS[section] ?? SECTION_TARGETS.top;
  let y = spec.y;
  const z = spec.z;
  let solved = clampJoints({
    ...solveArm(y, z),
    head: spec.head,
    yaw: spec.yaw,
  });

  for (let i = 0; i < 8; i++) {
    if (lowestPoint(solved.lower, solved.upper, solved.head) >= LINK.targetClearance) {
      break;
    }
    y += 0.05;
    solved = clampJoints({
      ...solveArm(y, z),
      head: spec.head,
      yaw: spec.yaw,
    });
  }

  solved = liftOffDesk(solved, LINK.targetClearance);

  return {
    ...solved,
    scale: spec.scale,
    ...optics(beam, section === "beam"),
  };
}

export const INITIAL_POSE: LampPose = resolvePose("top", "focus");
