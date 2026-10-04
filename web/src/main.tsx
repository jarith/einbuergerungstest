import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app/app'
import { startNavigation, startPageMetadata } from './app/navigation.model'

import '@einbuergerungstest/design-system/styles.css'

const container = document.getElementById('root')

if (!container) {
  throw new Error('Cannot start the app: index.html must contain #root.')
}

startNavigation()

startPageMetadata()

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
