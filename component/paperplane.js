// Loads the Spline scene via the runtime (keeps bloom/lighting/post-processing),
// grabs "paper-airplane", and gives it a single-axis FLICK roll (Z):
//   • a quick mouse movement kicks the Z rotation
//   • when the mouse stops, it eases back to the authored (default) angle
// Implemented as a damped spring (target = default angle) with velocity impulses.
import { Application } from "https://esm.sh/@splinetool/runtime@1.12.97";

const SCENE = "https://prod.spline.design/ityopc6hlJJqtw3X/scene.splinecode";
const OBJECT = "paper-airplane";

const CONFIG = {
  flick: 0.0006,     // Z-rotation impulse per px of mouse movement (much subtler)
  stiffness: 0.022,  // gentle, slow spring back to default (lower = smoother/floatier)
  damping: 0.9,      // smooth glide, minimal wobble
  max: 0.3,          // small max roll from default (rad ~17°) — keeps it subtle
  axis: "y",         // which mouse movement drives it: "y" = up/down, "x" = left/right
};

const canvas = document.getElementById("paperplane-canvas");
if (canvas) {
  const app = new Application(canvas);
  app.load(SCENE).then(() => {
    // just the model — no grey clear color
    try { app.setBackgroundColor("transparent"); } catch (e) { /* older runtime */ }

    const obj = app.findObjectByName(OBJECT);
    if (!obj) {
      console.warn(`[paperplane] object "${OBJECT}" not found in scene`);
      return;
    }

    // the angle we see at rest = the authored Z rotation; everything reverts to this
    const baseRZ = obj.rotation.z;
    let off = 0;   // current offset from default (rad)
    let vel = 0;   // angular velocity

    window.addEventListener("pointermove", (e) => {
      const m = CONFIG.axis === "x" ? (e.movementX || 0) : (e.movementY || 0);
      vel += -m * CONFIG.flick;   // a flick kicks the velocity; magnitude scales with mouse speed
    });

    (function tick() {
      vel += -CONFIG.stiffness * off;   // spring pulls the offset back to 0 (default angle)
      vel *= CONFIG.damping;            // damping -> eases to rest
      off += vel;
      if (off > CONFIG.max) { off = CONFIG.max; vel = 0; }
      else if (off < -CONFIG.max) { off = -CONFIG.max; vel = 0; }
      obj.rotation.z = baseRZ + off;    // ONLY the Z axis — x/y/position untouched
      requestAnimationFrame(tick);
    })();
  }).catch((err) => console.error("[paperplane] scene load failed:", err));
}
