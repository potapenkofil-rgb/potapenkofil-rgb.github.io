const STACK_RINGS = [
  ['Python', 'TypeScript', 'Rust', 'C++', 'C#', 'Kotlin', 'Swift'],
  ['aiogram', 'React', 'Next.js', 'Tauri', 'FastAPI', 'Flutter', 'SolidJS', '.NET'],
  ['PostgreSQL', 'Docker', 'Redis', 'Playwright', 'Linux', 'Git', 'Cloudflare', 'Telethon', 'SQLite', 'Node.js', 'Nginx'],
];

const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
const touchSceneStretch = isTouchDevice ? 1.5 : 1;
const COMPACT_QUERY = '(max-width: 760px), (pointer: coarse) and (max-height: 520px)';

function sceneLength(percent) {
  return `+=${percent * touchSceneStretch}%`;
}

function buildOrbits() {
  const system = document.querySelector('.orbit-system');

  STACK_RINGS.forEach((names, ringIndex) => {
    const ring = document.createElement('div');
    ring.className = `orbit orbit--${ringIndex + 1}`;

    names.forEach((name, itemIndex) => {
      const angle = (360 / names.length) * itemIndex + ringIndex * 17;
      const item = document.createElement('div');
      item.className = 'orbit__item';
      item.style.setProperty('--angle', `${angle}deg`);

      const chip = document.createElement('span');
      chip.className = 'orbit__chip';
      chip.textContent = name;

      item.append(chip);
      ring.append(item);
    });

    system.append(ring);
  });

  const technologyCount = STACK_RINGS.flat().length;
  document.querySelector('.orbit-core__count').textContent = technologyCount;
}

function buildMarquee() {
  const names = STACK_RINGS.flat();
  const rows = document.querySelectorAll('.marquee__row');

  rows.forEach((row, rowIndex) => {
    const orderedNames = rowIndex % 2 === 0 ? names : [...names].reverse();
    const content = document.createElement('div');
    content.className = 'marquee__content';

    orderedNames.forEach((name) => {
      const item = document.createElement('span');
      item.className = 'marquee__item';
      item.textContent = name;

      const separator = document.createElement('span');
      separator.className = 'marquee__separator';
      separator.setAttribute('aria-hidden', 'true');

      content.append(item, separator);
    });

    const duplicate = content.cloneNode(true);
    duplicate.setAttribute('aria-hidden', 'true');
    row.append(content, duplicate);
  });
}

function splitIntoWords(container) {
  const words = [];
  const sourceNodes = Array.from(container.childNodes);
  container.textContent = '';

  sourceNodes.forEach((node) => {
    const isAccent = node.nodeType === Node.ELEMENT_NODE;
    const parts = node.textContent.split(/\s+/).filter(Boolean);

    parts.forEach((part) => {
      const word = document.createElement('span');
      word.className = isAccent ? 'word word--accent' : 'word';
      word.textContent = part;
      container.append(word, ' ');
      words.push(word);
    });
  });

  return words;
}

function setupSmoothScroll() {
  const lenis = new Lenis({
    lerp: 0.085,
    wheelMultiplier: 1,
    syncTouch: false,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

function setupAnchorLinks(lenis) {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) {
        return;
      }
      event.preventDefault();

      if (lenis) {
        lenis.scrollTo(target, { duration: 1.2 });
      } else {
        target.scrollIntoView();
      }
    });
  });
}

function setupMenu(lenis) {
  const root = document.documentElement;
  const burger = document.querySelector('.nav__burger');
  const menu = document.querySelector('.menu');
  const compactQuery = window.matchMedia(COMPACT_QUERY);

  function setOpen(open) {
    if (root.classList.contains('menu-open') === open) {
      return;
    }
    root.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));

    if (lenis) {
      if (open) {
        lenis.stop();
      } else {
        lenis.start();
      }
    }
  }

  burger.addEventListener('click', () => setOpen(!root.classList.contains('menu-open')));
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setOpen(false);
    }
  });
  compactQuery.addEventListener('change', () => setOpen(false));
}

function setupNav() {
  const nav = document.querySelector('.nav');

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const scrolled = self.scroll();
      nav.classList.toggle('nav--solid', scrolled > 40);
    },
  });
}

function setupPageProgress() {
  gsap.to('.page-progress', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
  });
}

