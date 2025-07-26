import { useTus } from '~/server/utils/services'

export default defineEventHandler(async (event) => {
  console.info('TUS request received')
  const tus = useTus()
  await tus.handle(event.node.req, event.node.res)
})
