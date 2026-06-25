// Smoothly slides the paper-plane frame up/down within the "plane height" track,
// following the mouse's vertical position and stopping at the track ends.
// Eased like inertial / smooth scroll.
(function () {
  const track = document.querySelector(".plane-height");
  const slot = document.querySelector(".spline-slot");
  if (!track || !slot) return;

  // vertical travel = track height - plane height (design px; layout sizes are pre-scale)
  let RANGE = Math.max(0, track.clientHeight - slot.offsetHeight);
  const EASE = 0.07; // lower = smoother / floatier (smooth-scroll feel)

  let target = RANGE; // start at the bottom — the frame's authored position
  let cur = RANGE;

  window.addEventListener("resize", () => {
    RANGE = Math.max(0, track.clientHeight - slot.offsetHeight);
  });

  window.addEventListener("pointermove", (e) => {
    const ny = e.clientY / window.innerHeight;        // 0 at top of screen, 1 at bottom
    target = Math.min(RANGE, Math.max(0, ny * RANGE)); // mouse up -> plane up; clamped to the track
  });

  (function tick() {
    cur += (target - cur) * EASE;
    slot.style.transform = "translateY(" + cur.toFixed(2) + "px)";
    requestAnimationFrame(tick);
  })();
})();
