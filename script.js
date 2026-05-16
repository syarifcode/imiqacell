/* ================================================================
   AMIQA CELL & SERVICE ELEKTRONIK MAULANA
   script.js — Enterprise Interactions v4
   ================================================================ */

'use strict';

/* ── UTILITY ────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ================================================================
   1. INTRO LOADER
   ================================================================ */
(function initLoader() {
  const ldr = $('#ldr');
  if (!ldr) return;

  // Hide after 2.4s, then remove from DOM
  setTimeout(() => {
    ldr.classList.add('hide');
    setTimeout(() => ldr.remove(), 900);
  }, 2400);
})();

/* ================================================================
   2. THEME TOGGLE — Dark / Light with persistence
   ================================================================ */
(function initTheme() {
  const btn  = $('#tbtn');
  const body = document.body;
  const icon = btn?.querySelector('i');

  const apply = (isLight) => {
    body.classList.toggle('light', isLight);
    if (icon) icon.className = isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  };

  // Restore saved preference
  const saved = localStorage.getItem('amiqaTheme');
  if (saved === 'light') apply(true);

  btn?.addEventListener('click', () => {
    const next = !body.classList.contains('light');
    apply(next);
    localStorage.setItem('amiqaTheme', next ? 'light' : 'dark');
    // Trigger canvas color update
    window._canvasColorDirty = true;
  });
})();

/* ================================================================
   3. CANVAS — Particle Network + Mouse Glow
   ================================================================ */
(function initCanvas() {
  const cv  = $('#cvs');
  if (!cv) return;

  const ctx = cv.getContext('2d');
  let W, H, pts = [], animId;

  /* Resize */
  const resize = () => {
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
  };
  resize();

  /* Particle factory */
  const mkPt = () => ({
    x:    Math.random() * W,
    y:    Math.random() * H,
    vx:   (Math.random() - .5) * .33,
    vy:   (Math.random() - .5) * .33,
    r:    Math.random() * 1.4 + .3,
    life: Math.random(),
    max:  .6 + Math.random() * .4,
  });

  const init = () => {
    const count = Math.min(90, Math.floor(W * H / 13000));
    pts = Array.from({ length: count }, mkPt);
  };
  init();

  /* Mouse */
  let mx = W / 2, my = H / 2;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  /* Accent color from CSS var — updates on theme change */
  let cachedColor = null;
  const getColor = () => {
    if (!cachedColor || window._canvasColorDirty) {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--ac').trim();
      // Parse hex → "r,g,b"
      if (v.startsWith('#')) {
        const h = v.slice(1);
        const r = parseInt(h.slice(0,2), 16);
        const g = parseInt(h.slice(2,4), 16);
        const b = parseInt(h.slice(4,6), 16);
        cachedColor = `${r},${g},${b}`;
      } else {
        cachedColor = document.body.classList.contains('light') ? '0,111,204' : '0,200,255';
      }
      window._canvasColorDirty = false;
    }
    return cachedColor;
  };

  /* Draw loop */
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    const c = getColor();

    /* Connections */
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 130) {
          const a = (1 - d / 130) * .17;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${c},${a})`;
          ctx.lineWidth   = .55;
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }

      /* Particle dot */
      const p = pts[i];
      const pulse = .4 + .6 * Math.abs(Math.sin(p.life * Math.PI));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c},${pulse * .55})`;
      ctx.fill();

      /* Update */
      p.x += p.vx;
      p.y += p.vy;
      p.life += .003;
      if (p.life > p.max || p.x < -10 || p.x > W + 10 || p.y < -10 || p.y > H + 10) {
        Object.assign(p, mkPt(), { life: 0 });
      }
    }

    /* Mouse proximity glow */
    const grad = ctx.createRadialGradient(mx, my, 0, mx, my, 115);
    grad.addColorStop(0, `rgba(${c},.055)`);
    grad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.fillStyle = grad;
    ctx.arc(mx, my, 115, 0, Math.PI * 2);
    ctx.fill();

    animId = requestAnimationFrame(draw);
  };

  draw();

  /* Pause when tab hidden → save CPU */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      draw();
    }
  });

  /* Resize debounced */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); init(); }, 200);
  });
})();

/* ================================================================
   4. SCROLL REVEAL — staggered by sibling index
   ================================================================ */
(function initReveal() {
  const els = $$('.rv');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const idx = Array.from(el.parentElement.children).indexOf(el);
      el.style.transitionDelay = Math.min(idx * .07, .5) + 's';
      el.classList.add('in');
      obs.unobserve(el);
    });
  }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => obs.observe(el));
})();

/* ================================================================
   5. STATS COUNTER — animated number roll-up
   ================================================================ */
