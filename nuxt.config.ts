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
    experimental: {
      tasks: true,
      database: true,
    },
    storage: {
      s3: {
        driver: 's3',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'minioadmin',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin',
        endpoint: process.env.AWS_ENDPOINT || 'http://localhost:9000',
        bucket: process.env.AWS_BUCKET || 'uploads',
        region: process.env.AWS_REGION || 'us-east-1',
      },
    },
    scheduledTasks: {
      '* * * * *': ['files:process'],
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
