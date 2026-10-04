"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SECTIONS, type SectionId } from "@/lib/sections";

const Ctx = createContext<SectionId>("top");

export function useActiveSection() {
  return useContext(Ctx);
}

export function ActiveSectionProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<SectionId>("top");

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const mid = window.scrollY + window.innerHeight * 0.42;
      let best: SectionId = "top";
      let bestDist = Infinity;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const d = Math.abs(el.offsetTop - mid);
        if (d < bestDist) {
          bestDist = d;
          best = s.id;
        }
      }
      setActive(best);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const value = useMemo(() => active, [active]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
