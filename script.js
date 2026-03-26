/* =====================================================
   FABIO CAPACHO · script.js v3
   Optimizado: canvas liviano, sin física de partículas
   ===================================================== */

'use strict';

// ─── CANVAS: 2 líneas de mercado suaves, sin nodos físicos ─
(function initCanvas() {
  const canvas = document.getElementById('bg');
  const ctx    = canvas.getContext('2d');
  let W, H, raf;

  // Solo 3 líneas de chart — mucho más liviano
  const lines = [
    { amp: 0.12, freq: 0.0018, speed: 0.0008, phase: 0,    alpha: 0.18, hue: 162 },
    { amp: 0.08, freq: 0.0028, speed: 0.0006, phase: 2.1,  alpha: 0.10, hue: 195 },
    { amp: 0.06, freq: 0.0012, speed: 0.0004, phase: 4.3,  alpha: 0.07, hue: 270 },
  ];

  // Etiquetas SMC flotantes — precalculadas, no random cada frame
  const labels = [
    { txt:'BOS',   rx:0.12, ry:0.38, dy:0, spd:0.0007, color:'#00e89e' },
    { txt:'FVG',   rx:0.48, ry:0.62, dy:0, spd:0.0005, color:'#00c8ef' },
    { txt:'OB',    rx:0.72, ry:0.28, dy:0, spd:0.0009, color:'#7c5cfc' },
    { txt:'CHoCH', rx:0.32, ry:0.72, dy:0, spd:0.0006, color:'#00e89e' },
    { txt:'TP',    rx:0.84, ry:0.44, dy:0, spd:0.0008, color:'#ffd700' },
  ];

  let t = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function getY(line, x) {
    return H * 0.5
      + Math.sin(x * line.freq + line.phase + t * line.speed * 1000) * H * line.amp
      + Math.sin(x * line.freq * 2.3 + line.phase) * H * line.amp * 0.35;
  }

  function drawLine(l) {
    ctx.beginPath();
    for (let x = 0; x <= W; x += 8) {
      const y = getY(l, x);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    const g = ctx.createLinearGradient(0, 0, W, 0);
    const c = `hsla(${l.hue},90%,62%,`;
    g.addColorStop(0,   c+'0)');
    g.addColorStop(0.15, c+l.alpha+')');
    g.addColorStop(0.85, c+l.alpha+')');
    g.addColorStop(1,   c+'0)');
    ctx.strokeStyle = g;
    ctx.lineWidth   = 1.2;
    ctx.shadowColor = `hsl(${l.hue},90%,60%)`;
    ctx.shadowBlur  = 6;
    ctx.stroke();
    ctx.shadowBlur  = 0;

    // Fill
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    const fg = ctx.createLinearGradient(0, H * 0.3, 0, H);
    fg.addColorStop(0, `hsla(${l.hue},90%,60%,0.035)`);
    fg.addColorStop(1, 'transparent');
    ctx.fillStyle = fg; ctx.fill();
  }

  function drawLabels() {
    ctx.font = '600 9px "Space Mono", monospace';
    labels.forEach((lb, i) => {
      lb.dy = Math.sin(t * lb.spd * 1000 + i) * 10;
      const x = lb.rx * W;
      const y = lb.ry * H + lb.dy;
      const a = 0.1 + 0.05 * Math.sin(t * 0.0009 * 1000 + i);
      ctx.fillStyle = lb.color + Math.floor(a * 255).toString(16).padStart(2,'0');
      ctx.fillText(lb.txt, x, y);
    });
  }

  function frame(ts) {
    t = ts;
    ctx.clearRect(0, 0, W, H);

    // Grid estático sutil — dibujado una vez cada 3 frames
    if (Math.floor(ts / 16) % 3 === 0) {
      ctx.strokeStyle = 'rgba(0,232,158,.022)';
      ctx.lineWidth   = 1;
      for (let x = 0; x < W; x += 70) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 70) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    }

    lines.forEach(drawLine);
    drawLabels();

    raf = requestAnimationFrame(frame);
  }

  // Reducir FPS en móviles y tabs no visibles
  let lastFrame = 0;
  const TARGET_FPS = window.innerWidth < 600 ? 30 : 50;
  const FRAME_MS   = 1000 / TARGET_FPS;

  function throttledFrame(ts) {
    raf = requestAnimationFrame(throttledFrame);
    if (ts - lastFrame < FRAME_MS) return;
    lastFrame = ts;
    t = ts;
    ctx.clearRect(0, 0, W, H);
    lines.forEach(drawLine);
    drawLabels();
  }

  // Pausar cuando el tab no está visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else raf = requestAnimationFrame(throttledFrame);
  });

  window.addEventListener('resize', resize, { passive: true });
  resize();
  raf = requestAnimationFrame(throttledFrame);
})();


// ─── TYPING ──────────────────────────────────────────────────
(function initTyping() {
  const el = document.getElementById('typed');
  if (!el) return;

  const roles = [
    'Algorithmic Trader',
    'Dev · FJ2 Algorítmico',
    'SMC Methodology',
    'AI Engineer',
    'Índices Sintéticos',
  ];

  let ri = 0, ci = 0, del = false;

  function type() {
    const w = roles[ri];
    del ? ci-- : ci++;
    el.textContent = w.slice(0, ci);

    if (!del && ci === w.length) { del = true; setTimeout(type, 2000); return; }
    if (del && ci === 0)         { del = false; ri = (ri + 1) % roles.length; }

    setTimeout(type, del ? 35 : 75);
  }
  setTimeout(type, 700);
})();


// ─── RIPPLE EN CLICK ─────────────────────────────────────────
(function initRipple() {
  const style = document.createElement('style');
  style.textContent = `@keyframes ripple{to{transform:scale(2.5);opacity:0}}`;
  document.head.appendChild(style);

  document.querySelectorAll('.lk').forEach(lk => {
    lk.addEventListener('click', e => {
      const r    = document.createElement('span');
      const rect = lk.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      Object.assign(r.style, {
        position: 'absolute',
        width: size + 'px', height: size + 'px',
        left: (e.clientX - rect.left - size / 2) + 'px',
        top:  (e.clientY - rect.top  - size / 2) + 'px',
        background: 'rgba(255,255,255,.06)',
        borderRadius: '50%',
        transform: 'scale(0)',
        animation: 'ripple .45s ease-out forwards',
        pointerEvents: 'none',
      });
      lk.appendChild(r);
      r.addEventListener('animationend', () => r.remove());
    });
  });
})();


// ─── FADE IN PÁGINA ──────────────────────────────────────────
(function () {
  document.body.style.cssText += 'opacity:0;transition:opacity .4s ease';
  const show = () => requestAnimationFrame(() => document.body.style.opacity = '1');
  if (document.readyState === 'complete') show();
  else window.addEventListener('load', show);
})();