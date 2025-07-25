import { S3Store } from '@tus/s3-store'
import { Server } from '@tus/server'
import Stripe from 'stripe'

let stripe: Stripe | null = null
const useStripe = (): Stripe => {
  const config = useRuntimeConfig()
  if (!config.stripe.secretKey) throw new Error('Stripe secret key is not set')
  if (stripe === null) stripe = new Stripe(config.stripe.secretKey as string)
  return stripe
}

let tus: Server | null = null
const useTus = () => {
  if (tus) return tus

  console.info('Creating TUS server')
  tus = new Server(
    {
      path: '/api/tus',
      datastore: new S3Store({
        partSize: 8 * 1024 * 1024, // Each uploaded part will have ~8MiB,
        s3ClientConfig: {
          bucket: 'uploads',
          region: 'us-east-1',
          credentials: {
            accessKeyId: 'minioadmin',
            secretAccessKey: 'minioadmin',
          },
          endpoint: 'http://localhost:9000',
          forcePathStyle: true,
        },
      }),
    },
  )

  return tus
}

export { useStripe, useTus }
