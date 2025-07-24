import { eq } from 'drizzle-orm'
import z from 'zod'
import useDrizzle from '~/server/utils/drizzle'

const zSchema = z.object({
  id: z.string().uuid(),
})

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, e => zSchema.parse(e))

  const db = useDrizzle()
  const storage = useStorage('s3')

  const file = await db
    .delete(schema.files)
    .where(eq(schema.files.id, id))
    .returning()
    .get()
  if (!file) throw createError({ statusCode: 404 })

  await storage.removeItem(file.key)

  return { file }
})
