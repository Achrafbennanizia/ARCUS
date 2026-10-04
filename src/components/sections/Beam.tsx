"use client";

import { useEffect, useRef } from "react";
import { LayoutGroup, motion } from "motion/react";
import { BEAMS, CONTENT, type BeamMode } from "@/lib/content";
import { useActiveSection } from "@/lib/active-section";
import { useLampState } from "@/lib/lamp-state";
import { smoothScrollToId } from "@/lib/scroll-to";

const SELECT_SPRING = {
  type: "spring" as const,
  stiffness: 380,
  damping: 32,
  mass: 0.7,
};

export function Beam() {
  const { beam, setBeam } = useLampState();
  const activeSection = useActiveSection();
  const listRef = useRef<HTMLDivElement>(null);
  /** Ignore scroll-sync briefly after a deliberate click */
  const ignoreIoUntil = useRef(0);

  const selectThrow = (id: BeamMode) => {
    ignoreIoUntil.current = performance.now() + 1200;
    setBeam(id);
    if (activeSection !== "beam") {
      smoothScrollToId("beam", 0.9);
    }
  };

  // While Beam is active, the option nearest mid can drive the model —
  // but never override a fresh click.
  useEffect(() => {
    if (activeSection !== "beam") return;
    const root = listRef.current;
    if (!root) return;
    const buttons = Array.from(
      root.querySelectorAll<HTMLButtonElement>("[data-beam-id]"),
    );
    if (!buttons.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (performance.now() < ignoreIoUntil.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0),
          );
        const top = visible[0];
        if (!top) return;
        const id = (top.target as HTMLElement).dataset.beamId as
          | BeamMode
          | undefined;
        if (id) setBeam(id);
      },
      {
        root: null,
        threshold: [0.55, 0.8],
        rootMargin: "-32% 0px -40% 0px",
      },
    );

    buttons.forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, [activeSection, setBeam]);

  return (
    <section
      id="beam"
      className="section-panel relative z-10 px-5 py-12 md:px-8 md:py-16"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.85fr)] md:items-center md:gap-12">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.75, ease: [0.23, 1, 0.32, 1] }}
          >
            <p className="copy-legible text-xs font-semibold tracking-[0.24em] text-beam">
              {CONTENT.beamEyebrow}
            </p>
            <h2 className="display copy-legible-title mt-3 text-3xl md:mt-4 md:text-5xl">
              {CONTENT.beamTitle}
            </h2>
            <p className="copy-legible-muted mt-4 max-w-md text-[15px] leading-relaxed">
              {CONTENT.heroBody}
            </p>
            <p className="copy-legible-muted mt-3 max-w-md text-[15px] leading-relaxed">
              {CONTENT.beamBody}
            </p>
          </motion.div>

          <LayoutGroup id="beam-throws">
            <div ref={listRef} className="mt-8 flex flex-col gap-2.5">
              {BEAMS.map((mode, i) => {
                const active = beam === mode.id;
                return (
                  <motion.button
                    key={mode.id}
                    type="button"
                    data-beam-id={mode.id}
                    initial={false}
                    whileTap={{ scale: 0.985 }}
                    transition={SELECT_SPRING}
                    onClick={() => selectThrow(mode.id)}
                    className="beam-option relative isolate overflow-hidden rounded-2xl border px-5 py-3.5 text-left md:py-4"
                    style={{
                      borderColor: active
                        ? "color-mix(in oklab, var(--beam) 70%, transparent)"
                        : "var(--line)",
                      background: "rgba(20, 24, 32, 0.55)",
                    }}
                    aria-pressed={active}
                  >
                    {active ? (
                      <motion.span
                        layoutId="beam-active-shell"
                        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl"
                        style={{
                          background:
                            "color-mix(in oklab, var(--beam) 14%, var(--void-elevated))",
                        }}
                        transition={SELECT_SPRING}
                      />
                    ) : null}
                    {active ? (
                      <motion.span
                        layoutId="beam-active-bar"
                        className="pointer-events-none absolute top-3 bottom-3 left-0 w-[3px] rounded-full bg-beam"
                        transition={SELECT_SPRING}
                      />
                    ) : null}
                    <div className="flex items-baseline justify-between gap-4 pl-2">
                      <p className="display copy-legible text-xl md:text-2xl">
                        {mode.label}
                      </p>
                      <p className="copy-legible text-[11px] tracking-[0.18em] text-beam uppercase">
                        {mode.throw}
                      </p>
                    </div>
                    <p className="copy-legible-muted mt-1.5 max-w-md pl-2 text-sm leading-relaxed">
                      {mode.detail}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </LayoutGroup>
        </div>

        <div className="hidden md:block" aria-hidden />
      </div>
    </section>
  );
}
