import { CONTENT } from "@/lib/content";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-line px-5 py-8 md:px-8 md:py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm md:flex-row md:items-center md:justify-between">
        <p className="display copy-legible tracking-[0.18em]">
          {CONTENT.studio} / {CONTENT.brand}
        </p>
        <p className="copy-legible-muted">{CONTENT.footerBlurb}</p>
        <p className="copy-legible-muted">
          © {new Date().getFullYear()} Arcus
        </p>
      </div>
    </footer>
  );
}
