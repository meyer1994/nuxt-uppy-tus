// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
  ],

  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },

  compatibilityDate: '2025-05-15',

  typescript: { typeCheck: true, strict: true },

  eslint: {
    config: {
      stylistic: true,
    },
  },
})
