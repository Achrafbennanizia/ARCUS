"use client";

import { motion } from "motion/react";
import { CONTENT, FINISHES } from "@/lib/content";
import { useLampState } from "@/lib/lamp-state";

export function Finishes() {
  const { finishId, setFinishId } = useLampState();

  return (
    <section
      id="finishes"
      className="section-panel section-surface section-surface--finishes relative z-10 px-5 py-12 md:px-8 md:py-16"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.85fr)] md:items-center md:gap-12">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.75, ease: [0.23, 1, 0.32, 1] }}
            className="max-w-xl"
          >
            <p className="copy-legible text-xs font-semibold tracking-[0.24em] text-beam">
              {CONTENT.finishesEyebrow}
            </p>
            <h2 className="display copy-legible-title mt-3 text-3xl md:mt-4 md:text-5xl">
              {CONTENT.finishesTitle}
            </h2>
            <p className="copy-legible-muted mt-4 text-[15px] leading-relaxed">
              {CONTENT.finishesBody}
            </p>
          </motion.div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {FINISHES.map((finish, i) => {
              const active = finishId === finish.id;
              return (
                <motion.button
                  key={finish.id}
                  type="button"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.55,
                    delay: i * 0.05,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                  onClick={() => setFinishId(finish.id)}
                  className="finish-swatch rounded-2xl border p-5 text-left"
                  style={{
                    borderColor: active ? finish.accent : "var(--line)",
                    background: active
                      ? "rgba(36, 44, 58, 0.96)"
                      : "rgba(32, 40, 54, 0.82)",
                    boxShadow: active
                      ? `0 0 0 1px ${finish.accent}55, 0 20px 50px rgba(0,0,0,0.28)`
                      : "0 12px 32px rgba(0,0,0,0.16)",
                  }}
                  aria-pressed={active}
                >
                  <span
                    className="block h-16 w-full rounded-xl border border-white/10"
                    style={{
                      background: `linear-gradient(145deg, ${finish.accent}, ${finish.hex} 55%, #1a2230)`,
                    }}
                    aria-hidden
                  />
                  <p className="display copy-legible mt-4 text-xl">
                    {finish.name}
                  </p>
                  <p className="copy-legible-muted mt-2 text-sm leading-relaxed">
                    {finish.note}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="hidden md:block" aria-hidden />
      </div>
    </section>
  );
}
