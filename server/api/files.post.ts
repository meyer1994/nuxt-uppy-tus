import { eq } from 'drizzle-orm'
import useDrizzle from '~/server/utils/drizzle'
import { useAi } from '~/server/utils/useAi'
import { useS3 } from '~/server/utils/useS3'

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  if (!form) throw createError({ statusCode: 400 })

  const ai = useAi()
  const s3 = useS3()
  const db = useDrizzle()
  const storage = useStorage('s3')

  const files = await Promise.all(form.map(async (file) => {
    const filename = file.filename || 'unknown'
    const mimeType = file.type as SupportedMimeTypes

    console.info(`Uploading ${filename}, ${mimeType}, ${file.data.length} bytes`)
    await storage.setItemRaw(filename, file.data, { mimeType: mimeType })
    const url = await s3.url(filename)
    console.debug(url.toString())

    console.info(`Inserting into db ${filename}, ${mimeType}`)
    const [row] = await db
      .insert(schema.files)
      .values({ mimeType, name: filename, path: filename })
      .returning()
    console.debug(row.id)

    console.info(`Extracting type ${filename}, ${mimeType}`)
    const type = await ai.type(url, mimeType)
    console.debug(type.type)

    console.info(`Extracting info ${filename}, ${type.type}`)
    const info = await ai.info(url, mimeType, type.type)
    console.debug(info)

    console.info(`Updating document type ${filename}, ${type.type}`)
    await db
      .update(schema.files)
      .set({ ...info, type: type.type })
      .where(eq(schema.files.id, row.id))

    return row
  }))

  return { files }
})
