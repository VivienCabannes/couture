import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { configureApi } from '@shared/api/client'
import './index.css'
import App from './App.tsx'

configureApi({ baseUrl: import.meta.env.VITE_API_URL || "http://localhost:8000" });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
