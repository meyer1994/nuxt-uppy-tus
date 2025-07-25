declare module 'nuxt/schema' {
  interface RuntimeConfig {
    stripe: {
      secretKey: string
      webhookSecret: string
    }
  }
  interface PublicRuntimeConfig {
    stripe: {
      paymentLink: string
    }
  }
}

// It is always important to ensure you import/export something when augmenting a type
export { }
