<script setup lang="ts">
import Uppy from '@uppy/core'
import type { TusBody } from '@uppy/tus'
import Tus from '@uppy/tus'
import { Dashboard } from '@uppy/vue'
import Webcam from '@uppy/webcam'

import '@uppy/core/dist/style.min.css'
import '@uppy/dashboard/dist/style.min.css'

const config = useRuntimeConfig()

const { data, refresh, status } = useFetch('/api/files', { default: () => ({ files: [] }) })

const fetchFile = async (id: string) => {
  await $fetch(`/api/files/${id}`, { method: 'GET' })
  console.info('Data refreshed')
}

let uppy: Uppy<TusBody, Record<string, never>>
onMounted(() => {
  uppy = new Uppy<TusBody, Record<string, never>>()
    .use(Tus, {
      endpoint: 'api/tus/upload',
      removeFingerprintOnSuccess: true,
    })
    .use(Webcam)

  // triggered when all uploads complete
  uppy.on('complete', async (result) => {
    console.info('Upload success:', result.successful?.map(f => f.id))
    await refresh()
  })
})

const remove = async (id: string) => {
  await $fetch(`/api/tus/upload/${id}`, {
    method: 'DELETE',
    headers: { 'tus-resumable': '1.0.0' },
  })
  await refresh()
}
</script>

<template>
  <!-- full with with padding is defined here -->
  <main class="flex flex-col gap-4 min-h-screen p-4">
    <div>
      <Button
        label="Pay"
        icon="pi pi-wallet"
        severity="link"
        as="a"
        target="_blank"
        :href="config.public.stripe.paymentLink"
      />
      <Button
        id="uppy-dashboard"
        label="Upload"
        icon="pi pi-upload"
        severity="link"
      />
    </div>

    <ClientOnly>
      <Dashboard :uppy="uppy" />
    </ClientOnly>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card
        v-for="file in data.files"
        :key="file.id"
      >
        <template #title>
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <span class="text-sm font-mono hover:underline cursor-pointer">
                #{{ file.id.slice(0, 8) }}
              </span>
              <i
                class="pi pi-trash text-xs text-red-400 hover:text-red-600 cursor-pointer"
                @click="() => remove(file.key)"
              />
              <i
                class="pi pi-refresh text-xs text-green-400 hover:text-green-600 cursor-pointer"
                @click="() => fetchFile(file.id)"
              />
            </div>
            <!-- need this ClientOnly to avoid hydration error -->
            <ClientOnly>
              <NuxtTime
                class="text-xs font-mono text-gray-500"
                :datetime="file.created_at"
                title
                hour="2-digit"
                minute="2-digit"
                :hour12="false"
              />
            </ClientOnly>
          </div>
        </template>
        <template #subtitle>
          <span class="text-sm font-mono">{{ file.key.substring(0, 14) + '...' }}</span>
        </template>
        <template #content>
          <div>
            <Skeleton
              v-if="status === 'pending'"
              class="min-h-16"
            />
            <template v-if="file.key.endsWith('.pdf')">
              <div class="flex items-center justify-center w-full aspect-square">
                <i class="pi pi-file-pdf text-2xl text-gray-500" />
              </div>
            </template>
            <template v-else-if="file.key.endsWith('.jpg') || file.key.endsWith('.jpeg') || file.key.endsWith('.png')">
              <div class="flex items-center justify-center w-full aspect-square">
                <Image
                  :src="`/api/blobs/${file.key}`"
                  class="border rounded-lg"
                />
              </div>
            </template>
          </div>
        </template>
      </Card>
    </div>
  </main>
</template>
