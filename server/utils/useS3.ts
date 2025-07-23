import { CopyObjectCommand, GetObjectCommand, HeadObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

interface SetOptions {
  mimeType?: string
  metadata?: Record<string, string>
}

interface ListOptions {
  prefix?: string
}

export const useS3 = () => {
  const s3 = new S3Client({
    region: 'us-east-1',
    credentials: {
      accessKeyId: 'minioadmin',
      secretAccessKey: 'minioadmin',
    },
    endpoint: 'http://dev.jmeyer.dev',
    forcePathStyle: true,
  })

  const get = async (key: string): Promise<ReadableStream | null> => {
    console.info(`get(${key})`)

    const command = new GetObjectCommand({
      Bucket: 'uploads',
      Key: key,
    })

    const response = await s3.send(command)
    return response.Body?.transformToWebStream() || null
  }

  const set = async (key: string, body: Buffer, opts: SetOptions = {}): Promise<string> => {
    console.info(`set(${key}, ${opts.mimeType})`)

    const command = new PutObjectCommand({
      Key: key,
      Bucket: 'uploads',
      Body: body,
      ContentType: opts.mimeType,
      Metadata: opts.metadata,
    })

    await s3.send(command)
    return key
  }

  const metaGet = async (key: string): Promise<Record<string, string>> => {
    console.info(`metaGet(${key})`)
    const command = new HeadObjectCommand({
      Bucket: 'uploads',
      Key: key,
    })

    const response = await s3.send(command)
    return response.Metadata || {}
  }

  type ListItem = { key: string, metadata: Record<string, string> }
  const list = async (opts: ListOptions = {}): Promise<ListItem[]> => {
    console.info(`list(${opts.prefix})`)
    const command = new ListObjectsV2Command({
      Bucket: 'uploads',
      Prefix: opts.prefix,
    })

    const response = await s3.send(command)

    const metaPromises = response.Contents?.map(async (item) => {
      const key = item.Key || ''
      const metadata = await metaGet(key)
      return { key, metadata }
    })

    const metadata = await Promise.all(metaPromises || [])
    return metadata.map(item => ({ key: item.key, metadata: item.metadata }))
  }

  const url = async (key: string): Promise<string> => {
    console.info(`url(${key})`)

    const command = new GetObjectCommand({
      Bucket: 'uploads',
      Key: key,
    })

    return await getSignedUrl(s3, command, { expiresIn: 3600 })
  }

  const metaSet = async (key: string, metadata: Record<string, string>): Promise<void> => {
    console.info(`metadata.set(${key}, ${metadata})`)

    const command = new CopyObjectCommand({
      CopySource: `uploads/${key}`,
      Bucket: 'uploads',
      Key: key,
      Metadata: metadata,
      MetadataDirective: 'REPLACE',
    })

    await s3.send(command)
  }

  return {
    get,
    set,
    list,
    url,
    metadata: { set: metaSet, get: metaGet },
  }
}