function createHeroIntro(sphere) {
  const timeline = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });

  timeline
    .fromTo(sphere.state, { introSpread: 1.4 }, { introSpread: 0, duration: 4, ease: 'expo.out' }, 0)
    .fromTo(sphere.state, { introOpacity: 0 }, { introOpacity: 1, duration: 3.2, ease: 'sine.inOut' }, 0)
    .from('.hero__title .line > span', { yPercent: 112, duration: 1.5, stagger: 0.12 }, 0.1)
    .from(['.hero__badge', '.hero__lead', '.hero__actions'], { y: 32, opacity: 0, duration: 1.3, stagger: 0.1 }, 0.4)
    .from('.hero__scroll', { opacity: 0, duration: 1.2 }, 1)
    .from('.nav__inner', { y: -24, opacity: 0, duration: 1.3, clearProps: 'transform' }, 0.35);

  return timeline;
}

function hasSeenLoader() {
  try {
    const seen = sessionStorage.getItem('loader-seen') === '1';
    sessionStorage.setItem('loader-seen', '1');
    return seen;
  } catch {
    return false;
  }
}

function playLoader(lenis, onReveal) {
  const loader = document.querySelector('.loader');
  const letters = loader.querySelectorAll('.loader__letter');
  const bar = loader.querySelector('.loader__bar');

  if (hasSeenLoader()) {
    loader.remove();
    onReveal();
    return;
  }

  lenis.stop();

  const timeline = gsap.timeline({
    onComplete: () => {
      loader.remove();
      lenis.start();
    },
  });

  timeline
    .from(letters, { yPercent: 115, duration: 0.6, ease: 'power3.out', stagger: 0.04 })
    .to(bar, { scaleX: 1, duration: 0.6, ease: 'power2.inOut' }, 0.05)
    .to(letters, { yPercent: -115, duration: 0.4, ease: 'power3.in', stagger: 0.025 }, '+=0.05')
    .to(bar, { scaleX: 0, transformOrigin: 'right', duration: 0.4, ease: 'power2.in' }, '<')
    .to(loader, { yPercent: -100, duration: 0.75, ease: 'power4.inOut' }, '-=0.15')
    .add(onReveal, '-=0.5');
}

function setupHeroScroll(sphere, compact) {
  if (compact) {
    gsap.timeline({
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onLeave: () => sphere.stop(),
        onEnterBack: () => sphere.start(),
      },
    })
      .to(sphere.state, { scrollSpread: 1.6, scrollFade: 1, ease: 'power1.in' }, 0)
      .to('.hero__content', { yPercent: -12, opacity: 0, ease: 'power1.in' }, 0);
    return;
  }

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: sceneLength(100),
      pin: true,
      scrub: true,
      onLeave: () => sphere.stop(),
      onEnterBack: () => sphere.start(),
    },
  });

  timeline
    .to(sphere.state, { scrollSpread: 2.4, scrollFade: 1, ease: 'power2.in' }, 0)
    .to('.hero__content', { yPercent: -14, scale: 0.93, opacity: 0, ease: 'power1.in' }, 0)
    .to('.hero__scroll', { opacity: 0, duration: 0.15 }, 0);
}

function setupManifesto(words, compact) {
  if (compact) {
    gsap.fromTo(words, { opacity: 0.12 }, {
      opacity: 1,
      stagger: 0.1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.manifesto__text',
        start: 'top 85%',
        end: 'bottom 50%',
        scrub: true,
      },
    });
    return;
  }

  gsap.timeline({
    scrollTrigger: {
      trigger: '.manifesto',
      start: 'top top',
      end: sceneLength(100),
      pin: true,
      scrub: true,
    },
  })
    .fromTo(words, { opacity: 0.12 }, { opacity: 1, stagger: 0.1, ease: 'none' })
    .to({}, { duration: 0.6 });
}

