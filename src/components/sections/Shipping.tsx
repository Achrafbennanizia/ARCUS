"use client";

import { motion } from "motion/react";
import { CONTENT, SHIPPING } from "@/lib/content";

export function Shipping() {
  return (
    <section
      id="shipping"
      className="section-panel section-surface section-surface--shipping relative z-10 px-5 py-12 md:px-8 md:py-16"
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
              {CONTENT.shippingEyebrow}
            </p>
            <h2 className="display copy-legible-title mt-3 text-3xl md:mt-4 md:text-5xl">
              {CONTENT.shippingTitle}
            </h2>
            <p className="copy-legible-muted mt-4 text-[15px] leading-relaxed">
              {CONTENT.shippingBody}
            </p>
          </motion.div>

          <div className="mt-10 overflow-hidden rounded-[1.5rem] border border-line bg-[rgba(34,44,58,0.88)] shadow-[0_24px_60px_rgba(0,0,0,0.22)]">
            {SHIPPING.map((row, i) => (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{
                  duration: 0.55,
                  delay: i * 0.06,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className="ship-row grid gap-3 border-b border-line px-5 py-6 last:border-b-0 md:grid-cols-[7rem_9rem_1fr_7rem] md:items-center md:gap-6 md:px-7 md:py-7"
              >
                <p className="copy-legible-muted text-[11px] tracking-[0.2em] uppercase">
                  {row.window}
                </p>
                <p className="display copy-legible text-2xl md:text-3xl">
                  {row.month}
                </p>
                <div>
                  <p className="copy-legible text-sm">{row.seats}</p>
                  <p className="copy-legible-muted mt-1 text-sm leading-relaxed">
                    {row.note}
                  </p>
                </div>
                <p
                  className="text-[11px] font-semibold tracking-[0.18em] uppercase md:text-right"
                  style={{
                    color:
                      row.status === "Open"
                        ? "var(--beam-bright)"
                        : "var(--mist-muted)",
                  }}
                >
                  {row.status}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="hidden md:block" aria-hidden />
      </div>
    </section>
  );
}
