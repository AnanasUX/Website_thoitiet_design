
// GitHub Pages SPA redirect handler
(function() {
  const redirect = sessionStorage.redirect;
  delete sessionStorage.redirect;
  if (redirect && redirect != location.href) {
    window.history.replaceState(null, '', redirect);
  }
})();

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './ErrorBoundary.jsx'
import './index.css'

import { GoogleOAuthProvider } from '@react-oauth/google';

// GOOGLE CLIENT ID MỚI CHO TÊN MIỀN ANX.IO.VN
const GOOGLE_CLIENT_ID = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) || '808045911964-g69d5qp5ou2te9vm173p3o0qnlaqrbfu.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
