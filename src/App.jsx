import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { OWNER } from './data.js';
import { initScene } from './scene.js';
import { initAboutCore } from './aboutCore.js';
import { initCinematic } from './cinematic.js';
import ExperienceSection from './ExperienceSection.jsx';
import WorkSection from './WorkSection.jsx';
import StackSection from './StackSection.jsx';
import ContactSection from './ContactSection.jsx';
import OutroSection from './OutroSection.jsx';
import GlobalBackground from './GlobalBackground.jsx';
import AudioController from './AudioController.jsx';

// ---------- helpers ----------
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { el.classList.add('in'); obs.unobserve(el); }
        });
      },
      { rootMargin: '-10% 0px -10% 0px', threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ---------- Loader ----------
function Loader() {
  const [pct, setPct] = useState(0);
  const [gone, setGone] = useState(false);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const DUR = 1300;
    const step = () => {
      const t = Math.min(1, (performance.now() - start) / DUR);
      const eased = 1 - Math.pow(1 - t, 3);
      setPct(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(step);
      else setTimeout(() => setGone(true), 400);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className={`loader ${gone ? 'gone' : ''}`}>
      <div className="loader-text">INITIALISING — NEXUS / 01</div>
      <div className="loader-bar"></div>
      <div className="loader-num">{String(pct).padStart(3, '0')} / 100</div>
    </div>
  );
}

// ---------- Custom Cursor (optimized, blue glow, magnetic) ----------
const CURSOR_OVERABLES = [
  'a', 'button', '[data-cursor="link"]', '.proj-row', '.stack-cell',
  '.core-focus-item', '.journey-card', '.showcase-card', '.showcase-btn',
];

function Cursor() {
  const dot   = useRef(null);
  const ring  = useRef(null);
  const pulse = useRef(null);
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return undefined;

    const sel = CURSOR_OVERABLES.join(',');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2; // raw pointer
    let rx = mx, ry = my;                                        // ring (soft trail)
    let target = null;                                           // magnetic element
    let targetCx = 0, targetCy = 0;                              // cached target centre
    let lastEl = null, pendingHover = false;
    let ready = false;

    // keep the move handler trivial; defer DOM `closest()` to one check/frame
    const move = (e) => {
      mx = e.clientX; my = e.clientY;
      lastEl = e.target; pendingHover = true;
      if (!ready) {
        ready = true;
        rx = mx; ry = my; // avoid slide-in from centre on first move
        dot.current?.classList.add('ready');
        ring.current?.classList.add('ready');
      }
    };
    window.addEventListener('mousemove', move, { passive: true });

    const onLeave = () => {
      dot.current?.classList.remove('ready');
      ring.current?.classList.remove('ready');
    };
    const onEnter = () => {
      dot.current?.classList.add('ready');
      ring.current?.classList.add('ready');
    };
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    const onDown = (e) => {
      ring.current?.classList.add('down');
      // soft expanding neon glow ring on interaction
      const el = pulse.current;
      if (el) {
        el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%,-50%)`;
        el.classList.remove('go');
        void el.offsetWidth; // restart animation
        el.classList.add('go');
      }
    };
    const onUp   = () => ring.current?.classList.remove('down');
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    let raf;
    const loop = () => {
      // resolve hover/target once per frame (not per mouse event) + cache centre
      if (pendingHover) {
        pendingHover = false;
        const el = lastEl && lastEl.closest ? lastEl.closest(sel) : null;
        if (el !== target) {
          target = el;
          ring.current?.classList.toggle('hover', !!el);
        }
        if (target) {
          const r = target.getBoundingClientRect();
          targetCx = r.left + r.width / 2;
          targetCy = r.top + r.height / 2;
        }
      }
      // Dot tracks the pointer 1:1 — precise, never sticky.
      if (dot.current) dot.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%,-50%)`;

      // Ring softly trails with lerp; light magnetic pull toward cached centre.
      let tx = mx, ty = my;
      if (target) {
        tx = mx + (targetCx - mx) * 0.12;
        ty = my + (targetCy - my) * 0.12;
      }
      rx += (tx - rx) * 0.2;
      ry += (ty - ry) * 0.2;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%,-50%)`;
      raf = requestAnimationFrame(loop);
    };
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }
    };
    document.addEventListener('visibilitychange', onVis);
    loop();
    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('visibilitychange', onVis);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <>
      <div className="cursor-dot"  ref={dot}></div>
      <div className="cursor-ring" ref={ring}></div>
      <div className="cursor-pulse" ref={pulse}></div>
    </>
  );
}

// ---------- OS Frame ----------
function OSFrame({ time, active }) {
  return (
    <>
      <div className="os-frame"></div>
      <div className="os-bracket tr"></div>
      <div className="os-bracket bl"></div>
      <div className="grain"></div>
      <div className="vignette"></div>

      <header className="top-chrome">
        <div className="brand-mark">
          <div className="brand-glyph"></div>
          <div>
            <span className="brand-text">CHRIS·JACOB</span>
            <span className="brand-sub">// NEXUS-01</span>
          </div>
        </div>
        <div className="status-badge">
          <span className="badge-dot"></span>
          <span>OPEN TO INTERNSHIPS</span>
          <span className="badge-dot"></span>
        </div>
        <nav className="top-nav">
          {[
            { label: 'Index', target: 'index' },
            { label: 'About', target: 'about' },
            { label: 'Experience', target: 'experience' },
            { label: 'Work', target: 'work' },
            { label: 'Stack', target: 'stack' },
            { label: 'Contact', target: 'contact' },
          ].map((n) => (
            <a
              key={n.label}
              href={`#${n.target}`}
              className={(n.match || [n.target]).includes(active) ? 'active' : ''}
            >
              {n.label}
            </a>
          ))}
        </nav>
      </header>

      <footer className="bottom-chrome">
        <div className="bottom-row">
          <span>LAT 13.34° N — LON 74.78° E</span>
        </div>
        <div className="bottom-row">
          <span>v0.2.6</span>
          <span className="sep"></span>
          <span>{time} UTC+5:30</span>
        </div>
      </footer>
    </>
  );
}

