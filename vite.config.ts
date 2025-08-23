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
      devOptions: { enabled: true },
      manifest: {
        name: 'Anime Showdown',
        short_name: 'Showdown',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0b0b0b',
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
      },
    }),
  ],
});
