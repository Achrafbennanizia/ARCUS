"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";
import { useScrollProgress } from "@/lib/scroll-progress";
import { SECTIONS, type SectionId } from "@/lib/sections";
import {
  isProgrammaticScroll,
  prefersReducedMotion,
  smoothScrollToId,
} from "@/lib/scroll-to";

const SNAP_AT = 0.93;
const SNAP_DURATION = 0.95;
const SNAP_COOLDOWN_MS = 700;

function goToSection(id: string, duration = 1.6) {
  smoothScrollToId(id, duration);
}

type Top = { id: SectionId; top: number };

function measureTops(): Top[] {
  return SECTIONS.map((s) => {
    const el = document.getElementById(s.id);
    return el ? { id: s.id, top: el.offsetTop } : null;
  }).filter((x): x is Top => Boolean(x));
}

let lastY = 0;
let scrollDir: 1 | -1 | 0 = 0;
let cachedTops: Top[] = [];
let lastSnapAt = 0;

function maybeThresholdSnap() {
  if (isProgrammaticScroll() || prefersReducedMotion()) return;
  if (performance.now() - lastSnapAt < SNAP_COOLDOWN_MS) return;

  const tops = cachedTops;
  if (tops.length < 2) return;
  const y = window.scrollY;

  let i = 0;
  for (let n = 0; n < tops.length; n++) {
    if (y >= tops[n].top) i = n;
  }

  const snap = (id: SectionId) => {
    lastSnapAt = performance.now();
    goToSection(id, SNAP_DURATION);
  };

  if (scrollDir >= 0 && i < tops.length - 1) {
    const a = tops[i].top;
    const b = tops[i + 1].top;
    const span = b - a;
    if (span >= 80 && (y - a) / span >= SNAP_AT && y < b - 2) {
      snap(tops[i + 1].id);
      return;
    }
  }

  if (scrollDir <= 0 && i < tops.length - 1) {
    const a = tops[i].top;
    const b = tops[i + 1].top;
    const span = b - a;
    if (span >= 80 && (b - y) / span >= SNAP_AT && y > a + 2) {
      snap(tops[i].id);
      return;
    }
  }

  if (scrollDir <= 0 && i === tops.length - 1 && i > 0) {
    const curr = tops[i].top;
    const prev = tops[i - 1].top;
    const span = curr - prev;
    if (span >= 80 && y < curr && (curr - y) / span >= SNAP_AT && y > prev + 2) {
      snap(tops[i - 1].id);
    }
  }
}

