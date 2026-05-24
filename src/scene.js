import * as THREE from 'three';

export function initScene(container) {
  if (!container) return;

  let cfg = window.SCENE_CFG || {
    particles: window.__perfLite ? 5000 : 9000,
    ringRadius: 1.42,
    ringTube: 0.17,
    speed: 0.85,
    cubeScale: 0.36,
    showHud: true,
  };
  window.SCENE_CFG = cfg;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.set(0, 0, 4.6);

  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // Pause the (expensive) WebGL render whenever the hero is off-screen so the
  // rest of the page gets the full frame budget — key for sustained 120fps.
  let visible = true;
  const visObserver = new IntersectionObserver(
    (entries) => { visible = entries[0].isIntersecting; },
    { rootMargin: '120px' }
  );
  visObserver.observe(container);

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const root = new THREE.Group();
  scene.add(root);

  let particleSystem;
  let particleBasePositions;

  function buildParticles(count, R, r) {
    if (particleSystem) {
      root.remove(particleSystem);
      particleSystem.geometry.dispose();
      particleSystem.material.dispose();
    }
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      const rJitter = r * (0.85 + Math.random() * 0.3);
      const x = (R + rJitter * Math.cos(v)) * Math.cos(u);
      const y = (R + rJitter * Math.cos(v)) * Math.sin(u);
      const z = rJitter * Math.sin(v) * 0.85;
      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      phase[i] = Math.random() * Math.PI * 2;
    }
    particleBasePositions = positions.slice();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('phase', new THREE.BufferAttribute(phase, 1));
    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.35,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    });
    particleSystem = new THREE.Points(geo, mat);
    particleSystem.rotation.x = -0.24;
    particleSystem.rotation.z = 0.05;
    root.add(particleSystem);
  }
  buildParticles(cfg.particles, cfg.ringRadius, cfg.ringTube);

  const thinRingGeo = new THREE.TorusGeometry(cfg.ringRadius, 0.002, 6, 280);
  const thinRingMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.25,
  });
  const thinRing = new THREE.Mesh(thinRingGeo, thinRingMat);
  thinRing.rotation.x = -0.24;
  thinRing.rotation.z = 0.05;
  root.add(thinRing);

  function makeCube(scale) {
    const group = new THREE.Group();
    const faceColors = [
      new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.38 }),
      new THREE.MeshBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.22 }),
      new THREE.MeshBasicMaterial({ color: 0xdddddd, transparent: true, opacity: 0.55 }),
      new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.10 }),
      new THREE.MeshBasicMaterial({ color: 0x666666, transparent: true, opacity: 0.28 }),
      new THREE.MeshBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.18 }),
    ];
    const faceGeo = new THREE.BoxGeometry(scale, scale, scale);
    const faceMesh = new THREE.Mesh(faceGeo, faceColors);
    group.add(faceMesh);
    const edgesGeo = new THREE.EdgesGeometry(faceGeo);
    const edgesMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
    const edges = new THREE.LineSegments(edgesGeo, edgesMat);
    group.add(edges);
    return { group, edgesMat, faceMats: faceColors };
  }

  const FACE_OPS = [0.38, 0.22, 0.55, 0.10, 0.28, 0.18];
  const cubeSpacing = 0.72;
  const sceneCubes = [];
  const sidePositions = [-cubeSpacing, 0, cubeSpacing];
  for (let i = 0; i < 3; i++) {
    const c = makeCube(cfg.cubeScale);
    c.group.position.x = sidePositions[i];
    c.group.rotation.x = -0.45;
    c.group.rotation.y = 0.55;
    root.add(c.group);
    sceneCubes.push(c);
  }

  const connectorMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.65,
  });
  const connectorGeo = new THREE.BufferGeometry();
  const connectorPositions = new Float32Array(6);
  connectorGeo.setAttribute('position', new THREE.BufferAttribute(connectorPositions, 3));
  const connector = new THREE.Line(connectorGeo, connectorMat);
  root.add(connector);

  const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
  const dots = [];
  for (let i = 0; i < 2; i++) {
    const dotGeo = new THREE.SphereGeometry(0.018, 8, 8);
    const dot = new THREE.Mesh(dotGeo, dotMat.clone());
    root.add(dot);
    dots.push(dot);
  }

  const orbitRadius = cfg.cubeScale * 1.45;
  const orbitPts = [];
  const orbitSegments = 128;
  for (let i = 0; i <= orbitSegments; i++) {
    const a = (i / orbitSegments) * Math.PI * 2;
    orbitPts.push(new THREE.Vector3(Math.cos(a) * orbitRadius, Math.sin(a) * orbitRadius, 0));
  }
  const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPts);
  const orbitMat = new THREE.LineDashedMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
    dashSize: 0.055,
    gapSize: 0.038,
    linewidth: 1,
  });
  const orbitRing = new THREE.Line(orbitGeo, orbitMat);
  orbitRing.computeLineDistances();
  root.add(orbitRing);

  const orbitDotGeo = new THREE.SphereGeometry(0.022, 10, 10);
  const orbitDotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.95, transparent: true });
  const orbitDot = new THREE.Mesh(orbitDotGeo, orbitDotMat);
  root.add(orbitDot);

  const electrons = [];
  function makeElectron(parentCubeIndex, axisTilt, speed, radius, phase) {
    const g = new THREE.SphereGeometry(0.012, 8, 8);
    const m = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
    const mesh = new THREE.Mesh(g, m);
    root.add(mesh);
    electrons.push({ mesh, parent: parentCubeIndex, axisTilt, speed, radius, phase, mat: m });
  }
  for (let i = 0; i < 3; i++) {
    makeElectron(i, 0.0,  1.8, 0.28, Math.random() * Math.PI * 2);
    makeElectron(i, 0.7,  2.4, 0.30, Math.random() * Math.PI * 2);
    makeElectron(i, -0.5, 2.1, 0.27, Math.random() * Math.PI * 2);
  }

  const clock = new THREE.Clock();
  let elapsed = 0;
  const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const PERIOD = 8.0;
  function getPhaseProgress(t) {
    const tt = (t * cfg.speed) % PERIOD;
    if (tt < 2.5)  return { mode: 'merge',  p: easeInOutCubic(tt / 2.5) };
    if (tt < 4.0)  return { mode: 'single', p: 1.0 };
    if (tt < 6.5)  return { mode: 'split',  p: easeInOutCubic((tt - 4.0) / 2.5) };
    return               { mode: 'triple', p: 0.0 };
  }

  const hud = window.__sceneHud || {};
  window.__sceneHud = hud;

  function tick() {
    requestAnimationFrame(tick);
    const dt = clock.getDelta();
    if (!visible) return; // off-screen: skip all update + render work
    elapsed += dt;

    if (particleSystem) particleSystem.rotation.z += dt * 0.045 * cfg.speed;
    thinRing.rotation.z += dt * 0.045 * cfg.speed;
    root.rotation.y = Math.sin(elapsed * 0.12) * 0.075;
    root.rotation.x = Math.sin(elapsed * 0.15) * 0.03;

    const breath = 1 + Math.sin(elapsed * 0.45) * 0.009;
    root.scale.setScalar(breath);

    if (particleSystem) {
      const posAttr = particleSystem.geometry.attributes.position;
      const phaseAttr = particleSystem.geometry.attributes.phase;
      const pos = posAttr.array;
      const base = particleBasePositions;
      const wobble = 0.014;
      const t = elapsed * 1.05;
      for (let i = 0; i < posAttr.count; i++) {
        const ph = phaseAttr.array[i];
        const w = Math.sin(t + ph) * wobble;
        pos[i * 3 + 0] = base[i * 3 + 0] * (1 + w * 0.012);
        pos[i * 3 + 1] = base[i * 3 + 1] * (1 + w * 0.012);
        pos[i * 3 + 2] = base[i * 3 + 2] + w * 0.18;
      }
      posAttr.needsUpdate = true;
    }

    const phase = getPhaseProgress(elapsed);
    let leftX, rightX, centerScale, sideAlpha;
    if (phase.mode === 'merge') {
      leftX  = sidePositions[0] * (1 - phase.p);
      rightX = sidePositions[2] * (1 - phase.p);
      centerScale = 1 + phase.p * 0.18;
      sideAlpha = 1 - phase.p;
    } else if (phase.mode === 'single') {
      leftX = 0; rightX = 0;
      centerScale = 1.18;
      sideAlpha = 0;
    } else if (phase.mode === 'split') {
      leftX  = sidePositions[0] * phase.p;
      rightX = sidePositions[2] * phase.p;
      centerScale = 1.18 - phase.p * 0.18;
      sideAlpha = phase.p;
    } else {
      leftX = sidePositions[0];
      rightX = sidePositions[2];
      centerScale = 1.0;
      sideAlpha = 1;
    }

    sceneCubes[0].group.position.x = leftX;
    sceneCubes[2].group.position.x = rightX;
    sceneCubes[1].group.scale.setScalar(centerScale);

    sceneCubes[0].edgesMat.opacity = 0.95 * sideAlpha;
    sceneCubes[0].faceMats.forEach((m, i) => { m.opacity = FACE_OPS[i] * sideAlpha; });
    sceneCubes[2].edgesMat.opacity = 0.95 * sideAlpha;
    sceneCubes[2].faceMats.forEach((m, i) => { m.opacity = FACE_OPS[i] * sideAlpha; });

    const cubeWobble = Math.sin(elapsed * 0.5) * 0.03;
    sceneCubes.forEach((c) => {
      c.group.rotation.y = 0.55 + cubeWobble;
      c.group.rotation.x = -0.45 + cubeWobble * 0.4;
    });

    connectorPositions[0] = leftX; connectorPositions[1] = 0; connectorPositions[2] = 0;
    connectorPositions[3] = rightX; connectorPositions[4] = 0; connectorPositions[5] = 0;
    connector.geometry.attributes.position.needsUpdate = true;
    connectorMat.opacity = 0.65 * sideAlpha;

    dots[0].position.set(leftX * 0.5, 0, 0);
    dots[1].position.set(rightX * 0.5, 0, 0);
    dots[0].material.opacity = 0.9 * sideAlpha;
    dots[1].material.opacity = 0.9 * sideAlpha;

    orbitRing.position.copy(sceneCubes[1].group.position);
    orbitRing.rotation.z = elapsed * 0.3;
    orbitMat.opacity = 0.5;

    const dotAngle = elapsed * 0.9;
    orbitDot.position.set(
      sceneCubes[1].group.position.x + Math.cos(dotAngle) * orbitRadius,
      Math.sin(dotAngle) * orbitRadius,
      0.01
    );

    electrons.forEach((e) => {
      const cube = sceneCubes[e.parent].group;
      const a = elapsed * e.speed * cfg.speed + e.phase;
      const x = Math.cos(a) * e.radius;
      const z = Math.sin(a) * e.radius * Math.cos(e.axisTilt);
      const y = Math.sin(a) * e.radius * Math.sin(e.axisTilt);
      e.mesh.position.set(cube.position.x + x, y, z);
      e.mat.opacity = e.parent === 1 ? 0.95 : 0.95 * sideAlpha;
    });

    renderer.render(scene, camera);

    hud.orbit = (root.rotation.y * (180 / Math.PI)) % 360;
    hud.phase = phase.mode.toUpperCase();
    hud.fps = Math.round(1 / Math.max(dt, 0.001));
  }
  tick();

  window.applySceneCfg = function (next) {
    cfg = Object.assign(cfg, next);
    window.SCENE_CFG = cfg;
    if (next.particles && next.particles !== particleSystem.geometry.attributes.position.count) {
      buildParticles(next.particles, cfg.ringRadius, cfg.ringTube);
    }
    if (next.ringRadius || next.ringTube) {
      buildParticles(cfg.particles, cfg.ringRadius, cfg.ringTube);
      thinRing.geometry.dispose();
      thinRing.geometry = new THREE.TorusGeometry(cfg.ringRadius, 0.002, 6, 280);
    }
  };
}
