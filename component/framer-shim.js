// Minimal stand-in for Framer's editor-only "framer" module so the component
// runs outside Framer. None of these affect runtime rendering.
export function addPropertyControls() {}

// ControlType.* is only referenced inside addPropertyControls (a no-op here),
// so any value works. Proxy returns the key name for whatever is accessed.
export const ControlType = new Proxy(
  {},
  { get: (_t, key) => String(key) }
);

// Some components check the render context; default to "preview" (live canvas).
export const RenderTarget = {
  current: () => "preview",
  canvas: "canvas",
  preview: "preview",
  export: "export",
  thumbnail: "thumbnail",
};
