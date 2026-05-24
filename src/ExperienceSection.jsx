import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { EXPERIENCE } from './data.js';

const EASE = [0.22, 1, 0.36, 1];

const TIMELINE = [
  {
    num: '01',
    category: 'Education',
    role: 'B.Tech — Computer Science & Engineering',
    side: 'right',
    icon: 'education',
  },
  {
    num: '02',
    category: 'Leadership',
    role: 'Managing Committee',
    side: 'left',
    icon: 'leadership',
  },
  {
    num: '03',
    category: 'Workshops',
    role: "Aurora '25 — Workshops",
    side: 'right',
    icon: 'workshop',
  },
  {
    num: '04',
    category: 'Internship',
    role: 'Software Engineering Intern',
    side: 'left',
    icon: 'internship',
    badge: '1.5 months',
  },
];

function findExperience(role) {
  return EXPERIENCE.find((e) => e.role === role);
}

function TimelineIcon({ type }) {
  const props = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, 'aria-hidden': true };
  if (type === 'education') {
    return (
      <svg {...props}>
        <path d="M12 3L2 8l10 5 10-5-10-5z" strokeLinejoin="round" />
        <path d="M6 11v5c0 2 2.5 4 6 4s6-2 6-4v-5" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'leadership') {
    return (
      <svg {...props}>
        <circle cx="9" cy="8" r="3" />
        <circle cx="16" cy="9" r="2.5" />
        <path d="M4 19c0-3 2.5-5 5-5s5 2 5 5M13 19c0-2.5 1.8-4 4-4" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'workshop') {
    return (
      <svg {...props}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" />
    </svg>
  );
}

function TimelineItem({ step, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-6% 0px -10% 0px', amount: 0.28 });
  const data = findExperience(step.role);
  if (!data) return null;

  const card = (
    <motion.article
      className="journey-card"
      data-cursor="link"
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
      transition={{ duration: 0.85, delay: inView ? index * 0.05 : 0, ease: EASE }}
      whileHover={{ y: -4 }}
    >
      <div className="journey-card-top">
        <span className="journey-card-tag">{step.category}</span>
        <time className="journey-card-date">{data.when}</time>
      </div>
      <div className="journey-card-main">
        <div className="journey-card-icon">
          <TimelineIcon type={step.icon} />
        </div>
        <div className="journey-card-copy">
          <h3>{data.role}</h3>
          <p className="journey-card-org">{data.org}</p>
          <p className="journey-card-desc">{data.desc}</p>
          {step.badge ? <span className="journey-card-badge">{step.badge}</span> : null}
        </div>
      </div>
    </motion.article>
  );

  const connector = (
    <motion.span
      className="journey-connector"
      aria-hidden="true"
      initial={{ scaleX: 0, opacity: 0 }}
      animate={inView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
      transition={{ duration: 0.62, delay: inView ? 0.1 + index * 0.04 : 0, ease: EASE }}
      style={{ transformOrigin: step.side === 'right' ? 'left center' : 'right center' }}
    />
  );

  const node = (
    <motion.div
      className="journey-node"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.68, delay: inView ? index * 0.04 : 0, ease: EASE }}
    >
      <span className="journey-node-pulse" aria-hidden="true" />
      <span className="journey-node-ring" aria-hidden="true" />
      <span className="journey-node-label">{step.num}</span>
    </motion.div>
  );

  return (
    <li
      ref={ref}
      className={`journey-item journey-item--${step.side}${inView ? ' is-visible' : ''}`}
    >
      <div className="journey-col journey-col--start">
        {step.side === 'left' ? (
          <>
            {card}
            {connector}
          </>
        ) : null}
      </div>

      <div className="journey-col journey-col--axis">{node}</div>

      <div className="journey-col journey-col--end">
        {step.side === 'right' ? (
          <>
            {connector}
            {card}
          </>
        ) : null}
      </div>
    </li>
  );
}

export default function ExperienceSection() {
  const spineRef = useRef(null);
  const spineInView = useInView(spineRef, { once: true, amount: 0.12 });
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.4 });

  return (
    <section id="experience" className="experience-system" data-screen-label="03 Experience">
      <div className="experience-ambient" aria-hidden="true">
        <span /><span /><span /><span /><span /><span />
      </div>
      <div className="experience-glow" aria-hidden="true" />

      <motion.header
        ref={headerRef}
        className="journey-header"
        initial={{ opacity: 0, y: 20 }}
        animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <div className="section-meta journey-meta">
          <span className="num">03</span>
          <span className="bar" />
          <span className="meta-dim">EXPERIENCE /</span>
          <span className="meta-hot">TIMELINE</span>
        </div>
        <h2 className="journey-title">
          My journey
          <span>so far</span>
        </h2>
        <p className="journey-subcopy">
          A timeline of growth, learning, leadership, and real-world experience.
        </p>
      </motion.header>

      <div className="journey-timeline-wrap" ref={spineRef}>
        <div className="journey-spine" aria-hidden="true">
          <div className="journey-spine-base" />
          <motion.div
            className="journey-spine-progress"
            style={{ transformOrigin: 'top center' }}
            initial={{ scaleY: 0 }}
            animate={spineInView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 1.4, ease: EASE }}
          />
        </div>

        <ol className="journey-timeline">
          {TIMELINE.map((step, i) => (
            <TimelineItem key={step.num} step={step} index={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}
