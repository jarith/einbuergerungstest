export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  ('standalone' in navigator && navigator.standalone === true)

// Installed apps and browser tabs share an origin, but not a worker scope.
export const getAppBase = () => (location.pathname.startsWith('/pwa/') ? 'pwa' : '')

// Use the same base as the router for links that are built outside route definitions.
export const getAppPath = (path: `/${string}`) => {
  const base = getAppBase()

  return base === '' ? path : `/${base}${path}`
}

export const enterAppMode = () => {
  const url = new URL(location.href)
  const isPwaPath = url.pathname.startsWith('/pwa/')

  if (isStandalone() === isPwaPath) {
    return true
  }

  url.pathname = isStandalone() ? `/pwa${url.pathname}` : url.pathname.slice('/pwa'.length)

  location.replace(url)

  return false
}
