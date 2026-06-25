// Magnetic pills in the agent box: when the cursor gets near, the pill drifts
// toward it (eased); on hover it lifts a little (the CSS handles the opacity->100%).
(function () {
  const pills = Array.from(document.querySelectorAll(".agpill"));
  if (!pills.length) return;

  const MAG_RADIUS = 150;    // px proximity at which the pull begins
  const MAG_STRENGTH = 0.34; // fraction of the cursor distance followed
  const BOUNCE = 7;          // hover lift (design px)
  const EASE = 0.18;

  const st = pills.map((p) => ({ tx: 0, ty: 0, hover: false, rot: parseFloat(p.dataset.rot) || 0 }));
  pills.forEach((p, i) => {
    p.addEventListener("mouseenter", () => (st[i].hover = true));
    p.addEventListener("mouseleave", () => (st[i].hover = false));
  });

  let mx = -1e5, my = -1e5;
  window.addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; });

  function tick() {
    const s = window.innerWidth / 1600 || 1;   // page scale (pills live inside a scaled box)
    pills.forEach((p, i) => {
      const r = p.getBoundingClientRect();
      // rest centre = current centre minus the offset we've already applied (screen px)
      const cx = r.left + r.width / 2 - st[i].tx;
      const cy = r.top + r.height / 2 - st[i].ty;
      const dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy);

      let tx = 0, ty = 0;
      if (d < MAG_RADIUS) {
        const f = (1 - d / MAG_RADIUS) * MAG_STRENGTH;
        tx = dx * f; ty = dy * f;            // pull toward cursor (screen px)
      }
      if (st[i].hover) ty -= BOUNCE * s;      // lift on hover (screen px)

      st[i].tx += (tx - st[i].tx) * EASE;
      st[i].ty += (ty - st[i].ty) * EASE;
      // convert screen px -> the pill's local (unscaled) space; keep its base rotation
      p.style.transform = `translate(${st[i].tx / s}px, ${st[i].ty / s}px) rotate(${st[i].rot}deg)`;
    });
    requestAnimationFrame(tick);
  }
  tick();
})();
