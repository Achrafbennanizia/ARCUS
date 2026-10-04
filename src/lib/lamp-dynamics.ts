/**
 * Per-hinge spring with a pendulum gravity term.
 *
 * accel = (k (target − angle) − c vel − gravity cos(angle)) / mass
 *
 * Angle is from horizontal, positive up, so cos(angle) pulls the link
 * down toward straight-down (−90°). The pose spring is stiff enough to
 * arrive; gravity makes the drop faster than the lift and leaves a short
 * settle. Reduced motion snaps instead of stepping.
 */

export type Hinge = {
  angle: number;
  vel: number;
  target: number;
};

export type HingeConfig = {
  stiffness: number;
  damping: number;
  mass: number;
  /** Torque scale. 0 disables gravity on this hinge. */
  gravity: number;
  min: number;
  max: number;
};

export function createHinge(angle: number): Hinge {
  return { angle, vel: 0, target: angle };
}

export function snapHinge(h: Hinge, target: number) {
  h.angle = target;
  h.vel = 0;
  h.target = target;
}

export function stepHinge(h: Hinge, dt: number, cfg: HingeConfig) {
  const torque =
    cfg.stiffness * (h.target - h.angle) -
    cfg.damping * h.vel -
    cfg.gravity * Math.cos(h.angle);
  h.vel += (torque / cfg.mass) * dt;
  h.angle += h.vel * dt;
  if (h.angle <= cfg.min) {
    h.angle = cfg.min;
    if (h.vel < 0) h.vel = 0;
  } else if (h.angle >= cfg.max) {
    h.angle = cfg.max;
    if (h.vel > 0) h.vel = 0;
  }
}