(function initCounter() {
  const els = $$('.sn[data-n]');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.n, 10);
      const suffix = el.dataset.suffix ?? '+';
      let   val    = 0;
      const inc    = target / 65;

      const tick = setInterval(() => {
        val = Math.min(val + inc, target);
        el.textContent = Math.floor(val) + suffix;
        if (val >= target) clearInterval(tick);
      }, 16);

      obs.unobserve(el);
    });
  }, { threshold: .6 });

  els.forEach(el => obs.observe(el));
})();

/* ================================================================
   6. TESTIMONIAL SLIDER — auto-play, swipe, keyboard
   ================================================================ */
(function initSlider() {
  const slides = $$('.tc');
  const dots   = $$('.dt');
  const prev   = $('#prev');
  const next   = $('#next');
  const track  = $('.tes-t');
  if (!slides.length) return;

  let cur = 0, timer;

  const show = (n) => {
    cur = (n + slides.length) % slides.length;
    slides.forEach(s => s.classList.remove('on'));
    dots.forEach(d => d.classList.remove('on'));
    slides[cur].classList.add('on');
    if (dots[cur]) dots[cur].classList.add('on');
  };

  const startAuto = () => {
    clearInterval(timer);
    timer = setInterval(() => show(cur + 1), 5200);
  };

  const go = (n) => { show(n); startAuto(); };

  // Expose for inline onclick on dots
  window.goSlide = go;

  prev?.addEventListener('click', () => go(cur - 1));
  next?.addEventListener('click', () => go(cur + 1));

  // Touch swipe
  if (track) {
    let x0 = 0;
    track.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 42) go(dx < 0 ? cur + 1 : cur - 1);
    }, { passive: true });
  }

  // Keyboard arrow support when focused area
  document.addEventListener('keydown', e => {
    const inView = track?.getBoundingClientRect();
    if (!inView) return;
    if (e.key === 'ArrowLeft')  go(cur - 1);
    if (e.key === 'ArrowRight') go(cur + 1);
  });

  show(0);
  startAuto();

  // Pause autoplay on hover
  track?.addEventListener('mouseenter', () => clearInterval(timer));
  track?.addEventListener('mouseleave', startAuto);
})();

/* ================================================================
   7. FAQ ACCORDION — single open at a time
   ================================================================ */
(function initFAQ() {
  $$('.fq').forEach(q => {
    q.addEventListener('click', () => {
      const item   = q.parentElement;
      const isOpen = item.classList.contains('op');
      // Close all
      $$('.fi.op').forEach(i => i.classList.remove('op'));
      // Toggle clicked
      if (!isOpen) item.classList.add('op');
    });
  });
})();

/* ================================================================
   8. REPAIR CARDS — 3-D perspective tilt on mouse move
   ================================================================ */
