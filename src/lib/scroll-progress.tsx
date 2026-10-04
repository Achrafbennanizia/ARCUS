"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ScrollProgressContextValue = {
  progress: number;
  reducedMotion: boolean;
};

const ScrollProgressContext = createContext<ScrollProgressContextValue>({
  progress: 0,
  reducedMotion: false,
});

export function useScrollProgress() {
  return useContext(ScrollProgressContext);
}

export function ScrollProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReducedMotion(media.matches);
    syncPreference();
    media.addEventListener("change", syncPreference);

    let frame = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const next = max > 0 ? window.scrollY / max : 0;
      setProgress(Math.min(1, Math.max(0, next)));
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      media.removeEventListener("change", syncPreference);
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const value = useMemo(
    () => ({ progress, reducedMotion }),
    [progress, reducedMotion],
  );

  return (
    <ScrollProgressContext.Provider value={value}>
      {children}
    </ScrollProgressContext.Provider>
  );
}
