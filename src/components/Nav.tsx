"use client";

import { motion } from "motion/react";
import { CONTENT } from "@/lib/content";
import { smoothScrollToId } from "@/lib/scroll-to";

const LINKS = [
  { id: "beam", label: "Beam" },
  { id: "finishes", label: "Finishes" },
  { id: "shipping", label: "Ship" },
  { id: "waitlist", label: "Waitlist" },
] as const;

function go(id: string) {
  return (e: React.MouseEvent) => {
    e.preventDefault();
    smoothScrollToId(id, 1.45);
  };
}

export function Nav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className="absolute inset-0 border-b border-white/10"
        style={{
          background: "rgba(11, 13, 17, 0.96)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow:
            "0 22px 56px rgba(0, 0, 0, 0.7), 0 1px 0 rgba(232, 230, 225, 0.06) inset",
        }}
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8 md:py-5">
        <a
          href="#top"
          onClick={go("top")}
          className="nav-brand display text-sm tracking-[0.18em]"
          style={{ color: "#f7f4ec", textShadow: "0 2px 16px rgba(0,0,0,0.98)" }}
        >
          {CONTENT.studio} / {CONTENT.brand}
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={go(link.id)}
              className="nav-link"
              style={{
                color: "#f7f4ec",
                textShadow: "0 2px 14px rgba(0,0,0,0.98)",
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href="#waitlist"
          onClick={go("waitlist")}
          className="nav-cta rounded-full px-4 py-2 text-xs font-semibold tracking-[0.14em]"
          style={{
            background: "#f0a84b",
            color: "#0b0d11",
            border: "1px solid rgba(255, 208, 137, 0.55)",
            boxShadow:
              "0 10px 28px rgba(0,0,0,0.55), 0 0 0 1px rgba(240,168,75,0.25)",
          }}
        >
          WAITLIST
        </a>
      </div>
    </motion.header>
  );
}
