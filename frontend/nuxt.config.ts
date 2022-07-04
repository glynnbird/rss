import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
      // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,
  css: ['vuetify/lib/styles/main.sass',  'mdi/css/materialdesignicons.min.css'],
  build: {
    transpile: ['vuetify'],
  },
  vite: {
    define: {
      'process.env.DEBUG': false,
    },
  },

})
