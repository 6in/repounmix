import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'
import pkg from './package.json'

// https://vite.dev/config/
const COMMIT = (() => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
})();

export default defineConfig({
  plugins: [react()],
  base: '/repounmix/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_COMMIT__: JSON.stringify(COMMIT),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
})