export function ScrollAssist() {
  const systemReduced = useReducedMotion();
  const { paused, togglePause } = useScrollProgress();
  const reduced = Boolean(systemReduced) || paused;
  const [active, setActive] = useState<SectionId>("top");
  const [hint, setHint] = useState(true);
  const progressMv = useMotionValue(0);
  const progress = useSpring(progressMv, {
    stiffness: reduced ? 400 : 120,
    damping: reduced ? 40 : 28,
    mass: 0.6,
  });

  useEffect(() => {
    let raf = 0;
    let settle = 0;
    let ticking = false;
    let hintCleared = false;

    const refreshTops = () => {
      cachedTops = measureTops();
    };

    const read = () => {
      ticking = false;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressMv.set(max > 0 ? Math.min(1, y / max) : 0);

      if (!hintCleared && y > window.innerHeight * 0.45) {
        hintCleared = true;
        setHint(false);
      }

      const mid = y + window.innerHeight * 0.4;
      let best: SectionId = "top";
      let bestDist = Infinity;
      for (const section of cachedTops) {
        const d = Math.abs(section.top - mid);
        if (d < bestDist) {
          bestDist = d;
          best = section.id;
        }
      }
      setActive((prev) => (prev === best ? prev : best));
    };

    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY;
      if (Math.abs(dy) > 0.5) scrollDir = dy > 0 ? 1 : -1;
      lastY = y;

      if (!ticking) {
        ticking = true;
        raf = requestAnimationFrame(read);
      }

      window.clearTimeout(settle);
      settle = window.setTimeout(() => maybeThresholdSnap(), 120);
    };

    refreshTops();
    lastY = window.scrollY;
    const boot = requestAnimationFrame(read);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", refreshTops, { passive: true });
    return () => {
      cancelAnimationFrame(boot);
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", refreshTops);
    };
  }, [progressMv]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (!e.altKey) return;

      const idx = SECTIONS.findIndex((s) => s.id === active);
      const next =
        e.key === "ArrowDown"
          ? Math.min(SECTIONS.length - 1, Math.max(0, idx) + 1)
          : Math.max(0, Math.max(0, idx) - 1);
      if (next === idx) return;
      e.preventDefault();
      goToSection(SECTIONS[next].id);
      setHint(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <>
      <aside
        className="pointer-events-none fixed top-1/2 right-3 z-40 hidden -translate-y-1/2 md:right-5 md:block lg:right-8"
        aria-label="Section progress"
      >
        <div className="pointer-events-auto relative flex flex-col items-center gap-3">
          <div
            className="absolute top-2 bottom-2 left-1/2 w-px -translate-x-1/2 bg-line"
            aria-hidden
          />
          <motion.div
            className="absolute top-2 left-1/2 w-px origin-top -translate-x-1/2 bg-beam"
            style={{ scaleY: progress, height: "calc(100% - 1rem)" }}
            aria-hidden
          />
          {SECTIONS.map((section) => {
            const isActive = active === section.id;
            return (
              <button
                key={section.id}
                type="button"
                title={section.label}
                aria-label={`Go to ${section.label}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => {
                  goToSection(section.id);
                  setHint(false);
                }}
                className="group relative z-10 flex h-4 w-4 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-beam"
              >
                <motion.span
                  className="block rounded-full"
                  animate={
                    isActive
                      ? {
                          width: 10,
                          height: 10,
                          backgroundColor: "#f0a84b",
                          boxShadow: "0 0 14px rgba(240,168,75,0.5)",
                        }
                      : {
                          width: 6,
                          height: 6,
                          backgroundColor: "rgba(154,150,140,0.55)",
                          boxShadow: "0 0 0 rgba(0,0,0,0)",
                        }
                  }
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                />
                <span className="pointer-events-none absolute right-6 rounded bg-void/90 px-2 py-1 text-[10px] tracking-[0.16em] text-mist uppercase opacity-0 shadow-lg ring-1 ring-line transition duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {section.label}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <motion.button
        type="button"
        onClick={() => {
          goToSection("beam");
          setHint(false);
        }}
        initial={false}
        animate={{ opacity: hint ? 1 : 0, y: hint ? 0 : 10 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed bottom-8 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-1.5 text-[10px] tracking-[0.22em] text-mist uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-beam ${
          hint ? "" : "pointer-events-none"
        }`}
        style={{
          color: "#f5f2ea",
          textShadow: "0 2px 12px rgba(0,0,0,0.95)",
        }}
        aria-label="Scroll to next section"
      >
        <span>Scroll</span>
        <motion.span
          className="block h-8 w-px origin-top bg-gradient-to-b from-beam to-transparent"
          animate={
            hint && !reduced
              ? { scaleY: [1, 0.55, 1], opacity: [0.9, 0.35, 0.9] }
              : {}
          }
          transition={
            hint && !reduced
              ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
              : undefined
          }
          aria-hidden
        />
      </motion.button>
      <button
        type="button"
        onClick={togglePause}
        aria-pressed={paused}
        className="fixed bottom-8 right-5 z-40 rounded-full border border-line bg-void/90 px-3 py-2 text-[10px] tracking-[0.16em] text-mist uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-beam"
      >
        {paused ? "Play motion" : "Pause motion"}
      </button>
    </>
  );
}
