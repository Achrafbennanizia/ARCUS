import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ARCUS — Modular desk lamp | Nodal Hardware",
  description:
    "ARCUS is a modular desk lamp with steerable beam demos, four anodized finishes, clear shipping windows, and a founders waitlist.",
  openGraph: {
    title: "ARCUS — Modular desk lamp",
    description:
      "Aim the beam. Swap the joint. Ship when ready. A hardware launch for modular task light.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0d11",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${figtree.variable} h-full`}>
      <body className="min-h-full antialiased">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
