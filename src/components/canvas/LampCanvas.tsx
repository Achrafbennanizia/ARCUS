"use client";

import dynamic from "next/dynamic";

const LampScene = dynamic(
  () => import("./LampScene").then((m) => m.LampScene),
  { ssr: false },
);

export function LampCanvas() {
  return <LampScene />;
}
