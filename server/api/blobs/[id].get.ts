import z from 'zod'
import useSafestore from '~/server/utils/safestore'

const zSchema = z.object({
  id: z.string().uuid(),
})

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, e => zSchema.parse(e))
  const storage = useSafestore()
  const url = await storage.url(id)
  await sendRedirect(event, url.toString(), 302)
})
