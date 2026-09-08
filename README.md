# Erbert Bryan — Portfolio

Personal portfolio site. Single static page: hero carousel, process section,
case studies with in-page deep dives, and an About window with photo folders.

**Stack:** [Vite](https://vitejs.dev) · vanilla JS (ES modules) · [Rive](https://rive.app) for the avatar

No framework, no build-time data fetching — the whole site ships as static
HTML/CSS/JS plus media. That keeps it fast on a CDN and keeps the animation
code (FLIP transitions, the 3D carousel, scroll reveals) in direct control of
the DOM, which is where it needs to be.

## Getting started

```bash
npm install
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with HMR on `localhost:5173` |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built `dist/` locally to check the real output |
| `npm run lint` | ESLint — catches real mistakes, doesn't enforce formatting |

Requires Node 20+.

## Project layout

```
index.html            entry point — all page markup
src/
  scripts/            one module per feature (hero, works, deepdive, folders…)
  data/               content: projects.js, folders.js
  styles/style.css    single stylesheet, CSS custom properties as design tokens
public/               served at the web root, copied to dist/ verbatim
  brand/              logos, tool icons, UI art
  carousel/           hero carousel + case-study media
  folders/            "beyond the work" photos
  fonts/              self-hosted display face
docs/                 internal notes, not shipped
```

Content lives in `src/data/` — adding a project means adding an object to
`projects.js`, not touching markup.

## Environment variables

**None.** The site has no backend, no API keys, and no secrets. The Cal.com
booking modal is a client-side embed using a public scheduling link.

If that ever changes, add the variable to a `.env.example` here *and* set the
real value in the Vercel dashboard — never commit the real one.

## Deployment

Vercel auto-detects Vite. No `vercel.json` is needed.

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |

Deep links (`#case-financeable`) use hash routing, which never reaches the
server — so no rewrite rules are required either.

## Media

Source media is optimised before it's committed: images to WebP via `sharp`,
video to H.264 MP4 via `ffmpeg`. Both are installed ad hoc with
`npm install --no-save` when needed rather than being project dependencies,
since they're authoring tools and shouldn't ship or slow down CI installs.

Rules of thumb used here: images ≤1400px wide at quality ~82, video scaled to
≤1200px at 30fps with audio stripped.
