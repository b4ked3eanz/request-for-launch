// Footer CTA — the red handset lifts off its cradle and *becomes* the cursor while the
// pointer is inside the CTA box. Heavy, weighted trailing follow (lags behind the cursor,
// no springy overshoot) with a subtle bank; eases home to the dial when you leave the box.
(function () {
  const stage   = document.getElementById("ftstage");
  const handset = document.getElementById("fthandset");
  if (!stage || !handset) return;

  // Everything below is in 1600-wide DESIGN coordinates (the stage is scaled by innerWidth/1600).
  const CTA   = { x: 1409, y: 290, w: 191, h: 246 };  // activation zone — cursor must reach here first
  const BOUND = { x: 826,  y: 77,  w: 774, h: 678 };  // how far the phone may travel once active
  const DOCK  = { x: 1508 + 51, y: 333 + 85 };        // handset centre when cradled (102x170 image)
  const PAD   = 8;                                      // keep the grab point just inside the travel box

  let x = DOCK.x, y = DOCK.y;     // current handset centre
  let px = x, py = y;            // previous centre (for tilt-from-velocity)
  let tx = DOCK.x, ty = DOCK.y;  // target centre
  let rot = 0;                   // current tilt (deg)
  let active = false;

  function release() {
    if (active) { active = false; handset.classList.remove("lift"); stage.classList.remove("grab"); }
    tx = DOCK.x; ty = DOCK.y;     // spring back to the dial
  }

  addEventListener("pointermove", (e) => {
    const r = stage.getBoundingClientRect();
    const s = r.width / 1600;
    const lx = (e.clientX - r.left) / s;
    const ly = (e.clientY - r.top)  / s;
    const inCta   = lx >= CTA.x   && lx <= CTA.x + CTA.w     && ly >= CTA.y   && ly <= CTA.y + CTA.h;
    const inBound = lx >= BOUND.x && lx <= BOUND.x + BOUND.w && ly >= BOUND.y && ly <= BOUND.y + BOUND.h;
    // must first touch the CTA to pick the handset up...
    if (!active && inCta) { active = true; handset.classList.add("lift"); stage.classList.add("grab"); }
    // ...then it follows anywhere inside the bigger travel box, releasing once you leave it
    if (active && !inBound) { release(); return; }
    if (active) {
      tx = Math.max(BOUND.x + PAD, Math.min(BOUND.x + BOUND.w - PAD, lx));
      ty = Math.max(BOUND.y + PAD, Math.min(BOUND.y + BOUND.h - PAD, ly));
    }
  }, { passive: true });

  // bail out cleanly if the pointer leaves the window mid-grab
  document.addEventListener("pointerleave", release);
  addEventListener("blur", release);

  const LAG = 0.09;   // heavy trailing follow — lower = more weight / more lag, no overshoot
  (function tick() {
    // exponential follow toward the target: smooth, weighty, never springs past it
    x += (tx - x) * LAG;
    y += (ty - y) * LAG;

    // subtle bank, taken from how fast it's actually moving (not from a bouncy velocity)
    const dx = x - px, dy = y - py;
    px = x; py = y;
    const want = Math.max(-13, Math.min(13, dx * 1.0 + dy * 0.25));
    rot += (want - rot) * 0.10;

    handset.style.transform =
      `translate(${(x - DOCK.x).toFixed(2)}px, ${(y - DOCK.y).toFixed(2)}px) rotate(${rot.toFixed(2)}deg)`;
    requestAnimationFrame(tick);
  })();
})();
