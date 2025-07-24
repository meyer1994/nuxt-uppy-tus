import useSafestore from '~/server/utils/safestore'
import type { AIMimeTypes } from '~/server/utils/useAi'

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  if (!form) throw createError({ statusCode: 400 })

  const storage = useSafestore()

  const files = await Promise.all(form.map(async (file) => {
    const filename = file.filename || 'unknown'
    const mimeType = file.type as AIMimeTypes
    return await storage.put(filename, file.data, { contentType: mimeType })
  }))

  return { files }
})
