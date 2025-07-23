import { drizzle } from 'db0/integrations/drizzle'

import * as schema from '~/server/database/schema'

export default function useDrizzle() {
  const db = useDatabase()
  return drizzle(db)
}

export type FileSelect = typeof schema.files.$inferSelect
export type FileInsert = typeof schema.files.$inferInsert

export { schema }
