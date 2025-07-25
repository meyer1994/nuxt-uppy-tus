import Stripe from 'stripe'

let stripe: Stripe | null = null
const useStripe = (): Stripe => {
  const config = useRuntimeConfig()
  if (!config.stripe.secretKey) throw new Error('Stripe secret key is not set')
  if (stripe === null) stripe = new Stripe(config.stripe.secretKey as string)
  return stripe
}

export { useStripe }
