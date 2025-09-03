import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from '@/components/ErrorBoundary'
import '@/utils/errorLogger'
import { registerSW } from './utils/serviceWorker'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

// Register service worker for PWA functionality
registerSW();
