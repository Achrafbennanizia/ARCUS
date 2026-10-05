"use client";

import {
  createContext,
  useContext,
  useEffect,
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

const FINISH_IDS = FINISHES.map((f) => f.id);

function isBeam(value: string | null): value is BeamMode {
  return value === "focus" || value === "flood" || value === "ambient";
}

function isFinish(value: string | null): value is (typeof FINISHES)[number]["id"] {
  return FINISH_IDS.includes(value as (typeof FINISHES)[number]["id"]);
}

function writeQuery(key: string, value: string) {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.replaceState(null, "", url);
}

export function LampStateProvider({ children }: { children: ReactNode }) {
  const [beam, setBeamState] = useState<BeamMode>("focus");
  const [finishId, setFinishState] =
    useState<(typeof FINISHES)[number]["id"]>("graphite");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const nextBeam = query.get("beam");
    const nextFinish = query.get("finish");
    if (isBeam(nextBeam)) setBeamState(nextBeam);
    if (isFinish(nextFinish)) setFinishState(nextFinish);
  }, []);

  const setBeam = (next: BeamMode) => {
    setBeamState(next);
    writeQuery("beam", next);
  };

  const setFinishId = (next: (typeof FINISHES)[number]["id"]) => {
    setFinishState(next);
    writeQuery("finish", next);
  };

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
