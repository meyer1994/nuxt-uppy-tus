import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { asc, eq, sql } from 'drizzle-orm'
import useDrizzle from '~/server/utils/drizzle'

export type StorePutOptions = {
  contentType?: string
  contentLength?: number
  meta?: Record<string, string>
}

export default () => {
  const db = useDrizzle()
  const BUCKET = 'uploads'

  const s3 = new S3Client({
    region: 'us-east-1',
    credentials: {
      accessKeyId: 'minioadmin',
      secretAccessKey: 'minioadmin',
    },
    endpoint: 'https://dev.jmeyer.dev',
    forcePathStyle: true,
  })

  const fetch = async (id: string): Promise<FileSelect> => {
    const item = await db
      .select()
      .from(schema.files)
      .where(eq(schema.files.id, id))
      .get()

    if (!item) throw new Error(`File not found: ${id}`)

    return item
  }

  const update = async (id: string, meta: Record<string, string>): Promise<FileSelect> => {
    const row = await db
      .update(schema.files)
      .set({ meta })
      .where(eq(schema.files.id, id))
      .returning()
      .get()

    if (!row) throw new Error(`File not found: ${id}`)

    return row
  }

  const exists = async (id: string): Promise<boolean> => {
    try {
      await get(id)
      return true
    }
    catch {
      return false
    }
  }

  const get = async (id: string): Promise<ReadableStream> => {
    await fetch(id) // errors if not found

    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: id,
    })

    const response = await s3.send(command)

    if (!response.Body) throw new Error(`Error fetching ${id} from S3`)

    return response.Body?.transformToWebStream()
  }

  const put = async (key: string, data: ReadableStream | Blob | Buffer, opts?: StorePutOptions): Promise<FileSelect> => {
    // update if exists
    let row = await db
      .update(schema.files)
      .set({ meta: opts?.meta || {}, key })
      .where(eq(schema.files.key, key))
      .returning()
      .get()

    // insert if not exists
    if (!row) {
      row = await db
        .insert(schema.files)
        .values({ meta: opts?.meta || {}, key })
        .returning()
        .get()
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: data,
      Metadata: opts?.meta,
      ContentType: opts?.contentType,
      ContentLength: opts?.contentLength,
    })

    await s3.send(command)

    return row
  }

  const del = async (id: string): Promise<FileSelect> => {
    const item = await db
      .delete(schema.files)
      .where(eq(schema.files.id, id))
      .returning()
      .get()

    if (!item) throw new Error(`File not found: ${id}`)

    const command = new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: item.key,
    })

    await s3.send(command)

    return item
  }

  const url = async (id: string, opts?: { expiresIn?: number }): Promise<URL> => {
    const item = await db
      .select()
      .from(schema.files)
      .where(eq(schema.files.id, id))
      .get()

    if (!item) throw new Error(`File not found: ${id}`)

    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: item.key,
    })

    const uri = await getSignedUrl(s3, command, { expiresIn: opts?.expiresIn || 3_600 })
    return new URL(uri)
  }

  const list = async (prefix: string = ''): Promise<FileSelect[]> => {
    const rows = await db
      .select()
      .from(schema.files)
      .where(sql`starts_with(${schema.files.key}, ${prefix})`)
      .orderBy(asc(schema.files.created_at))

    return rows
  }

  return {
    // s3 + db
    get,
    put,
    del,
    url,

    // db only
    has: exists,
    fetch,
    update,
    list,
  }
}