function setupServicesSwipe(section, cards, currentLabel, progressBar) {
  const viewport = section.querySelector('.services__viewport');

  function update() {
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const progress = maxScroll > 0 ? viewport.scrollLeft / maxScroll : 0;
    const step = cards[1].offsetLeft - cards[0].offsetLeft;
    const activeIndex = progress > 0.99 ? cards.length : Math.round(viewport.scrollLeft / step) + 1;
    currentLabel.textContent = String(activeIndex).padStart(2, '0');
    progressBar.style.transform = `scaleX(${Math.max(progress, 1 / cards.length)})`;
  }

  viewport.addEventListener('scroll', update, { passive: true });
  update();

  cards.forEach((card) => {
    const iconShapes = card.querySelectorAll('.service__icon [pathLength]');

    if (iconShapes.length > 0) {
      gsap.fromTo(
        iconShapes,
        { strokeDashoffset: 1, opacity: 0, fillOpacity: 0 },
        {
          strokeDashoffset: 0,
          opacity: 1,
          fillOpacity: 1,
          duration: 1.4,
          ease: 'sine.inOut',
          stagger: 0.2,
          scrollTrigger: {
            trigger: card,
            scroller: viewport,
            horizontal: true,
            start: 'left 85%',
            once: true,
          },
        },
      );
    }
  });

  gsap.from(cards.slice(0, 2), {
    x: 60,
    opacity: 0,
    duration: 1.2,
    ease: 'expo.out',
    stagger: 0.1,
    scrollTrigger: { trigger: viewport, start: 'top 85%', once: true },
  });

  return () => {
    viewport.removeEventListener('scroll', update);
    viewport.scrollLeft = 0;
  };
}

