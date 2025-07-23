export type ApiFileGetResponseItem = {
  id: number
  filename: string
  mime_type: string
  createdAt: string
}

export type ApiFileGetResponse = {
  files: ApiFileGetResponseItem[]
}

export default defineEventHandler(async (): Promise<ApiFileGetResponse> => {
  return { files: [] }
  const db = useDatabase()
  await db.sql`CREATE TABLE IF NOT EXISTS files (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`
  const files = await db.sql`SELECT id, filename, mime_type, created_at FROM files`
  return { files: files.rows as ApiFileGetResponseItem[] }
})
