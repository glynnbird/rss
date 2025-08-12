// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  build: {
    transpile: ['vuetify'],
  },
  modules: [
    // from https://github.com/vite-pwa/nuxt?tab=readme-ov-file#-usage
    '@vite-pwa/nuxt',
    // from https://vuetifyjs.com/en/getting-started/installation/#manual-setup
    async (options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', config => {
        if (config && config.plugins) {
          config.plugins.push(vuetify({ autoImport: true }))
        }
      })
    }
  ],
  ssr: false,
  pwa: {
    strategies: 'generateSW',
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600,
    },
    manifest: {
      "name": "RSS Reader",
      "short_name": "RSS",
      "icons": [
        {
          "src": "/android-chrome-192x192.png",
          "sizes": "192x192",
          "type": "image/png"
        },
        {
          "src": "/android-chrome-512x512.png",
          "sizes": "512x512",
          "type": "image/png"
        }
      ],
      "theme_color": "#4CAF50",
      "background_color": "#ffffff",
      "display": "standalone"
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg}']
    },
    devOptions: {
      enabled: false,
      type: "module"
    }
  },
  runtimeConfig: {
    public: {
      apiBase: ''
    }
  },
  compatibilityDate: '2024-09-24',
  devtools: { enabled: true },
  vite: {
    define: {
      'process.env.DEBUG': false,
    },
    vue: {
      template: {
        transformAssetUrls,
      }
    }
  }
})
