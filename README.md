# ARCUS — Modular Desk Lamp

Product launch landing for a fictional **modular desk lamp** hardware startup. Same craft language as AURALIS (scroll-scrubbed WebGL, Lenis, section snap) — different category: beam demos, finishes, shipping windows, waitlist.

**Live intent:** awareness → beam desire → finish choice → ship window → waitlist.

**Repo:** [ARCUS](https://github.com/Achrafbennanizia/ARCUS) — GitHub Pages base path is `/ARCUS`  
**Live:** [https://achrafbennanizia.github.io/ARCUS/](https://achrafbennanizia.github.io/ARCUS/)

## Stack
- Next.js (App Router) + TypeScript + Tailwind CSS v4
- React Three Fiber + Drei (procedural lamp model)
- Motion for UI entrances
- Lenis (desktop) + ~93% threshold section snap

## Design
- Brand-first hero: **ARCUS** as the dominant signal (headline + one line + CTAs)
- Graphite void + cool mist + amber beam accent (not purple / cream-terracotta)
- Display: Bricolage Grotesque · Body: Figtree
- Studio mark: NODAL
- 3D: procedural parallelogram linkage (the Poly Haven arm pack in `public/models` is unused)

## Sections
1. Rise — brand + CTA
2. Beam — Focus / Flood / Ambient (drives the live optic)
3. Finishes — Graphite, Brass, Chalk, Ink (recolors the model)
4. Ship — three batch windows
5. Waitlist — founders seat form

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run build:pages
npm run typecheck
npm run lint
```

## CI/CD
- **CI** — lint + typecheck + Pages build on push/PR
- **Deploy** — publishes `out/` to GitHub Pages on `main`

Enable once: **Settings → Pages → Source: GitHub Actions**.  
The Pages site is served from the **`ARCUS`** repository, so asset URLs use the `/ARCUS` base path.
# ARCUS
