import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const files = sqliteTable('files', {
  id: integer('id')
    .primaryKey({ autoIncrement: true }),
  name: text('name')
    .notNull(),
  path: text('path')
    .notNull(),
  mimeType: text('mime_type')
    .notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
})
