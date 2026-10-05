import { copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * GitHub Pages has no server-side routing: a URL like /memo-test/game/1/... has
 * no file, so Pages serves 404.html. Making 404.html a copy of index.html loads
 * the app, and BrowserRouter then shows the right page.
 *
 * @returns {import('vite').Plugin}
 */
function spaFallback() {
  let outDir;
  return {
    name: 'spa-fallback-404',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      await copyFile(resolve(outDir, 'index.html'), resolve(outDir, '404.html'));
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  // Path where the app is served. Only `npm run deploy` sets it (/<repo>/);
  // `dev`, `build` and `preview` serve the app from /.
  base: process.env.BASE_URL || '/',
  plugins: [react(), spaFallback()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/testUtils/setupTests.js'],
    // Tests must not depend on the developer's .env.local (backend URL).
    env: { VITE_API_URL: '' },
    restoreMocks: true,
  },
});
