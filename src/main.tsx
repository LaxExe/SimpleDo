import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { storage } from './services/storage'
import { ErrorBoundary } from './components/ErrorBoundary'

// Expose storage API globally for autonomous agents & automated testing
if (typeof window !== 'undefined') {
  (window as any).storage = storage;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
