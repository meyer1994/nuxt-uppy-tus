import { drizzle } from 'db0/integrations/drizzle'

import * as schema from '~/server/database/schema'

export default () => {
  const db = useDatabase()
  return drizzle<typeof schema>(db)
}

export { schema }

export type FileSelect = typeof schema.files.$inferSelect
export type FileInsert = typeof schema.files.$inferInsert
