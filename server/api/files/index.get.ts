import { desc } from 'drizzle-orm'
import useDrizzle from '~/server/utils/drizzle'

export default defineEventHandler(async () => {
  const db = useDrizzle()
  const rows = await db
    .select()
    .from(schema.files)
    .orderBy(desc(schema.files.created_at))
  return { files: rows }
})
