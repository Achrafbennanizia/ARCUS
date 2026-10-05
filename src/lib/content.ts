export const CONTENT = {
  studio: "NODAL",
  brand: "ARCUS",
  kind: "Modular desk lamp",
  eyebrow: "NODAL HARDWARE · TASK LIGHT SYSTEM",
  heroLine: "Aim the beam. Swap the joint. Ship when ready.",
  heroBody:
    "A modular desk lamp built as a kit of precision parts — steerable beam head, magnetic stem links, and four anodized finishes. Founders batch opens in three shipping windows.",
  heroCta: "Join the waitlist",
  heroSecondary: "See beam demos",
  beamEyebrow: "BEAM DEMOS",
  beamTitle: "Three throw profiles. One head.",
  beamBody:
    "The optic carousel clicks between focus, flood, and ambient without tools. Scroll the demos — the live model tracks the active throw.",
  finishesEyebrow: "FINISHES",
  finishesTitle: "Shells that hold up under task light.",
  finishesBody:
    "Hard-anodized aluminum bodies, brass contacts on the joint ring, matte polymer feet. Pick a shell with your waitlist seat.",
  shippingEyebrow: "SHIPPING WINDOWS",
  shippingTitle: "Three batches. Clear dates.",
  shippingBody:
    "No infinite preorder. Each window closes when the batch fills — you pick a seat, we lock a ship month.",
  waitlistEyebrow: "WAITLIST",
  waitlistTitle: "Reserve a founders seat.",
  waitlistBody:
    "$240 · founders kit includes head, two stem links, base, and one finish. Reply within 48 hours with your window preference.",
  waitlistCta: "Request a seat",
  waitlistNote: "No charge until your batch confirms.",
  footerBlurb:
    "Portfolio hardware launch — modular desk lamp concept with beam demos, finish selection, and batch shipping windows.",
} as const;

export type BeamMode = "focus" | "flood" | "ambient";

export const BEAMS: Array<{
  id: BeamMode;
  label: string;
  throw: string;
  detail: string;
  angle: number;
  intensity: number;
}> = [
  {
    id: "focus",
    label: "Focus",
    throw: "18° spot",
    detail: "Pin a page or solder pad — hard edge, high candela.",
    angle: 0.16,
    intensity: 1,
  },
  {
    id: "flood",
    label: "Flood",
    throw: "48° work",
    detail: "Desk-wide coverage without washing the wall behind you.",
    angle: 0.42,
    intensity: 0.78,
  },
  {
    id: "ambient",
    label: "Ambient",
    throw: "Soft fill",
    detail: "Soft downward fill for late sessions — less glare on screens.",
    angle: 0.72,
    intensity: 0.45,
  },
];

export const FINISHES = [
  {
    id: "graphite",
    name: "Graphite",
    hex: "#a6aebc",
    accent: "#e8edf5",
    metalness: 0.84,
    roughness: 0.28,
    note: "Cool anodize · default founders shell",
  },
  {
    id: "brass",
    name: "Brass",
    hex: "#d4a65c",
    accent: "#f0d08a",
    metalness: 0.92,
    roughness: 0.26,
    note: "Warm metal · joint ring match",
  },
  {
    id: "chalk",
    name: "Chalk",
    hex: "#e8e4dc",
    accent: "#faf7f0",
    metalness: 0.12,
    roughness: 0.58,
    note: "Soft satin · high-contrast desk",
  },
  {
    id: "ink",
    name: "Ink",
    hex: "#2a303c",
    accent: "#8a96aa",
    metalness: 0.42,
    roughness: 0.5,
    note: "Deep matte · disappears until lit",
  },
] as const;

export const SHIPPING = [
  {
    id: "w1",
    window: "Window A",
    month: "June 2026",
    seats: "120 seats",
    status: "Open",
    note: "First cut of Graphite + Brass.",
  },
  {
    id: "w2",
    window: "Window B",
    month: "August 2026",
    seats: "160 seats",
    status: "Open",
    note: "Full finish set · second stem link pack.",
  },
  {
    id: "w3",
    window: "Window C",
    month: "October 2026",
    seats: "200 seats",
    status: "Waitlist only",
    note: "Holiday batch · closes when filled.",
  },
] as const;
