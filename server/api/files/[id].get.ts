import { eq } from 'drizzle-orm'
import z from 'zod'
import useDrizzle from '~/server/utils/drizzle'

const zSchema = z.object({
  id: z.string().uuid(),
})

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, e => zSchema.parse(e))

  const s3 = useS3()
  const db = useDrizzle()

  const file = await db
    .select()
    .from(schema.files)
    .where(eq(schema.files.id, params.id))
    .get()
  if (!file) throw createError({ statusCode: 404 })

  const url = await s3.url(file.key)
  return { file, url: url.toString() }
})
