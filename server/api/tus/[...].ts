import { FileStore } from '@tus/file-store'
import { Server } from '@tus/server'

let _tus: Server | null = null
const useTus = () => {
  if (_tus) return _tus
  _tus = new Server({
    path: '/api/tus',
    datastore: new FileStore({ directory: '.data/uploads' }),
  })
  return _tus
}

export default defineEventHandler(async (event) => {
  console.info('TUS request received')
  const tus = useTus()
  await tus.handle(event.node.req, event.node.res)
})
