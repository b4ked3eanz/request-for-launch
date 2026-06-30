// Footer CTA — the red handset lifts off its cradle and *becomes* the cursor while the
// pointer is inside the CTA box. Heavy, weighted trailing follow (lags behind the cursor,
// no springy overshoot) with a subtle bank; eases home to the dial when you leave the box.
(function () {
  const stage   = document.getElementById("ftstage");
  const handset = document.getElementById("fthandset");
  if (!stage || !handset) return;

  // Everything below is in 1600-wide DESIGN coordinates (the stage is scaled by innerWidth/1600).
  const BOX  = { x: 1261, y: 184, w: 339, h: 453 };   // the "cta" frame — trigger + roam bounds
  const DOCK = { x: 1508 + 51, y: 333 + 85 };         // handset centre when cradled (102x170 image)
  const PAD  = 8;                                       // keep the grab point just inside the box

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
    const inside = lx >= BOX.x && lx <= BOX.x + BOX.w && ly >= BOX.y && ly <= BOX.y + BOX.h;
    if (inside) {
      if (!active) { active = true; handset.classList.add("lift"); stage.classList.add("grab"); }
      tx = Math.max(BOX.x + PAD, Math.min(BOX.x + BOX.w - PAD, lx));
      ty = Math.max(BOX.y + PAD, Math.min(BOX.y + BOX.h - PAD, ly));
    } else {
      release();
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
