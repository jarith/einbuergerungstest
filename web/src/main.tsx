import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app/app'
import { startAppAnalytics } from './app/app.analytics'
import { appRoute, routes } from './app/app.route'
import { startNavigation, startPageMetadata } from './app/navigation.model'

import '@einbuergerungstest/design-system/styles.css'

const container = document.getElementById('root')

if (!container) {
  throw new Error('Cannot start the app: index.html must contain #root.')
}

startNavigation()

startPageMetadata()

const stopAnalytics = startAppAnalytics(appRoute, routes)

if (import.meta.hot) {
  import.meta.hot.dispose(stopAnalytics)
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
