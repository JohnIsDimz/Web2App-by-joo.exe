import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global resilience handler to catch database closing/hidden or connection lifecycle warnings gracefully
if (typeof window !== 'undefined') {
  const isTransientError = (str: string): boolean => {
    const s = str.toLowerCase();
    return (
      s.includes('database is closing') ||
      s.includes('closing/hidden') ||
      s.includes('indexeddb') ||
      s.includes('idb') ||
      s.includes('network-request-failed') ||
      s.includes('network_request_failed') ||
      s.includes('networkerror') ||
      s.includes('firebase: error') ||
      s.includes('auth/network-request-failed')
    );
  };

  const getFullErrorStr = (obj: any): string => {
    if (!obj) return '';
    try {
      let result = `${obj.message || ''} ${obj.code || ''} ${obj.name || ''} ${String(obj)}`;
      if (typeof obj === 'object') {
        result += ' ' + JSON.stringify(obj);
      }
      return result;
    } catch (e) {
      return String(obj);
    }
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = getFullErrorStr(event.reason);
    if (isTransientError(reasonStr)) {
      console.warn('[Network & Database Guard] Caught transient rejection gracefully:', reasonStr);
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msgStr = getFullErrorStr(event.error) + ' ' + (event.message || '');
    if (isTransientError(msgStr)) {
      console.warn('[Network & Database Guard] Caught transient error gracefully:', msgStr);
      event.preventDefault();
      event.stopPropagation();
    }
  });

  const originalOnError = window.onerror;
  window.onerror = function (msg, source, lineno, colno, error) {
    const errStr = `${msg} ${error?.message || ''} ${error?.stack || ''} ${source || ''}`;
    if (isTransientError(errStr)) {
      console.warn('[Network & Database Guard] Suppressed transient window.onerror:', errStr);
      return true; // Prevents browser runtime error overlay
    }
    if (originalOnError) {
      return originalOnError.call(window, msg, source, lineno, colno, error);
    }
    return false;
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
