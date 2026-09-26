// @ts-nocheck

// --- document.addEventListener at module scope ---
document.addEventListener('click', () => {})

// --- window.addEventListener at module scope ---
window.addEventListener('resize', () => {})

if (enabled) {
  window.addEventListener('click', handler)
}
