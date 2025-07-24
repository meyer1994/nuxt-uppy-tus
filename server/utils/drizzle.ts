import { drizzle } from 'db0/integrations/drizzle'

import * as schema from '~/server/database/schema'

export default function useDrizzle() {
  const db = useDatabase()
  return drizzle(db)
}

export { schema }

type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue }
type Item = Record<string, JSONValue>

export type FileSelect = typeof schema.files.$inferSelect
export type FileInsert = Omit<typeof schema.files.$inferInsert, 'meta'> & { meta?: Item }
