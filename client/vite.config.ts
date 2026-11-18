import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Installable app (PWA): web-app manifest + our own service worker
    // (src/sw.ts) for offline use and push notifications. `injectManifest`
    // = we write the service worker; the plugin only injects the list of
    // build files to store on the phone. See docs in src/sw.ts.
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      // A new version waits until the user taps "Aktualisieren"
      // (components/PwaUpdatePrompt.tsx), so nobody loses a half-filled form.
      registerType: 'prompt',
      // We register the worker ourselves via useRegisterSW().
      injectRegister: false,
      manifest: {
        id: '/',
        name: 'AStA Remagen',
        short_name: 'AStA Remagen',
        description:
          'Events, BaRACke, Sport, Ersti-Infos und alles über AStA, StuPa und Fachschaften am RheinAhrCampus Remagen.',
        lang: 'de',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#9d1006',
        categories: ['education', 'social'],
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        // Long-press on the app icon (Android) → jump straight in.
        shortcuts: [
          { name: 'Eventkalender', url: '/eventkalender', icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }] },
          { name: 'Ersti-Info', url: '/ersti', icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }] },
          { name: 'BaRACke', url: '/baracke', icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }] },
        ],
      },
      injectManifest: {
        // Stored on the phone at install: the app's code, styles and fonts
        // plus the small icons. Photos are NOT pre-downloaded (several MB of
        // mobile data); they're cached as they're viewed (see src/sw.ts).
        globPatterns: [
          '**/*.{js,css,html,woff2}',
          'favicon.svg',
          'asta-logo.png',
          'pwa-192x192.png',
          'pwa-badge-96.png',
        ],
        // Editor-only code (admin pages, forms, the ~400 KB rich-text
        // editor) isn't pre-downloaded to every student's phone — editors
        // load it online when they open the admin area. Cyrillic font
        // glyphs aren't needed for German.
        globIgnores: [
          '**/RichTextEditor-*.js',
          '**/Admin*.js',
          '**/EventForm-*.js',
          '**/ProtocolForm-*.js',
          '**/EditEvent-*.js',
          '**/EditProtocol-*.js',
          '**/NewEvent-*.js',
          '**/NewProtocol-*.js',
          '**/admin-*.js',
          '**/*cyrillic*.woff2',
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      // Keep in sync with tsconfig.json / tsconfig.app.json paths
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Forward /api/* requests to the backend during dev.
      // Frontend code uses relative URLs (fetch("/api/events")) so it works
      // identically in dev and prod (where frontend + backend share an origin).
      //
      // Explicit options (instead of the shorthand string form) so we can:
      //   - changeOrigin: rewrite the Host header to localhost:5000 so the
      //     backend sees the real target, not the Vite origin.
      //   - configure: hook into the http-proxy lifecycle to log any
      //     proxy-level errors (helps diagnose mystery 5xx/413 responses
      //     that don't come from our Express routes).
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('[vite-proxy] /api error:', err.message)
          })
        },
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
