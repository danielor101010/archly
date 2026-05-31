import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { useThemeStore } from './stores/themeStore'

const saved = useThemeStore.getState().theme
if (saved === 'light') document.documentElement.classList.add('light')
else document.documentElement.classList.add('dark')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
