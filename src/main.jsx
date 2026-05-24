import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'
import App from './App.jsx'

// ---- Adaptive performance tier (set before first paint) ----
// Weaker devices get lighter glow/blur/particles via the `perf-lite` class
// and the window.__perfLite flag — same visual language, less rendering cost.
(() => {
  const cores = navigator.hardwareConcurrency || 8;
  const mem = navigator.deviceMemory || 8;
  const coarse = window.matchMedia('(pointer: coarse)').matches; // phones/tablets
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lite = cores <= 4 || mem <= 4 || coarse || reduced;
  window.__perfLite = lite;
  document.documentElement.classList.toggle('perf-lite', lite);
})();

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
