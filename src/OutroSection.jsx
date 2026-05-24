import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { OWNER } from './data.js';

const EASE = [0.22, 1, 0.36, 1];

const cols = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: EASE } },
};
const nameWrap = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};
const lineMask = {
  hidden: { y: '115%' },
  show: { y: '0%', transition: { duration: 1.1, ease: EASE } },
};

export default function OutroSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  // subtle parallax on the giant name (transform only)
  const nameY = useTransform(scrollYProgress, [0, 1], [44, -44]);

  return (
    <section id="outro" ref={ref} className="outro" data-screen-label="07 Outro">
      <div className="outro-ticks" aria-hidden="true">
        <span /><span /><span /><span /><span /><span />
      </div>
      <div className="outro-orbit" aria-hidden="true">
        <i className="outro-orbit-ring ring-1" />
        <i className="outro-orbit-ring ring-2" />
        <span className="outro-orbit-dot" />
      </div>
      <div className="outro-particles" aria-hidden="true">
        <span /><span /><span /><span /><span />
      </div>

      <motion.div
        className="outro-cols"
        variants={cols}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
      >
        <motion.div className="outro-col" variants={item}>
          <div className="outro-label"><b>+</b> Identification</div>
          <p>Chris Jacob</p>
          <p>AI / ML Engineer</p>
          <p>Manipal, India</p>
        </motion.div>

        <motion.div className="outro-col" variants={item}>
          <div className="outro-label"><b>+</b> Channels</div>
          <a href={`mailto:${OWNER.email}`} data-cursor="link">Email <i>↗</i></a>
          <a href={OWNER.linkedin} target="_blank" rel="noreferrer" data-cursor="link">LinkedIn <i>↗</i></a>
          <a href={OWNER.github} target="_blank" rel="noreferrer" data-cursor="link">GitHub <i>↗</i></a>
        </motion.div>

        <motion.div className="outro-col" variants={item}>
          <div className="outro-label"><b>+</b> Colophon</div>
          <p>Built with: React / GSAP / Framer / Lenis</p>
          <p>Typeface: Inter / Helvetica</p>
          <p>Deployed on: Vercel</p>
          <p>2026</p>
        </motion.div>
      </motion.div>

      <motion.h2
        className="outro-name"
        style={{ y: nameY }}
        variants={nameWrap}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
      >
        <span className="outro-name-line">
          <motion.span className="outro-name-inner" variants={lineMask}>Chris</motion.span>
        </span>
        <span className="outro-name-line">
          <motion.span className="outro-name-inner" variants={lineMask}>
            Jacob<sup className="outro-c">©</sup>
          </motion.span>
        </span>
      </motion.h2>

      <motion.p
        className="outro-tagline"
        initial={{ opacity: 0, filter: 'blur(6px)' }}
        animate={inView ? { opacity: 1, filter: 'blur(0px)' } : {}}
        transition={{ duration: 1, delay: 0.45, ease: EASE }}
      >
        Engineering digital experiences that feel <em>alive.</em>
      </motion.p>

      <motion.div
        className="outro-divider"
        aria-hidden="true"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.3, delay: 0.55, ease: EASE }}
      >
        <span className="outro-divider-dot" />
      </motion.div>
    </section>
  );
}
