
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

// GOOGLE CLIENT ID: TỰ ĐỘNG NHẬN DIỆN CLIENT ID CHO ANX.IO.VN VÀ GITHUB PAGES
const GOOGLE_CLIENT_ID = (typeof window !== 'undefined' && window.location.hostname === 'anx.io.vn')
  ? '808045911964-g69d5qp5ou2te9vm173p3o0qnlaqrbfu.apps.googleusercontent.com'
  : '808045911964-1s7hoh6jv3mo3ks3d0qt0d1bhfp19htj.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
