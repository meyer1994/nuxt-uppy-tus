import type { FileInsert } from '~/server/utils/drizzle'
import useDrizzle from '~/server/utils/drizzle'

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  if (!form) throw createError({ statusCode: 400 })

  const db = useDrizzle()
  const storage = useStorage('s3')

  const files = await Promise.all(form.map(async (file) => {
    const filename = file.filename || 'unknown'
    const mimeType = file.type as SupportedMimeTypes
    console.info('file', filename, mimeType, file.data.length)
    await storage.setItemRaw(filename, file.data, { mimeType: mimeType })

    const values: FileInsert = {
      mimeType,
      name: filename,
      path: filename,
    }

    const [row] = await db.insert(schema.files).values(values).returning()
    return row
  }))

  return { files }
})
