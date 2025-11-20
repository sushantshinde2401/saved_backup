import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './shared/components/ThemeContext';

// Global error handlers to catch unhandled errors and promise rejections
window.addEventListener('error', (event) => {
  // Suppress Chrome extension runtime errors
  if (event.message && event.message.includes('Extension context invalidated')) {
    event.preventDefault();
    return false;
  }
  if (event.message && event.message.includes('message port closed before a response was received')) {
    event.preventDefault();
    return false;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  // Suppress Chrome extension runtime errors
  if (event.reason && typeof event.reason === 'string') {
    if (event.reason.includes('Extension context invalidated') ||
        event.reason.includes('message port closed before a response was received')) {
      event.preventDefault();
      return false;
    }
  }
  // Log other unhandled promise rejections for debugging
  console.warn('Unhandled promise rejection:', event.reason);
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider> {/* ✅ Wrap the App */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
