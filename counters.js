/* Per-digit odometer counters.
   Each digit is its own wheel (0-9). On increment, changed digits roll UP
   (with upward wrap on carry), cascading from the RIGHT-most digit leftward.
   Numbers auto-tick up by a small random amount on a staggered interval. */
(function () {
  "use strict";
  var LINE = 19;                 // px, matches .roller / .dg / span height in CSS
  var DUR = 0.6;                 // s, per-wheel roll duration
  var CASCADE = 55;              // ms delay added per digit position, right -> left
  var EASE = "cubic-bezier(.2,.85,.25,1)";

  function fmt(n) { return n.toLocaleString("en-US"); }

  function makeWheel(digit) {
    var dg = document.createElement("span");
    dg.className = "dg";
    var col = document.createElement("span");
    col.className = "col";
    var html = "";
    for (var c = 0; c < 2; c++) for (var i = 0; i < 10; i++) html += "<span>" + i + "</span>"; // 0-9 twice (wrap)
    col.innerHTML = html;
    dg.appendChild(col);
    col.style.transform = "translateY(" + (-digit * LINE) + "px)";
    col._pos = digit;            // digit currently shown (0-9)
    return dg;
  }

  function buildRoller(roller, str) {
    roller.innerHTML = "";
    var wheels = [];
    for (var k = 0; k < str.length; k++) {
      var ch = str[k];
      if (ch >= "0" && ch <= "9") {
        var dg = makeWheel(parseInt(ch, 10));
        roller.appendChild(dg);
        wheels.push(dg.firstChild);   // the .col
      } else {
        var s = document.createElement("span");
        s.className = "sep";
        s.textContent = ch;
        roller.appendChild(s);
      }
    }
    return wheels;
  }

  function rollDigit(col, nd, delay) {
    var od = col._pos;
    if (nd === od) return;
    var target = nd > od ? nd : nd + 10;  // always move upward; wrap through second 0-9 cycle
    col.style.transition = "none";
    col.style.transform = "translateY(" + (-od * LINE) + "px)";
    void col.offsetHeight;                // reflow so the next transition runs
    col.style.transition = "transform " + DUR + "s " + EASE;
    col.style.transitionDelay = (delay || 0) + "ms";
    col.style.transform = "translateY(" + (-target * LINE) + "px)";
    col.addEventListener("transitionend", function done() {
      col.removeEventListener("transitionend", done);
      col.style.transition = "none";
      col.style.transitionDelay = "0ms";
      col.style.transform = "translateY(" + (-nd * LINE) + "px)";  // snap to 1st cycle
      col._pos = nd;
    }, { once: true });
  }

  function initChip(chip) {
    var roller = chip.querySelector(".roller");
    var value = parseInt(chip.dataset.start, 10) || 0;
    var lo = parseInt(chip.dataset.min || "1", 10);
    var hi = parseInt(chip.dataset.max || "10", 10);
    var str = fmt(value);
    var wheels = buildRoller(roller, str);

    function tick() {
      var next = value + lo + Math.floor(Math.random() * (hi - lo + 1));
      var ns = fmt(next);
      if (ns.length !== str.length) {        // digit count changed -> rebuild structure
        wheels = buildRoller(roller, ns);
      } else {
        var digits = ns.replace(/[^0-9]/g, "");
        var n = wheels.length;
        for (var w = 0; w < n; w++) {
          rollDigit(wheels[w], parseInt(digits[w], 10), (n - 1 - w) * CASCADE);
        }
      }
      value = next; str = ns;
      roller.setAttribute("aria-label", ns);
      schedule();
    }
    function schedule() { setTimeout(tick, 1600 + Math.random() * 2600); }
    setTimeout(schedule, Math.random() * 1500);   // stagger chips
  }

  function start() {
    var chips = document.querySelectorAll(".chip2");
    for (var i = 0; i < chips.length; i++) initChip(chips[i]);
  }
  if (document.readyState !== "loading") start();
  else document.addEventListener("DOMContentLoaded", start);
})();
