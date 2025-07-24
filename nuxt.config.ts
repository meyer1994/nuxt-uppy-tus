import Material from '@primeuix/themes/material'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@primevue/nuxt-module', '@nuxtjs/tailwindcss', '@vueuse/nuxt'],

  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },

  css: ['primeicons/primeicons.css'],

  runtimeConfig: {
    openai: {
      model: 'gpt-4o-mini',
      apiKey: process.env.OPENAI_API_KEY,
    },
  },

  compatibilityDate: '2025-05-15',

  nitro: {
    experimental: {
      database: true,
    },
    database: {
      default: {
        connector: 'postgresql',
        options: {
          url: process.env.DATABASE_URL,
        },
      },
    },
    storage: {
      s3: {
        driver: 's3',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        endpoint: process.env.AWS_ENDPOINT,
        bucket: process.env.AWS_BUCKET,
        region: process.env.AWS_REGION,
      },
    },
  },

  vite: {
    server: {
      allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0', 'free-loudly-dingo.ngrok-free.app'],
    },
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
