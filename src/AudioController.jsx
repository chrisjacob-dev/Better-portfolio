import React, { useEffect, useRef, useState } from 'react';

const SRC = '/audio/ambient.mp3';
const TARGET_VOL = 0.08;       // immersive, low (background ambience)
const FADE_MS = 1600;          // smooth fade in/out
const UI_OVERABLES = [
  'a', 'button', '[data-cursor="link"]', '.showcase-card', '.showcase-btn',
  '.stack-line', '.contact-card', '.core-focus-item', '.journey-card',
].join(',');

export default function AudioController() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const fadeRaf = useRef(0);
  const playingRef = useRef(false);   // avoid stale closures in listeners
  const userPausedRef = useRef(false); // don't auto-resume if user paused
  const acRef = useRef(null);          // WebAudio ctx for UI blips

  // smooth volume ramp (rAF, transform-free so it never touches layout)
  const fadeTo = (target, onDone) => {
    const a = audioRef.current;
    if (!a) return;
    cancelAnimationFrame(fadeRaf.current);
    const from = a.volume;
    const start = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - start) / FADE_MS);
      const eased = 1 - Math.pow(1 - k, 3); // easeOutCubic
      a.volume = Math.min(1, Math.max(0, from + (target - from) * eased));
      if (k < 1) fadeRaf.current = requestAnimationFrame(step);
      else onDone?.();
    };
    fadeRaf.current = requestAnimationFrame(step);
  };

  const play = () => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = false;              // bring sound in (after the muted preload)
    a.volume = 0;
    const p = a.play();
    if (p && p.catch) p.catch(() => {}); // ignore autoplay rejection
    fadeTo(TARGET_VOL);
    playingRef.current = true;
    setPlaying(true);
  };

  const pause = () => {
    const a = audioRef.current;
    if (!a) return;
    playingRef.current = false;
    setPlaying(false);
    fadeTo(0, () => { if (!playingRef.current) a.pause(); });
  };

  const toggle = () => {
    if (playingRef.current) { userPausedRef.current = true; pause(); }
    else { userPausedRef.current = false; play(); }
  };

  // create audio; start it MUTED on load (browsers allow muted autoplay) so
  // it's already running, then unmute + fade in on the first interaction
  // anywhere on the page — no need to press the control.
  useEffect(() => {
    const a = new Audio(SRC);
    a.loop = true;
    a.preload = 'auto';
    a.muted = true;
    a.volume = 0;
    audioRef.current = a;
    const mp = a.play();
    if (mp && mp.catch) mp.catch(() => {}); // muted autoplay (best effort)

    // Browsers only unmute audio after a REAL activation gesture (a press /
    // tap / key) — mousemove & scroll are silently blocked. So we listen for
    // the first such gesture ANYWHERE on the page (not just the control).
    const EVENTS = ['pointerdown', 'mousedown', 'touchstart', 'keydown', 'click'];
    const removeAll = () => EVENTS.forEach((ev) => window.removeEventListener(ev, onFirst));
    const onFirst = (e) => {
      // unlock a tiny WebAudio context for UI sounds (within the gesture)
      if (!acRef.current) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) acRef.current = new AC();
      }
      acRef.current?.resume?.();
      removeAll(); // first gesture only
      // if the gesture is the toggle itself, let its onClick drive playback
      if (e.target?.closest?.('.music-toggle')) return;
      if (!userPausedRef.current) play();
    };
    const opts = { passive: true };
    EVENTS.forEach((ev) => window.addEventListener(ev, onFirst, opts));

    return () => {
      cancelAnimationFrame(fadeRaf.current);
      removeAll();
      a.pause();
      audioRef.current = null;
    };
  }, []);

  // subtle futuristic UI blips on hover/click (only while sound is on)
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return undefined;

    let lastTarget = null;
    const blip = (freq, gainPeak, dur) => {
      const ac = acRef.current;
      if (!ac || !playingRef.current) return;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const now = ac.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(gainPeak, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(gain).connect(ac.destination);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    };
    const onOver = (e) => {
      const el = e.target.closest(UI_OVERABLES);
      if (el && el !== lastTarget) { lastTarget = el; blip(880, 0.035, 0.09); }
      else if (!el) lastTarget = null;
    };
    const onClick = (e) => {
      if (e.target.closest(UI_OVERABLES)) blip(560, 0.06, 0.14);
    };
    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('click', onClick, { passive: true });
    return () => {
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <button
      type="button"
      className={`music-toggle${playing ? ' is-playing' : ''}`}
      onClick={toggle}
      aria-label={playing ? 'Pause ambient music' : 'Play ambient music'}
      aria-pressed={playing}
      data-cursor="link"
    >
      <span className="music-eq" aria-hidden="true">
        <i /><i /><i /><i />
      </span>
      <span className="music-label">{playing ? 'SOUND ON' : 'SOUND OFF'}</span>
    </button>
  );
}
