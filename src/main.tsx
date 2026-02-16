import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Append build/version info to the document title (values injected at build time)
declare const __APP_VERSION__: string;
declare const __APP_COMMIT__: string;
declare const __BUILD_TIME__: string;

try {
  const ver = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';
  const commit = typeof __APP_COMMIT__ !== 'undefined' ? __APP_COMMIT__ : 'local';
  document.title = `${document.title} — v${ver} (${commit})`;
  console.debug('App version:', ver, commit, typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : '');
} catch {
  // ignore if running in envs without the defines
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
