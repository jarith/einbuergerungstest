// @ts-nocheck

// --- Top-level let ---
let x = 1

// --- Let inside function ---
const fn = () => {
  let y = 2
}

// --- Let in for...of ---
for (let item of [1, 2, 3]) {
}

// --- Let in for...in ---
for (let key in { a: 1 }) {
}

let reassigned = 0
reassigned += 1
