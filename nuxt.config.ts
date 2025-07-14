import Material from '@primeuix/themes/material'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@primevue/nuxt-module', '@nuxtjs/tailwindcss'],

  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },

  runtimeConfig: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  },

  compatibilityDate: '2025-05-15',

  nitro: {
    preset: 'aws-lambda',
    serveStatic: true,
    inlineDynamicImports: true, // ideal for AWS lambda
  },

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
