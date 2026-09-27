import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@app/design-system/styles.css'

const App = () => <main>Einbürgerungstest</main>

const container = document.getElementById('root')

if (!container) {
  throw new Error('Cannot start the app: index.html must contain #root.')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
