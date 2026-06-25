// Parallax clouds over the blue band: clouds spawn off the right edge, drift
// linearly to the left and exit, then get recycled. The FAR layer moves slower
// (smaller, further) and the NEAR layer faster (bigger, closer) -> parallax.
// Each cloud uses mix-blend-mode: screen (set in CSS).
(function () {
  const band = document.querySelector(".bluerect");
  if (!band) return;

  const W = 1252, H = 154; // band size in design px (stage scales it) — band shortened

  // Adjusted Figma sizes (w, h) — raw textures are sized to these.
  const SIZE = {
    "near-1": [1134, 906], "near-2": [1076, 730], "near-3": [1117, 835], "near-4": [1111, 639],
    "far-1": [407, 174], "far-2": [610, 293], "far-3": [506, 177],
    "far-4": [292, 232], "far-5": [522, 304], "far-6": [542, 290],
  };
  const FAR = {
    pool: ["far-1", "far-2", "far-3", "far-4", "far-5", "far-6"],
    minDur: 19000, maxDur: 30000, minGap: 4500, maxGap: 8500,   // wider gaps between deploys
  };
  const NEAR = {
    pool: ["near-1", "near-2", "near-3", "near-4"],
    minDur: 9000, maxDur: 15000, minGap: 4000, maxGap: 7500,    // wider gaps between deploys
  };

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[(Math.random() * a.length) | 0];

  const far = document.createElement("div"); far.className = "cloud-layer cloud-far";
  const near = document.createElement("div"); near.className = "cloud-layer cloud-near";
  band.appendChild(far); band.appendChild(near);

  function spawn(layer, cfg, progress) {
    const name = pick(cfg.pool);
    const [w, h] = SIZE[name];                 // adjusted Figma size
    const img = new Image();
    img.src = "assets/clouds/" + name + ".png";
    img.className = "cloud";
    img.style.width = w + "px";
    img.style.height = h + "px";
    img.style.top = ((H - h) / 2 + rand(-H * 0.45, H * 0.45)) + "px"; // centred in band + jitter
    layer.appendChild(img);

    const dur = rand(cfg.minDur, cfg.maxDur);
    const anim = img.animate(
      [{ transform: `translateX(${W}px)` }, { transform: `translateX(${-w}px)` }],
      { duration: dur, easing: "linear" }
    );
    if (progress) anim.currentTime = dur * progress; // pre-place some clouds mid-flight
    anim.onfinish = () => img.remove();
  }

  function loop(layer, cfg) {
    spawn(layer, cfg);
    setTimeout(() => loop(layer, cfg), rand(cfg.minGap, cfg.maxGap));
  }

  // pre-populate so the sky isn't empty on load
  for (const p of [0.25, 0.6, 0.85]) spawn(far, FAR, p);
  for (const p of [0.4, 0.8]) spawn(near, NEAR, p);

  loop(far, FAR);
  loop(near, NEAR);
})();
