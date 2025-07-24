import { sql } from 'drizzle-orm'
import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const files = pgTable('files', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  key: text('key')
    .notNull(),
  meta: jsonb('meta')
    .notNull()
    .$type<Record<string, string>>()
    .default(sql`'{}'`),
  created_at: timestamp('created_at', { withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date()),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
})
