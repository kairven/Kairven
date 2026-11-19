import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'

// Self-hosted fonts (public/fonts), latin subset only — declared in
// styles/fonts.css and preloaded from index.html. No Google Fonts CDN hop.

// Single GSAP plugin registration point — must run before any component tween.
import '@/lib/gsap.config'
import './styles/fonts.css'
import './styles/global.css'

import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
