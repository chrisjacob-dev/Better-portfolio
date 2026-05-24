# Chris Jacob — Portfolio

A cinematic, futuristic portfolio for an AI / ML engineer — built to feel like a
high-end AI operating-system interface. Deep matte-black canvas, flowing
electric-blue gradients, a 3D hero, scroll-choreographed project stacking, and an
ambient cinematic atmosphere throughout.

Live: _add your Vercel URL here_

## Highlights

- **3D hero scene** — a Three.js particle ring + morphing geometry with phase animation.
- **Cinematic project deck** — projects fully reveal, hold, then compress into a layered
  stack on scroll (scroll-tied, fully reversible), ending in a smooth zoom.
- **Flowing typography stack section** — multi-row marquee of the tech stack at varied
  speeds and depths, plus minimal dotted-leader category rows.
- **Glassmorphic contact cards** + a **cinematic outro frame** (giant `CHRIS / JACOB`).
- **Global background system** — drifting blue ambient glow, blueprint grid, scanlines,
  particles, and a cursor-following light source.
- **Custom cursor** — precise dot + soft magnetic trailing ring with hover/click feedback.
- **Ambient soundtrack** — low, looping cinematic ambience with smooth fades and subtle
  futuristic UI sounds (starts muted, fades in on first interaction).
- **Engineered for smoothness** — transform/opacity-only GPU animations, off-screen
  render gating, Lenis smooth scroll, and an adaptive `perf-lite` tier for weaker devices.

## Tech stack

- **React 18** + **Vite**
- **Framer Motion** — scroll-linked motion values and reveal animations
- **GSAP** — cinematic timelines
- **Lenis** — smooth inertia scrolling
- **Three.js** — hero and "about core" WebGL scenes
- Plain CSS (no framework) for the full design system

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build -> dist/
npm run preview  # preview the production build
```

## Project structure

```
index.html              # entry + favicon + fonts
src/
  main.jsx              # bootstrap + adaptive performance tier
  App.jsx               # layout, cursor, OS frame, Lenis, sections
  GlobalBackground.jsx  # reusable cinematic background + cursor light
  AudioController.jsx   # ambient music + UI sounds
  WorkSection.jsx       # stacked project deck + zoom
  StackSection.jsx      # flowing-typography tech stack
  ContactSection.jsx    # glassmorphic contact cards
  OutroSection.jsx      # cinematic closing frame
  ExperienceSection.jsx # timeline
  scene.js / aboutCore.js  # Three.js scenes
  data.js               # content (profile, projects, stack)
  styles.css            # full design system
public/                 # audio, project images, favicon
```

## Deployment

Optimized for **Vercel** (zero config — Vite is auto-detected: build `npm run build`,
output `dist`). Import the repo at [vercel.com/new](https://vercel.com/new) and deploy;
each push to `main` redeploys automatically.

## Contact

- **Email** — chris.jkarottu@icloud.com
- **GitHub** — [@chrisjacob-dev](https://github.com/chrisjacob-dev)
- **LinkedIn** — [chris-jacob](https://linkedin.com/in/chris-jacob-a03a49369)

---

Hand-engineered in Manipal, India.
