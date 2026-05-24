import * as THREE from 'three';

export function initAboutCore(container) {
  if (!container) return () => {};

  const isSmall = window.matchMedia('(max-width: 760px)').matches || window.__perfLite;
  const particleCount = isSmall ? 2600 : 6200;
  const dustCount = isSmall ? 520 : 1100;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 5.4);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // Pause WebGL render while the About core is off-screen (free frame budget).
  let visible = true;
  const visObserver = new IntersectionObserver(
    (entries) => { visible = entries[0].isIntersecting; },
    { rootMargin: '120px' }
  );
  visObserver.observe(container);

  const root = new THREE.Group();
  const parallaxRoot = new THREE.Group();
  parallaxRoot.add(root);
  scene.add(parallaxRoot);

  const surfaceGeo = new THREE.BufferGeometry();
  const surfacePositions = new Float32Array(particleCount * 3);
  const surfaceSeeds = new Float32Array(particleCount);
  const surfaceIntensity = new Float32Array(particleCount);
  const radius = 1.58;

  for (let i = 0; i < particleCount; i++) {
    const u = (i / particleCount) * Math.PI * 2 * 34.377 + Math.random() * 0.018;
    const v = Math.acos(2 * ((i + 0.5) / particleCount) - 1);
    const band = 1 + Math.sin(v * 10 + i * 0.003) * 0.025;
    surfacePositions[i * 3 + 0] = Math.sin(v) * Math.cos(u) * radius * band;
    surfacePositions[i * 3 + 1] = Math.cos(v) * radius * band;
    surfacePositions[i * 3 + 2] = Math.sin(v) * Math.sin(u) * radius * band;
    surfaceSeeds[i] = Math.random() * 1000;
    surfaceIntensity[i] = 0.35 + Math.random() * 0.85;
  }

  surfaceGeo.setAttribute('position', new THREE.BufferAttribute(surfacePositions, 3));
  surfaceGeo.setAttribute('seed', new THREE.BufferAttribute(surfaceSeeds, 1));
  surfaceGeo.setAttribute('intensity', new THREE.BufferAttribute(surfaceIntensity, 1));

  const surfaceMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uScroll: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.8) },
    },
    vertexShader: `
      attribute float seed;
      attribute float intensity;
      varying float vAlpha;
      varying float vTint;
      uniform float uTime;
      uniform float uPulse;
      uniform float uScroll;
      uniform float uPixelRatio;

      void main() {
        vec3 p = position;
        float wave = sin((p.y * 4.8) + uTime * 1.15 + seed) * 0.028;
        wave += sin((p.x * 3.0) - uTime * 0.82 + seed * 0.41) * 0.018;
        float flow = sin(seed + uTime * (0.9 + uScroll * 0.7)) * 0.018;
        p += normalize(p) * (wave + flow + uPulse * 0.028);

        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        float depth = smoothstep(-1.8, 1.4, p.z);
        vAlpha = (0.18 + depth * 0.82) * intensity;
        vTint = depth;
        gl_PointSize = (1.45 + intensity * 1.75 + uPulse * 1.6) * uPixelRatio * (4.8 / -mvPosition.z);
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      varying float vTint;

      void main() {
        vec2 c = gl_PointCoord - vec2(0.5);
        float d = length(c);
        float glow = smoothstep(0.5, 0.0, d);
        vec3 blue = vec3(0.23, 0.51, 0.96);
        vec3 white = vec3(1.0);
        vec3 color = mix(blue, white, 0.62 + vTint * 0.28);
        gl_FragColor = vec4(color, glow * vAlpha);
      }
    `,
  });

  const surface = new THREE.Points(surfaceGeo, surfaceMat);
  root.add(surface);

  const dustGeo = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(dustCount * 3);
  const dustSeeds = new Float32Array(dustCount);
  const dustIntensity = new Float32Array(dustCount);
  for (let i = 0; i < dustCount; i++) {
    const d = 2.0 + Math.random() * 2.2;
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(Math.random() * 2 - 1);
    dustPositions[i * 3 + 0] = Math.sin(b) * Math.cos(a) * d;
    dustPositions[i * 3 + 1] = Math.cos(b) * d * 0.82;
    dustPositions[i * 3 + 2] = Math.sin(b) * Math.sin(a) * d;
    dustSeeds[i] = Math.random() * 1000;
    dustIntensity[i] = 0.08 + Math.random() * 0.28;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  dustGeo.setAttribute('seed', new THREE.BufferAttribute(dustSeeds, 1));
  dustGeo.setAttribute('intensity', new THREE.BufferAttribute(dustIntensity, 1));

  const dustMat = surfaceMat.clone();
  dustMat.uniforms = {
    uTime: { value: 0 },
    uPulse: { value: 0 },
    uScroll: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.8) },
  };
  const dust = new THREE.Points(dustGeo, dustMat);
  dust.scale.setScalar(1.18);
  root.add(dust);

  function makeOrbit(radiusX, radiusY, tiltX, tiltY, tiltZ, color, opacity) {
    const pts = [];
    for (let i = 0; i <= 360; i++) {
      const a = (i / 360) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radiusX, Math.sin(a) * radiusY, 0));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const line = new THREE.Line(geo, mat);
    line.rotation.set(tiltX, tiltY, tiltZ);
    root.add(line);
    return { line, mat, radiusX, radiusY, speed: 0.04 + Math.random() * 0.06 };
  }

  const orbits = [
    makeOrbit(2.05, 0.48, 0.58, 0.12, -0.34, 0x8bb8ff, 0.52),
    makeOrbit(2.0, 0.7, -0.42, 0.32, 0.82, 0x3b82f6, 0.35),
    makeOrbit(1.86, 0.34, 0.1, 0.88, 0.18, 0xffffff, 0.22),
    makeOrbit(1.72, 0.98, 1.06, -0.15, -0.66, 0x73a6ff, 0.24),
  ];

  const pulseGeo = new THREE.SphereGeometry(0.026, 12, 12);
  const pulseMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const pulses = orbits.map((orbit, i) => {
    const dot = new THREE.Mesh(pulseGeo, pulseMat.clone());
    root.add(dot);
    return { dot, orbit, phase: i * 1.7, speed: 0.28 + i * 0.08 };
  });

  const nodeGeo = new THREE.SphereGeometry(0.035, 14, 14);
  const nodes = [];
  const nodeCoords = [
    [0.2, 0.82, 0.52], [-0.78, 0.42, 0.32], [0.88, 0.04, 0.25],
    [-0.52, -0.68, 0.6], [0.44, -0.74, 0.42], [0.02, -0.12, 0.98],
    [0.66, 0.48, -0.24], [-0.36, 0.18, -0.62],
  ];
  nodeCoords.forEach((coord, i) => {
    const mat = new THREE.MeshBasicMaterial({
      color: i % 3 === 0 ? 0xffffff : 0x87b8ff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const node = new THREE.Mesh(nodeGeo, mat);
    node.position.set(coord[0] * radius, coord[1] * radius, coord[2] * radius);
    root.add(node);
    nodes.push({ node, mat, phase: Math.random() * Math.PI * 2 });
  });

  const haloGeo = new THREE.SphereGeometry(1.72, 48, 48);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    transparent: true,
    opacity: 0.055,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide,
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  root.add(halo);

  const clock = new THREE.Clock();
  let raf = 0;
  let scrollY = window.scrollY;
  let scrollVelocity = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;
  let mouseX = 0;
  let mouseY = 0;
  let disposed = false;
  const hud = window.__aboutCoreHud || {};
  window.__aboutCoreHud = hud;

  function resize() {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    surfaceMat.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 1.8);
    dustMat.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 1.8);
  }

  function onMove(e) {
    const rect = container.getBoundingClientRect();
    targetMouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    targetMouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  }

  function onScroll() {
    const nextY = window.scrollY;
    scrollVelocity += (nextY - scrollY) * 0.002;
    scrollY = nextY;
  }

  function animate() {
    if (disposed) return;
    raf = requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.033);
    if (!visible) return; // off-screen: skip update + render
    const t = clock.elapsedTime;

    mouseX += (targetMouseX - mouseX) * 0.045;
    mouseY += (targetMouseY - mouseY) * 0.045;
    scrollVelocity *= 0.92;
    const scrollBoost = Math.min(1.0, Math.abs(scrollVelocity));
    const breath = (Math.sin(t * 1.15) + 1) * 0.5;
    const pulse = Math.pow(breath, 2.6) * 0.42 + scrollBoost * 0.32;

    surfaceMat.uniforms.uTime.value = t;
    surfaceMat.uniforms.uPulse.value = pulse;
    surfaceMat.uniforms.uScroll.value = scrollBoost;
    dustMat.uniforms.uTime.value = t * 0.45;
    dustMat.uniforms.uPulse.value = pulse * 0.4;
    dustMat.uniforms.uScroll.value = scrollBoost;

    root.rotation.y += dt * (0.11 + scrollBoost * 0.14);
    root.rotation.x = Math.sin(t * 0.18) * 0.055 + mouseY * 0.085;
    parallaxRoot.rotation.y = mouseX * 0.12;
    parallaxRoot.rotation.x = -mouseY * 0.08;
    root.scale.setScalar(1 + Math.sin(t * 1.15) * 0.014);
    halo.scale.setScalar(1.0 + pulse * 0.045);
    haloMat.opacity = 0.045 + pulse * 0.045;

    orbits.forEach((orbit, i) => {
      orbit.line.rotation.z += dt * orbit.speed * (i % 2 ? -1 : 1) * (1 + scrollBoost);
      orbit.mat.opacity = (i === 0 ? 0.42 : 0.2) + Math.sin(t * 0.7 + i) * 0.045 + pulse * 0.08;
    });

    pulses.forEach(({ dot, orbit, phase, speed }, i) => {
      const a = t * speed + phase;
      dot.position.set(Math.cos(a) * orbit.radiusX, Math.sin(a) * orbit.radiusY, 0);
      dot.rotation.copy(orbit.line.rotation);
      dot.material.opacity = 0.4 + Math.pow(Math.sin(a * 1.7) * 0.5 + 0.5, 3) * 0.6;
      dot.scale.setScalar(0.85 + pulse * 1.35 + (i % 2) * 0.24);
    });

    nodes.forEach(({ node, mat, phase }, i) => {
      const p = Math.sin(t * (0.9 + i * 0.05) + phase) * 0.5 + 0.5;
      node.scale.setScalar(0.72 + p * 0.92 + pulse * 0.4);
      mat.opacity = 0.35 + p * 0.48 + pulse * 0.1;
    });

    dust.rotation.y -= dt * 0.018;
    dust.rotation.x = Math.sin(t * 0.14) * 0.04;
    surface.rotation.y += dt * 0.035;

    hud.frame = (hud.frame || 0) + 1;
    hud.rotation = root.rotation.y;
    hud.pulse = pulse;
    hud.scrollBoost = scrollBoost;

    renderer.render(scene, camera);
  }

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  raf = requestAnimationFrame(animate);

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    visObserver.disconnect();
    window.removeEventListener('resize', resize);
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('scroll', onScroll);
    if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    surfaceGeo.dispose();
    surfaceMat.dispose();
    dustGeo.dispose();
    dustMat.dispose();
    pulseGeo.dispose();
    nodeGeo.dispose();
    haloGeo.dispose();
    haloMat.dispose();
    orbits.forEach(({ line, mat }) => {
      line.geometry.dispose();
      mat.dispose();
    });
    pulses.forEach(({ dot }) => dot.material.dispose());
    nodes.forEach(({ mat }) => mat.dispose());
    renderer.dispose();
  };
}
