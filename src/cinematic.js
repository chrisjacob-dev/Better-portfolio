import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initCinematic() {
  gsap.registerPlugin(ScrollTrigger);

  if (window.__lenis) {
    window.__lenis.on('scroll', ScrollTrigger.update);
  }

  const EASE = 'power3.out';
  const EXPO = 'expo.out';
  const TA   = 'play none none reverse';

  function splitChars(el) {
    const text = el.textContent;
    el.innerHTML = text.split('').map(ch =>
      ch === ' '
        ? '<span style="display:inline-block;width:0.28em"> </span>'
        : `<span class="c" style="display:inline-block;overflow:hidden;vertical-align:top"><span class="ci" style="display:inline-block">${ch}</span></span>`
    ).join('');
    return el.querySelectorAll('.ci');
  }

  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(w =>
      `<span style="display:inline-block;overflow:hidden;vertical-align:top;margin-right:0.22em"><span class="wi" style="display:inline-block">${w}</span></span>`
    ).join('');
    return el.querySelectorAll('.wi');
  }

  function wipeIn(el, trigger, ta) {
    gsap.set(el, { clipPath: 'inset(0 100% 0 0)' });
    gsap.to(el, {
      clipPath: 'inset(0 0% 0 0)',
      duration: 1.1, ease: EXPO,
      scrollTrigger: { trigger: trigger || el, start: 'top 88%', toggleActions: ta || TA },
    });
  }

  // Hero entrance — delay synced with loader fade-out (loader fully gone at ~2.5s)
  // so the from-state is applied at t=0 (hidden under loader) and the reveal begins
  // exactly as the loader fades. One continuous transition, no pop.
  const heroTl = gsap.timeline({ delay: 2.0 });
  heroTl
    .from('.os-frame',      { opacity: 0, duration: 2.0, ease: 'power1.out' }, 0)
    .from('.os-bracket',    { opacity: 0, scale: 0, duration: 1.2, ease: EXPO }, 0.15)
    .from('.top-chrome',    { y: -28, opacity: 0, duration: 1.2, ease: EASE }, 0.25)
    .from('.status-badge',  { y: -20, opacity: 0, duration: 1.4, ease: EASE }, 0.4)
    .from('.bottom-chrome', { y: 28,  opacity: 0, duration: 1.2, ease: EASE }, 0.25)
    .from('.scene-wrap',    { scale: 0.72, opacity: 0, rotateY: 15, duration: 2.4, ease: 'power2.out' }, 0.2)
    .from('.hero-sub',      { y: 18, opacity: 0, duration: 1.4, ease: EASE }, 1.05);

  const heroName = document.querySelector('.hero-name');
  if (heroName) {
    const line1 = heroName.querySelector('.line1');
    const line2 = heroName.querySelector('.line2');
    const chars = [];
    if (line1) chars.push(...splitChars(line1));
    if (line2) chars.push(...splitChars(line2));
    if (chars.length === 0) chars.push(...splitChars(heroName));
    heroTl.from(chars, { y: '110%', opacity: 0, duration: 1.3, ease: EASE, stagger: { amount: 0.6 } }, 0.55);
  }

  const heroMark = document.querySelector('.hero-mark');
  if (heroMark) {
    const words = splitWords(heroMark);
    words.forEach((w) => {
      if (w.textContent.trim() === '•' || w.textContent.trim() === '·') {
        w.classList.add('hm-dot');
      }
    });
    heroTl.from(words, { y: '100%', opacity: 0, duration: 1.1, ease: EASE, stagger: 0.14 }, 1.15);
  }

  heroTl
    .from('.hero-widgets',  { x: 50, opacity: 0, duration: 1.4, ease: EASE }, 0.8)
    .from('.hero-scanline',  { scaleX: 0, transformOrigin: 'left center', duration: 1.2, ease: EXPO }, 1.0);

  // Hero exit — light parallax, no overlay gate or blur (keeps scroll snappy)
  const heroScroll = { trigger: '.hero', start: 'top top', scrub: 0.65 };
  gsap.to('.hero-name',    { y: -80, opacity: 0, ease: 'none', immediateRender: false, scrollTrigger: { ...heroScroll, end: '70% top' } });
  gsap.to('.hero-sub',     { y: -50, opacity: 0, ease: 'none', immediateRender: false, scrollTrigger: { ...heroScroll, end: '60% top' } });
  gsap.to('.hero-widgets', { x: 40, opacity: 0, ease: 'none', immediateRender: false, scrollTrigger: { ...heroScroll, end: '60% top' } });
  gsap.to('.hero-mark',    { y: 40, opacity: 0, ease: 'none', immediateRender: false, scrollTrigger: { ...heroScroll, end: '65% top' } });
  gsap.to('.scene-wrap',   { y: -90, scale: 0.82, opacity: 0, ease: 'none', immediateRender: false, scrollTrigger: { ...heroScroll, end: 'bottom top' } });
  gsap.to('.hero-scanline', { scaleX: 0, opacity: 0, ease: 'none', immediateRender: false, scrollTrigger: { ...heroScroll, end: '45% top' } });

  // Index → About: simple crossfade tied to scroll
  gsap.fromTo('.ai-about',
    { opacity: 0.72, y: 28 },
    {
      opacity: 1,
      y: 0,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '.ai-about', start: 'top bottom', end: 'top 52%', scrub: 0.5 },
    },
  );
  gsap.from('.about-field span', {
    y: 42,
    scale: 0,
    opacity: 0,
    duration: 1.0,
    ease: EXPO,
    stagger: 0.055,
    scrollTrigger: { trigger: '.ai-about', start: 'top 90%', toggleActions: TA },
  });
  gsap.from('.neural-depth-ring', {
    scale: 0.72,
    rotate: -14,
    opacity: 0,
    duration: 1.35,
    ease: EXPO,
    stagger: 0.12,
    scrollTrigger: { trigger: '.neural-visual', start: 'top 86%', toggleActions: TA },
  });

  // Section scan lines
  document.querySelectorAll('section.block, .ai-about, .experience-system').forEach((sec) => {
    sec.style.position = 'relative';
    const line = document.createElement('div');
    line.style.cssText = 'position:absolute;top:0;left:0;right:0;height:1px;background:rgba(255,255,255,0.45);transform:scaleX(0);transform-origin:left;z-index:30;pointer-events:none;';
    sec.appendChild(line);
    gsap.to(line, { scaleX: 1, duration: 1.2, ease: EXPO, scrollTrigger: { trigger: sec, start: 'top 92%', toggleActions: TA } });
  });

  // Section heads
  document.querySelectorAll('.section-title').forEach((title) => {
    const words = splitWords(title);
    gsap.from(words, { y: '108%', opacity: 0, duration: 1.1, ease: EASE, stagger: 0.065, scrollTrigger: { trigger: title, start: 'top 85%', toggleActions: TA } });
  });
  document.querySelectorAll('.section-meta').forEach((meta) => { wipeIn(meta, meta, TA); });

  // About — AI system layer
  const aboutTitle = document.querySelector('.about-system-title');
  if (aboutTitle) {
    const lines = aboutTitle.querySelectorAll('span');
    gsap.from(lines, {
      y: 28,
      opacity: 0,
      duration: 0.95,
      ease: EASE,
      stagger: 0.08,
      scrollTrigger: { trigger: aboutTitle, start: 'top 78%', toggleActions: TA },
    });
  }
  const aboutMeta = document.querySelector('.about-system-meta');
  if (aboutMeta) wipeIn(aboutMeta, aboutMeta, TA);
  document.querySelectorAll('.about-fragment').forEach((frag, i) => {
    gsap.from(frag, {
      x: -12,
      opacity: 0,
      duration: 0.7,
      ease: EASE,
      delay: i * 0.06,
      scrollTrigger: { trigger: '.about-fragments', start: 'top 82%', toggleActions: TA },
    });
  });
  gsap.from('.neural-visual', {
    y: 28,
    scale: 0.94,
    opacity: 0,
    duration: 1.0,
    ease: EASE,
    scrollTrigger: { trigger: '.ai-about', start: 'top 72%', toggleActions: TA },
  });
  gsap.from('.neural-core-canvas', {
    scale: 0.7,
    opacity: 0,
    duration: 1.35,
    ease: EXPO,
    scrollTrigger: { trigger: '.neural-visual', start: 'top 82%', toggleActions: TA },
  });
  gsap.from('.core-focus-panel', {
    x: 42,
    opacity: 0,
    filter: 'blur(10px)',
    clipPath: 'inset(18% 12% 18% 12%)',
    duration: 1.15,
    ease: EASE,
    scrollTrigger: { trigger: '.core-focus-panel', start: 'top 82%', toggleActions: TA },
  });
  document.querySelectorAll('.core-focus-item').forEach((item, i) => {
    gsap.from(item, {
      x: 26,
      opacity: 0,
      duration: 0.7,
      ease: EASE,
      delay: i * 0.055,
      scrollTrigger: { trigger: '.core-focus-list', start: 'top 86%', toggleActions: TA },
    });
  });

  // Stack cells
  document.querySelectorAll('.stack-cell').forEach((cell) => {
    gsap.from(cell, { y: 55, opacity: 0, scale: 0.88, duration: 0.9, ease: EXPO, scrollTrigger: { trigger: cell, start: 'top 88%', toggleActions: TA } });
    const glyph = cell.querySelector('.glyph');
    if (glyph) gsap.from(glyph, { scale: 0, opacity: 0, duration: 0.7, ease: 'back.out(2)', delay: 0.2, scrollTrigger: { trigger: cell, start: 'top 88%', toggleActions: TA } });
    const v = cell.querySelector('.v');
    if (v) wipeIn(v, cell, TA);
  });

  const certWrap = document.querySelector('#stack .stack-grid + div');
  if (certWrap) {
    gsap.from(Array.from(certWrap.children), { y: 22, opacity: 0, scale: 0.92, duration: 0.75, ease: EXPO, stagger: 0.08, scrollTrigger: { trigger: certWrap, start: 'top 90%', toggleActions: TA } });
  }

  // Contact
  const contactBig = document.querySelector('.contact-big');
  if (contactBig) {
    const chars = splitChars(contactBig);
    gsap.from(chars, { y: '110%', opacity: 0, duration: 0.9, ease: EASE, stagger: { amount: 0.45 }, scrollTrigger: { trigger: contactBig, start: 'top 85%', toggleActions: TA } });
  }
  document.querySelectorAll('.contact-side-row').forEach((row, i) => {
    gsap.from(row, { x: 32, opacity: 0, duration: 0.8, ease: EASE, delay: i * 0.08, scrollTrigger: { trigger: row, start: 'top 90%', toggleActions: TA } });
  });
  gsap.from('.footer-mark', { opacity: 0, y: 22, duration: 1.0, ease: EASE, scrollTrigger: { trigger: '.footer-mark', start: 'top 95%', toggleActions: TA } });

  // Section parallax lift
  document.querySelectorAll('section.block, .experience-system').forEach((sec) => {
    gsap.fromTo(sec, { y: 40 }, { y: 0, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top center', scrub: 0.7 } });
  });

  // Scroll progress bar
  if (!document.getElementById('__scroll_prog')) {
    const prog = document.createElement('div');
    prog.id = '__scroll_prog';
    prog.style.cssText = 'position:fixed;top:0;left:0;height:1px;width:100%;background:rgba(255,255,255,0.6);transform:scaleX(0);transform-origin:left;z-index:9001;pointer-events:none;';
    document.body.appendChild(prog);
    ScrollTrigger.create({
      trigger: document.body, start: 'top top', end: 'bottom bottom',
      onUpdate: (s) => { prog.style.transform = `scaleX(${s.progress})`; },
    });
  }

  // Magnetic nav + rows
  document.querySelectorAll('.top-nav a, [data-magnet], .proj-row, .core-focus-item, .journey-card, .showcase-btn').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.18;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.18;
      gsap.to(el, { x: dx, y: dy, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
    });
  });

  console.log('[cinematic v2] ✓ active — all animations replay on scroll');
}
