import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Track Birthdays',
        short_name: 'Birthdays',
        description: 'Track Birthdays helps you track birthdays of your friends and family with ease.',
        orientation: 'portrait',
        id: '/',
        start_url: '/',
        display: 'standalone',
        theme_color: '#0f0f0f',
        background_color: '#0f0f0f',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        navigateFallback: null,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        importScripts: ['/push-handler.js'],
        runtimeCaching: [],
        additionalManifestEntries: [],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      }
    })
  ]
})