import React, { useEffect, useRef } from 'react';

const OVERABLES = [
  'a', 'button', '[data-cursor="link"]', '.showcase-card', '.showcase-btn',
  '.stack-line', '.contact-card', '.core-focus-item', '.journey-card',
].join(',');

export default function GlobalBackground() {
  const rootRef = useRef(null);
  const glowRef = useRef(null);
  const blobsRef = useRef(null);
  const particlesRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return undefined;
    const root = rootRef.current;
    const glow = glowRef.current;
    const blobs = blobsRef.current;
    const particles = particlesRef.current;

    let vw = window.innerWidth, vh = window.innerHeight;
    let tx = vw / 2, ty = vh / 2;
    let gx = tx, gy = ty;
    let scrollY = window.scrollY;
    let near = false;
    let lastEl = null, pendingNearCheck = false;

    let raf = 0, running = false;
    const wake = () => { if (!running && !document.hidden) { running = true; raf = requestAnimationFrame(loop); } };

    // cheap handlers: just record state, then make sure the loop is awake
    const onMove = (e) => { tx = e.clientX; ty = e.clientY; lastEl = e.target; pendingNearCheck = true; wake(); };
    const onScroll = () => { scrollY = window.scrollY; wake(); };
    const onResize = () => { vw = window.innerWidth; vh = window.innerHeight; wake(); };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    const loop = () => {
      if (pendingNearCheck) {
        pendingNearCheck = false;
        const isNear = !!(lastEl && lastEl.closest && lastEl.closest(OVERABLES));
        if (isNear !== near) { near = isNear; root?.classList.toggle('is-near', near); }
      }
      // soft delayed (cinematic) lerp toward the cursor
      gx += (tx - gx) * 0.08;
      gy += (ty - gy) * 0.08;
      if (glow) glow.style.transform = `translate3d(${gx}px, ${gy}px, 0) translate(-50%, -50%)`;
      // subtle parallax: blob layer (+ slow scroll drift) and lighter particle layer
      const px = gx / vw - 0.5;
      const py = gy / vh - 0.5;
      if (blobs) blobs.style.transform = `translate3d(${px * -24}px, ${py * -20 + scrollY * 0.016}px, 0)`;
      if (particles) particles.style.transform = `translate3d(${px * 14}px, ${py * 11}px, 0)`;

      // idle out once everything has settled — no per-frame work while the
      // user is still (CSS breathing keeps running on its own GPU layer)
      const settled = Math.abs(tx - gx) < 0.4 && Math.abs(ty - gy) < 0.4;
      if (settled) { running = false; return; }
      raf = requestAnimationFrame(loop);
    };

    const onVisibility = () => { if (document.hidden) { cancelAnimationFrame(raf); running = false; } else wake(); };
    document.addEventListener('visibilitychange', onVisibility);
    wake();

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="bg-system" aria-hidden="true" ref={rootRef}>
      <div className="bg-base" />
      <div className="bg-core" />
      <div className="bg-blobs" ref={blobsRef}>
        <span className="bg-blob bg-blob-a" />
        <span className="bg-blob bg-blob-b" />
      </div>
      <div className="bg-grid" />
      <div className="bg-particles" ref={particlesRef}>
        <span /><span /><span /><span /><span />
      </div>
      <div className="bg-edge" />
      <div className="bg-cursor-glow" ref={glowRef} />
    </div>
  );
}