function setupServices(compact) {
  const section = document.querySelector('.services');
  const track = section.querySelector('.services__track');
  const cards = gsap.utils.toArray('.service', track);
  const currentLabel = section.querySelector('.services__current');
  const progressBar = section.querySelector('.services__progress-bar');

  function scrollDistance() {
    return Math.max(0, track.scrollWidth - document.documentElement.clientWidth);
  }

  function updateCounter(progress) {
    const activeIndex = Math.min(cards.length, Math.floor(progress * cards.length) + 1);
    currentLabel.textContent = String(activeIndex).padStart(2, '0');
    progressBar.style.transform = `scaleX(${progress})`;
  }

  if (compact) {
    return setupServicesSwipe(section, cards, currentLabel, progressBar);
  }

  const horizontalScroll = gsap.to(track, {
    x: () => -scrollDistance(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${scrollDistance() * 0.8 * touchSceneStretch}`,
      pin: true,
      scrub: 0.8,
      invalidateOnRefresh: true,
      onUpdate: (self) => updateCounter(self.progress),
    },
  });

  cards.forEach((card) => {
    const iconShapes = card.querySelectorAll('.service__icon [pathLength]');

    if (iconShapes.length > 0) {
      gsap.fromTo(
        iconShapes,
        { strokeDashoffset: 1, opacity: 0, fillOpacity: 0 },
        {
          strokeDashoffset: 0,
          opacity: 1,
          fillOpacity: 1,
          ease: 'sine.inOut',
          stagger: 0.25,
          scrollTrigger: {
            trigger: card,
            containerAnimation: horizontalScroll,
            start: 'left 100%',
            end: 'left 45%',
            scrub: 1.2,
          },
        },
      );
    }

    gsap.fromTo(
      card,
      { opacity: 0.3 },
      {
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          containerAnimation: horizontalScroll,
          start: 'left 105%',
          end: 'left 65%',
          scrub: true,
        },
      },
    );
  });
}

function setupPlatformTabs(section, device, screens, items, shapeFor, highlightPlatform) {
  let current = 0;
  let switching = null;
  let autoplay = null;
  let userTookOver = false;

  function show(index) {
    if (index === current) {
      return;
    }
    const previous = current;
    current = index;
    highlightPlatform(index);

    if (switching) {
      switching.kill();
    }
    gsap.set(screens.filter((_, i) => i !== index && i !== previous), { autoAlpha: 0 });

    switching = gsap.timeline()
      .to(device, { ...shapeFor(index), duration: 0.9, ease: 'power3.inOut' }, 0)
      .to(device, { scale: 0.92, rotateY: index % 2 === 0 ? -10 : 10, duration: 0.45, ease: 'power2.in' }, 0)
      .to(device, { scale: 1, rotateY: 0, duration: 0.45, ease: 'power2.out' }, 0.45)
      .to(screens[previous], { autoAlpha: 0, duration: 0.45, ease: 'sine.inOut' }, 0.1)
      .to(screens[index], { autoAlpha: 1, duration: 0.45, ease: 'sine.inOut' }, 0.35);
  }

  function stopAutoplay() {
    clearInterval(autoplay);
    autoplay = null;
  }

  function startAutoplay() {
    if (userTookOver || autoplay) {
      return;
    }
    autoplay = setInterval(() => show((current + 1) % screens.length), 3200);
  }

  const handlers = items.map((item, index) => {
    const select = (event) => {
      if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') {
        return;
      }
      event.preventDefault();
      userTookOver = true;
      stopAutoplay();
      show(index);
    };
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.addEventListener('click', select);
    item.addEventListener('keydown', select);
    return select;
  });

  ScrollTrigger.create({
    trigger: section,
    start: 'top 60%',
    end: 'bottom 30%',
    onToggle: (self) => (self.isActive ? startAutoplay() : stopAutoplay()),
    onRefresh: () => gsap.set(device, shapeFor(current)),
  });

  return () => {
    stopAutoplay();
    if (switching) {
      switching.kill();
    }
    items.forEach((item, index) => {
      item.removeAttribute('role');
      item.removeAttribute('tabindex');
      item.removeEventListener('click', handlers[index]);
      item.removeEventListener('keydown', handlers[index]);
    });
    highlightPlatform(0);
  };
}

function setupPlatforms(compact) {
  const section = document.querySelector('.platforms');
  const stage = section.querySelector('.platforms__stage');
  const device = section.querySelector('.device');
  const screens = gsap.utils.toArray('.screen', device);
  const items = gsap.utils.toArray('.platforms__item', section);

  function shapeFor(index) {
    const stageWidth = stage.clientWidth;
    const stageHeight = stage.clientHeight;

    const phoneHeight = Math.min(stageHeight * 0.94, 620);
    const phoneWidth = phoneHeight * 0.49;
    const desktopWidth = Math.min(stageWidth * 0.98, 860);
    const desktopHeight = Math.min(desktopWidth * 0.64, stageHeight * 0.92);

    const shapes = [
      { width: phoneWidth, height: phoneHeight, borderRadius: phoneWidth * 0.14, '--bezel': '7px' },
      { width: phoneWidth, height: phoneHeight, borderRadius: phoneWidth * 0.18, '--bezel': '7px' },
      { width: desktopWidth, height: desktopHeight, borderRadius: 12, '--bezel': '0px' },
      { width: desktopWidth, height: desktopHeight, borderRadius: 16, '--bezel': '0px' },
    ];

    return shapes[index];
  }

  function shapeGetters(index) {
    return {
      width: () => shapeFor(index).width,
      height: () => shapeFor(index).height,
      borderRadius: () => shapeFor(index).borderRadius,
      '--bezel': shapeFor(index)['--bezel'],
    };
  }

  function highlightPlatform(activeIndex) {
    items.forEach((item, index) => item.classList.toggle('is-active', index === activeIndex));
  }

  gsap.set(device, shapeFor(0));
  gsap.set(screens, { autoAlpha: 0 });
  gsap.set(screens[0], { autoAlpha: 1 });

  if (compact) {
    return setupPlatformTabs(section, device, screens, items, shapeFor, highlightPlatform);
  }

  const switchTimes = [];
  const holdDuration = 0.7;

  const timeline = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    onUpdate: () => {
      const passedSwitches = switchTimes.filter((time) => timeline.time() >= time).length;
      highlightPlatform(passedSwitches);
    },
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: sceneLength(270),
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      onRefreshInit: () => gsap.set(device, shapeFor(0)),
    },
  });

  timeline.to({}, { duration: holdDuration });

  for (let index = 1; index < screens.length; index++) {
    const startTime = timeline.duration();

    timeline.fromTo(device, shapeGetters(index - 1), { ...shapeGetters(index), duration: 1, immediateRender: false }, startTime);
    timeline.to(device, { scale: 0.92, rotateY: index % 2 === 0 ? -10 : 10, duration: 0.5, ease: 'power2.in' }, startTime);
    timeline.to(device, { scale: 1, rotateY: 0, duration: 0.5, ease: 'power2.out' }, startTime + 0.5);
    timeline.to(screens[index - 1], { autoAlpha: 0, duration: 0.5, ease: 'sine.inOut' }, startTime + 0.15);
    timeline.to(screens[index], { autoAlpha: 1, duration: 0.5, ease: 'sine.inOut' }, startTime + 0.35);
    timeline.to({}, { duration: holdDuration });

    switchTimes.push(startTime + 0.5);
  }
}

function setupStack() {
  gsap.fromTo(
    '.orbit-plane',
    { rotateX: 62, scale: 0.72, opacity: 0.15 },
    {
      rotateX: 0,
      scale: 1,
      opacity: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.stack__stage',
        start: 'top 100%',
        end: 'center 55%',
        scrub: 1,
      },
    },
  );

  ScrollTrigger.create({
    trigger: '.stack',
    start: 'top bottom',
    end: 'bottom top',
    toggleClass: { targets: '.stack', className: 'is-visible' },
  });

  gsap.from('.orbit__item', {
    opacity: 0,
    duration: 1,
    ease: 'power2.out',
    stagger: { each: 0.035, from: 'random' },
    scrollTrigger: { trigger: '.stack__stage', start: 'top 70%' },
  });
}

function setupMarquee(lenis) {
  const rows = gsap.utils.toArray('.marquee__row');

  const tweens = rows.map((row, index) => {
    const contents = row.querySelectorAll('.marquee__content');
    const movesLeft = index % 2 === 0;

    return gsap.fromTo(
      contents,
      { xPercent: movesLeft ? 0 : -100 },
      { xPercent: movesLeft ? -100 : 0, duration: 70, ease: 'none', repeat: -1 },
    );
  });

  let speedBoost = 0;

  lenis.on('scroll', (instance) => {
    speedBoost = Math.min(Math.abs(instance.velocity) * 0.3, 7);
  });

  gsap.ticker.add(() => {
    speedBoost *= 0.93;
    tweens.forEach((tween) => tween.timeScale(1 + speedBoost));
  });
}

function setupProjectPreview() {
  if (!hasFinePointer) {
    return;
  }

  const preview = document.querySelector('.project-preview');
  const projects = document.querySelectorAll('.project');

  gsap.set(preview, { xPercent: -50, yPercent: -50, scale: 0.6 });
  const moveX = gsap.quickTo(preview, 'x', { duration: 0.7, ease: 'power3' });
  const moveY = gsap.quickTo(preview, 'y', { duration: 0.7, ease: 'power3' });
  const rotate = gsap.quickTo(preview, 'rotation', { duration: 0.9, ease: 'power3' });

  let lastPointerX = 0;

  window.addEventListener('pointermove', (event) => {
    const horizontalSpeed = event.clientX - lastPointerX;
    lastPointerX = event.clientX;
    moveX(event.clientX + 40);
    moveY(event.clientY);
    rotate(gsap.utils.clamp(-10, 10, horizontalSpeed * 0.6));
  });

  projects.forEach((project) => {
    const art = project.querySelector('.project__art');

    project.addEventListener('pointerenter', () => {
      preview.replaceChildren(art.cloneNode(true));
      gsap.to(preview, { opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out', overwrite: 'auto' });
    });

    project.addEventListener('pointerleave', () => {
      gsap.to(preview, { opacity: 0, scale: 0.6, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
    });
  });
}

function setupProcess() {
  gsap.fromTo(
    '.process__line-fill',
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.process__timeline',
        start: 'top 62%',
        end: 'bottom 62%',
        scrub: true,
      },
    },
  );

  gsap.utils.toArray('.process__step').forEach((step) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 62%',
      onEnter: () => step.classList.add('is-active'),
      onLeaveBack: () => step.classList.remove('is-active'),
    });

    gsap.from(step.children, {
      y: 50,
      opacity: 0,
      duration: 1.3,
      ease: 'expo.out',
      stagger: 0.1,
      scrollTrigger: { trigger: step, start: 'top 85%', once: true },
    });
  });
}

function setupCtaReveal() {
  gsap.fromTo(
    '.cta__title',
    { scale: 0.72, opacity: 0.1, filter: 'blur(14px)' },
    {
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)',
      ease: 'none',
      scrollTrigger: {
        trigger: '.cta',
        start: 'top 95%',
        end: 'center 60%',
        scrub: true,
      },
    },
  );

}

function setupCtaGlow() {
  if (!hasFinePointer) {
    return;
  }

  const section = document.querySelector('.cta');
  const glow = section.querySelector('.cta__glow');
  gsap.set(glow, { xPercent: -50, yPercent: -50, x: 0, y: 0 });
  const moveX = gsap.quickTo(glow, 'x', { duration: 1.4, ease: 'power3' });
  const moveY = gsap.quickTo(glow, 'y', { duration: 1.4, ease: 'power3' });

  section.addEventListener('pointermove', (event) => {
    const bounds = section.getBoundingClientRect();
    const offsetFromCenterX = event.clientX - (bounds.left + bounds.width / 2);
    const offsetFromCenterY = event.clientY - (bounds.top + bounds.height / 2);
    moveX(offsetFromCenterX * 0.6);
    moveY(offsetFromCenterY * 0.6);
  });
}

function setupTitleReveals() {
  gsap.utils.toArray('[data-lines]').forEach((title) => {
    gsap.from(title.querySelectorAll('.line > span'), {
      yPercent: 112,
      duration: 1.4,
      ease: 'expo.out',
      stagger: 0.1,
      scrollTrigger: { trigger: title, start: 'top 88%', once: true },
    });
  });

  gsap.utils.toArray('.eyebrow').forEach((eyebrow) => {
    if (eyebrow.closest('.hero')) {
      return;
    }
    gsap.from(eyebrow, {
      opacity: 0,
      x: -20,
      duration: 1.2,
      ease: 'expo.out',
      scrollTrigger: { trigger: eyebrow, start: 'top 90%', once: true },
    });
  });
}

function setupReveals() {
  gsap.utils.toArray('[data-reveal]').forEach((element) => {
    gsap.from(element, {
      y: 56,
      opacity: 0,
      duration: 1.4,
      ease: 'expo.out',
      scrollTrigger: { trigger: element, start: 'top 90%', once: true },
    });
  });
}

function setupMagneticButtons() {
  if (!hasFinePointer) {
    return;
  }

  document.querySelectorAll('[data-magnetic]').forEach((element) => {
    const strength = Number(element.dataset.magnetic) || 0.3;
    const moveX = gsap.quickTo(element, 'x', { duration: 0.6, ease: 'power3' });
    const moveY = gsap.quickTo(element, 'y', { duration: 0.6, ease: 'power3' });

    element.addEventListener('pointermove', (event) => {
      const bounds = element.getBoundingClientRect();
      const offsetX = event.clientX - (bounds.left + bounds.width / 2);
      const offsetY = event.clientY - (bounds.top + bounds.height / 2);
      moveX(offsetX * strength);
      moveY(offsetY * strength);
    });

    element.addEventListener('pointerleave', () => {
      moveX(0);
      moveY(0);
    });
  });
}

function setupSpotlights() {
  document.querySelectorAll('[data-spotlight], .service--cta').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      const bounds = element.getBoundingClientRect();
      element.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
      element.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
    });
  });
}

function setupCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach((button) => {
    const label = button.querySelector('span');
    const originalText = label.textContent;

    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        label.textContent = 'Скопировано';
      } catch {
        label.textContent = button.dataset.copy;
      }
      setTimeout(() => {
        label.textContent = originalText;
      }, 1800);
    });
  });
}

function setupAnimatedPage() {
  const sphere = createParticleSphere(document.querySelector('.hero__canvas'));
  const lenis = setupSmoothScroll();
  const heroIntro = createHeroIntro(sphere);
  const manifestoWords = splitIntoWords(document.querySelector('.manifesto__text'));

  setupMenu(lenis);
  setupAnchorLinks(lenis);

  gsap.matchMedia().add({ compact: COMPACT_QUERY, any: '(min-width: 0px)' }, (context) => {
    const { compact } = context.conditions;
    const cleanups = [
      setupHeroScroll(sphere, compact),
      setupManifesto(manifestoWords, compact),
      setupServices(compact),
      setupPlatforms(compact),
    ];
    setupStack();
    setupProcess();
    setupCtaReveal();
    setupTitleReveals();
    setupReveals();
    setupNav();
    setupPageProgress();
    sphere.start();

    return () => cleanups.forEach((cleanup) => cleanup && cleanup());
  });

  setupMarquee(lenis);
  setupCtaGlow();
  setupProjectPreview();
  setupMagneticButtons();
  setupSpotlights();

  document.fonts.ready.then(() => ScrollTrigger.refresh());
  playLoader(lenis, () => heroIntro.play());
}

function setupStaticPage() {
  const sphere = createParticleSphere(document.querySelector('.hero__canvas'));
  sphere.drawFrame();

  const screens = document.querySelectorAll('.screen');
  screens.forEach((screen, index) => {
    screen.style.visibility = index === 0 ? 'visible' : 'hidden';
    screen.style.opacity = index === 0 ? '1' : '0';
  });

  setupMenu(null);
  setupAnchorLinks(null);
  setupSpotlights();
}

function init() {
  const librariesLoaded = Boolean(window.gsap && window.ScrollTrigger && window.Lenis);
  if (!librariesLoaded) {
    document.documentElement.classList.remove('js');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  buildOrbits();
  buildMarquee();
  setupCopyButtons();

  if (prefersReducedMotion) {
    setupStaticPage();
    return;
  }

  setupAnimatedPage();
}

init();
