import Material from '@primeuix/themes/material'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@primevue/nuxt-module',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    'nuxt-webhook-validators',
  ],

  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },

  css: ['primeicons/primeicons.css'],

  runtimeConfig: {
    stripe: {
      secretKey: process.env.NUXT_STRIPE_SECRET_KEY,
      webhookSecret: process.env.NUXT_STRIPE_WEBHOOK_SECRET,
    },
    public: {
      stripe: {
        paymentLink: process.env.NUXT_STRIPE_PAYMENT_LINK,
      },
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
