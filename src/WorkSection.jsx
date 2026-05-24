import React, { useRef, useState } from 'react';
import {
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { PROJECTS } from './data.js';

const EASE = [0.22, 1, 0.36, 1];
const FEATURED_PROJECTS = PROJECTS.slice(0, 3);

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #0082FF, #3A7BFF, #6CC5FF, #00E0FF, #0A84FF)',
  'linear-gradient(135deg, #0082FF, #3A7BFF, #6CC5FF, #00E0FF, #0A84FF)',
  'linear-gradient(135deg, #0082FF, #3A7BFF, #6CC5FF, #00E0FF, #0A84FF)',
];

// Compressing-deck model, paced for readability. Each project ENTERS, settles
// FULLY centred, then HOLDS (breathing room to read it) before the next card
// rises and it relaxes one step back into the deck. Scroll-tied directly (no
// springs) so it's glued to scroll and fully reversible — de-stacking on the
// way up re-reveals each card the same way.
//
// Timeline phases (scroll progress):
//   0.00–0.22  card 1 fully visible + hold
//   0.22–0.36  card 2 rises in, card 1 steps back
//   0.36–0.56  card 2 fully visible + hold
//   0.56–0.70  card 3 rises in, card 2 steps back
//   0.70–1.00  card 3 fully visible + hold (cinematic zoom plays here)
const ENTER = 920; // how far below an upcoming card waits (fully off-stage)
const STACK = 36;  // peek offset between stacked cards (visible lower edges)
const BP = [0, 0.22, 0.36, 0.56, 0.7, 1];

const MOTION_RECIPES = [
  {
    // Card 1 — front first, then settles down to the back of the deck
    range:   BP,
    y:       [0, 0, STACK, STACK, 2 * STACK, 2 * STACK],
    scale:   [1, 1, 0.985, 0.985, 0.97, 0.97],
    opacity: [1, 1, 0.95, 0.95, 0.9, 0.9],
  },
  {
    // Card 2 — waits below, rises to front, holds, then one step back
    range:   BP,
    y:       [ENTER, ENTER, 0, 0, STACK, STACK],
    scale:   [0.985, 0.985, 1, 1, 0.985, 0.985],
    opacity: [1, 1, 1, 1, 0.95, 0.95],
  },
  {
    // Card 3 — waits below, advances in queue, rises to front, holds (zoom)
    range:   BP,
    y:       [2 * ENTER, 2 * ENTER, ENTER, ENTER, 0, 0],
    scale:   [0.97, 0.97, 0.985, 0.985, 1, 1],
    opacity: [1, 1, 1, 1, 1, 1],
  },
];

const PROJECT_NARRATIVES = [
  'Decision Fatigue Score predictor for high-stakes environments. Built around 25K shift records with a Ridge regression pipeline, 10 operational inputs, R² of 0.96, and a Streamlit interface designed to make fatigue risk readable before it becomes operational failure.',
  'Full-stack rental operations platform with Oracle XE as the system of record. Engineered role-based access, stored procedures, triggers, automated billing, PDF invoicing, and a deployed Streamlit workflow for real rental transactions.',
  'JavaFX desktop operations suite for hotel teams. Built as a 5-screen management system with Oracle SQL, JDBC, auto-refreshing room availability, color-coded state, and an automated billing engine for front-desk workflows.',
];

function PreviewPanel({ project, index }) {
  if (project.preview) {
    return (
      <div className="showcase-preview showcase-preview--shot">
        <img src={project.preview} alt={project.previewAlt || project.name} loading="lazy" decoding="async" />
      </div>
    );
  }

  return (
    <div className="showcase-preview showcase-preview--system" aria-hidden="true">
      <div className="showcase-system-nav">
        <strong>{project.name}</strong>
        <span>Dashboard</span>
        <span>Model</span>
        <span>Reports</span>
      </div>
      <div className="showcase-system-hero">
        <span>Predictive fatigue intelligence</span>
        <h4>Expose operational risk before the shift breaks.</h4>
        <div className="showcase-system-button">Run Assessment</div>
      </div>
      <div className="showcase-system-panel">
        {project.metrics.map((metric) => (
          <div key={metric.k}>
            <b>{metric.v}</b>
            <small>{metric.k}</small>
          </div>
        ))}
      </div>
      <i className={`showcase-system-orb showcase-system-orb--${index}`} />
    </div>
  );
}

