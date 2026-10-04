"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { BeamMode } from "@/lib/content";
import { FINISHES } from "@/lib/content";

type LampState = {
  beam: BeamMode;
  finishId: (typeof FINISHES)[number]["id"];
  setBeam: (b: BeamMode) => void;
  setFinishId: (id: (typeof FINISHES)[number]["id"]) => void;
  finish: (typeof FINISHES)[number];
};

const Ctx = createContext<LampState | null>(null);

export function LampStateProvider({ children }: { children: ReactNode }) {
  const [beam, setBeam] = useState<BeamMode>("focus");
  const [finishId, setFinishId] =
    useState<(typeof FINISHES)[number]["id"]>("graphite");

  const value = useMemo(() => {
    const finish = FINISHES.find((f) => f.id === finishId) ?? FINISHES[0];
    return { beam, finishId, setBeam, setFinishId, finish };
  }, [beam, finishId]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLampState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLampState requires LampStateProvider");
  return ctx;
}
