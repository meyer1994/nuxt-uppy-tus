import Material from '@primeuix/themes/material'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@primevue/nuxt-module', '@nuxtjs/tailwindcss'],
  devtools: { enabled: true },
  compatibilityDate: '2025-05-15',
  typescript: { typeCheck: true },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  primevue: {
    options: {
      theme: {
        preset: Material,
      },
    },
  },
})
