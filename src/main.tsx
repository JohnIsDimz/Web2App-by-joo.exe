import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global resilience handler to catch database closing/hidden or connection lifecycle warnings gracefully
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || String(event.reason || '');
    if (
      reason.includes('Database is closing') ||
      reason.includes('Database is closing/hidden') ||
      reason.includes('indexeddb') ||
      reason.includes('IndexedDB')
    ) {
      console.warn('[Database Lifecycle Guard] Ignored transient database closing/hidden event:', reason);
      event.preventDefault();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (
      msg.includes('Database is closing') ||
      msg.includes('Database is closing/hidden') ||
      msg.includes('indexeddb') ||
      msg.includes('IndexedDB')
    ) {
      console.warn('[Database Lifecycle Guard] Caught database closing error:', msg);
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
