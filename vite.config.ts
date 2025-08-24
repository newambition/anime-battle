/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      injectRegister: 'auto',
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{ts,tsx,css,html,png,svg,mp3}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5mb
      },
      devOptions: { enabled: true },
      manifest: {
        name: 'Anime Showdown',
        short_name: 'Showdown',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#f0f0f0',
        theme_color: '#0ea5e9',
        description: 'Turn-based anime battle game.',
        icons: [
          {
            src: '/winkHeart.svg',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/winkHeart.svg',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        orientation: 'portrait-primary',
        display_override: ['window-controls-overlay', 'fullscreen'],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