function ProjectCard({ project, index, progress, frontIndex }) {
  const recipe = MOTION_RECIPES[index];
  const y = useTransform(progress, recipe.range, recipe.y);
  const scale = useTransform(progress, recipe.range, recipe.scale);
  const opacity = useTransform(progress, recipe.range, recipe.opacity);
  const num = String(index + 1).padStart(3, '0');

  // depth relative to the front card: 0 = front, >0 = stacked behind, <0 = not yet arrived
  const depth = frontIndex - index;
  const state =
    depth === 0 ? 'is-front is-active'
    : depth > 0 ? `is-behind is-depth-${Math.min(depth, 2)}`
    : 'is-upcoming';

  return (
    <motion.article
      className={`showcase-card showcase-card--stack ${state}`}
      style={{
        '--card-gradient': CARD_GRADIENTS[index % CARD_GRADIENTS.length],
        y,
        scale,
        opacity,
        zIndex: 10 + index, // newest card rides in front
      }}
    >
      <div className="showcase-card-border" aria-hidden="true" />
      <div className="showcase-card-echo echo-a" aria-hidden="true" />
      <div className="showcase-card-echo echo-b" aria-hidden="true" />

      <div className="showcase-card-inner">
        <header className="showcase-card-top">
          <span className="showcase-num">{num}</span>
          <div className="showcase-heading">
            <h3>{project.name}</h3>
            <p>{project.stack.replaceAll(' · ', ', ')}</p>
          </div>

          <div className="showcase-card-actions">
            {project.live ? (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer"
                className="showcase-btn showcase-btn--primary"
                data-cursor="link"
              >
                View Project
              </a>
            ) : (
              <span className="showcase-btn showcase-btn--disabled">View Project</span>
            )}
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="showcase-btn showcase-btn--github"
              data-cursor="link"
            >
              GitHub
            </a>
          </div>
        </header>

        <div className="showcase-card-body">
          <PreviewPanel project={project} index={index} />
          <p className="showcase-desc">{PROJECT_NARRATIVES[index]}</p>
        </div>
      </div>
    </motion.article>
  );
}

export default function WorkSection() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true, amount: 0.4 });
  const [frontIndex, setFrontIndex] = useState(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // ONE shared scrubbed progress: a gentle spring smooths the raw scroll so a
  // fast flick doesn't snap the whole deck together — the stacking eases into
  // place at a controlled "mid" pace regardless of scroll speed, and never
  // jitters. All card transforms + the zoom read from this single value.
  const progress = useSpring(scrollYProgress, {
    stiffness: 68,
    damping: 28,
    mass: 0.45,
    restDelta: 0.0005,
  });

  // Cinematic zoom: only after the final project has fully arrived (0.70),
  // during its hold phase — so stacking flows into the zoom with no reset.
  const stackScale = useTransform(progress, [0, 0.7, 1], [1, 1, 1.08]);
  const stackY = useTransform(progress, [0, 0.7, 1], [0, 0, -10]);
  const dimOpacity = useTransform(progress, [0.72, 1], [0, 0.55]);

  // Which card is currently front-of-deck — discrete state for glow / blur /
  // pointer-events. Reads the smoothed progress so it matches the visual.
  useMotionValueEvent(progress, 'change', (latest) => {
    const next = latest < 0.36 ? 0 : latest < 0.7 ? 1 : 2;
    setFrontIndex((current) => (current === next ? current : next));
  });

  return (
    <section id="work" ref={sectionRef} className="work-showcase" data-screen-label="04 Work">
      <div className="work-showcase-ambient" aria-hidden="true">
        <span /><span /><span /><span />
      </div>

      <motion.div
        ref={titleRef}
        className="showcase-intro"
        initial={{ opacity: 0, y: 20 }}
        animate={titleInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <div className="section-meta showcase-meta">
          <span className="num">04</span>
          <span className="bar" />
          <span className="meta-dim">WORK /</span>
          <span className="meta-hot">PROJECTS</span>
        </div>
        <h2>Projects I&apos;ve built and shipped.</h2>
        <p>Projects I&apos;ve built, deployed, and shaped into working systems.</p>
      </motion.div>

      <div className="showcase-stage">
        <motion.div className="showcase-dim" aria-hidden="true" style={{ opacity: dimOpacity }} />
        <motion.div
          className="showcase-stack"
          aria-label="Selected projects"
          style={{ scale: stackScale, y: stackY }}
        >
          {FEATURED_PROJECTS.map((project, i) => (
            <ProjectCard
              key={project.num}
              project={project}
              index={i}
              progress={progress}
              frontIndex={frontIndex}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
