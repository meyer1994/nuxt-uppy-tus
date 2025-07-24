import useSafestore from '~/server/utils/safestore'

export default defineEventHandler(async () => {
  const storage = useSafestore()
  return { files: await storage.list() }
})
