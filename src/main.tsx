
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

// BẠN CẦN ĐIỀN GOOGLE CLIENT ID VÀO ĐÂY ĐỂ ĐĂNG NHẬP HOẠT ĐỘNG
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
