// Released Work — over the carousel "screenview", the pointer becomes a "PLAY" tag that
// follows with spring weight (damping + inertia) and swings with velocity, like a real object.
(function () {
  const screen = document.getElementById("rwscreen");
  if (!screen) return;

  const el = document.createElement("div");
  el.className = "rw-cursor";
  el.innerHTML = '<img src="assets/work/play-cursor.png" alt="">';
  document.body.appendChild(el);

  let mx = innerWidth / 2, my = innerHeight / 2;   // pointer target
  let cx = mx, cy = my, vx = 0, vy = 0;            // tag position + velocity
  let rot = 0, sc = 0.4, scT = 0.4, on = false;

  addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  screen.addEventListener("pointerenter", () => { on = true; scT = 1; el.classList.add("on"); });
  screen.addEventListener("pointerleave", () => { on = false; scT = 0.4; el.classList.remove("on"); });

  const K = 0.13, DAMP = 0.72;   // spring stiffness / damping -> weighty, settles
  (function tick() {
    // critically-ish damped spring toward the pointer
    vx = (vx + (mx - cx) * K) * DAMP;
    vy = (vy + (my - cy) * K) * DAMP;
    cx += vx; cy += vy;
    // weight: the tag tilts into its motion and swings, then eases back to level
    const tilt = Math.max(-24, Math.min(24, vx * 1.1 - vy * 0.25));
    rot += (tilt - rot) * 0.16;
    sc += (scT - sc) * 0.2;
    el.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
    requestAnimationFrame(tick);
  })();
})();
