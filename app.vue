<script setup lang="ts">
import Uppy from '@uppy/core'
import Tus from '@uppy/tus'
import { Dashboard } from '@uppy/vue'

import '@uppy/core/dist/style.min.css'
import '@uppy/dashboard/dist/style.min.css'

import type { FileUploadUploaderEvent } from 'primevue/fileupload'

const config = useRuntimeConfig()

const { data, refresh, status } = useFetch('/api/files', { default: () => ({ files: [] }) })

const remove = async (id: string) => {
  await $fetch(`/api/files/${id}`, { method: 'DELETE' })
  await refresh()
}

const uploader = async (e: FileUploadUploaderEvent) => {
  console.info('File upload event:', e)
  const files = Array.isArray(e.files) ? e.files : [e.files]
  if (files.length === 0) return

  await Promise.all(files.map(async (file) => {
    const form = new FormData()
    form.append('file', file)
    await $fetch<never>('/api/files', {
      method: 'POST',
      body: form,
    })
  }))
}

const fetchFile = async (id: string) => {
  await $fetch(`/api/files/${id}`, { method: 'GET' })
  console.info('Data refreshed')
}

const uppy = new Uppy()
  .use(Tus, { endpoint: 'api/tus/upload' }) // we need to add a path after /tus
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

    <Dashboard :uppy="uppy" />

    <FileUpload
      v-if="false"
      url="/api/files"
      :multiple="true"
      accept="image/jpeg,image/png,image/jpg,application/pdf"
      :pt="{ root: 'w-full' }"
      :custom-upload="true"
      @uploader="(e: FileUploadUploaderEvent) => uploader(e)"
    >
      <!-- selected files -->
      <template #content="{ files, removeFileCallback }">
        <DataTable
          v-if="files.length > 0"
          :value="files"
          size="small"
        >
          <Column
            field="name"
            header="Filename"
          >
            <template #body="{ data: { name } }">
              {{ name.length > 11 ? name.slice(0, 14) + '...' : name }}
            </template>
          </Column>
          <Column
            field="size"
            header="Size"
          >
            <template #body="{ data: { size } }">
              {{ (size / 1024).toFixed(1) }} KB
            </template>
          </Column>
          <Column
            field="type"
            header="Type"
          />
          <Column
            header="Remove"
          >
            <template #body="{ index }">
              <Button
                icon="pi pi-times"
                severity="danger"
                size="small"
                @click="() => removeFileCallback(index)"
              />
            </template>
          </Column>
        </DataTable>
      </template>

      <template #empty>
        <div class="flex flex-col items-center justify-center h-full w-full gap-2 p-4">
          <i class="pi pi-upload text-4xl text-primary-500" />
          <span class="text-base font-semibold">Drag and drop files here</span>
        </div>
      </template>
    </FileUpload>

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
                @click="() => remove(file.id)"
              />
              <i
                class="pi pi-refresh text-xs text-green-400 hover:text-green-600 cursor-pointer"
                @click="() => fetchFile(file.id)"
              />
            </div>
            <NuxtTime
              class="text-xs font-mono text-gray-500"
              :datetime="file.created_at"
              title
              hour="2-digit"
              minute="2-digit"
            />
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
                  :src="`/api/blobs/${file.id}`"
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
