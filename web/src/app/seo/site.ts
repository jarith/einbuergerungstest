export const getSiteOrigin = () => 'https://einbuergerungstest.jarith.dev'

export const getPublicLanguage = (pathname: string) => {
  if (pathname === '/') {
    return 'de'
  }

  if (pathname === '/en/') {
    return 'en'
  }

  return null
}

// Only learner routes get the app shell. Unknown public URLs must stay 404s.
export const getLearnerPathPattern = () =>
  /^\/(?:dashboard|study(?:\/[^/]+|\/groups\/[^/]+(?:\/[^/]+)?)?|mock-test(?:\/[^/]+(?:\/[^/]+)?)?|progress(?:\/questions(?:\/[^/]+)?|\/tests\/[^/]+)?|cheat-sheet|settings)\/?$/

export const isLearnerPath = (pathname: string) =>
  getLearnerPathPattern().test(pathname.replace(/^\/pwa(?=\/)/, ''))
