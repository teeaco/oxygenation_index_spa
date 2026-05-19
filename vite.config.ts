import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig, loadEnv } from 'vite';

const trimSlash = (value: string): string => value.replace(/\/+$/, '');
const getTargetFromMode = (mode: string): 'web' | 'pages' | 'tauri' => {
  if (mode === 'pages') return 'pages';
  if (mode === 'tauri') return 'tauri';
  return 'web';
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const deployTarget = env.VITE_DEPLOY_TARGET || env['\uFEFFVITE_DEPLOY_TARGET'] || getTargetFromMode(mode);
  const repoName = env.VITE_GH_REPO || 'oxygenation_index_spa';
  const backendUrl = trimSlash(env.VITE_BACKEND_URL || 'http://localhost:8080');
  const imageBackendUrl = trimSlash(env.VITE_IMAGE_BACKEND_URL || 'http://localhost:9000');
  const basePath = deployTarget === 'pages' ? `/${repoName}/` : '/';

  return {
    base: basePath,
    plugins: [
      react(),
      mkcert(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,
        },
        devOptions: {
          enabled: true,
        },
        includeAssets: ['favicon.svg', 'icons.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          name: 'Расчет индекса оксигенации',
          short_name: 'Oxygenation',
          start_url: basePath,
          scope: basePath,
          display: 'standalone',
          background_color: '#fdfdfd',
          theme_color: '#6f58c2',
          orientation: 'portrait-primary',
          icons: [
            {
              src: `${basePath}pwa-192x192.png`,
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: `${basePath}pwa-512x512.png`,
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
    ],
    server: {
      host: '0.0.0.0',
      port: 3000,
      https: {},
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        '/img-proxy': {
          target: imageBackendUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
