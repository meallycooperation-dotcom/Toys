import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import faviconUrl from './assets/favicon.png'

const existingIcon = document.querySelector("link[rel~='icon']")

if (existingIcon) {
  existingIcon.setAttribute('href', faviconUrl)
  existingIcon.setAttribute('type', 'image/png')
} else {
  const link = document.createElement('link')
  link.rel = 'icon'
  link.type = 'image/png'
  link.href = faviconUrl
  document.head.appendChild(link)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
