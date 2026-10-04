export const SECTIONS = [
  { id: "top", label: "Rise" },
  { id: "beam", label: "Beam" },
  { id: "finishes", label: "Finishes" },
  { id: "shipping", label: "Ship" },
  { id: "waitlist", label: "Join" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];
