import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { OWNER } from './data.js';

const EASE = [0.22, 1, 0.36, 1];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.06 } },
};
const lineMask = {
  hidden: { y: '116%', opacity: 0 },
  show: { y: '0%', opacity: 1, transition: { duration: 1.15, ease: EASE } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.95, ease: EASE } },
};
const cardIn = {
  // transform + opacity only (no blur re-raster) so the replay stays cheap
  hidden: { opacity: 0, x: 46 },
  show: { opacity: 1, x: 0, transition: { duration: 0.95, ease: EASE } },
};
const lineGrow = {
  hidden: { scaleX: 0, opacity: 0 },
  show: { scaleX: 1, opacity: 1, transition: { duration: 1.4, ease: EASE } },
};

function Icon({ type }) {
  const p = { width: 19, height: 19, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  switch (type) {
    case 'mail':
      return (<svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>);
    case 'github':
      return (<svg {...p} strokeWidth="0" fill="currentColor"><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.27 10.27 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" /></svg>);
    case 'linkedin':
      return (<svg {...p} strokeWidth="0" fill="currentColor"><path d="M6.94 5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0ZM3.4 8.5h3.1V21H3.4V8.5Zm5.06 0h2.97v1.71h.04c.41-.78 1.42-1.6 2.93-1.6 3.13 0 3.71 2.06 3.71 4.74V21h-3.1v-5.54c0-1.32-.02-3.02-1.84-3.02-1.84 0-2.12 1.44-2.12 2.93V21h-3.1V8.5Z" /></svg>);
    case 'phone':
      return (<svg {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" /></svg>);
    case 'pin':
      return (<svg {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>);
    case 'clock':
      return (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
    default:
      return null;
  }
}

const ROWS = [
  { icon: 'mail', label: 'EMAIL', value: OWNER.email, href: `mailto:${OWNER.email}`, ext: false },
  { icon: 'github', label: 'GITHUB', value: '/chrisjacob-dev', href: OWNER.github, ext: true },
  { icon: 'linkedin', label: 'LINKEDIN', value: '/chris-jacob', href: OWNER.linkedin, ext: true },
  { icon: 'phone', label: 'PHONE', value: OWNER.phone, href: `tel:${OWNER.phone.replace(/\s+/g, '')}`, ext: false },
  { icon: 'pin', label: 'BASE', value: OWNER.location, href: null, ext: false },
  { icon: 'clock', label: 'RESPONSE', value: '< 24h', href: null, ext: false },
];

function ContactRow({ row, index }) {
  const Comp = row.href ? motion.a : motion.div;
  const linkProps = row.href
    ? { href: row.href, ...(row.ext ? { target: '_blank', rel: 'noreferrer' } : {}), 'data-cursor': 'link' }
    : {};
  return (
    <Comp
      className={`contact-card${row.href ? ' is-link' : ''}`}
      variants={cardIn}
      {...linkProps}
    >
      <span className="contact-card-glow" aria-hidden="true" />
      <span className="contact-card-icon"><Icon type={row.icon} /></span>
      <span className="contact-card-label">{row.label}</span>
      <span className="contact-card-value">{row.value}</span>
      <span className="contact-card-arrow" aria-hidden="true">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      </span>
    </Comp>
  );
}

export default function ContactSection() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const glowRef = useRef(null);

  const heroRef = useRef(null);
  const cardsRef = useRef(null);
  const footRef = useRef(null);
  // once:false -> animations replay every time the section re-enters view
  const heroIn = useInView(heroRef, { once: false, amount: 0.35 });
  const cardsIn = useInView(cardsRef, { once: false, amount: 0.25 });
  const footIn = useInView(footRef, { once: false, amount: 0.5 });
  // pauses all the ambient/loop animations while Contact is off-screen
  const liveInView = useInView(sectionRef, { margin: '15% 0px 15% 0px' });

  // Cursor-following ambient glow + subtle headline parallax (pointer-driven).
  useEffect(() => {
    const section = sectionRef.current;
    const glow = glowRef.current;
    const title = titleRef.current;
    if (!section || window.matchMedia('(pointer: coarse)').matches) return undefined;

    let tx = 0, ty = 0, rx = 0, ry = 0, active = false, raf = 0;
    const onMove = (e) => { tx = e.clientX; ty = e.clientY; };
    const loop = () => {
      rx += (tx - rx) * 0.12;
      ry += (ty - ry) * 0.12;
      const rect = section.getBoundingClientRect();
      if (glow) glow.style.transform = `translate3d(${rx - rect.left}px, ${ry - rect.top}px, 0) translate(-50%, -50%)`;
      if (title) {
        const cx = tx / window.innerWidth - 0.5;
        const cy = ty / window.innerHeight - 0.5;
        // use the `translate` property so the CSS idle-float `transform` composes
        title.style.translate = `${cx * -16}px ${cy * -11}px`;
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => { if (!active) { active = true; glow?.classList.add('is-on'); loop(); } };
    const stop = () => { active = false; cancelAnimationFrame(raf); glow?.classList.remove('is-on'); if (title) title.style.translate = '0px 0px'; };

    section.addEventListener('mousemove', onMove, { passive: true });
    section.addEventListener('mouseenter', start);
    section.addEventListener('mouseleave', stop);
    return () => {
      section.removeEventListener('mousemove', onMove);
      section.removeEventListener('mouseenter', start);
      section.removeEventListener('mouseleave', stop);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="contact" ref={sectionRef} className={`contact-cinematic${liveInView ? ' is-live' : ''}`} data-screen-label="06 Contact">
      <div className="contact-bg" aria-hidden="true">
        <span className="contact-blob blob-a" />
        <span className="contact-blob blob-b" />
        <span className="contact-scan" />
        <div className="contact-orbit">
          <span className="contact-orbit-dot" />
        </div>
        <div className="contact-particles">
          <span /><span /><span /><span /><span /><span />
        </div>
      </div>
      <div className="contact-cursor-glow" ref={glowRef} aria-hidden="true" />

      <div className="contact-inner">
        <motion.div
          ref={heroRef}
          className="contact-hero"
          variants={container}
          initial="hidden"
          animate={heroIn ? 'show' : 'hidden'}
        >
          <motion.div className="section-meta contact-meta" variants={fadeUp}>
            <span className="num">06</span>
            <span className="bar" />
            <span className="meta-dim">CONTACT /</span>
            <span className="meta-hot">LINK</span>
          </motion.div>

          <h2 className="contact-title" ref={titleRef}>
            <span className="contact-title-line">
              <motion.span className="contact-title-inner" variants={lineMask}>Let&apos;s build</motion.span>
            </span>
            <span className="contact-title-line">
              <motion.span className="contact-title-inner" variants={lineMask}>
                <span className="contact-grad">intelligent systems</span>
              </motion.span>
            </span>
            <span className="contact-title-line">
              <motion.span className="contact-title-inner" variants={lineMask}>
                that feel inevitable<span className="contact-dot">.</span>
              </motion.span>
            </span>
          </h2>

          <motion.p className="contact-lede" variants={fadeUp}>
            I&apos;m always excited to collaborate on meaningful projects
            that push the boundaries of AI and software engineering.
          </motion.p>

          <motion.div className="contact-reply" variants={fadeUp}>
            <span className="contact-reply-dot" aria-hidden="true" />
            I usually reply within a few hours.
          </motion.div>
        </motion.div>

        <motion.div
          ref={cardsRef}
          className="contact-cards"
          variants={container}
          initial="hidden"
          animate={cardsIn ? 'show' : 'hidden'}
        >
          {ROWS.map((row, i) => (
            <ContactRow key={row.label} row={row} index={i} />
          ))}
        </motion.div>
      </div>

      <motion.div
        ref={footRef}
        className="contact-footer"
        variants={container}
        initial="hidden"
        animate={footIn ? 'show' : 'hidden'}
      >
        <motion.span className="contact-footer-line" aria-hidden="true" variants={lineGrow} />
        <div className="contact-footer-row">
          <motion.span className="contact-foot-left" variants={fadeUp}>
            © 2026 · CHRIS JACOB · NEXUS / 01
          </motion.span>
          <motion.span className="contact-foot-center" variants={fadeUp}>
            [ LET&apos;S <em>CREATE THE FUTURE</em> TOGETHER. ]
          </motion.span>
          <motion.span className="contact-foot-right" variants={fadeUp}>
            HAND-ENGINEERED · MANIPAL <span className="arrow">→</span>
          </motion.span>
        </div>
      </motion.div>
    </section>
  );
}
