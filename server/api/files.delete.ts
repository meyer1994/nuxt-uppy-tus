import { eq } from 'drizzle-orm'
import z from 'zod'
import useDrizzle, { schema } from '~/server/utils/drizzle'

const zSchema = z.object({
  id: z.number().int().positive(),
})

export default defineEventHandler(async (event) => {
  const { id } = await readValidatedBody(event, e => zSchema.parse(e))

  const db = useDrizzle()
  const storage = useStorage('s3')

  const [file] = await db.delete(schema.files).where(eq(schema.files.id, id)).returning()
  if (!file) throw createError({ statusCode: 404 })

  await storage.removeItem(file.path)

  return { file }
})
