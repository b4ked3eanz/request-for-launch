// Postcard: hover -> subtle 3D tilt (eased), click -> flip front<->back (eased).
(function () {
  const card = document.getElementById("postcard");
  if (!card) return;
  const inner = card.querySelector(".postcard-inner");

  const MAX_TILT = 20;     // deg
  let tX = 0, tY = 0, tgX = 0, tgY = 0;   // tilt current / target
  let flip = 0, flipTarget = 0;           // flip current / target (deg)

  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    tgY = nx * MAX_TILT;
    tgX = -ny * MAX_TILT;
  });
  card.addEventListener("pointerleave", () => { tgX = 0; tgY = 0; });
  card.addEventListener("click", () => { flipTarget = flipTarget ? 0 : 180; });
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flipTarget = flipTarget ? 0 : 180; }
  });

  (function tick() {
    tX += (tgX - tX) * 0.12;
    tY += (tgY - tY) * 0.12;
    flip += (flipTarget - flip) * 0.1;
    inner.style.transform = `rotateX(${tX}deg) rotateY(${tY + flip}deg)`;
    requestAnimationFrame(tick);
  })();
})();
