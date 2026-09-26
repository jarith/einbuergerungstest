// @ts-nocheck

// --- document.addEventListener inside a function ---
const setup = () => {
  document.addEventListener('click', () => {})
}

// --- window.addEventListener inside a function ---
function init() {
  window.addEventListener('resize', () => {})
}

// --- addEventListener inside a function expression ---
const handler = function () {
  document.addEventListener('keydown', () => {})
}

const nested = () => () => window.addEventListener('click', handler)
window['addEventListener']('click', handler)
element.addEventListener('click', handler)