// ---------- Left Rail ----------
function LeftRail({ active }) {
  const items = [
    { k: '01', n: 'index' },
    { k: '02', n: 'process' },
    { k: '03', n: 'work' },
    { k: '04', n: 'experience' },
    { k: '05', n: 'stack' },
    { k: '06', n: 'contact' },
  ];
  return (
    <div className="left-rail">
      {items.map((it) => (
        <a key={it.k} href={`#${it.n}`} className={`left-rail-item ${active === it.n ? 'active' : ''}`} data-cursor="link">
          {it.k} · {it.n}
        </a>
      ))}
    </div>
  );
}

// ---------- Hero ----------
function Hero() {
  const [orbit, setOrbit] = useState(0);
  const [phase, setPhase] = useState('TRIPLE');
  const sceneRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => {
      const h = window.__sceneHud || {};
      if (typeof h.orbit === 'number') setOrbit(h.orbit);
      if (h.phase) setPhase(h.phase);
    }, 120);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (sceneRef.current) initScene(sceneRef.current);
  }, []);

  return (
    <section id="index" className="hero" data-screen-label="01 Hero">
      <h1 className="hero-name">
        <span className="line1">Chris</span>
        <br />
        <span className="line2">Jacob</span>
      </h1>
      <div className="hero-sub">
        <span>DEEP LEARNING</span>
        <span className="hero-dot">•</span>
        <span>NEURAL NETWORKS</span>
        <span className="hero-dot">•</span>
        <span>AI</span>
      </div>

      <div className="hero-scanline" style={{ top: 96 }}></div>

      <div className="scene-wrap" id="scene" ref={sceneRef}></div>

      <aside className="hero-widgets">
        <div className="philosophy">
          <div className="widget-label" style={{ textAlign: 'right', marginBottom: 10 }}>PERSPECTIVE / LOG</div>
          &ldquo;{OWNER.philosophy[0]} {OWNER.philosophy[1]}&rdquo;
        </div>

        <div className="widget">
          <div className="widget-label">SYSTEM</div>
          <div className="widget-row">
            <span>MODE</span>
            <span className="widget-value">IDLE</span>
          </div>
          <div className="widget-row">
            <span>PHASE</span>
            <span className="widget-value">{phase}</span>
          </div>
          <div className="widget-row">
            <span>ORBIT</span>
            <span className="widget-value">{orbit.toFixed(2).padStart(6, '0')}°</span>
          </div>
          <div className="widget-row">
            <span>PART.</span>
            <span className="widget-value">9′000</span>
          </div>
        </div>

        <div className="widget" style={{ padding: '12px 16px' }}>
          <div className="widget-label">SOCIAL · STACK</div>
          <div className="widget-row">
            <a href={OWNER.github} target="_blank" rel="noreferrer" data-cursor="link" style={{ letterSpacing: 1, fontWeight: 600 }}>GITHUB ↗</a>
            <span className="widget-hint">/dev</span>
          </div>
          <div className="widget-row">
            <a href={OWNER.linkedin} target="_blank" rel="noreferrer" data-cursor="link" style={{ letterSpacing: 1, fontWeight: 600 }}>LINKEDIN ↗</a>
            <span className="widget-hint">/chris</span>
          </div>
          <div className="widget-row">
            <a href={`mailto:${OWNER.email}`} data-cursor="link" style={{ letterSpacing: 1, fontWeight: 600 }}>EMAIL ↗</a>
            <span className="widget-hint">/jkarottu</span>
          </div>
        </div>
      </aside>

      <div className="hero-mark">
        Deep Learning<span className="hm-dot">·</span>Neural Networks<span className="hm-dot">·</span>AI
      </div>
    </section>
  );
}

