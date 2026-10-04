import { animate } from "motion";

type LenisLike = {
  scrollTo: (
    target: number | string | HTMLElement,
    opts?: {
      offset?: number;
      immediate?: boolean;
      duration?: number;
      easing?: (t: number) => number;
      onComplete?: () => void;
    },
  ) => void;
};

let lenisRef: LenisLike | null = null;
let activeStop: (() => void) | null = null;
let programScroll = false;
let programTimer = 0;

/** Slow cinematic ease — long settle, soft landing */
export function cinematicEase(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

export function registerLenis(instance: LenisLike | null) {
  lenisRef = instance;
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isProgrammaticScroll() {
  return programScroll;
}

function beginProgramScroll(duration: number) {
  programScroll = true;
  window.clearTimeout(programTimer);
  programTimer = window.setTimeout(() => {
    programScroll = false;
  }, duration * 1000 + 80);
}

export function smoothScrollTo(
  target: number | string | HTMLElement,
  options?: { duration?: number },
) {
  const duration = options?.duration ?? 1.45;

  if (prefersReducedMotion()) {
    if (typeof target === "number") window.scrollTo(0, target);
    else {
      const el =
        typeof target === "string" ? document.querySelector(target) : target;
      el?.scrollIntoView({ behavior: "auto", block: "start" });
    }
    return;
  }

  activeStop?.();
  activeStop = null;
  beginProgramScroll(duration);

  if (lenisRef) {
    lenisRef.scrollTo(target, {
      duration,
      easing: cinematicEase,
      offset: 0,
      onComplete: () => {
        programScroll = false;
        window.clearTimeout(programTimer);
      },
    });
    return;
  }

  let y = 0;
  if (typeof target === "number") {
    y = target;
  } else {
    const el =
      typeof target === "string"
        ? document.querySelector<HTMLElement>(target)
        : target;
    if (!el) return;
    y = el.getBoundingClientRect().top + window.scrollY;
  }

  const from = window.scrollY;
  const controls = animate(from, y, {
    duration,
    ease: [0.16, 1, 0.3, 1],
    onUpdate: (v) => {
      window.scrollTo(0, v);
    },
    onComplete: () => {
      programScroll = false;
      window.clearTimeout(programTimer);
    },
  });
  activeStop = () => {
    controls.stop();
    programScroll = false;
    window.clearTimeout(programTimer);
  };
}

export function smoothScrollToId(id: string, duration?: number) {
  const el = document.getElementById(id);
  if (!el) return;
  smoothScrollTo(el, { duration });
}
