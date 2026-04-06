import React from 'react'
import ReactDOM from 'react-dom/client'
import SpendSenseApp from './SpendSense.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SpendSenseApp />
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });

  // Listen for the active SW broadcasting that a new version has taken over
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SW_UPDATED') {
      window.location.reload();
    }
  });
}
