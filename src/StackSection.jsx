import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { STACK, CERTS } from './data.js';

const EASE = [0.22, 1, 0.36, 1];

// Layered flowing typography — varied speeds, directions, weights and depth.
const MARQUEE_ROWS = [
  { id: 0, dir: 'left',  dur: 48, variant: 'solid',   accent: [0, 2], words: ['PyTorch', 'TensorFlow', 'scikit-learn', 'Hugging Face'] },
  { id: 1, dir: 'right', dur: 62, variant: 'serif',   accent: [0, 2], words: ['Generative AI', 'Computer Vision', 'Deep Learning', 'Neural Networks'] },
  { id: 2, dir: 'left',  dur: 76, variant: 'outline', accent: [1, 4], words: ['Python', 'TypeScript', 'Java', 'C++', 'Swift'] },
  { id: 3, dir: 'right', dur: 92, variant: 'ghost',   accent: [2],    words: ['Docker', 'Git', 'FastAPI', 'Oracle SQL', 'MySQL'] },
];

const CATEGORIES = [
  { label: 'LANGUAGES', value: STACK[0].v },
  { label: 'AI / ML',   value: STACK[1].v },
  { label: 'DOMAIN',    value: STACK[2].v },
  { label: 'TOOLS',     value: STACK[3].v },
];

function MarqueeSequence({ words, accent, hidden }) {
  return (
    <span className="marquee-seq" aria-hidden={hidden || undefined}>
      {words.map((word, i) => (
        <span className="marquee-cell" key={i}>
          <span className={`marquee-word${accent.includes(i) ? ' is-accent' : ''}`}>{word}</span>
          <span className="marquee-sep" aria-hidden="true">/</span>
        </span>
      ))}
    </span>
  );
}

function MarqueeRow({ row, progress }) {
  // Scroll-linked parallax: each layer drifts a little as the section passes,
  // deeper rows drift more — pure GPU transform, no layout reads.
  const reach = (row.id + 1) * 22 * (row.dir === 'left' ? -1 : 1);
  const x = useTransform(progress, [0, 1], [-reach, reach]);

  return (
    <div className={`marquee-row marquee-row--${row.variant}`}>
      <motion.div className="marquee-parallax" style={{ x }}>
        <div className={`marquee-inner is-${row.dir}`} style={{ '--dur': `${row.dur}s` }}>
          <MarqueeSequence words={row.words} accent={row.accent} />
          <MarqueeSequence words={row.words} accent={row.accent} hidden />
        </div>
      </motion.div>
    </div>
  );
}

export default function StackSection() {
  const sectionRef = useRef(null);
  const headRef = useRef(null);
  const listRef = useRef(null);
  const headInView = useInView(headRef, { once: true, amount: 0.5 });
  const listInView = useInView(listRef, { once: true, amount: 0.3 });
  // Drives marquee/grain play-state so nothing animates while off-screen.
  const liveInView = useInView(sectionRef, { margin: '12% 0px 12% 0px' });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  return (
    <section
      id="stack"
      ref={sectionRef}
      className={`stack-cinematic${liveInView ? ' is-live' : ''}`}
      data-screen-label="05 Stack"
    >
      <div className="stack-ambient" aria-hidden="true">
        <span /><span /><span /><span />
      </div>

      <motion.div
        ref={headRef}
        className="stack-head"
        initial={{ opacity: 0, y: 22 }}
        animate={headInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.95, ease: EASE }}
      >
        <div className="section-meta stack-meta">
          <span className="num">05</span>
          <span className="bar" />
          <span className="meta-dim">STACK /</span>
          <span className="meta-hot">TOOLING</span>
        </div>
        <p className="stack-head-sub">A living ecosystem of languages, models, and the tools to ship them.</p>
      </motion.div>

      <div className="stack-marquee" aria-label="Technologies and tools">
        {MARQUEE_ROWS.map((row) => (
          <MarqueeRow key={row.id} row={row} progress={scrollYProgress} />
        ))}
      </div>

      <motion.div
        ref={listRef}
        className="stack-lines"
        initial={{ opacity: 0, y: 24 }}
        animate={listInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.95, ease: EASE }}
      >
        {CATEGORIES.map((cat, i) => (
          <motion.div
            className="stack-line"
            key={cat.label}
            data-cursor="link"
            initial={{ opacity: 0, y: 16 }}
            animate={listInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 + i * 0.1, ease: EASE }}
          >
            <span className="stack-line-label">{cat.label}</span>
            <span className="stack-line-leader" aria-hidden="true" />
            <span className="stack-line-value">{cat.value}</span>
          </motion.div>
        ))}

        <div className="stack-certs">
          <span className="stack-certs-label">CERTIFIED</span>
          {CERTS.map((c) => (
            <em key={c} data-cursor="link">{c}</em>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
