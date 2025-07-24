import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import type { AIInfoTypes } from '../utils/useAi'
import { AIDocumentTypes } from '../utils/useAi'

export const files = pgTable('files', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name')
    .notNull(),
  path: text('path')
    .notNull(),
  mimeType: text('mime_type')
    .notNull(),
  info: jsonb('info')
    .notNull()
    .$type<AIInfoTypes>()
    .$defaultFn(() => ({ type: AIDocumentTypes.DESCONHECIDO })),
  createdAt: timestamp('created_at', { withTimezone: false })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp('updated_at', { withTimezone: false })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
})
