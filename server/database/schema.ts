import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const files = sqliteTable('files', {
  id: integer('id')
    .primaryKey({ autoIncrement: true }),
  name: text('name')
    .notNull(),
  path: text('path')
    .notNull(),
  mimeType: text('mimeType')
    .notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
})
