import type { FileInsert } from '~/server/utils/drizzle'
import useDrizzle from '~/server/utils/drizzle'

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  if (!form) throw createError({ statusCode: 400 })

  const db = useDrizzle()
  const storage = useStorage('s3')

  const files = await Promise.all(form.map(async (file) => {
    const filename = file.filename || 'unknown'
    const mimeType = file.type as AIMimeTypes

    console.info(`Uploading ${filename}, ${mimeType}, ${file.data.length} bytes`)
    await storage.setItemRaw(filename, file.data)

    const values: FileInsert = {
      mime_type: mimeType,
      file_name: filename,
      key: filename,
      size_bytes: file.data.length,
      meta: {},
    }

    console.info(`Inserting into db ${filename}, ${mimeType}`)
    const row = await db
      .insert(schema.files)
      .values(values)
      .returning()
      .get()
    console.debug(row.id)

    return row
  }))

  return { files: files.filter(i => i !== null) }
})