(function initTilt() {
  // Only on non-touch devices
  if (!window.matchMedia('(pointer: fine)').matches) return;

  $$('.rc').forEach(card => {
    card.addEventListener('mousemove', e => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const dx = (e.clientX - left - width  / 2) / (width  / 2);
      const dy = (e.clientY - top  - height / 2) / (height / 2);
      card.style.transform = `translateY(-8px) rotateX(${dy * -7}deg) rotateY(${dx * 7}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ================================================================
   9. SERVICE ITEMS — data-i attribute for CSS watermark numbers
   ================================================================ */
(function initServiceNumbers() {
  $$('.si').forEach((el, i) => {
    el.setAttribute('data-i', String(i + 1).padStart(2, '0'));
  });
})();

/* ================================================================
   10. FLOATING WA BUTTON — periodic pulse attention ring
   ================================================================ */
(function initWaPulse() {
  const wa = $('.waf');
  if (!wa) return;

  // Start after 5s, repeat every 7s
  setTimeout(() => {
    setInterval(() => {
      wa.classList.add('pulse');
      setTimeout(() => wa.classList.remove('pulse'), 750);
    }, 7000);
  }, 5000);
})();

/* ================================================================
   11. SMOOTH ANCHOR SCROLL — offset for any fixed header
   ================================================================ */
(function initAnchorScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 20;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ================================================================
   12. CURSOR GLOW — soft radial follow (desktop only)
   ================================================================ */
(function initCursorGlow() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const el = Object.assign(document.createElement('div'), {
    id: 'cursor-glow',
  });
  Object.assign(el.style, {
    position:      'fixed',
    width:         '320px',
    height:        '320px',
    borderRadius:  '50%',
    background:    'radial-gradient(circle, rgba(0,200,255,.042) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex:        '0',
    transform:     'translate(-50%, -50%)',
    transition:    'left .12s ease, top .12s ease',
    willChange:    'left, top',
  });
  document.body.appendChild(el);

  window.addEventListener('mousemove', ({ clientX, clientY }) => {
    el.style.left = clientX + 'px';
    el.style.top  = clientY + 'px';
  });
})();

/* ================================================================
   13. PARTNER MARQUEE — pause on hover
   ================================================================ */
(function initMarquee() {
  const inner = $('.min');
  if (!inner) return;
  inner.addEventListener('mouseenter', () => inner.style.animationPlayState = 'paused');
  inner.addEventListener('mouseleave', () => inner.style.animationPlayState = 'running');
})();

/* ================================================================
   14. ACTIVE SECTION HIGHLIGHT — adds class to body based on
       currently visible section (useful for future nav)
   ================================================================ */
(function initSectionTracker() {
  const sections = $$('section[id], header.hero');
  if (!sections.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.body.dataset.section = entry.target.id || 'hero';
      }
    });
  }, { threshold: .35 });

  sections.forEach(s => obs.observe(s));
})();

/* ================================================================
   15. SCROLL PROGRESS BAR — thin accent line at top of page
   ================================================================ */
(function initScrollProgress() {
  const bar = Object.assign(document.createElement('div'), { id: 'scroll-progress' });
  Object.assign(bar.style, {
    position:   'fixed',
    top:        '0',
    left:       '0',
    height:     '2px',
    width:      '0%',
    background: 'linear-gradient(90deg, #00c8ff, rgba(0,200,255,.4))',
    zIndex:     '999',
    transition: 'width .1s linear',
    pointerEvents: 'none',
  });
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const pct = (scrollTop / (scrollHeight - clientHeight)) * 100;
    bar.style.width = pct.toFixed(1) + '%';
  }, { passive: true });
})();

/* ================================================================
   16. BACK-TO-TOP BUTTON — appears after 40% scroll
   ================================================================ */
(function initBackToTop() {
  const btn = Object.assign(document.createElement('button'), {
    id:          'btt',
    innerHTML:   '<i class="fa-solid fa-chevron-up"></i>',
    title:       'Kembali ke atas',
    'aria-label':'Kembali ke atas',
  });
  Object.assign(btn.style, {
    position:     'fixed',
    bottom:       '82px',
    right:        '24px',
    zIndex:       '399',
    width:        '40px',
    height:       '40px',
    borderRadius: '50%',
    background:   'var(--sur)',
    border:       '1px solid var(--bdr)',
    color:        'var(--ac)',
    fontSize:     '.85rem',
    display:      'flex',
    alignItems:   'center',
    justifyContent:'center',
    cursor:       'pointer',
    boxShadow:    '0 4px 16px rgba(0,0,0,.3)',
    opacity:      '0',
    transform:    'translateY(12px)',
    transition:   'opacity .3s ease, transform .3s ease',
    pointerEvents:'none',
  });
  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const show = () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    const visible = pct > .35;
    btn.style.opacity      = visible ? '1' : '0';
    btn.style.transform    = visible ? 'translateY(0)' : 'translateY(12px)';
    btn.style.pointerEvents= visible ? 'auto' : 'none';
  };

  window.addEventListener('scroll', show, { passive: true });
})();

/* ================================================================
   17. PREFERS-REDUCED-MOTION — disable heavy animations
   ================================================================ */
(function initReducedMotion() {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const style = document.createElement('style');
  style.textContent = `
    *, *::before, *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .01ms !important;
    }
    .dcube, .orw, .chip, .sline { display: none !important; }
  `;
  document.head.appendChild(style);
})();

/* ================================================================
   18. SERVICE ITEMS — hover sound-like visual ripple
   ================================================================ */
(function initRipple() {
  $$('.si').forEach(item => {
    item.addEventListener('click', e => {
      const ripple = document.createElement('span');
      const rect   = item.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height);
      const x      = e.clientX - rect.left - size / 2;
      const y      = e.clientY - rect.top  - size / 2;

      Object.assign(ripple.style, {
        position:     'absolute',
        width:        size + 'px',
        height:       size + 'px',
        left:         x + 'px',
        top:          y + 'px',
        borderRadius: '50%',
        background:   'rgba(0,200,255,.14)',
        transform:    'scale(0)',
        animation:    'rippleAnim .55s ease-out forwards',
        pointerEvents:'none',
        zIndex:       '0',
      });

      // Ensure item is positioned relative
      if (getComputedStyle(item).position === 'static') {
        item.style.position = 'relative';
      }
      item.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Inject keyframe once
  const style = document.createElement('style');
  style.textContent = '@keyframes rippleAnim{to{transform:scale(2.5);opacity:0}}';
  document.head.appendChild(style);
})();
