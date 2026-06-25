// Released Work — over the carousel "screenview", the pointer becomes a "PLAY" tag that
// lags slightly behind the cursor (a bit heavy), no tilt, no overshoot — just a smooth follow.
(function () {
  const screen = document.getElementById("rwscreen");
  if (!screen) return;

  const el = document.createElement("div");
  el.className = "rw-cursor";
  el.innerHTML = '<img src="assets/work/play-cursor.png" alt="">';
  document.body.appendChild(el);

  let mx = innerWidth / 2, my = innerHeight / 2;   // pointer target
  let cx = mx, cy = my, sc = 0.6, scT = 0.6;       // tag position + scale

  addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  screen.addEventListener("pointerenter", () => { scT = 1; el.classList.add("on"); });
  screen.addEventListener("pointerleave", () => { scT = 0.6; el.classList.remove("on"); });

  const LAG = 0.16;   // lower = heavier / more lag (no overshoot)
  (function tick() {
    cx += (mx - cx) * LAG;
    cy += (my - cy) * LAG;
    sc += (scT - sc) * 0.2;
    el.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px) scale(${sc.toFixed(3)})`;
    requestAnimationFrame(tick);
  })();
})();