// ---------- About (AI System Layer) ----------
function About() {
  const coreRef = useRef(null);

  useEffect(() => {
    if (!coreRef.current) return undefined;
    return initAboutCore(coreRef.current);
  }, []);

  const fragments = [
    OWNER.year,
    `${OWNER.university} · ${OWNER.intake}`,
    OWNER.role,
    OWNER.location,
    'GenAI, ML & full-stack systems',
  ];

  const focus = [
    { glyph: 'DL', title: 'Deep Learning', desc: 'Building models that learn.' },
    { glyph: 'NN', title: 'Neural Networks', desc: 'Designing intelligent architectures.' },
    { glyph: 'GA', title: 'GenAI', desc: 'Exploring generative intelligence.' },
    { glyph: 'FS', title: 'Full Stack', desc: 'Building end-to-end experiences.' },
    { glyph: 'SE', title: 'Software Engineering', desc: 'Writing clean, scalable code.' },
    { glyph: 'IX', title: 'Intelligent Interfaces', desc: 'Crafting immersive UI/UX.' },
  ];

  return (
    <section id="about" className="ai-about" data-screen-label="02 About">
      <div className="about-field" aria-hidden="true">
        <span style={{ '--x': '15%', '--y': '16%', '--d': '0s' }}></span>
        <span style={{ '--x': '34%', '--y': '12%', '--d': '1.3s' }}></span>
        <span style={{ '--x': '61%', '--y': '18%', '--d': '0.5s' }}></span>
        <span style={{ '--x': '82%', '--y': '29%', '--d': '2.1s' }}></span>
        <span style={{ '--x': '21%', '--y': '72%', '--d': '1.7s' }}></span>
        <span style={{ '--x': '52%', '--y': '78%', '--d': '0.2s' }}></span>
        <span style={{ '--x': '88%', '--y': '68%', '--d': '2.6s' }}></span>
      </div>

      <div className="about-system-grid">
        <div className="about-copy">
          <div className="section-meta about-system-meta">
            <span className="num">02</span>
            <span className="bar"></span>
            <span className="meta-dim">ABOUT /</span>
            <span className="meta-hot">INFO</span>
          </div>
          <h2 className="about-system-title">
            <span>Engineering</span>
            <span>intelligent</span>
            <span>systems.</span>
          </h2>
          <div className="about-fragments">
            {fragments.map((item) => (
              <div className="about-fragment" key={item}>
                <span></span>
                {item}
              </div>
            ))}
          </div>
          <div className="about-scroll-cue">
            <span></span>
            Scroll to explore
          </div>
        </div>

        <div className="neural-visual" aria-hidden="true">
          <div className="neural-glow"></div>
          <div className="neural-core-canvas" ref={coreRef}></div>
          <div className="neural-scan"></div>
          <div className="neural-depth-ring ring-a"></div>
          <div className="neural-depth-ring ring-b"></div>
          <div className="neural-depth-ring ring-c"></div>
        </div>

        <aside className="core-focus-panel">
          <div className="core-panel-top">
            <span></span>
            Core Focus
          </div>
          <div className="core-focus-list">
            {focus.map((item) => (
              <div className="core-focus-item" key={item.title} data-cursor="link">
                <div className="focus-glyph">{item.glyph}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

// ---------- App ----------
export default function App() {
  const [time,   setTime]   = useState('—');
  const [active, setActive] = useState('index');

  useEffect(() => {
    const tick = () => {
      const d  = new Date();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      setTime(`${hh}:${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Cache section offsets so the scroll path does zero layout reads.
    // Recompute only on resize (debounced) — prevents layout thrashing.
    let offsets = [];
    const measure = () => {
      offsets = Array.from(document.querySelectorAll('section[id]')).map((s) => ({
        id: s.id,
        top: s.offsetTop,
      }));
    };

    let ticking = false;
    let current = '';
    const compute = () => {
      ticking = false;
      const mid = window.scrollY + window.innerHeight * 0.4;
      let cur = offsets[0]?.id || 'index';
      for (const o of offsets) { if (o.top <= mid) cur = o.id; }
      if (cur !== current) { current = cur; setActive(cur); }
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(compute); }
    };

    let resizeT;
    const onResize = () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => { measure(); compute(); }, 150);
    };

    measure();
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeT);
    };
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      // lerp-based smoothing, frame-rate independent. Lower = more glide /
      // smoother; higher = snappier. 0.09 = a touch glidier than 0.11 while
      // staying responsive (not the floaty/heavy feel of ~0.07).
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.6,
      smoothTouch: false,
      syncTouch: false,
    });
    window.__lenis = lenis;
    let rafId;
    function raf(time) { lenis.raf(time); rafId = requestAnimationFrame(raf); }
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  useEffect(() => {
    // Run immediately so gsap.from() sets the hidden initial state at t=0
    // (under the loader). The heroTl delay handles the actual reveal timing.
    initCinematic();
  }, []);

  return (
    <>
      <GlobalBackground />
      <AudioController />
      <Loader />
      <Cursor />
      <OSFrame time={time} active={active} />
      <main>
        <Hero />
        <About />
        <ExperienceSection />
        <WorkSection />
        <StackSection />
        <ContactSection />
        <OutroSection />
      </main>
    </>
  );
}
