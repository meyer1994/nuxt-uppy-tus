// import { serverSupabaseUser } from '#supabase/server'
// import type { User } from '@supabase/supabase-js'
import type { H3Event } from 'h3'
// import { validateWebhook } from 'replicate'
import type Stripe from 'stripe'

// export const assertValidReplicateWebhook = async <T>(event: H3Event): Promise<T> => {
//   const config = useRuntimeConfig(event)
//   const secret = config.replicate.webhookSecret

//   console.info('Reading webhook headers')
//   const id = getHeader(event, 'webhook-id')
//   const timestamp = getHeader(event, 'webhook-timestamp')
//   const signature = getHeader(event, 'webhook-signature')
//   console.debug('Read webhook headers', { id, timestamp, signature })

//   // For better error messages
//   const missing: string[] = []
//   if (!id) missing.push('webhook-id')
//   if (!timestamp) missing.push('webhook-timestamp')
//   if (!signature) missing.push('webhook-signature')

//   if (missing.length > 0) {
//     console.warn(`Missing webhook headers: ${missing.join(', ')}`)
//     throw createError({
//       status: 400,
//       message: `Missing webhook headers: ${missing.join(', ')}`,
//     })
//   }

//   const body = await readRawBody(event)

//   if (!body) {
//     console.warn('Missing body')
//     throw createError({ status: 400, message: 'Missing body' })
//   }

//   const validation = {
//     body,
//     secret,
//     // We have asserted above that these are not null/undefined. So we make
//     // typescript happy
//     id: id as string,
//     timestamp: timestamp as string,
//     signature: signature as string,
//   }

//   const isValid = await validateWebhook(validation, secret)

//   if (!isValid) {
//     console.warn('Invalid webhook signature')
//     throw createError({ status: 403, message: 'Invalid webhook signature' })
//   }

//   try {
//     // We can safely cast as Prediction because, if it passed the signature
//     // validation, it must have the correct shape. In other situations, better
//     // to use `zod`
//     return JSON.parse(body) as T
//   } catch (e) {
//     console.warn('Error parsing webhook body', e)
//     throw createError({ status: 400, message: 'Invalid JSON body' })
//   }
// }

// export const assertUser = async (event: H3Event): Promise<User> => {
//   let user: User | null = null
//   try {
//     user = await serverSupabaseUser(event)
//   } catch (e) {
//     console.info('Error fetching user', e)
//     throw createError({ status: 401, message: 'No session' })
//   }

//   if (user === null) {
//     console.info('No user')
//     throw createError({ status: 401, message: 'No user' })
//   }

//   return user
// }

export const assertValidStripeEvent = async (event: H3Event): Promise<Stripe.Event> => {
  const config = useRuntimeConfig(event)
  const stripe = useStripe()

  const signature = getHeader(event, 'stripe-signature')
  console.debug('stripe-signature', signature)

  if (!signature) {
    console.info('Missing stripe-signature header')
    throw createError({ status: 400, message: 'Missing stripe-signature header' })
  }

  const body = await readRawBody(event)

  if (!body) {
    console.info('Missing body')
    throw createError({ status: 400, message: 'Missing body' })
  }

  try {
    return stripe.webhooks.constructEvent(body, signature, config.stripe.webhookSecret)
  }
  catch (error) {
    console.error(error)
    throw createError({ status: 401, message: 'Unauthorized' })
  }
}
