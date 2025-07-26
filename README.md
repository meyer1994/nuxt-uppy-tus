# Nuxt uppy tus example

This is a Nuxt 4 project to demonstrate the use of [Uppy](https://uppy.io/) with
[tus](https://tus.io/).

## Setup

```bash
# install dependencies
$ pnpm install

# serve with hot reload at localhost:3000
$ pnpm run dev
```

For detailed explanation on how things work, check out the
[documentation](https://nuxt.com).

The server uses node-tus-server to provide a tus server. Basically:

```js
import { Server } from '@tus/server'

const server = new Server({
  path: '/api/tus',  // must match the path
})

// server/api/tus/[...].ts
export default defineEventHandler(async (event) => {
  await server.handle(event.node.req, event.node.res)
})
```