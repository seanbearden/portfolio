import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initTelemetry } from './otel'

// Init OTEL before mounting React so document-load auto-instrumentation
// captures the bootstrap timings. No-op when VITE_OTLP_ENDPOINT is empty.
initTelemetry()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
