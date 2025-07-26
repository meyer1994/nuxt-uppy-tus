import { S3Store } from '@tus/s3-store'
import { Server } from '@tus/server'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'
import useDrizzle from '~/server/utils/drizzle'

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
      onUploadFinish: async (req, upload) => {
        console.info('Upload finished:', upload.id)

        const db = useDrizzle()
        await db
          .insert(schema.files)
          .values({ key: upload.id, meta: { uppy: { onUploadFinish: upload } } })

        return { status_code: 200 }
      },
      onIncomingRequest: async (req, uploadId) => {
        console.info('TUS request:', uploadId)
        if (req.method !== 'DELETE') return

        const db = useDrizzle()
        await db
          .delete(schema.files)
          .where(eq(schema.files.key, uploadId))
      },
    },
  )

  return tus
}

export { useStripe, useTus }
