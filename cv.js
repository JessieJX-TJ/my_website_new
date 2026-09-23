const frame = document.querySelector(".cv-frame");
const label = document.querySelector(".cv-zoom__label");
const buttons = document.querySelectorAll("[data-zoom]");

const MIN = 50;
const MAX = 200;
const STEP = 25;
const DEFAULT = 100;

let zoom = DEFAULT;

function applyZoom() {
  if (!frame) return;
  frame.src = `./Xi-Jessie-Ji-CV.pdf#toolbar=0&navpanes=0&zoom=${zoom}`;
  if (label) label.textContent = `${zoom}%`;
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.zoom;
    if (action === "in") zoom = Math.min(MAX, zoom + STEP);
    if (action === "out") zoom = Math.max(MIN, zoom - STEP);
    if (action === "reset") zoom = DEFAULT;
    applyZoom();
  });
});
