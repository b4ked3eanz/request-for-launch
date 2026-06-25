import React from "react";
import { createRoot } from "react-dom/client";
import PolaroidFlipCard from "./PolaroidFlipCard.js";

const el = document.getElementById("polaroid-mount");
if (el) {
  createRoot(el).render(
    React.createElement(PolaroidFlipCard, {
      // image: defaults to the Framer-hosted photo — swap to a local asset anytime
      caption: "cnvrt labs ’26",
      backNote: "request for launch ♡",
      tiltStrength: 14,
      shadowStrength: 0.24,
      radius: 4,
      framePadding: 12,
      bottomPadding: 56,
    })
  );
}
