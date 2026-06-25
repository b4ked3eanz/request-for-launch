// Section 3 — Released Work.
// The section pins (sticky); scroll is split into N equal regions (one per project). Crossing a
// region boundary SNAPS to that project (short ease-out tween) — no scrubbing in between.
//  - left list: the orange selection line glides under the focused project; the row highlights.
//  - carousel: the focused card is big/bright/centered; neighbours shrink, dim and stack above/below.
//  - info pod: the project name re-decodes (scramble) on each step.
(function () {
  const sec = document.getElementById("rwork");
  const stage = document.getElementById("rwstage");
  if (!sec || !stage) return;

  const items = Array.from(document.querySelectorAll(".rw-item"));
  const cards = Array.from(document.querySelectorAll(".rw-card"));
  const line = document.getElementById("rwline");
  const titleEl = document.getElementById("rwtitle");
  const iconEl = document.getElementById("rwicon");
  const N = cards.length;

  const NAMES = ["ABACOR", "LANESURF", "MOCHATRADE", "DRACONIC", "ION"];
  const ICONS = ["#F26B1F", "#3A3A3A", "#7A4DD8", "#2B5CFF", "#1FA67A"]; // per-project pod icon tint

  const REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // carousel geometry (design px), measured from the screenview centre
  const Hb = 170, Hs = 82, G = 30;           // big half-height, small half-height, gap
  const STEP = Hs + G + Hs;                   // small-to-small centre distance (194)
  const FIRST = Hb + G + Hs;                   // centre -> first neighbour centre (282)
  const SMALL = 292 / 604;                     // small/big scale (~0.483)

  function centreY(d) {
    const a = Math.abs(d), s = Math.sign(d);
    const y = a <= 1 ? a * FIRST : FIRST + (a - 1) * STEP;
    return s * y;
  }

  const smooth01 = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));   // smoothstep

  function render(f) {
    const sel = Math.max(0, Math.min(N - 1, Math.round(f)));

    cards.forEach((c, i) => {
      const d = i - f, a = Math.abs(d);
      const e = smooth01(Math.min(a, 1));                       // 0 centred -> 1 once a full slot away
      const sc = SMALL + (1 - SMALL) * (1 - e);                 // eased big<->small
      // bright while it sits in the screen-view, then drops to 50% as it leaves
      let op = 0.5 + 0.5 * (1 - smooth01((Math.min(a, 1) - 0.12) / 0.73));
      if (a > 2.4) op *= Math.max(0, 1 - (a - 2.4) / 0.8);      // fade the far ones out
      c.style.transform = `translateY(${centreY(d).toFixed(1)}px) scale(${sc.toFixed(4)})`;
      c.style.opacity = op.toFixed(3);
      c.style.zIndex = String(100 - Math.round(a * 10));
      c.style.visibility = a > 3.3 ? "hidden" : "visible";
    });

    // orange line + selection snap with the focus; row pitch is 21px
    line.style.top = (f * 21 + 18).toFixed(1) + "px";
    items.forEach((it, i) => it.classList.toggle("sel", i === sel));
  }

  // pod: decode the name + retint the icon when the project changes
  function setProject(i) {
    if (i === setProject._i) return;
    setProject._i = i;
    scramble(titleEl, NAMES[i]);
    iconEl.style.background = ICONS[i];
  }
  setProject._i = -1;

  function progress() {
    const range = sec.offsetHeight - window.innerHeight;
    if (range <= 0) return 0;
    return Math.max(0, Math.min(1, (window.scrollY - sec.offsetTop) / range));
  }
  // scroll is split into N equal regions, one per project. The displayed step only changes when
  // you cross a region boundary — no scrubbing in between.
  function stepFromScroll() { return Math.min(N - 1, Math.floor(progress() * N)); }

  // On a boundary cross we SNAP (no continuous follow of the scroll).
  const SNAP_MS = 1000;                                 // snap duration
  // exact CSS cubic-bezier(0, 0.98, 0.05, 1): fast launch, long gentle settle
  function cubicBezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (t) => ((ax * t + bx) * t + cx) * t;
    const sy = (t) => ((ay * t + by) * t + cy) * t;
    const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => {
      let t = x;
      for (let i = 0; i < 8; i++) {                     // Newton-Raphson on x
        const e = sx(t) - x, d = dx(t);
        if (Math.abs(e) < 1e-6) break;
        if (Math.abs(d) < 1e-6) break;
        t -= e / d;
      }
      t = Math.max(0, Math.min(1, t));
      return sy(t);
    };
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
  function snapTo(step) {
    from = cur; to = step; t0 = performance.now();
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function onScroll() {
    const step = stepFromScroll();
    setProject(step);                                   // name decodes straight to the destination
    if (REDUCE) { cur = from = to = step; render(cur); return; }
    if (step !== to) snapTo(step);
  }

  // --- code-forming (scramble) text effect ---
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%@&";
  function scramble(el, text) {
    if (REDUCE) { el.textContent = text; return; }   // no decode flicker for reduced motion
    if (el._raf) cancelAnimationFrame(el._raf);
    const start = performance.now(), DUR = 520;
    function step(now) {
      const t = Math.min(1, (now - start) / DUR);
      const reveal = t * text.length;
      let out = "";
      for (let i = 0; i < text.length; i++) {
        if (i < reveal - 0.5) out += text[i];
        else if (text[i] === " ") out += " ";
        else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (t < 1) el._raf = requestAnimationFrame(step);
      else { el.textContent = text; el._raf = 0; }
    }
    el._raf = requestAnimationFrame(step);
  }

  // prev / next jump to the matching scroll position
  function jump(dir) {
    const ni = Math.max(0, Math.min(N - 1, to + dir));
    const range = sec.offsetHeight - window.innerHeight;
    // land in the middle of project ni's scroll region
    window.scrollTo({ top: sec.offsetTop + ((ni + 0.5) / N) * range, behavior: "smooth" });
  }
  const prev = document.querySelector(".rw-prev"), next = document.querySelector(".rw-next");
  if (prev) prev.addEventListener("click", () => jump(-1));
  if (next) next.addEventListener("click", () => jump(1));

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
})();
