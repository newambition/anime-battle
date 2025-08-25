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
        description:
          'Turn-based anime battle game with epic characters and tactical combat.',
        categories: ['games', 'entertainment'],
        lang: 'en',
        icons: [
          {
            src: '/winkHeart.svg',
            sizes: '72x72',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/winkHeart.svg',
            sizes: '96x96',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/winkHeart.svg',
            sizes: '128x128',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/winkHeart.svg',
            sizes: '144x144',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/winkHeart.svg',
            sizes: '152x152',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/winkHeart.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/winkHeart.svg',
            sizes: '384x384',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/winkHeart.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/winkHeart.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
          {
            src: '/winkHeart.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
        orientation: 'portrait-primary',
        display_override: [
          'window-controls-overlay',
          'standalone',
          'fullscreen',
        ],
        shortcuts: [
          {
            name: 'Quick Battle',
            short_name: 'Battle',
            description: 'Start a new battle immediately',
            url: '/',
            icons: [{ src: '/winkHeart.svg', sizes: '96x96' }],
          },
        ],
        screenshots: [
          {
            src: '/winkHeart.svg',
            sizes: '540x720',
            type: 'image/svg+xml',
            form_factor: 'narrow',
            label: 'Anime Showdown Battle Screen',
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
