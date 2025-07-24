import { sql } from 'drizzle-orm'
import { bigint, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const files = pgTable('files', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  file_name: text('file_name')
    .notNull(),
  key: text('key')
    .notNull(),
  mime_type: text('mime_type')
    .notNull()
    .default(sql`'application/octet-stream'`),
  size_bytes: bigint('size_bytes', { mode: 'number' })
    .notNull()
    .default(-1),
  meta: jsonb('meta')
    .notNull()
    .default(sql`'{}'`),
  created_at: timestamp('created_at', { withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date()),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
})
