import { useTus } from '~/server/utils/services'

export default defineEventHandler(async (event) => {
  const tus = useTus()
  console.info('TUS request received')
  await tus.handle(event.node.req, event.node.res)
})
