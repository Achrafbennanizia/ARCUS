"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { CONTENT, SHIPPING } from "@/lib/content";
import { useLampState } from "@/lib/lamp-state";

export function Waitlist() {
  const { finish } = useLampState();
  const [status, setStatus] = useState<"idle" | "done">("idle");

  return (
    <section
      id="waitlist"
      className="section-panel relative z-10 px-5 py-12 md:px-8 md:py-16"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-14">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          <p className="copy-legible text-xs font-semibold tracking-[0.24em] text-beam">
            {CONTENT.waitlistEyebrow}
          </p>
          <h2 className="display copy-legible-title mt-3 text-3xl md:mt-4 md:text-5xl">
            {CONTENT.waitlistTitle}
          </h2>
          <p className="copy-legible-muted mt-4 max-w-md text-[15px] leading-relaxed">
            {CONTENT.waitlistBody}
          </p>
          <p className="copy-legible-muted mt-4 text-sm">
            Selected finish:{" "}
            <span className="copy-legible" style={{ color: finish.accent }}>
              {finish.name}
            </span>
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.8, delay: 0.08, ease: [0.23, 1, 0.32, 1] }}
          className="rounded-[1.75rem] border border-line bg-[rgba(22,26,34,0.96)] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.55)] md:p-8"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            if (!String(data.get("email") || "").includes("@")) return;
            setStatus("done");
          }}
        >
          <label className="block">
            <span className="text-[11px] tracking-[0.18em] text-mist-muted uppercase" style={{ color: "#d2cdc2" }}>
              Full name
            </span>
            <input
              required
              name="name"
              autoComplete="name"
              className="field-input mt-1"
              placeholder="Jordan Lee…"
            />
          </label>
          <label className="mt-6 block">
            <span className="text-[11px] tracking-[0.18em] text-mist-muted uppercase">
              Email
            </span>
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              spellCheck={false}
              className="field-input mt-1"
              placeholder="jordan@studio.com…"
            />
          </label>
          <label className="mt-6 block">
            <span className="text-[11px] tracking-[0.18em] text-mist-muted uppercase">
              Shipping window
            </span>
            <select
              name="window"
              className="field-input mt-1 bg-void-elevated"
              defaultValue="w1"
            >
              {SHIPPING.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.window} · {w.month} ({w.status})
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn-beam mt-8 w-full">
            {CONTENT.waitlistCta}
          </button>
          <p className="mt-3 text-center text-sm text-mist" aria-live="polite">
            {status === "done" ? "Request received. We’ll reply within 48 hours." : ""}
          </p>
          <p className="mt-4 text-center text-xs leading-relaxed text-mist-muted">
            {CONTENT.waitlistNote}
          </p>
        </motion.form>
      </div>
    </section>
  );
}
