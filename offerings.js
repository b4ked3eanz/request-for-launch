// Offerings — pinned section, scroll split into 4 equal regions (base + 3 row expansions).
// Crossing a region boundary SNAPS to that state (cubic-bezier(0,0.98,0.05,1), 1s): the active
// row nudges outward, its sub-text decodes in (which lifts the icon+heading via column-centring),
// and the rows below push down. Same stepped feel as Released Work.
(function () {
  const sec = document.getElementById("offer");
  const stage = document.getElementById("ofstage");
  if (!sec || !stage) return;

  const rows = Array.from(stage.querySelectorAll(".of-row"));
  const subs = rows.map((r) => r.querySelector(".of-sub"));
  const cta = stage.querySelector(".of-cta");
  subs.forEach((s) => (s.dataset.full = s.textContent));

  // the CTA arrow always points at the agent card (fixed, bottom-right)
  const arrow = document.getElementById("ofarrow");
  const agent = document.querySelector(".agent");
  function aimArrow() {
    if (!arrow || !agent) return;
    const a = arrow.getBoundingClientRect(), g = agent.getBoundingClientRect();
    const ang = Math.atan2((g.top + g.height / 2) - (a.top + a.height / 2),
                           (g.left + g.width / 2) - (a.left + a.width / 2));   // arrow art points right (0°)
    arrow.style.transform = `rotate(${(ang * 180 / Math.PI).toFixed(1)}deg)`;
  }

  const REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const N = 4;                 // states: 0 base, 1/2/3 expand rows 0/1/2
  const SHIFT = 96;            // active-row horizontal nudge (design px)
  const PUSH = 24;             // per-expansion push-down
  const DIR = [-1, +1, -1];    // motion left, cinematic right, founder left
  const DESIGN_H = 1166;       // tallest (fully expanded) design height -> scale to fit

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth01 = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

  // --- fit: centre + scale the stage so the whole design fits the viewport ---
  function fit() {
    const iw = window.innerWidth, ih = window.innerHeight;
    const s = Math.min(iw / 1600, ih / DESIGN_H);
    const x = (iw - 1600 * s) / 2, y = (ih - DESIGN_H * s) / 2;
    stage.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${s})`;
  }

  function render(f) {
    let acc = 0;
    rows.forEach((row, i) => {
      const e = clamp(f - i, 0, 1);                 // 0 collapsed -> 1 expanded
      const act = clamp(1 - Math.abs(f - (i + 1)), 0, 1);  // spotlight: peaks on its own step
      row.style.transform = `translate(${(DIR[i] * SHIFT * act).toFixed(1)}px, ${(PUSH * acc).toFixed(1)}px)`;

      const sub = subs[i];
      sub.style.maxHeight = (e * 60).toFixed(1) + "px";
      sub.style.opacity = (smooth01((e - 0.15) / 0.55) * 0.7).toFixed(3);   // Figma: sub-text at 70%
      sub.style.marginTop = (e * 8).toFixed(1) + "px";
      const open = e > 0.5;
      if (open !== row._open) { row._open = open; if (open) scramble(sub, sub.dataset.full); }

      acc += e;
    });
    if (cta) cta.style.transform = `translateY(${(PUSH * acc).toFixed(1)}px)`;
    aimArrow();
  }

  function progress() {
    const range = sec.offsetHeight - window.innerHeight;
    if (range <= 0) return 0;
    return clamp((window.scrollY - sec.offsetTop) / range, 0, 1);
  }
  const stepFromScroll = () => Math.min(N - 1, Math.floor(progress() * N));

  // --- snap tween: cubic-bezier(0, 0.98, 0.05, 1), 1s ---
  const SNAP_MS = 1000;
  function cubicBezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (t) => ((ax * t + bx) * t + cx) * t, sy = (t) => ((ay * t + by) * t + cy) * t;
    const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => { let t = x; for (let i = 0; i < 8; i++) { const e = sx(t) - x, d = dx(t); if (Math.abs(e) < 1e-6 || Math.abs(d) < 1e-6) break; t -= e / d; } return sy(clamp(t, 0, 1)); };
  }
  const ease = cubicBezier(0, 0.98, 0.05, 1);
  let cur = 0, from = 0, to = 0, t0 = 0, raf = 0;

  function tick(now) {
    const t = Math.min(1, (now - t0) / SNAP_MS);
    cur = from + (to - from) * ease(t);
    render(cur);
    if (t < 1) raf = requestAnimationFrame(tick);
    else { cur = to; render(cur); raf = 0; }
  }
  function snapTo(step) { from = cur; to = step; t0 = performance.now(); if (!raf) raf = requestAnimationFrame(tick); }

  function onScroll() {
    const step = stepFromScroll();
    if (REDUCE) { cur = from = to = step; render(cur); aimArrow(); return; }
    if (step !== to) snapTo(step);
    aimArrow();   // keep the arrow aimed while the section scrolls in/out (even between snaps)
  }

  // --- code-forming (scramble) text ---
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%@&";
  function scramble(el, text) {
    if (REDUCE) { el.textContent = text; return; }
    if (el._raf) cancelAnimationFrame(el._raf);
    const start = performance.now(), DUR = 620;
    function step(now) {
      const t = Math.min(1, (now - start) / DUR), reveal = t * text.length;
      let out = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (i < reveal - 0.5 || ch === " ") out += ch;
        else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (t < 1) el._raf = requestAnimationFrame(step);
      else { el.textContent = text; el._raf = 0; }
    }
    el._raf = requestAnimationFrame(step);
  }

  fit();
  onScroll();
  window.addEventListener("resize", () => { fit(); onScroll(); });
  window.addEventListener("scroll", onScroll, { passive: true });
})();
