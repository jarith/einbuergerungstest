// @ts-nocheck

// --- reatomRoute in a non-route file triggers violation ---
const route = reatomRoute({ path: '/foo' }, 'fooRoute')
const anotherRoute = reatomRoute({ path: '/bar' }, 'barRoute')
