"use client";

import { motion } from "motion/react";
import { CONTENT } from "@/lib/content";
import { smoothScrollToId } from "@/lib/scroll-to";

export function Hero() {
  return (
    <section
      id="top"
      className="section-panel relative z-10 px-5 pt-[46dvh] pb-14 md:px-8 md:py-24 md:pt-32"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] md:items-center">
        <div className="max-w-xl">
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
            className="display copy-legible-title text-[clamp(3.2rem,8vw,6.5rem)]"
          >
            {CONTENT.brand}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.32 }}
            className="copy-legible mt-5 max-w-md text-lg leading-relaxed md:text-xl"
          >
            {CONTENT.heroLine}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.23, 1, 0.32, 1], delay: 0.45 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <button
              type="button"
              className="btn-beam"
              onClick={() => smoothScrollToId("waitlist", 1.5)}
            >
              {CONTENT.heroCta}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => smoothScrollToId("beam", 1.35)}
            >
              {CONTENT.heroSecondary}
            </button>
          </motion.div>
        </div>

        <div className="hidden min-h-[36vh] md:block" aria-hidden />
      </div>
    </section>
  );
}
