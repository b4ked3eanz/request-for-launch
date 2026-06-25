// YC JIT — builds the company cards and wires the interactive bits:
//  - company-size slider (draggable), pagination (active page), view-report hover is CSS.
(function () {
  const list = document.getElementById("yclist");
  if (!list) return;

  // --- company cards: headings from Figma, the rest randomized ---
  const NAMES = ["LANESURF", "ABACOR", "MOCHATRADE", "ION", "DRACONIC"];
  const BATCHES = ["W25", "S25", "F25", "S26", "P26"];
  const CATS = ["LOGISTICS", "SAAS", "AI / ML", "FINTECH", "HEALTH", "CONSUMER", "CLIMATE", "DEVELOPER TOOLS"];
  const LABELS = ["POSITIONING SCORE", "NARRATIVE SCORE", "EXECUTION SCORE"];
  const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (a) => a[(Math.random() * a.length) | 0];
  const scoreColor = (v) => (v >= 75 ? "#00a351" : v >= 55 ? "#7fcd00" : "#f0b22d");

  const LOGO_COLORS = ["#7A4DD8", "#2B5CFF", "#1FA67A", "#F26B1F", "#E0245E", "#0EA5A5", "#212121"];
  NAMES.forEach((name, i) => {
    const batch = pick(BATCHES), cat = pick(CATS);
    const scoreHTML = LABELS.map((l) => {
      const n = rand(28, 96), c = scoreColor(n), w = Math.max(8, Math.round(n / 100 * 80));
      return `<div class="yc-score"><div class="yc-score-l">${l}</div>` +
        `<div class="yc-score-row"><span class="yc-score-n" style="color:${c}">${n}</span>` +
        `<div class="yc-score-bar"><i style="width:${w}px;background:${c}"></i></div></div></div>`;
    }).join("");
    // LANESURF keeps its logo; the rest get a randomized coloured mark with the initial
    const logo = i === 0
      ? `<div class="yc-logo"><img src="assets/yc/logo.png" alt=""></div>`
      : `<div class="yc-logo yc-logo-gen" style="background:${pick(LOGO_COLORS)}">${name[0]}</div>`;
    const card = document.createElement("div");
    card.className = "yc-card";
    card.innerHTML =
      logo +
      `<h3 class="yc-name">${name}</h3>` +
      `<div class="yc-tags"><span class="yc-ctag yc-ctag-batch">${batch}</span><span class="yc-ctag yc-ctag-cat">${cat}</span></div>` +
      `<div class="yc-scores">${scoreHTML}</div>` +
      `<div class="yc-vr"><img class="yc-vr-off" src="assets/yc/vr-off.png" alt="View report"><img class="yc-vr-on" src="assets/yc/vr-on.png" alt=""></div>`;
    list.appendChild(card);
  });

  // --- pagination: clicking a page makes it active (white bg + chevron) ---
  const pag = document.getElementById("ycpag");
  if (pag) {
    const CHEV = '<img class="yc-page-chev" src="assets/yc/ico-chevron.svg" alt="">';
    pag.querySelectorAll(".yc-page").forEach((btn) => {
      btn.addEventListener("click", () => {
        pag.querySelectorAll(".yc-page").forEach((b) => {
          b.classList.remove("is-active");
          const ch = b.querySelector(".yc-page-chev");
          if (ch) ch.remove();
        });
        btn.classList.add("is-active");
        if (!btn.querySelector(".yc-page-chev")) btn.insertAdjacentHTML("beforeend", CHEV);
      });
    });
  }

  // --- company-size slider (draggable) ---
  const slider = document.getElementById("ycslider");
  if (slider) {
    const track = slider.querySelector(".yc-slider-track");
    const fill = document.getElementById("ycfill");
    const knob = document.getElementById("ycknob");
    const box = document.getElementById("ycsizebox");
    const W = 174, MAX = 250;   // slider value runs 0 (start) -> 250 (end); the box shows it
    function set(posDesign, fromBox) {
      const pos = Math.max(0, Math.min(W, posDesign));
      fill.style.width = pos + "px";
      if (box && !fromBox) box.value = Math.round(pos / W * MAX);   // the "1-250" next to COMPANY SIZE stays static
    }
    const toDesign = (e) => {
      const r = track.getBoundingClientRect();
      const s = window.innerWidth / 1600 || 1;     // slider lives inside the width-scaled stage
      return (e.clientX - r.left) / s;
    };
    let drag = false;
    knob.addEventListener("pointerdown", (e) => { drag = true; e.preventDefault(); });
    track.addEventListener("pointerdown", (e) => { drag = true; set(toDesign(e)); });
    window.addEventListener("pointermove", (e) => { if (drag) set(toDesign(e)); });
    window.addEventListener("pointerup", () => { drag = false; });
    // the box is also a typed input (0-250): move the slider to match
    if (box) box.addEventListener("input", () => {
      const n = parseInt(box.value, 10);
      if (!isNaN(n)) fill.style.width = (Math.max(0, Math.min(MAX, n)) / MAX * W) + "px";
    });
    set(81);   // initial knob position
  }
})();
