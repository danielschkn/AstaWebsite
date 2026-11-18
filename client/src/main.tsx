import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthContext'
import { FavoritesProvider } from './auth/FavoritesContext'
import PwaUpdatePrompt from './components/PwaUpdatePrompt'
import { initPwa } from './lib/pwa'

// Installable app: catch the browser's install offer as early as possible
// (it can fire before React renders). See lib/pwa.ts.
initPwa()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider>
          <App />
          {/* Registers the service worker + "Neue Version" notice. */}
          <PwaUpdatePrompt />
        </FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
