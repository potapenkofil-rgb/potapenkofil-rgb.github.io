function createParticleSphere(canvas) {
  const context = canvas.getContext('2d');
  const isCompactScreen = window.matchMedia('(max-width: 760px)').matches;
  const particleCount = isCompactScreen ? 700 : 1500;
  const particles = createSpherePoints(particleCount);

  const state = {
    introSpread: 0,
    introOpacity: 1,
    scrollSpread: 0,
    scrollFade: 0,
  };

  const view = {
    width: 0,
    height: 0,
    time: 0,
    rotation: 0,
    tiltX: 0,
    tiltY: 0,
    pointerX: 0,
    pointerY: 0,
    frameId: 0,
    isRunning: false,
  };

  function createSpherePoints(count) {
    const points = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const palette = ['#5cc8ff', '#a48bff', '#ff9bd2'];

    for (let index = 0; index < count; index++) {
      const y = 1 - (index / (count - 1)) * 2;
      const ringRadius = Math.sqrt(1 - y * y);
      const angle = index * goldenAngle;
      const isAccent = Math.random() < 0.14;

      points.push({
        x: Math.cos(angle) * ringRadius,
        y: y,
        z: Math.sin(angle) * ringRadius,
        burst: 0.5 + Math.random() * 2.2,
        phase: Math.random() * Math.PI * 2,
        size: Math.random() < 0.07 ? 2.4 : 1.25,
        color: isAccent ? palette[index % palette.length] : '#f5f5f7',
      });
    }

    return points;
  }

  function resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    view.width = canvas.clientWidth;
    view.height = canvas.clientHeight;
    canvas.width = Math.round(view.width * pixelRatio);
    canvas.height = Math.round(view.height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    drawFrame();
  }

  function sphereCenter() {
    const isWideScreen = view.width > 980;

    if (isWideScreen) {
      return { x: view.width * 0.7, y: view.height * 0.5 };
    }

    return { x: view.width * 0.5, y: view.height * 0.34 };
  }

  function sphereRadius() {
    const isWideScreen = view.width > 980;

    if (isWideScreen) {
      return Math.min(view.width * 0.25, view.height * 0.38);
    }

    return Math.min(view.width * 0.4, view.height * 0.24);
  }

  function drawFrame() {
    context.clearRect(0, 0, view.width, view.height);

    const visibility = state.introOpacity * (1 - state.scrollFade);
    if (visibility <= 0.01) {
      return;
    }

    view.tiltX += (view.pointerY * 0.35 - view.tiltX) * 0.045;
    view.tiltY += (view.pointerX * 0.55 - view.tiltY) * 0.045;

    const center = sphereCenter();
    const radius = sphereRadius();
    const perspective = radius * 3.2;
    const spread = state.introSpread + state.scrollSpread;

    const angleY = view.rotation + view.tiltY;
    const angleX = 0.32 + view.tiltX;
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);

    for (const particle of particles) {
      const breathing = 1 + Math.sin(view.time * 1.4 + particle.phase) * 0.018;
      const distance = radius * breathing * (1 + spread * particle.burst);

      const rotatedX = particle.x * cosY - particle.z * sinY;
      const rotatedZ = particle.x * sinY + particle.z * cosY;
      const tiltedY = particle.y * cosX - rotatedZ * sinX;
      const tiltedZ = particle.y * sinX + rotatedZ * cosX;

      const cameraDistance = perspective + tiltedZ * distance;
      if (cameraDistance < perspective * 0.12) {
        continue;
      }

      const depth = perspective / cameraDistance;
      const screenX = center.x + rotatedX * distance * depth;
      const screenY = center.y + tiltedY * distance * depth;
      const frontness = (1 - tiltedZ) / 2;
      const size = Math.min(particle.size * depth, 7);

      context.globalAlpha = (0.1 + frontness * 0.9) * visibility;
      context.fillStyle = particle.color;
      context.fillRect(screenX - size / 2, screenY - size / 2, size, size);
    }

    context.globalAlpha = 1;
  }

  function tick() {
    if (document.hidden) {
      view.frameId = requestAnimationFrame(tick);
      return;
    }
    view.time += 1 / 60;
    view.rotation += 0.0017;
    drawFrame();
    view.frameId = requestAnimationFrame(tick);
  }

  function start() {
    if (view.isRunning) {
      return;
    }
    view.isRunning = true;
    view.frameId = requestAnimationFrame(tick);
  }

  function stop() {
    view.isRunning = false;
    cancelAnimationFrame(view.frameId);
  }

  function handlePointerMove(event) {
    view.pointerX = event.clientX / window.innerWidth - 0.5;
    view.pointerY = event.clientY / window.innerHeight - 0.5;
  }

  resize();
  new ResizeObserver(resize).observe(canvas);
  window.addEventListener('pointermove', handlePointerMove, { passive: true });

  return { state, start, stop, drawFrame };
}
